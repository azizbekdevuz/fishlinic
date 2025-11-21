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
  userId?: string; // Filter telemetry by user ID
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

  // Load historical data from database
  const loadHistoricalData = useCallback(async (range: string = '24h', maxRecords: number = 1000) => {
    try {
      const params = new URLSearchParams({
        range,
        max: maxRecords.toString()
      });
      
      if (options?.userId) {
        params.append('userId', options.userId);
      }

      const response = await fetch(`/api/telemetry/save?${params}`);
      if (response.ok) {
        const historicalData: Telemetry[] = await response.json();
        
        // Replace current data with historical data + any pending real-time data
        setTelemetry(prev => {
          const realtimeData = pendingDataRef.current;
          const combined = [...historicalData, ...realtimeData];
          return combined.slice(-bufferSize);
        });
        
        console.log(`[telemetry] Loaded ${historicalData.length} historical records`);
      }
    } catch (error) {
      console.warn('[telemetry] Failed to load historical data:', error);
    }
  }, [bufferSize, options?.userId]);

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
    
    // Use throttled update function with user filtering
    const userId = options?.userId;
    socket.on("telemetry", (data: Telemetry) => {
      // Filter by userId if provided (assuming backend sends userId in telemetry)
      // For now, accept all data - backend should filter
      addTelemetryData(data);
    });
    socket.on("telemetry:update", (data: Telemetry) => {
      addTelemetryData(data);
    });
    
    // Join user-specific room if userId provided
    if (userId) {
      socket.emit("join:user", { userId });
    }
    
    socket.on("serial:status", (s: { status: "connected" | "disconnected" }) => 
      setSerialConnected(s.status === "connected")
    );

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (userId && socketRef.current) {
        socketRef.current.emit("leave:user", { userId });
      }
      disconnect();
      socketRef.current = null;
    };
  }, [addTelemetryData, options?.userId]);

  // Fetch history on mount (with user filtering if userId provided)
  useEffect(() => {
    const controller = new AbortController();
    
    async function loadHistory() {
      try {
        // Try database first (new approach)
        const params = new URLSearchParams({
          range: '24h',
          max: '5000'
        });
        
        if (options?.userId) {
          params.append('userId', options.userId);
        }

        const dbRes = await fetch(`/api/telemetry/save?${params}`, { 
          signal: controller.signal 
        });
        
        if (dbRes.ok) {
          const data: Telemetry[] = await dbRes.json();
          setTelemetry(data.slice(-bufferSize));
          lastUpdateRef.current = Date.now();
          console.log(`[telemetry] Loaded ${data.length} records from database`);
          return;
        }

        // Fallback to mock server (existing approach)
        const baseUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";
        const userId = options?.userId;
        const url = userId 
          ? `${baseUrl}/history?range=24h&max=5000&userId=${userId}`
          : `${baseUrl}/history?range=24h&max=5000`;
        
        const res = await fetch(url, { 
          signal: controller.signal 
        });
        
        if (!res.ok) return;
        
        const data: Telemetry[] = await res.json();
        setTelemetry(data.slice(-bufferSize));
        lastUpdateRef.current = Date.now();
        console.log(`[telemetry] Loaded ${data.length} records from mock server`);
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('Failed to load telemetry history:', error);
        }
      }
    }
    
    loadHistory();
    
    return () => controller.abort();
  }, [bufferSize, options?.userId]);

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

  // Manual refresh function
  const refresh = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") || "http://localhost:4000";
    const userId = options?.userId;
    const url = userId 
      ? `${baseUrl}/history?range=24h&max=5000&userId=${userId}`
      : `${baseUrl}/history?range=24h&max=5000`;
    
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data: Telemetry[] = await res.json();
        setTelemetry(data.slice(-bufferSize));
        lastUpdateRef.current = Date.now();
      }
    } catch (error) {
      console.warn('Failed to refresh telemetry:', error);
    }
  }, [bufferSize, options?.userId]);

  return { 
    telemetry, 
    latest, 
    socketConnected, 
    serialConnected,
    refresh,
    // Performance metrics for debugging
    _debug: {
      bufferSize: telemetry.length,
      lastUpdate: lastUpdateRef.current,
      pendingCount: pendingDataRef.current.length
    }
  } as const;
}