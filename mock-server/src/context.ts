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
  appendTelemetry(t);
}


