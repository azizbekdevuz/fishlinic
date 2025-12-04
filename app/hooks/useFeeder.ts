"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type FeederSchedule = {
  id: string;
  name?: string;
  cron: string; // HH:MM
  duration?: number;
  next_run: string | null;
};

export type FeederStatus = {
  device: string;
  hardware?: {
    connected: boolean;
    main: boolean;
    secondary: boolean;
  };
  last_feed: { timestamp: string; source: string; success?: boolean; details?: string } | null;
  schedules: FeederSchedule[];
};

export type HardwareStatus = {
  connected: boolean;
  main: boolean;
  secondary: boolean;
  mockMode: boolean;
};

export type FeederEvent = Record<string, unknown>; // passthrough; used for toasts/logs

export type UseFeederOptions = {
  userId?: string;
};

function baseUrl(): string {
  const b = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
  return b.replace(/\/$/, "");
}

export function useFeeder(options?: UseFeederOptions) {
  const userId = options?.userId;
  
  const [status, setStatus] = useState<FeederStatus | null>(null);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<FeederEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Build URL with userId query param if provided
  const withUserId = useCallback((url: string) => {
    if (!userId) return url;
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}userId=${encodeURIComponent(userId)}`;
  }, [userId]);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(withUserId(`${baseUrl()}/status`), { cache: "no-store" });
      if (!res.ok) return;
      const data: FeederStatus = await res.json();
      setStatus(data);
      
      // Extract hardware status from status response
      if (data.hardware) {
        setHardwareStatus({
          connected: data.hardware.connected,
          main: data.hardware.main,
          secondary: data.hardware.secondary,
          mockMode: false
        });
      }
    } catch (e) {
      setError((e as Error).message);
      console.error("Failed to load feeder status:", e);
    }
  }, [withUserId]);

  const loadHardwareStatus = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl()}/feed/status`, { cache: "no-store" });
      if (!res.ok) return;
      const data: HardwareStatus = await res.json();
      setHardwareStatus(data);
    } catch (e) {
      // Silently fail - hardware status is optional info
      console.warn("Failed to load hardware status:", e);
    }
  }, []);

  const listSchedules = useCallback(async () => {
    try {
      const res = await fetch(withUserId(`${baseUrl()}/schedule`), { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStatus((prev) => prev ? { ...prev, schedules: data.schedules as FeederSchedule[] } : prev);
    } catch (e) {
      setError((e as Error).message);
      console.error("Failed to list schedules:", e);
    }
  }, [withUserId]);

  const addSchedule = useCallback(async (name: string | undefined, cron: string, duration: number = 2) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl()}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cron, duration, userId })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add schedule");
      }
      await listSchedules();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listSchedules, userId]);

  const deleteSchedule = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(withUserId(`${baseUrl()}/schedule/${id}`), { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          throw new Error("You don't have permission to delete this schedule");
        }
        throw new Error(data.error || "Failed to delete schedule");
      }
      await listSchedules();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listSchedules, withUserId]);

  const feedNow = useCallback(async (durationSec: number, source = "dashboard") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl()}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: durationSec, source, userId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle specific error for hardware not connected
        if (res.status === 503) {
          throw new Error(data.error || "Feeder hardware not connected");
        }
        throw new Error(data.error || "Feed failed");
      }
      
      await loadStatus();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loadStatus, userId]);

  // Initial load
  useEffect(() => {
    loadStatus();
    loadHardwareStatus();
    listSchedules();
  }, [loadStatus, loadHardwareStatus, listSchedules]);

  // Periodic hardware status check
  useEffect(() => {
    const interval = setInterval(() => {
      loadHardwareStatus();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [loadHardwareStatus]);

  // Socket.IO for real-time events
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;
    
    const s = io(url, { transports: ["websocket", "polling"], reconnectionAttempts: 5 });
    socketRef.current = s;
    
    s.on("feeder:event", (evt) => {
      // Only show events for this user (or all if no userId filter)
      const eventUserId = evt.userId as string | undefined;
      if (!userId || !eventUserId || eventUserId === userId) {
        setEvents((prev) => [...prev.slice(-49), evt]);
      }
      loadStatus();
    });
    
    s.on("serial:status", (data) => {
      // Update hardware status from socket event
      if (data.main !== undefined || data.secondary !== undefined) {
        setHardwareStatus(prev => ({
          connected: data.main || data.secondary,
          main: data.main ?? prev?.main ?? false,
          secondary: data.secondary ?? prev?.secondary ?? false,
          mockMode: prev?.mockMode ?? false
        }));
      }
    });
    
    return () => {
      s.close();
      socketRef.current = null;
    };
  }, [loadStatus, userId]);

  const value = useMemo(() => ({
    status,
    hardwareStatus,
    events,
    loading,
    error,
    addSchedule,
    deleteSchedule,
    feedNow,
    reload: loadStatus,
  }), [status, hardwareStatus, events, loading, error, addSchedule, deleteSchedule, feedNow, loadStatus]);

  return value;
}
