import express from "express";
import crypto from "crypto";
import { CronJob } from "cron";
import { ctx } from "./context";
import { writeToSecondary } from "./serial";
import { dbDeleteSchedule, dbInsertFeedLog, dbInsertSchedule, dbListSchedules } from "./db";

type FeedLog = { ts: string; source: string; ok: boolean; msg?: string; duration?: number; userId?: string };
type FeedSchedule = { id: string; name?: string; hh: number; mm: number; duration?: number; userId?: string };

const feedLogs: FeedLog[] = [];
const schedules: FeedSchedule[] = [];
const jobs = new Map<string, CronJob>();

function logFeed(entry: FeedLog) {
  feedLogs.push(entry);
  if (feedLogs.length > 500) feedLogs.shift();
  ctx.io?.emit("feeder:event", { type: "log", ...entry });
  dbInsertFeedLog(entry).catch(() => {});
}

// Check if secondary Arduino (feeder) is connected
function isFeederConnected(): boolean {
  return ctx.secondaryConnected && ctx.serialPortSecondary?.isOpen === true;
}

function addScheduleJob(hh: number, mm: number, id: string, duration: number = 2.0, userId?: string) {
  const job = new CronJob(`${mm} ${hh} * * *`, () => {
    if (!isFeederConnected()) {
      logFeed({ ts: new Date().toISOString(), source: "scheduler", ok: false, msg: "Secondary Arduino not connected", userId });
      return;
    }
    try {
      writeToSecondary({ cmd: "feed", duration });
      logFeed({ ts: new Date().toISOString(), source: "scheduler", ok: true, duration, userId });
    } catch (e) {
      logFeed({ ts: new Date().toISOString(), source: "scheduler", ok: false, msg: (e as Error)?.message, userId });
    }
  }, null, true);
  jobs.set(id, job);
}

