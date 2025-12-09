import express from "express";
import http from "http";
import { Server } from "socket.io";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { Telemetry } from "../app/lib/types";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import readline from "readline";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const SERIAL_PATH = process.env.SERIAL_PATH || "auto";
const SERIAL_BAUD = Number(process.env.SERIAL_BAUD || 9600);
const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

const app = express();
const server = http.createServer(app);

// CORS configuration: allow all origins by default; override with ALLOWED_ORIGINS (comma-separated)
// Set ALLOWED_ORIGINS="*" for all origins, or specific origins like "http://localhost:3000,https://example.com"
const envOrigins = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOW_ALL = envOrigins.includes("*") || envOrigins.length === 0;
const ALLOWED_ORIGINS = ALLOW_ALL ? "*" : envOrigins;

const io = new Server(server, {
  cors: {
    origin: ALLOW_ALL ? true : ALLOWED_ORIGINS,
    methods: ["GET", "POST", "DELETE"],
  },
  transports: ["websocket"],
});

// Basic CORS for REST endpoints (no extra dependency)
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  
  if (ALLOW_ALL) {
    // Allow all origins
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", "*");
    }
  } else {
    // Allow specific origins only
    if (origin && (ALLOWED_ORIGINS as string[]).includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
  }
  
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// --- Persistent storage: JSONL files in ./data/YYYY-MM-DD.jsonl ---
// Allow override via DATA_DIR to avoid dev watcher loops in Next.js
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}
ensureDataDir();

function dateToYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function filePathForDate(d: Date) {
  return path.join(DATA_DIR, `${dateToYMD(d)}.jsonl`);
}

function appendTelemetry(t: Telemetry) {
  const ts = new Date(t.timestamp);
  const fp = filePathForDate(ts);
  const normalized = {
    ...t,
    // ensure JSON has null instead of NaN
    temp_c: Number.isFinite(t.temp_c) ? t.temp_c : null,
  } as Telemetry & { temp_c: number | null };
  fs.appendFile(fp, JSON.stringify(normalized) + "\n", { encoding: "utf8" }, () => {});
}

function* daysBetween(start: Date, end: Date) {
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const until = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  for (; d <= until; d.setUTCDate(d.getUTCDate() + 1)) {
    yield new Date(d);
  }
}

