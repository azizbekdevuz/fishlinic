import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { ctx, pushTelemetry } from "./context";
import { SERIAL_BAUD, SERIAL_PATH } from "./config";
import { normalize } from "./normalize";
import { enrichWithAI } from "./ai";
import { startMockDataGeneration, stopMockDataGeneration } from "./mockData";

export async function listSerialPorts() {
  try {
    return await SerialPort.list();
  } catch (e) {
    console.error("[serial] list failed:", e instanceof Error ? e.message : String(e));
    return [];
  }
}

function normalizeWindowsComPath(pathIn: string): string {
  if (process.platform !== "win32") return pathIn;
  const m = /^COM(\d+)$/i.exec(pathIn.trim());
  if (!m) return pathIn;
  const n = Number(m[1]);
  // Windows needs \\.\COMxx for COM10+
  return n >= 10 ? `\\\\.\\COM${n}` : pathIn;
}

async function findSerialPort(): Promise<string> {
  if (SERIAL_PATH !== "auto") {
    return normalizeWindowsComPath(SERIAL_PATH);
  }
  
  const ports = await listSerialPorts();
  console.log("[serial] available ports:");
  for (const p of ports) {
    console.log("  -", p.path, p.manufacturer || "", p.vendorId || "");
  }
  
  // Find Arduino-like port
  const arduino = ports.find((p) =>
    /arduino|wch|ch340|silabs|ftdi|usb-serial|uno|mega|nano/i.test(
      [p.manufacturer, p.vendorId, p.productId, p.path, p.pnpId].filter(Boolean).join(" ")
    )
  ) || ports[0];
  
  if (!arduino) {
    throw new Error("No serial device found. Set SERIAL_PATH=COM3 in .env");
  }
  
  return normalizeWindowsComPath(arduino.path);
}

let serialRetryTimeout: NodeJS.Timeout | null = null;

function emitSerialStatus(status: "connected" | "disconnected") {
  ctx.io?.emit("serial:status", { status });
}

export function writeSerialJson(obj: unknown) {
  if (!ctx.serialPort?.isOpen) {
    throw new Error("Serial port not connected");
  }
  ctx.serialPort.write(JSON.stringify(obj) + "\n", (err) => {
    if (err) console.error("[serial] write error:", err.message);
  });
}

export async function startSerialLoop() {
  // Clear any previous retry
  if (serialRetryTimeout) {
    clearTimeout(serialRetryTimeout);
    serialRetryTimeout = null;
  }
  
  try {
    const portPath = await findSerialPort();
    console.log(`[serial] Opening ${portPath} @ ${SERIAL_BAUD} baud...`);
    
    // Create and open serial port
    const port = new SerialPort({
      path: portPath,
      baudRate: SERIAL_BAUD,
      autoOpen: false  // We'll open manually for better control
    });
    
    ctx.serialPort = port;
    
    // Open with promise
    await new Promise<void>((resolve, reject) => {
      port.open((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log("[serial] ✓ Port opened successfully");
    
    // Wait for Arduino to reset (it resets when serial connection opens)
    // This is critical - Arduino needs ~2 seconds after reset before sending data
    console.log("[serial] Waiting 2.5s for Arduino to initialize after reset...");
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Flush any garbage data from the buffer
    await new Promise<void>((resolve) => {
      port.flush((err) => {
        if (err) console.warn("[serial] Flush warning:", err.message);
        resolve();
      });
    });
    
    console.log("[serial] ✓ Ready to receive data");
    emitSerialStatus("connected");
    
    // Stop mock data when real hardware connects
    if (ctx.isMockMode) {
      stopMockDataGeneration();
    }
    
    // Set up line parser
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
    
    let dataReceived = false;
    
    parser.on("data", async (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      if (!dataReceived) {
        dataReceived = true;
        console.log("[serial] ✓ First data received!");
      }
      
      try {
        // Handle feeder acknowledgment
        const parsed = JSON.parse(trimmed);
        if (parsed?.ack) {
          ctx.io?.emit("feeder:event", parsed);
          return;
        }
        
        // Normalize telemetry data
        const telemetry = normalize(parsed);
        if (!telemetry) {
          console.warn("[serial] Invalid data format:", trimmed);
          return;
        }
        
        // Enrich with AI (optional, fails gracefully)
        const enriched = await enrichWithAI(telemetry);
        
        // Push to clients and storage
        pushTelemetry(enriched);
        console.log("→", enriched);
        
      } catch (error) {
        if (error instanceof SyntaxError) {
          // Probably startup garbage or incomplete line
          console.warn("[serial] JSON parse error:", trimmed.substring(0, 50));
        } else {
          console.error("[serial] Processing error:", error);
        }
      }
    });
    
    // Handle errors
    port.on("error", (err) => {
      console.error("[serial] Error:", err.message);
      handleDisconnect();
    });
    
    port.on("close", () => {
      console.log("[serial] Port closed");
      handleDisconnect();
    });
    
    // Warn if no data after timeout
    setTimeout(() => {
      if (!dataReceived) {
        console.warn("[serial] ⚠️ No data received after 15 seconds!");
        console.warn("[serial] Check: Arduino is sending, baud rate matches, correct COM port");
      }
    }, 15000);
    
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[serial] Failed to open:", msg);
    
    if (msg.includes("Access denied") || msg.includes("Permission denied")) {
      console.error("[serial] ❌ Port is locked! Close Arduino Serial Monitor and try again.");
    }
    
    handleDisconnect();
  }
}

function handleDisconnect() {
  ctx.serialPort = null;
  emitSerialStatus("disconnected");
  
  // Start mock data if not already running
  if (!ctx.isMockMode) {
    console.log("[serial] Starting mock data generation...");
    startMockDataGeneration();
  }
  
  // Retry after 10 seconds
  scheduleRetry();
}

export function scheduleRetry() {
  if (serialRetryTimeout) return;
  
  console.log("[serial] Will retry connection in 10 seconds...");
  serialRetryTimeout = setTimeout(() => {
    serialRetryTimeout = null;
    startSerialLoop();
  }, 10000);
}
