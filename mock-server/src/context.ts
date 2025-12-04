import type express from "express";
import type http from "http";
import type { Server as IOServer } from "socket.io";
import type { SerialPort } from "serialport";
import { Telemetry } from "./types";
import { appendTelemetry } from "./storage";

export const MAX_BUFFER_SIZE = 200;

// Partial data from each Arduino
export type PartialTelemetry = {
  pH?: number;
  do_mg_l?: number;
  rtc?: string;
  temp_c?: number;
};

export const ctx: {
  app: express.Express | null;
  server: http.Server | null;
  io: IOServer | null;
  latestTelemetry: Telemetry | null;
  telemetryBuffer: Telemetry[];
  isMockMode: boolean;
  // Main Arduino (pH, DO, RTC)
  serialPortMain: SerialPort | null;
  mainConnected: boolean;
  // Secondary Arduino (temp, servo)
  serialPortSecondary: SerialPort | null;
  secondaryConnected: boolean;
  // Latest partial data from each Arduino for merging
  latestMainData: PartialTelemetry;
  latestSecondaryData: PartialTelemetry;
  // Legacy compatibility
  serialPort: SerialPort | null;
} = {
  app: null,
  server: null,
  io: null,
  latestTelemetry: null,
  telemetryBuffer: [],
  isMockMode: false,
  serialPortMain: null,
  mainConnected: false,
  serialPortSecondary: null,
  secondaryConnected: false,
  latestMainData: {},
  latestSecondaryData: {},
  serialPort: null, // Legacy - points to main
};

// Convert NaN values to null for JSON serialization and database storage
function sanitizeForJson(t: Telemetry): Record<string, unknown> {
  return {
    timestamp: t.timestamp,
    pH: Number.isFinite(t.pH) ? t.pH : null,
    temp_c: Number.isFinite(t.temp_c) ? t.temp_c : null,
    do_mg_l: Number.isFinite(t.do_mg_l) ? t.do_mg_l : null,
    fish_health: t.fish_health !== undefined && Number.isFinite(t.fish_health) ? t.fish_health : undefined,
    quality_ai: t.quality_ai !== undefined && Number.isFinite(t.quality_ai) ? t.quality_ai : undefined,
    status_ai: t.status_ai,
    rtc: t.rtc,
  };
}

// Save telemetry to database via API (optional - only if Next.js app is running)
async function saveTelemetryToDatabase(t: Telemetry) {
  // Check if database saving is enabled (default: true)
  const dbEnabled = process.env.ENABLE_DB_SAVE !== 'false';
  if (!dbEnabled) {
    return; // Skip database save if disabled
  }

  // Don't save if both pH and DO are missing (need at least pH or DO for meaningful record)
  const sanitized = sanitizeForJson(t);
  if (sanitized.pH === null && sanitized.do_mg_l === null) {
    return; // Skip - only temperature data, not worth saving alone
  }

  try {
    const apiUrl = process.env.NEXTJS_API_URL || 'http://localhost:3000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000); // 2s timeout
    
    const response = await fetch(`${apiUrl}/api/telemetry/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitized),
      signal: controller.signal as AbortSignal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const error = await response.text();
      console.warn('[db] Failed to save telemetry to database:', error);
    }
  } catch (error) {
    // Silently fail if Next.js app is not running - this is expected in some setups
    // Data is still saved to files and broadcast via Socket.IO
    if (error instanceof Error && error.name === 'AbortError') {
      // Timeout - Next.js app likely not running, skip silently
      return;
    }
    // Only log non-timeout errors (connection refused, etc.) on first occurrence
    // to avoid spam when Next.js is intentionally not running
    const errorKey = 'db_connection_warned';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(global as any)[errorKey]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any)[errorKey] = true;
      console.warn('[db] Database save unavailable (Next.js app not running). Data saved to files only.');
    }
  }
}

export function pushTelemetry(t: Telemetry) {
  ctx.latestTelemetry = t;
  ctx.telemetryBuffer.push(t);
  if (ctx.telemetryBuffer.length > MAX_BUFFER_SIZE) {
    ctx.telemetryBuffer.shift();
  }
  if (ctx.io) {
    ctx.io.emit("telemetry", t);
    ctx.io.emit("telemetry:update", t);
  }
  
  // Save to both file storage (existing) and database (new)
  appendTelemetry(t);
  saveTelemetryToDatabase(t).catch(err => {
    console.warn('[db] Async database save failed:', err);
  });
}


