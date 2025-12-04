"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Telemetry } from "@/app/lib/types";
import { nowISO } from "@/app/lib/utils";
import type { Socket } from "socket.io-client";
import { connectTelemetrySocket } from "@/app/services/socket";

export type UseTelemetryOptions = {
  bufferSize?: number;
  updateThrottleMs?: number;  // How often to update UI (user setting)
  userId?: string;
};

// Hardware connection status for both Arduinos
export type HardwareConnectionStatus = {
  main: boolean;      // pH, DO, RTC Arduino
  secondary: boolean; // Temperature, Servo Arduino
};

export function useTelemetry(options?: UseTelemetryOptions) {
  const bufferSize = options?.bufferSize ?? 200;
  const updateThrottleMs = options?.updateThrottleMs ?? 2000;
  
  const [telemetry, setTelemetry] = useState<Telemetry[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [serialConnected, setSerialConnected] = useState<boolean | null>(null);
  const [bridgeAvailable, setBridgeAvailable] = useState<boolean | null>(null);
  const [isMockMode, setIsMockMode] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareConnectionStatus>({ main: false, secondary: false });
  
  const socketRef = useRef<Socket | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pendingDataRef = useRef<Telemetry[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Flush pending data to state (respects user's update interval setting)
  const flushPendingData = useCallback(() => {
    if (pendingDataRef.current.length === 0) return;
    
    const newData = [...pendingDataRef.current];
    pendingDataRef.current = [];
    
    setTelemetry(prev => {
      const combined = [...prev, ...newData];
      return combined.slice(-bufferSize);
    });
    
    lastUpdateRef.current = Date.now();
  }, [bufferSize]);

  // Add telemetry data with throttling based on user settings
  const addTelemetryData = useCallback((payload: Telemetry) => {
    pendingDataRef.current.push(payload);
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    if (timeSinceLastUpdate >= updateThrottleMs) {
      // Update immediately if enough time has passed
      flushPendingData();
    } else {
      // Schedule update for later (respects user's refresh interval setting)
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        flushPendingData();
      }, updateThrottleMs - timeSinceLastUpdate);
    }
  }, [updateThrottleMs, flushPendingData]);

  // Socket.IO connection for real-time updates
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      setBridgeAvailable(false);
      return;
    }

    const { socket, disconnect } = connectTelemetrySocket(wsUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10
    });
    socketRef.current = socket;

    // Connection status handlers
    socket.on("connect", () => {
      console.log("[telemetry] Socket connected");
      setSocketConnected(true);
      setBridgeAvailable(true);
    });
    
    socket.on("disconnect", () => {
      console.log("[telemetry] Socket disconnected");
      setSocketConnected(false);
    });
    
    socket.on("connect_error", (err) => {
      console.warn("[telemetry] Connection error:", err.message);
      setSocketConnected(false);
      setBridgeAvailable(false);
    });
    
    socket.on("reconnect", () => {
      console.log("[telemetry] Reconnected");
      setSocketConnected(true);
      setBridgeAvailable(true);
    });
    
    // Serial status (hardware connection) - supports both old and new format
    socket.on("serial:status", (s: { status?: "connected" | "disconnected"; main?: boolean; secondary?: boolean }) => {
      const mainConnected = s.main ?? false;
      const secondaryConnected = s.secondary ?? false;
      const anyConnected = mainConnected || secondaryConnected || s.status === "connected";
      
      console.log("[telemetry] Hardware status:", { main: mainConnected, secondary: secondaryConnected, anyConnected });
      
      setHardwareStatus({ main: mainConnected, secondary: secondaryConnected });
      setSerialConnected(anyConnected);
      setIsMockMode(!anyConnected);
    });
    
    // Telemetry data events
    socket.on("telemetry", (data: Telemetry) => {
      addTelemetryData(data);
    });
    
    socket.on("telemetry:update", (data: Telemetry) => {
      addTelemetryData(data);
    });

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      disconnect();
      socketRef.current = null;
    };
  }, [addTelemetryData]);

  // Load historical data on mount
  useEffect(() => {
    const controller = new AbortController();
    
    async function loadHistory() {
      const baseUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "");
      if (!baseUrl) return;
      
      try {
        // Fetch from bridge's history endpoint
        const url = `${baseUrl}/history?range=24h&max=5000`;
        const res = await fetch(url, { signal: controller.signal });
        
        if (res.ok) {
          const data: Telemetry[] = await res.json();
          setTelemetry(data.slice(-bufferSize));
          lastUpdateRef.current = Date.now();
          console.log(`[telemetry] Loaded ${data.length} historical records`);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('[telemetry] Failed to load history:', error.message);
        }
      }
    }
    
    loadHistory();
    return () => controller.abort();
  }, [bufferSize]);

  // Fallback: Generate mock data locally when no bridge available
  useEffect(() => {
    // Only run if bridge is confirmed unavailable (not just null/unknown)
    if (bridgeAvailable !== false) return;
    
    console.log("[telemetry] Bridge unavailable, generating local mock data");
    
    const id = setInterval(() => {
      setTelemetry(prev => {
        const last = prev[prev.length - 1] || {
          pH: 7.2, temp_c: 25.0, do_mg_l: 6.5
        };
        
        const next: Telemetry = {
          timestamp: nowISO(),
          pH: +(last.pH + (Math.random() - 0.5) * 0.1).toFixed(2),
          temp_c: +(last.temp_c + (Math.random() - 0.5) * 0.3).toFixed(1),
          do_mg_l: +(last.do_mg_l + (Math.random() - 0.5) * 0.2).toFixed(2),
          fish_health: Math.round(75 + (Math.random() - 0.5) * 10)
        };
        
        return [...prev.slice(-(bufferSize - 1)), next];
      });
    }, updateThrottleMs);
    
    return () => clearInterval(id);
  }, [bridgeAvailable, bufferSize, updateThrottleMs]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "");
    if (!baseUrl) return;
    
    try {
      const res = await fetch(`${baseUrl}/history?range=24h&max=5000`);
      if (res.ok) {
        const data: Telemetry[] = await res.json();
        setTelemetry(data.slice(-bufferSize));
        lastUpdateRef.current = Date.now();
      }
    } catch (error) {
      console.warn('[telemetry] Refresh failed:', error);
    }
  }, [bufferSize]);

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
    bridgeAvailable,
    isMockMode,
    hardwareStatus,
    refresh
  } as const;
}
