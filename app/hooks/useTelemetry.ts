"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Telemetry } from "@/app/lib/types";
import { nowISO } from "@/app/lib/utils";
import type { Socket } from "socket.io-client";
import { connectTelemetrySocket } from "@/app/services/socket";

export type UseTelemetryOptions = {
  mockIntervalMs?: number;
  bufferSize?: number;
  updateThrottleMs?: number;
};

export function useTelemetry(options?: UseTelemetryOptions) {
  const bufferSize = options?.bufferSize ?? 200;
  const updateThrottleMs = options?.updateThrottleMs ?? 2000; // Throttle updates to every 2 seconds
  
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [serialConnected, setSerialConnected] = useState<boolean | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  // Performance optimization: throttle updates
  const lastUpdateRef = useRef<number>(0);
  const pendingDataRef = useRef<Telemetry[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flushPendingData = useCallback(() => {
    if (pendingDataRef.current.length > 0) {
      const newData = [...pendingDataRef.current];
      pendingDataRef.current = [];
      
      setTelemetry(prev => {
        const combined = [...prev, ...newData];
        return combined.slice(-bufferSize);
      });
      
      lastUpdateRef.current = Date.now();
    }
  }, [bufferSize]);

  const addTelemetryData = useCallback((payload: Telemetry) => {
    pendingDataRef.current.push(payload);
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    if (timeSinceLastUpdate >= updateThrottleMs) {
      // Update immediately if enough time has passed
      flushPendingData();
    } else {
      // Schedule update for later
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        flushPendingData();
      }, updateThrottleMs - timeSinceLastUpdate);
    }
  }, [updateThrottleMs, flushPendingData]);

  // Socket.IO live stream
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return;

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
    
    // Use throttled update function
    socket.on("telemetry", addTelemetryData);
    socket.on("telemetry:update", addTelemetryData);
    
    socket.on("serial:status", (s: { status: "connected" | "disconnected" }) => 
      setSerialConnected(s.status === "connected")
    );

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      disconnect();
      socketRef.current = null;
    };
  }, [addTelemetryData]);

  // Fetch history on mount
  useEffect(() => {
    const controller = new AbortController();
    
    async function loadHistory() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";
        const res = await fetch(`${baseUrl}/history?range=24h&max=5000`, { 
          signal: controller.signal 
        });
        
        if (!res.ok) return;
        
        const data: Telemetry[] = await res.json();
        setTelemetry(data.slice(-bufferSize));
        lastUpdateRef.current = Date.now();
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('Failed to load telemetry history:', error);
        }
      }
    }
    
    loadHistory();
    
    return () => controller.abort();
  }, [bufferSize]);

  // Mock updates when no WS URL (dev only) - also throttled
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WS_URL) return;
    
    const id = setInterval(() => {
      setTelemetry(prev => {
        if (prev.length === 0) {
          // Initial mock data
          const initial: Telemetry = {
            timestamp: nowISO(),
            pH: 7.2,
            temp_c: 25.0,
            do_mg_l: 6.5,
            fish_health: 78
          };
          return [initial];
        }
        
        const last = prev[prev.length - 1];
        let ph = last.pH + (Math.random() - 0.5) * 0.08;
        const temp = last.temp_c + (Math.random() - 0.5) * 0.4;
        const dox = last.do_mg_l + (Math.random() - 0.5) * 0.2;
        
        // Occasional spikes for realism
        if (Math.random() < 0.05) {
          ph += (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.2);
        }
        
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const latest = telemetry[telemetry.length - 1];

  return { 
    telemetry, 
    latest, 
    socketConnected, 
    serialConnected,
    // Performance metrics for debugging
    _debug: {
      bufferSize: telemetry.length,
      lastUpdate: lastUpdateRef.current,
      pendingCount: pendingDataRef.current.length
    }
  } as const;
}