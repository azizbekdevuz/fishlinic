import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { ctx, pushTelemetry, PartialTelemetry } from "./context";
import { SERIAL_BAUD, SERIAL_PATH_MAIN, SERIAL_PATH_SECONDARY } from "./config";
import { normalize } from "./normalize";
import { enrichWithAI } from "./ai";
import { startMockDataGeneration, stopMockDataGeneration } from "./mockData";
import { Telemetry } from "./types";

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

async function findSerialPorts(): Promise<{ main: string | null; secondary: string | null }> {
  const ports = await listSerialPorts();
  console.log("[serial] available ports:");
  for (const p of ports) {
    console.log("  -", p.path, p.manufacturer || "", p.vendorId || "");
  }

  let mainPath: string | null = null;
  let secondaryPath: string | null = null;

  // If explicit paths are set, use them
  if (SERIAL_PATH_MAIN !== "auto") {
    mainPath = normalizeWindowsComPath(SERIAL_PATH_MAIN);
  }
  if (SERIAL_PATH_SECONDARY !== "auto") {
    secondaryPath = normalizeWindowsComPath(SERIAL_PATH_SECONDARY);
  }

  // Auto-detect Arduino ports
  const arduinoPorts = ports.filter((p) =>
    /arduino|wch|ch340|silabs|ftdi|usb-serial|uno|mega|nano/i.test(
      [p.manufacturer, p.vendorId, p.productId, p.path, p.pnpId].filter(Boolean).join(" ")
    )
  );

  // If main not set, use first Arduino port
  if (!mainPath && arduinoPorts.length > 0) {
    mainPath = normalizeWindowsComPath(arduinoPorts[0].path);
  }

  // If secondary not set, use second Arduino port (different from main)
  if (!secondaryPath && arduinoPorts.length > 1) {
    const secondPort = arduinoPorts.find(p => normalizeWindowsComPath(p.path) !== mainPath);
    if (secondPort) {
      secondaryPath = normalizeWindowsComPath(secondPort.path);
    }
  }

  return { main: mainPath, secondary: secondaryPath };
}

function emitSerialStatus() {
  const mainConnected = ctx.serialPortMain?.isOpen ?? false;
  const secondaryConnected = ctx.serialPortSecondary?.isOpen ?? false;
  
  ctx.io?.emit("serial:status", { 
    status: mainConnected || secondaryConnected ? "connected" : "disconnected",
    main: mainConnected,
    secondary: secondaryConnected
  });
}

// Write command to secondary Arduino (for feeder)
export function writeToSecondary(obj: unknown) {
  if (!ctx.serialPortSecondary?.isOpen) {
    throw new Error("Secondary Arduino not connected");
  }
  const data = JSON.stringify(obj) + "\n";
  console.log("[serial:secondary] sending:", data.trim());
  ctx.serialPortSecondary.write(data, (err) => {
    if (err) console.error("[serial:secondary] write error:", err.message);
  });
}

// Legacy compatibility
export function writeSerialJson(obj: unknown) {
  return writeToSecondary(obj);
}

// Merge data from both Arduinos and emit telemetry
let lastMergeTime = 0;
const MERGE_INTERVAL_MS = 1000; // Emit merged data every 1 second

async function emitMergedTelemetry() {
  const now = Date.now();
  if (now - lastMergeTime < MERGE_INTERVAL_MS) return;
  lastMergeTime = now;

  const { pH, do_mg_l, rtc } = ctx.latestMainData;
  const { temp_c } = ctx.latestSecondaryData;

  // Allow partial data - emit if we have ANY sensor data
  // This allows the system to work with only one Arduino connected
  const hasMainData = pH !== undefined || do_mg_l !== undefined;
  const hasSecondaryData = temp_c !== undefined;
  
  if (!hasMainData && !hasSecondaryData) return;

  const rawTelemetry = {
    pH: pH ?? null,
    do_mg_l: do_mg_l ?? null,
    temp_c: temp_c ?? null,
    rtc,
    timestamp: new Date().toISOString()
  };

  const telemetry = normalize(rawTelemetry);
  if (!telemetry) return;

  // Enrich with AI (only if we have pH and DO for meaningful prediction)
  let enriched = telemetry;
  if (pH !== undefined && do_mg_l !== undefined) {
    enriched = await enrichWithAI(telemetry);
  }
  
  // Push to clients and storage
  pushTelemetry(enriched);
  console.log("→", enriched);
}

