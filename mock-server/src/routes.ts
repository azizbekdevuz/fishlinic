import express from "express";
import { ctx } from "./context";
import { ALLOWED_ORIGINS } from "./config";
import { readHistory, ensureDataDir } from "./storage";
import { listSerialPorts } from "./serial";
import { startMockDataGeneration, stopMockDataGeneration } from "./mockData";

export function createApp() {
  ensureDataDir();
  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Vary", "Origin");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.get("/ports", async (_req, res) => {
    const ports = await listSerialPorts();
    res.json(ports);
  });

  app.get("/history", async (req, res) => {
    try {
      const now = new Date();
      const range = String(req.query.range || "24h");
      const max = Math.min(10000, Number(req.query.max || 5000));
      let from = new Date(now);
      if (range === "1w") from = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      else if (range === "1m") from = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
      else from = new Date(now.getTime() - 24 * 3600 * 1000);

      if (req.query.from) from = new Date(String(req.query.from));
      const to = req.query.to ? new Date(String(req.query.to)) : now;
      const data = await readHistory(from.toISOString(), to.toISOString(), max);
      data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      res.json(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "history_failed";
      res.status(500).json({ error: msg });
    }
  });

  app.get("/live", (_req, res) => {
    if (!ctx.latestTelemetry) return res.status(404).json({ error: "No live data available" });
    res.json({
      timestamp: ctx.latestTelemetry.timestamp,
      pH: ctx.latestTelemetry.pH,
      temp_c: ctx.latestTelemetry.temp_c,
      do_mg_l: ctx.latestTelemetry.do_mg_l,
      fish_health: ctx.latestTelemetry.fish_health,
      quality_ai: ctx.latestTelemetry.quality_ai,
      status_ai: ctx.latestTelemetry.status_ai,
      system_status: {
        serial_connected: ctx.serialPort !== null,
        mock_mode: ctx.isMockMode,
        socket_connections: ctx.io?.engine.clientsCount ?? 0,
      },
    });
  });

  app.get("/latest", (req, res) => {
    const limit = parseInt(req.query.n as string) || 10;
    const maxLimit = Math.min(limit, ctx.telemetryBuffer.length);
    if (ctx.telemetryBuffer.length === 0) return res.status(404).json({ error: "No data available" });
    const latestReadings = ctx.telemetryBuffer.slice(-maxLimit);
    res.json(latestReadings);
  });

  app.post("/mock/start", (_req, res) => {
    startMockDataGeneration();
    res.json({ message: "Mock data generation started", isMockMode: ctx.isMockMode });
  });
  app.post("/mock/stop", (_req, res) => {
    stopMockDataGeneration();
    res.json({ message: "Mock data generation stopped", isMockMode: ctx.isMockMode });
  });
  app.get("/mock/status", (_req, res) => {
    res.json({ isMockMode: ctx.isMockMode, hasSerialConnection: ctx.serialPort !== null, latestTelemetry: ctx.latestTelemetry ? "available" : "none" });
  });

  return app;
}


