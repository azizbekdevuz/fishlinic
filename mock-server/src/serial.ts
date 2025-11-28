import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { ctx, pushTelemetry } from "./context";
import { SERIAL_BAUD, SERIAL_PATH } from "./config";
import { normalize } from "./normalize";
import { enrichWithAI } from "./ai";
import { startMockDataGeneration, stopMockDataGeneration } from "./mockData";

export async function listSerialPorts() {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (e) {
    console.error("[serial] list failed:", e instanceof Error ? e.message : String(e));
    return [] as Awaited<ReturnType<typeof SerialPort.list>>;
  }
}

function normalizeWindowsComPath(pathIn: string): string {
  if (process.platform !== "win32") return pathIn;
  const m = /^COM(\d+)$/i.exec(pathIn.trim());
  if (!m) return pathIn;
  const n = Number(m[1]);
  if (Number.isFinite(n) && n >= 10) {
    return `\\\\.\\COM${n}`;
  }
  return pathIn;
}

async function openSerial(): Promise<SerialPort> {
  if (SERIAL_PATH !== "auto") {
    const chosen = normalizeWindowsComPath(SERIAL_PATH);
    console.log("[serial] opening explicit port:", SERIAL_PATH, "=>", chosen, "@", SERIAL_BAUD);
    return new SerialPort({ path: chosen, baudRate: SERIAL_BAUD });
  }
  const ports = await listSerialPorts();
  console.log("[serial] available ports:");
  for (const p of ports) {
    console.log("  -", (p as unknown as Record<string, unknown>).path, JSON.stringify({ manufacturer: (p as unknown as Record<string, unknown>).manufacturer, vendorId: (p as unknown as Record<string, unknown>).vendorId, productId: (p as unknown as Record<string, unknown>).productId }));
  }
  const guess =
    (ports as unknown as Record<string, unknown>[]).find((p: Record<string, unknown>) =>
      /arduino|wch|usb|ch340|silabs|ftdi|usb-serial|uno|mega|nano/i.test(
        [p.manufacturer, p.vendorId, p.productId, p.path, p.pnpId].filter(Boolean).join(" ")
      )
    ) || (ports as unknown as Record<string, unknown>[])[0];
  if (!guess) throw new Error("No serial device found. Set SERIAL_PATH=COM3 or /dev/ttyACM0");
  const chosen = normalizeWindowsComPath(guess.path as string);
  console.log("[serial] auto-picked", guess.path, "=>", chosen);
  return new SerialPort({ path: chosen, baudRate: SERIAL_BAUD });
}

let serialRetryTimeout: NodeJS.Timeout | null = null;

function emitSerialStatus(status: "connected" | "disconnected") {
  ctx.io?.emit("serial:status", { status });
}

export function writeSerialJson(obj: unknown) {
  if (!ctx.serialPort) throw new Error("serial not connected");
  const line = JSON.stringify(obj) + "\n";
  ctx.serialPort.write(line, (err) => {
    if (err) console.error("[serial] write error", err.message);
  });
}

export async function startSerialLoop() {
  try {
    ctx.serialPort = await openSerial();
    emitSerialStatus("connected");
    console.log("[serial] ✓ Serial port opened successfully, waiting for data...");
    if (ctx.isMockMode) stopMockDataGeneration();
    
    // Use ReadlineParser - handles both \n and \r\n automatically
    const parser = ctx.serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));
    parser.on("data", async (line: string) => {
      try {
        // Log raw data for debugging
        const trimmedLine = line.trim();
        if (!trimmedLine) return; // Skip empty lines
        
        console.log("[serial] raw:", trimmedLine);
        
        const parsed: unknown = JSON.parse(trimmedLine);
        if (parsed && typeof parsed === "object" && (parsed as Record<string, unknown>)["ack"]) {
          ctx.io?.emit("feeder:event", parsed);
          return;
        }
        const t = normalize(parsed);
        if (!t) {
          console.warn("[serial] normalization failed for:", parsed);
          return;
        }
        const enriched = await enrichWithAI(t);
        pushTelemetry(enriched);
        console.log("→", enriched);
      } catch (error) {
        // Log errors instead of silently ignoring them
        if (error instanceof SyntaxError) {
          console.warn("[serial] JSON parse error:", error.message);
          console.warn("[serial] raw line:", line.trim());
        } else if (error instanceof Error) {
          console.error("[serial] processing error:", error.message);
        } else {
          console.error("[serial] unknown error:", error);
        }
      }
    });
    ctx.serialPort.on("error", (e) => {
      console.error("[serial] error:", (e as Error).message);
      emitSerialStatus("disconnected");
      if (!ctx.isMockMode) {
        console.log("[serial] starting mock data generation due to serial error");
        startMockDataGeneration();
      }
    });
    ctx.serialPort.on("close", () => {
      console.log("[serial] closed");
      emitSerialStatus("disconnected");
      if (!ctx.isMockMode) {
        console.log("[serial] starting mock data generation due to serial close");
        startMockDataGeneration();
      }
      scheduleRetry();
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[serial] open failed:", msg);
    console.error("[serial] hints: ensure Arduino Serial Monitor is CLOSED, correct COMx, and baud=", SERIAL_BAUD);
    emitSerialStatus("disconnected");
    console.log("[serial] No hardware detected, starting mock data generation");
    startMockDataGeneration();
    scheduleRetry();
  }
}

export function scheduleRetry() {
  if (serialRetryTimeout) return;
  serialRetryTimeout = setTimeout(() => {
    serialRetryTimeout = null;
    startSerialLoop();
  }, 10000);
}