async function openPort(
  portPath: string, 
  portName: "main" | "secondary",
  onData: (line: string) => void
): Promise<SerialPort | null> {
  try {
    console.log(`[serial:${portName}] Opening ${portPath} @ ${SERIAL_BAUD} baud...`);
    
    const port = new SerialPort({
      path: portPath,
      baudRate: SERIAL_BAUD,
      autoOpen: false
    });

    await new Promise<void>((resolve, reject) => {
      port.open((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`[serial:${portName}] ✓ Port opened successfully`);
    
    // Wait for Arduino reset
    console.log(`[serial:${portName}] Waiting 2.5s for Arduino to initialize...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Flush garbage data
    await new Promise<void>((resolve) => {
      port.flush((err) => {
        if (err) console.warn(`[serial:${portName}] Flush warning:`, err.message);
        resolve();
      });
    });

    console.log(`[serial:${portName}] ✓ Ready to receive data`);

    // Set up line parser
    const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));
    let dataReceived = false;

    parser.on("data", (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      if (!dataReceived) {
        dataReceived = true;
        console.log(`[serial:${portName}] ✓ First data received!`);
      }
      
      onData(trimmed);
    });

    port.on("error", (err) => {
      console.error(`[serial:${portName}] Error:`, err.message);
    });

    port.on("close", () => {
      console.log(`[serial:${portName}] Port closed`);
      if (portName === "main") {
        ctx.serialPortMain = null;
        ctx.mainConnected = false;
      } else {
        ctx.serialPortSecondary = null;
        ctx.secondaryConnected = false;
      }
      emitSerialStatus();
      checkAndStartMock();
    });

    // Warn if no data after timeout
    setTimeout(() => {
      if (!dataReceived) {
        console.warn(`[serial:${portName}] ⚠️ No data received after 15 seconds!`);
      }
    }, 15000);

    return port;

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[serial:${portName}] Failed to open:`, msg);
    
    if (msg.includes("Access denied") || msg.includes("Permission denied")) {
      console.error(`[serial:${portName}] ❌ Port is locked! Close Arduino Serial Monitor.`);
    }
    
    return null;
  }
}

function handleMainData(line: string) {
  try {
    // Skip non-JSON lines
    if (!line.startsWith("{")) return;
    
    const parsed = JSON.parse(line);
    
    // Extract pH and DO (ignore temp_c from main - we get it from secondary)
    if (typeof parsed.pH === "number") {
      ctx.latestMainData.pH = parsed.pH;
    }
    if (typeof parsed.do_mg_l === "number") {
      ctx.latestMainData.do_mg_l = parsed.do_mg_l;
    }
    if (typeof parsed.rtc === "string") {
      ctx.latestMainData.rtc = parsed.rtc;
    }
    
    // Trigger merged telemetry emission
    emitMergedTelemetry();
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn("[serial:main] JSON parse error:", line.substring(0, 50));
    }
  }
}

function handleSecondaryData(line: string) {
  try {
    // Skip non-JSON lines
    if (!line.startsWith("{")) return;
    
    const parsed = JSON.parse(line);
    
    // Handle feeder acknowledgments
    if (parsed.ack) {
      console.log("[serial:secondary] Feeder ack:", parsed.ack);
      ctx.io?.emit("feeder:event", { type: "ack", ...parsed });
      return;
    }
    
    // Handle errors
    if (parsed.error) {
      console.warn("[serial:secondary] Error:", parsed.error);
      ctx.io?.emit("feeder:event", { type: "error", error: parsed.error });
      return;
    }
    
    // Extract temperature
    if (parsed.temp_c !== undefined && parsed.temp_c !== null) {
      ctx.latestSecondaryData.temp_c = parsed.temp_c;
    }
    
    // Trigger merged telemetry emission
    emitMergedTelemetry();
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn("[serial:secondary] JSON parse error:", line.substring(0, 50));
    }
  }
}

function checkAndStartMock() {
  // Start mock only if both ports are disconnected
  if (!ctx.mainConnected && !ctx.secondaryConnected && !ctx.isMockMode) {
    console.log("[serial] Both ports disconnected, starting mock data...");
    startMockDataGeneration();
  }
}

let retryTimeout: NodeJS.Timeout | null = null;

export async function startSerialLoop() {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }

  const paths = await findSerialPorts();
  console.log("[serial] Detected paths:", paths);

  // Stop mock if we have any real connection
  if (paths.main || paths.secondary) {
    if (ctx.isMockMode) {
      stopMockDataGeneration();
    }
  }

  // Open main port
  if (paths.main) {
    const mainPort = await openPort(paths.main, "main", handleMainData);
    if (mainPort) {
      ctx.serialPortMain = mainPort;
      ctx.serialPort = mainPort; // Legacy compatibility
      ctx.mainConnected = true;
    }
  } else {
    console.warn("[serial] No main Arduino port found");
  }

  // Open secondary port
  if (paths.secondary) {
    const secondaryPort = await openPort(paths.secondary, "secondary", handleSecondaryData);
    if (secondaryPort) {
      ctx.serialPortSecondary = secondaryPort;
      ctx.secondaryConnected = true;
    }
  } else {
    console.warn("[serial] No secondary Arduino port found");
  }

  emitSerialStatus();

  // Start mock if no ports connected
  if (!ctx.mainConnected && !ctx.secondaryConnected) {
    checkAndStartMock();
  }

  // Schedule retry if either port failed
  if (!ctx.mainConnected || !ctx.secondaryConnected) {
    scheduleRetry();
  }
}

export function scheduleRetry() {
  if (retryTimeout) return;
  
  console.log("[serial] Will retry connection in 10 seconds...");
  retryTimeout = setTimeout(() => {
    retryTimeout = null;
    startSerialLoop();
  }, 10000);
}