export function attachFeeder(app: express.Express) {
  app.use(express.json());

  // Manual feed endpoint
  app.post("/feed", (req, res) => {
    const rawDuration = Number(req.body?.duration || 2);
    const source = String(req.body?.source || "api");
    const userId = req.body?.userId as string | undefined;
    
    // Validate duration: only 1, 2, 3, 4, 5 allowed (number of cycles)
    const ALLOWED_DURATIONS = [1, 2, 3, 4, 5];
    const duration = Math.round(rawDuration); // Round to integer
    
    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({ 
        status: "error", 
        error: "Invalid duration. Only 1, 2, 3, 4, or 5 cycles allowed.",
        allowed: ALLOWED_DURATIONS
      });
    }
    
    // Check if secondary Arduino is connected
    if (!isFeederConnected()) {
      const msg = "Secondary Arduino (feeder) not connected";
      logFeed({ ts: new Date().toISOString(), source, ok: false, msg, userId });
      return res.status(503).json({ 
        status: "error", 
        error: msg,
        hardware: {
          main: ctx.mainConnected,
          secondary: ctx.secondaryConnected
        }
      });
    }
    
    try {
      writeToSecondary({ cmd: "feed", duration });
      logFeed({ ts: new Date().toISOString(), source, ok: true, duration, userId });
      res.json({ 
        status: "ok", 
        action: "feed", 
        cycles: duration,
        timestamp: new Date().toISOString(),
        hardware: {
          main: ctx.mainConnected,
          secondary: ctx.secondaryConnected
        }
      });
    } catch (e) {
      const msg = (e as Error)?.message || String(e);
      logFeed({ ts: new Date().toISOString(), source, ok: false, msg, userId });
      res.status(500).json({ status: "error", error: msg });
    }
  });
  
  // Hardware status endpoint for feeder
  app.get("/feed/status", (_req, res) => {
    res.json({
      connected: isFeederConnected(),
      main: ctx.mainConnected,
      secondary: ctx.secondaryConnected,
      mockMode: ctx.isMockMode
    });
  });

  // Create schedule - now requires userId
  app.post("/schedule", (req, res) => {
    const name = req.body?.name as string | undefined;
    const cron = req.body?.cron as string | undefined; // HH:MM
    const rawDuration = Number(req.body?.duration || 2);
    const userId = req.body?.userId as string | undefined;
    
    // Validate duration: only 1, 2, 3, 4, 5 allowed
    const ALLOWED_DURATIONS = [1, 2, 3, 4, 5];
    const duration = Math.round(rawDuration);
    
    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({ 
        status: "error", 
        error: "Invalid duration. Only 1, 2, 3, 4, or 5 cycles allowed.",
        allowed: ALLOWED_DURATIONS
      });
    }
    
    if (!cron || typeof cron !== "string") return res.status(400).json({ status: "error", error: "cron required in HH:MM" });
    if (!/^\d{2}:\d{2}$/.test(cron)) return res.status(400).json({ status: "error", error: "cron must be HH:MM format" });
    
    const [hh, mm] = cron.split(":").map(Number);
    const id = crypto.randomUUID();
    
    // Store schedule with userId
    schedules.push({ id, name, hh, mm, duration, userId });
    addScheduleJob(hh, mm, id, duration, userId);
    dbInsertSchedule({ id, name: name ?? null, hh, mm, duration, userId }).catch(() => {});
    
    res.json({ status: "ok", id, name, cron, cycles: duration, userId });
  });

  // List schedules - filter by userId if provided
  app.get("/schedule", (req, res) => {
    const userId = req.query.userId as string | undefined;
    
    // Filter schedules by userId if provided
    const userSchedules = userId 
      ? schedules.filter(s => s.userId === userId)
      : schedules;
    
    const out = userSchedules.map((s) => {
      const job = jobs.get(s.id);
      const cron = `${String(s.hh).padStart(2, "0")}:${String(s.mm).padStart(2, "0")}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nd: any = (job as any)?.nextDates?.();
      const next_run = nd?.toJSDate?.()?.toISOString?.() ?? nd?.toDate?.()?.toISOString?.() ?? null;
      return { id: s.id, name: s.name, cron, duration: s.duration ?? 2, next_run };
    });
    res.json({ status: "ok", schedules: out });
  });

  // Delete schedule - validate userId ownership
  app.delete("/schedule/:id", (req, res) => {
    const sid = String(req.params.id);
    const userId = req.query.userId as string | undefined;
    
    const idx = schedules.findIndex((s) => s.id === sid);
    if (idx < 0) return res.status(404).json({ status: "error", error: "not found" });
    
    // Check ownership if userId provided
    const schedule = schedules[idx];
    if (userId && schedule.userId && schedule.userId !== userId) {
      return res.status(403).json({ status: "error", error: "not authorized" });
    }
    
    try { jobs.get(sid)?.stop(); } catch {}
    jobs.delete(sid);
    schedules.splice(idx, 1);
    dbDeleteSchedule(sid, userId).catch(() => {});
    res.json({ status: "ok", deleted: sid });
  });

  app.get("/feed/logs", (req, res) => {
    const userId = req.query.userId as string | undefined;
    
    // Filter logs by userId if provided
    const userLogs = userId 
      ? feedLogs.filter(l => l.userId === userId)
      : feedLogs;
    
    res.json({ logs: [...userLogs].slice(-100).reverse() });
  });

  // Status endpoint - filter schedules by userId
  app.get("/status", (req, res) => {
    const userId = req.query.userId as string | undefined;
    
    // Filter by userId if provided
    const userSchedules = userId 
      ? schedules.filter(s => s.userId === userId)
      : schedules;
    const userLogs = userId
      ? feedLogs.filter(l => l.userId === userId)
      : feedLogs;
    
    const last = userLogs.length ? userLogs[userLogs.length - 1] : null;
    const out = userSchedules.map((s) => {
      const job = jobs.get(s.id);
      const cron = `${String(s.hh).padStart(2, "0")}:${String(s.mm).padStart(2, "0")}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nd: any = (job as any)?.nextDates?.();
      const next_run = nd?.toJSDate?.()?.toISOString?.() ?? nd?.toDate?.()?.toISOString?.() ?? null;
      return { id: s.id, name: s.name, cron, duration: s.duration ?? 2, next_run };
    });
    
    res.json({
      device: "fish-feeder",
      hardware: {
        connected: isFeederConnected(),
        main: ctx.mainConnected,
        secondary: ctx.secondaryConnected
      },
      last_feed: last ? { timestamp: last.ts, source: last.source, success: last.ok, details: last.msg ?? `duration=${last.duration ?? 2}s` } : null,
      schedules: out,
    });
  });
}

// Load schedules from database on startup
export async function initFeederPersistence() {
  try {
    // Load ALL schedules (we'll filter by user at query time)
    const rows = await dbListSchedules();
    for (const r of rows) {
      if (!schedules.find(s => s.id === r.id)) {
        const duration = r.duration ?? 2.0;
        schedules.push({ id: r.id, name: r.name ?? undefined, hh: r.hh, mm: r.mm, duration, userId: r.userId ?? undefined });
        addScheduleJob(r.hh, r.mm, r.id, duration, r.userId ?? undefined);
      }
    }
    console.log(`[feeder] loaded ${rows.length} schedules from DB`);
  } catch (e) {
    console.warn("[feeder] persistence load failed:", (e as Error)?.message || e);
  }
}
