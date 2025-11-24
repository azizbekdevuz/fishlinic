import http from "http";
import { Server } from "socket.io";
import { PORT, ALLOWED_ORIGINS } from "./config";
import { ctx } from "./context";
import { createApp } from "./routes";
import { startSerialLoop, listSerialPorts } from "./serial";
import { attachFeeder, initFeederPersistence } from "./feeder";
import { initDb } from "./db";

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: ALLOWED_ORIGINS, methods: ["GET", "POST"] }, transports: ["websocket"] });

ctx.app = app;
ctx.server = server;
ctx.io = io;

attachFeeder(app);

listSerialPorts().then((ports) => {
  if (!ports.length) console.warn("[serial] no ports detected");
  else console.log("[serial] detected", ports.length, "ports");
});

// Initialize DB and load persisted schedules; then start serial loop
(async () => {
  await initDb();
  await initFeederPersistence();
  startSerialLoop();
})().catch((e) => {
  console.warn("[startup] init error:", (e as Error)?.message || e);
  startSerialLoop();
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);
  socket.on("disconnect", () => console.log("client disconnected", socket.id));
});

server.listen(PORT, () => console.log("Serial Socket.IO bridge on", PORT));


