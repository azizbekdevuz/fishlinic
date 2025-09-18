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
  const [telemetry, setTelemetry] = useState<Telemetry[]>(() => {
    const base: Telemetry[] = [];
    const baseTime = Date.UTC(2025, 0, 1, 0, 0, 0, 0);
    for (let i = 0; i < 40; i++) {
      const ph = 7.2 + 0.12 * Math.sin(i * 0.7);
      const temp = 25.0 + 0.6 * Math.sin(i * 0.35 + 1);
      const dox = 6.2 + 0.24 * Math.sin(i * 0.5 + 2);
      const fish = Math.round(80 + 5 * (1 + Math.sin(i * 0.4 + 3)));
      base.push({
        timestamp: new Date(baseTime + i * 60 * 60 * 1000).toISOString(),
        pH: +ph.toFixed(2),
        temp_c: +temp.toFixed(2),
        do_mg_l: +dox.toFixed(2),
        fish_health: fish
      });
    }
    return base;
  });

  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Socket.IO live stream
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return; // no WS configured, mock fallback below

    const { socket, disconnect } = connectTelemetrySocket(wsUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 5
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("telemetry", (payload: Telemetry) => setTelemetry(prev => [...prev.slice(-(bufferSize - 1)), payload]));
    socket.on("telemetry:update", (payload: Telemetry) => setTelemetry(prev => [...prev.slice(-(bufferSize - 1)), payload]));

    return () => {
      disconnect();
      socketRef.current = null;
    };
  }, [bufferSize]);

  // Mock updates when no WS URL
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

  return { telemetry, latest, socketConnected } as const;
}


