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

// Save telemetry to database via API
async function saveTelemetryToDatabase(t: Telemetry) {
  try {
    const response = await fetch('http://localhost:3000/api/telemetry/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(t)
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn('[db] Failed to save telemetry to database:', error);
    }
  } catch (error) {
    console.warn('[db] Database save error:', error);
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


