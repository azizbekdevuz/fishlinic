import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = Number(process.env.PORT) || 4000;

const nowISO = () => new Date().toISOString();
let pH = 7.2,
  temp = 25.0,
  dox = 6.2;

io.on("connection", (socket) => {
  console.log("client connected", socket.id);
  socket.emit("telemetry", { timestamp: nowISO(), pH, temp_c: temp, do_mg_l: dox, fish_health: 82 });
  socket.on("disconnect", () => console.log("client disconnected", socket.id));
});

setInterval(() => {
  pH += (Math.random() - 0.5) * 0.12;
  temp += (Math.random() - 0.5) * 0.6;
  dox += (Math.random() - 0.5) * 0.24;
  if (Math.random() < 0.06) pH += (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.2);
  const payload = {
    timestamp: nowISO(),
    pH: +pH.toFixed(2),
    temp_c: +temp.toFixed(1),
    do_mg_l: +dox.toFixed(2),
    fish_health: Math.round(78 + (Math.random() - 0.5) * 12)
  };
  io.emit("telemetry", payload);
  console.log("emitted", payload);
}, 3000);

server.listen(PORT, () => console.log("Mock telemetry server running on", PORT));