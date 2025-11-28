import type express from "express";
import type http from "http";
import type { Server as IOServer } from "socket.io";
import type { SerialPort } from "serialport";
import { Telemetry } from "./types";
import { appendTelemetry } from "./storage";

export const MAX_BUFFER_SIZE = 200;

export const ctx: {
  app: express.Express | null;
  server: http.Server | null;
  io: IOServer | null;
  latestTelemetry: Telemetry | null;
  telemetryBuffer: Telemetry[];
  isMockMode: boolean;
  serialPort: SerialPort | null;
} = {
  app: null,
  server: null,
  io: null,
  latestTelemetry: null,
  telemetryBuffer: [],
  isMockMode: false,
  serialPort: null,
};

// Save telemetry to database via API (optional - only if Next.js app is running)
async function saveTelemetryToDatabase(t: Telemetry) {
  // Check if database saving is enabled (default: true)
  const dbEnabled = process.env.ENABLE_DB_SAVE !== 'false';
  if (!dbEnabled) {
    return; // Skip database save if disabled
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
      body: JSON.stringify(t),
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
    if (!(global as any)[errorKey]) {
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


