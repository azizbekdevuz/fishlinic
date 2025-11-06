import express from "express";
import crypto from "crypto";
import { CronJob } from "cron";
import { ctx } from "./context";
import { writeSerialJson } from "./serial";
import { dbDeleteSchedule, dbInsertFeedLog, dbInsertSchedule, dbListSchedules } from "./db";

type FeedLog = { ts: string; source: string; ok: boolean; msg?: string; duration?: number };
type FeedSchedule = { id: string; name?: string; hh: number; mm: number };

const feedLogs: FeedLog[] = [];
const schedules: FeedSchedule[] = [];
const jobs = new Map<string, CronJob>();

function logFeed(entry: FeedLog) {
  feedLogs.push(entry);
  if (feedLogs.length > 500) feedLogs.shift();
  ctx.io?.emit("feeder:event", { type: "log", ...entry });
  dbInsertFeedLog(entry).catch(() => {});
}

function addSchedule(hh: number, mm: number, id: string, name?: string) {
  const job = new CronJob(`${mm} ${hh} * * *`, () => {
    const duration = 1.0;
    try {
      writeSerialJson({ cmd: "feed", duration });
      logFeed({ ts: new Date().toISOString(), source: "scheduler", ok: true, duration });
    } catch (e) {
      logFeed({ ts: new Date().toISOString(), source: "scheduler", ok: false, msg: (e as any)?.message });
    }
  }, null, true);
  jobs.set(id, job);
}

export function attachFeeder(app: express.Express) {
  app.use(express.json());

  app.post("/feed", (req, res) => {
    const duration = Math.max(0.5, Math.min(10, Number(req.body?.duration || 1)));
    const source = String(req.body?.source || "api");
    try {
      writeSerialJson({ cmd: "feed", duration });
      logFeed({ ts: new Date().toISOString(), source, ok: true, duration });
      res.json({ status: "ok", action: "feed", duration, timestamp: new Date().toISOString() });
    } catch (e) {
      const msg = (e as any)?.message || String(e);
      logFeed({ ts: new Date().toISOString(), source, ok: false, msg });
      res.status(500).json({ status: "error", error: msg });
    }
  });

  app.post("/schedule", (req, res) => {
    const name = req.body?.name as string | undefined;
    const cron = req.body?.cron as string | undefined; // HH:MM
    if (!cron || typeof cron !== "string") return res.status(400).json({ status: "error", error: "cron required in HH:MM" });
    if (!/^\d{2}:\d{2}$/.test(cron)) return res.status(400).json({ status: "error", error: "cron must be HH:MM format" });
    const [hh, mm] = cron.split(":").map(Number);
    const id = crypto.randomUUID();
    schedules.push({ id, name, hh, mm });
    addSchedule(hh, mm, id, name);
    dbInsertSchedule({ id, name: name ?? null, hh, mm }).catch(() => {});
    res.json({ status: "ok", id, name, cron });
  });

  app.get("/schedule", (_req, res) => {
    const out = schedules.map((s) => {
      const job = jobs.get(s.id);
      const cron = `${String(s.hh).padStart(2, "0")}:${String(s.mm).padStart(2, "0")}`;
      const nd: any = (job as any)?.nextDates?.();
      const next_run = nd?.toJSDate?.()?.toISOString?.() ?? nd?.toDate?.()?.toISOString?.() ?? null;
      return { id: s.id, name: s.name, cron, next_run };
    });
    res.json({ status: "ok", schedules: out });
  });

  app.delete("/schedule/:id", (req, res) => {
    const sid = String(req.params.id);
    const idx = schedules.findIndex((s) => s.id === sid);
    if (idx < 0) return res.status(404).json({ status: "error", error: "not found" });
    try { jobs.get(sid)?.stop(); } catch {}
    jobs.delete(sid);
    schedules.splice(idx, 1);
    dbDeleteSchedule(sid).catch(() => {});
    res.json({ status: "ok", deleted: sid });
  });

  app.get("/feed/logs", (_req, res) => {
    res.json({ logs: [...feedLogs].slice(-100).reverse() });
  });

  app.get("/status", (_req, res) => {
    const last = feedLogs.length ? feedLogs[feedLogs.length - 1] : null;
    const out = schedules.map((s) => {
      const job = jobs.get(s.id);
      const cron = `${String(s.hh).padStart(2, "0")}:${String(s.mm).padStart(2, "0")}`;
      const nd: any = (job as any)?.nextDates?.();
      const next_run = nd?.toJSDate?.()?.toISOString?.() ?? nd?.toDate?.()?.toISOString?.() ?? null;
      return { id: s.id, name: s.name, cron, next_run };
    });
    res.json({
      device: "fish-feeder",
      on_rpi: false,
      last_feed: last ? { timestamp: last.ts, source: last.source, details: last.msg ?? `duration=${last.duration ?? 1}` } : null,
      schedules: out,
    });
  });
}

export async function initFeederPersistence() {
  try {
    const rows = await dbListSchedules();
    for (const r of rows) {
      if (!schedules.find(s => s.id === r.id)) {
        schedules.push({ id: r.id, name: r.name ?? undefined, hh: r.hh, mm: r.mm });
        addSchedule(r.hh, r.mm, r.id, r.name ?? undefined);
      }
    }
    console.log(`[feeder] loaded ${rows.length} schedules from DB`);
  } catch (e) {
    console.warn("[feeder] persistence load failed:", (e as any)?.message || e);
  }
}