async function readHistory(fromISO: string, toISO: string, max: number): Promise<Telemetry[]> {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  const results: Telemetry[] = [];
  for (const day of daysBetween(from, to)) {
    const fp = filePathForDate(day);
    if (!fs.existsSync(fp)) continue;
    const file = fs.createReadStream(fp, { encoding: "utf8" });
    const rl = readline.createInterface({ input: file, crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      try {
        const obj = JSON.parse(line);
        if (!obj?.timestamp) continue;
        const ts = new Date(obj.timestamp).getTime();
        if (ts >= from.getTime() && ts <= to.getTime()) {
          results.push(obj as Telemetry);
          if (results.length >= max) {
            rl.close();
            file.close?.();
            return results;
          }
        }
      } catch {}
    }
  }
  return results;
}

app.get("/history", async (req, res) => {
  try {
    const now = new Date();
    const range = String(req.query.range || "24h");
    const max = Math.min(10000, Number(req.query.max || 5000));
    let from = new Date(now);
    if (range === "1w") from = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    else if (range === "1m") from = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    else from = new Date(now.getTime() - 24 * 3600 * 1000);

    // Override with explicit from/to if provided
    if (req.query.from) from = new Date(String(req.query.from));
    const to = req.query.to ? new Date(String(req.query.to)) : now;

    const data = await readHistory(from.toISOString(), to.toISOString(), max);
    // Ensure chronological order
    data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    res.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "history_failed";
    res.status(500).json({ error: msg });
  }
});

// Narrow to a simple key/value object safely
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

// Try to coerce a numeric field from multiple candidate keys.
// Accepts number or numeric string; ignores null/undefined/NaN.
function pickNumber(
  obj: Record<string, unknown>,
  keys: readonly string[]
): number | undefined {
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string") {
      const n = Number(val.trim());
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

// Like pickNumber, but allows explicit null → returns undefined (so caller can decide).
function pickNumberOrNull(
  obj: Record<string, unknown>,
  keys: readonly string[]
): number | undefined {
  for (const k of keys) {
    const val = obj[k];
    if (val === null || val === undefined) continue;
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string") {
      const n = Number(val.trim());
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

// Optional: basic plausibility clamps to avoid crazy spikes from noise/parsing.
// Adjust to your domain needs or remove if you prefer raw values.
function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Normalize an arbitrary parsed JSON line into a strict TelemetryPayload.
 * - Accepts multiple key aliases: pH|ph|PH, do_mg_l|do|DO|dox, temp_c|temp|temperature
 * - Requires pH and DO to be present and finite; temp becomes NaN if missing.
 * - Adds timestamp if absent.
 * - Returns null if mandatory fields are not valid.
 */
export function normalize(raw: unknown): Telemetry | null {
  if (!isRecord(raw)) return null;

  const pH = pickNumber(raw, ["pH", "ph", "PH"] as const);
  const DOx = pickNumber(raw, ["do_mg_l", "do", "DO", "dox"] as const);
  const temp = pickNumberOrNull(raw, [
    "temp_c",
    "temp",
    "temperature",
  ] as const);

  if (pH === undefined || DOx === undefined) return null; // mandatory fields missing

  // Optional plausibility (tune these if you like):
  const pHSafe = clamp(pH, 0, 14);
  const DOsafe = clamp(DOx, 0, 30); // mg/L upper bound generous
  const tempSafe = temp === undefined ? Number.NaN : temp;

  const ts =
    typeof raw["timestamp"] === "string" &&
    !Number.isNaN(Date.parse(raw["timestamp"] as string))
      ? (raw["timestamp"] as string)
      : new Date().toISOString();

  const fish = pickNumberOrNull(raw, ["fish_health", "health"] as const);

  const out: Telemetry = {
    timestamp: ts,
    pH: pHSafe,
    do_mg_l: DOsafe,
    temp_c: tempSafe,
    ...(fish !== undefined ? { fish_health: clamp(fish, 0, 100) } : {}),
  };

  return out;
}

// --- Utilities to inspect serial ports and improve Windows handling ---
async function listSerialPorts(): Promise<Awaited<ReturnType<typeof SerialPort.list>>> {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (e) {
    console.error("[serial] list failed:", e instanceof Error ? e.message : String(e));
    return [] as Awaited<ReturnType<typeof SerialPort.list>>;
  }
}

function normalizeWindowsComPath(pathIn: string): string {
  // For COM10+ Windows requires \\.\COM10 syntax. For COM1-9 regular 'COMx' works.
  if (process.platform !== "win32") return pathIn;
  const m = /^COM(\d+)$/i.exec(pathIn.trim());
  if (!m) return pathIn;
  const n = Number(m[1]);
  if (Number.isFinite(n) && n >= 10) {
    return `\\\\.\\COM${n}`;
  }
  return pathIn;
}

app.get("/ports", async (_req, res) => {
  const ports = await listSerialPorts();
  res.json(ports);
});

// Live data endpoint for external access
let latestTelemetry: Telemetry | null = null;
const telemetryBuffer: Telemetry[] = [];
const MAX_BUFFER_SIZE = 200; // Optimal for capstone project

// Mock data generation for testing without hardware
let mockDataInterval: NodeJS.Timeout | null = null;
let isMockMode = false;

function generateMockTelemetry(): Telemetry {
  const now = new Date();
  
  // Generate realistic water quality data with some variation
  const basePH = 7.2;
  const baseTemp = 25.0;
  const baseDO = 6.5;
  
  // Add some realistic variation
  const phVariation = (Math.random() - 0.5) * 0.3; // ±0.15 pH
  const tempVariation = (Math.random() - 0.5) * 2.0; // ±1°C
  const doVariation = (Math.random() - 0.5) * 1.0; // ±0.5 mg/L
  
  // Occasional spikes for realism
  const spikeChance = Math.random() < 0.05; // 5% chance
  const phSpike = spikeChance ? (Math.random() < 0.5 ? -0.8 : 0.8) : 0;
  const tempSpike = spikeChance ? (Math.random() < 0.5 ? -2.0 : 2.0) : 0;
  
  const pH = Math.max(0, Math.min(14, basePH + phVariation + phSpike));
  const temp_c = Math.max(0, Math.min(40, baseTemp + tempVariation + tempSpike));
  const do_mg_l = Math.max(0, Math.min(15, baseDO + doVariation));
  const fish_health = Math.round(75 + (Math.random() - 0.5) * 20); // 65-85%
  
  return {
    timestamp: now.toISOString(),
    pH: Math.round(pH * 100) / 100,
    temp_c: Math.round(temp_c * 10) / 10,
    do_mg_l: Math.round(do_mg_l * 100) / 100,
    fish_health: fish_health
  };
}

async function enrichWithAI(telemetry: Telemetry): Promise<Telemetry> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`${AI_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pH: telemetry.pH, temp_c: telemetry.temp_c, do_mg_l: telemetry.do_mg_l }),
      signal: controller.signal as AbortSignal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const quality_ai = typeof data?.quality_ai === "number" ? data.quality_ai : undefined;
      const status_ai = typeof data?.status_ai === "string" ? data.status_ai : undefined;
      return { ...telemetry, ...(quality_ai !== undefined ? { quality_ai } : {}), ...(status_ai ? { status_ai } : {}) };
    }
  } catch {}
  return telemetry;
}

function startMockDataGeneration() {
  if (mockDataInterval) return; // Already running
  
  console.log("[mock] Starting mock data generation for testing without hardware");
  isMockMode = true;
  
  mockDataInterval = setInterval(async () => {
    const mockTelemetry = generateMockTelemetry();
    const enriched = await enrichWithAI(mockTelemetry);
    
    // Store for API access
    latestTelemetry = enriched;
    
    // Add to buffer
    telemetryBuffer.push(enriched);
    if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
      telemetryBuffer.shift();
    }
    
    // Emit to WebSocket clients
    io.emit("telemetry", enriched);
    io.emit("telemetry:update", enriched);
    
    // Save to file
    appendTelemetry(enriched);
    
    console.log("[mock] →", enriched);
  }, 3000); // Generate data every 3 seconds
}

function stopMockDataGeneration() {
  if (mockDataInterval) {
    clearInterval(mockDataInterval);
    mockDataInterval = null;
    isMockMode = false;
    console.log("[mock] Stopped mock data generation");
  }
}

app.get("/live", (_req, res) => {
  if (!latestTelemetry) {
    return res.status(404).json({ error: "No live data available" });
  }
  res.json({
    timestamp: latestTelemetry.timestamp,
    pH: latestTelemetry.pH,
    temp_c: latestTelemetry.temp_c,
    do_mg_l: latestTelemetry.do_mg_l,
    fish_health: latestTelemetry.fish_health,
    quality_ai: latestTelemetry.quality_ai,
    status_ai: latestTelemetry.status_ai,
    system_status: {
      serial_connected: serialPort !== null,
      mock_mode: isMockMode,
      socket_connections: io.engine.clientsCount
    }
  });
});

// Latest N readings endpoint
app.get("/latest", (req, res) => {
  const limit = parseInt(req.query.n as string) || 10;
  const maxLimit = Math.min(limit, MAX_BUFFER_SIZE);
  
  if (telemetryBuffer.length === 0) {
    return res.status(404).json({ error: "No data available" });
  }
  
  // Return the latest N readings from buffer
  const latestReadings = telemetryBuffer.slice(-maxLimit);
  res.json(latestReadings);
});

// Mock data control endpoints
app.post("/mock/start", (_req, res) => {
  startMockDataGeneration();
  res.json({ message: "Mock data generation started", isMockMode });
});

app.post("/mock/stop", (_req, res) => {
  stopMockDataGeneration();
  res.json({ message: "Mock data generation stopped", isMockMode });
});

app.get("/mock/status", (_req, res) => {
  res.json({ 
    isMockMode, 
    hasSerialConnection: serialPort !== null,
    latestTelemetry: latestTelemetry ? "available" : "none"
  });
});

async function openSerial(): Promise<SerialPort> {
  if (SERIAL_PATH !== "auto") {
    const chosen = normalizeWindowsComPath(SERIAL_PATH);
    console.log("[serial] opening explicit port:", SERIAL_PATH, "=>", chosen, "@", SERIAL_BAUD);
    return new SerialPort({ path: chosen, baudRate: SERIAL_BAUD });
  }
  // Auto-pick likely Arduino port
  const ports = await listSerialPorts();
  console.log("[serial] available ports:");
  for (const p of ports) {
    console.log("  -", p.path, JSON.stringify({ manufacturer: p.manufacturer, vendorId: p.vendorId, productId: p.productId }));
  }
  const guess = ports.find((p) =>
    /arduino|wch|usb|ch340|silabs|ftdi|usb-serial|uno|mega|nano/i.test(
      [p.manufacturer, p.vendorId, p.productId, p.path, p.pnpId].filter(Boolean).join(" ")
    )
  ) || ports[0];
  if (!guess)
    throw new Error(
      "No serial device found. Set SERIAL_PATH=COM3 or /dev/ttyACM0"
    );
  const chosen = normalizeWindowsComPath(guess.path!);
  console.log("[serial] auto-picked", guess.path, "=>", chosen);
  return new SerialPort({ path: chosen, baudRate: SERIAL_BAUD });
}

let serialPort: SerialPort | null = null;
let serialRetryTimeout: NodeJS.Timeout | null = null;

function emitSerialStatus(status: "connected" | "disconnected") {
  io.emit("serial:status", { status });
}

async function startSerialLoop() {
  try {
    serialPort = await openSerial();
    emitSerialStatus("connected");
    stopMockDataGeneration(); // Stop mock data when real hardware connects
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));
    parser.on("data", async (line: string) => {
      try {
        const parsed: unknown = JSON.parse(line);
        const t = normalize(parsed);
        if (!t) return;
        let enriched: Telemetry = t;
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 600);
          const res = await fetch(`${AI_BASE_URL}/predict`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pH: t.pH, temp_c: t.temp_c, do_mg_l: t.do_mg_l }),
            signal: controller.signal as AbortSignal
          });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            const quality_ai = typeof data?.quality_ai === "number" ? data.quality_ai : undefined;
            const status_ai = typeof data?.status_ai === "string" ? data.status_ai : undefined;
            enriched = { ...t, ...(quality_ai !== undefined ? { quality_ai } : {}), ...(status_ai ? { status_ai } : {}) };
          }
        } catch {}
        // Store latest telemetry for API access
        latestTelemetry = enriched;
        
        // Add to buffer (keep only recent readings)
        telemetryBuffer.push(enriched);
        if (telemetryBuffer.length > MAX_BUFFER_SIZE) {
          telemetryBuffer.shift(); // Remove oldest reading
        }
        
        io.emit("telemetry", enriched);
        io.emit("telemetry:update", enriched);
        appendTelemetry(enriched);
        console.log("→", enriched);
      } catch {}
    });
    serialPort.on("error", (e) => {
      console.error("[serial] error:", e.message);
      emitSerialStatus("disconnected");
      if (!isMockMode)
      {
        console.log("[serial] starting mock data generation due to serial error");
        startMockDataGeneration();
      }
    });
    serialPort.on("close", () => {
      console.log("[serial] closed");
      emitSerialStatus("disconnected");
      if (!isMockMode)
      {
        console.log("[serial] starting mock data generation due to serial error");
        startMockDataGeneration();
      }
      scheduleRetry();
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[serial] open failed:", msg);
    console.error("[serial] hints: ensure Arduino Serial Monitor is CLOSED, correct COMx, and baud=", SERIAL_BAUD);
    emitSerialStatus("disconnected");
    
    // Start mock data generation when no hardware is available
    console.log("[serial] No hardware detected, starting mock data generation");
    startMockDataGeneration();
    
    scheduleRetry();
  }
}

function scheduleRetry() {
  if (serialRetryTimeout) return;
  serialRetryTimeout = setTimeout(() => {
    serialRetryTimeout = null;
    startSerialLoop();
  }, 10000);
}

// Log ports on startup for easier debugging
listSerialPorts().then((ports) => {
  if (!ports.length) console.warn("[serial] no ports detected");
  else console.log("[serial] detected", ports.length, "ports");
});

startSerialLoop();

io.on("connection", (socket) => {
  console.log("client connected", socket.id);
  socket.on("disconnect", () => console.log("client disconnected", socket.id));
});

server.listen(PORT, () => console.log("Serial Socket.IO bridge on", PORT));