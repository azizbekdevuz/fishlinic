"use client";

import { useEffect, useRef, useState } from "react";
import type { Telemetry } from "@/app/lib/types";
import { nowISO } from "@/app/lib/utils";
import type { Socket } from "socket.io-client";
import { connectTelemetrySocket } from "@/app/services/socket";

export type UseTelemetryOptions = {
  mockIntervalMs?: number;
  bufferSize?: number;
};

export function useTelemetry(options?: UseTelemetryOptions) {
  const bufferSize = options?.bufferSize ?? 200;
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);

  const [socketConnected, setSocketConnected] = useState(false);
  const [serialConnected, setSerialConnected] = useState<boolean | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Socket.IO live stream
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return; // no WS configured, mock fallback below

    const { socket, disconnect } = connectTelemetrySocket(wsUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 8
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("connect_error", () => setSocketConnected(false));
    socket.on("reconnect", () => setSocketConnected(true));
    socket.on("reconnect_attempt", () => setSocketConnected(false));
    socket.on("telemetry", (payload: Telemetry) => setTelemetry(prev => [...prev.slice(-(bufferSize - 1)), payload]));
    socket.on("telemetry:update", (payload: Telemetry) => setTelemetry(prev => [...prev.slice(-(bufferSize - 1)), payload]));
    socket.on("serial:status", (s: { status: "connected" | "disconnected" }) => setSerialConnected(s.status === "connected"));

    return () => {
      disconnect();
      socketRef.current = null;
    };
  }, [bufferSize]);

  // Fetch history on mount (true 24h default)
  useEffect(() => {
    const controller = new AbortController();
    async function loadHistory() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";
        const res = await fetch(`${baseUrl}/history?range=24h&max=5000`, { signal: controller.signal });
        if (!res.ok) return;
        const data: Telemetry[] = await res.json();
        setTelemetry(data.slice(-bufferSize));
      } catch {}
    }
    loadHistory();
    return () => controller.abort();
  }, [bufferSize]);

  // Mock updates when no WS URL (dev only)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WS_URL) return;
    const id = setInterval(() => {
      setTelemetry(prev => {
        const last = prev[prev.length - 1];
        let ph = last.pH + (Math.random() - 0.5) * 0.08;
        const temp = last.temp_c + (Math.random() - 0.5) * 0.4;
        const dox = last.do_mg_l + (Math.random() - 0.5) * 0.2;
        if (Math.random() < 0.05) ph += (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.2);
        const next: Telemetry = {
          timestamp: nowISO(),
          pH: +ph.toFixed(2),
          temp_c: +temp.toFixed(1),
          do_mg_l: +dox.toFixed(2),
          fish_health: Math.round(78 + (Math.random() - 0.5) * 12)
        };
        return [...prev.slice(-(bufferSize - 1)), next];
      });
    }, options?.mockIntervalMs ?? 3000);
    return () => clearInterval(id);
  }, [bufferSize, options?.mockIntervalMs]);

  const latest = telemetry[telemetry.length - 1];

  return { telemetry, latest, socketConnected, serialConnected } as const;
}


