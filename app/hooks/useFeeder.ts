"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

export type FeederSchedule = {
  id: string;
  name?: string;
  cron: string; // HH:MM
  next_run: string | null;
};

export type FeederStatus = {
  device: string;
  on_rpi: boolean;
  last_feed: { timestamp: string; source: string; details?: string } | null;
  schedules: FeederSchedule[];
};

export type FeederEvent = Record<string, unknown>; // passthrough; used for toasts/logs

function baseUrl(): string {
  const b = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
  return b.replace(/\/$/, "");
}

export function useFeeder() {
  const [status, setStatus] = useState<FeederStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<FeederEvent[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl()}/status`, { cache: "no-store" });
      if (!res.ok) return;
      const data: FeederStatus = await res.json();
      setStatus(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError((e as Error).message);
      console.error("Failed to load feeder status:", e);
    }
  }, []);

  const listSchedules = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl()}/schedule`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setStatus((prev) => prev ? { ...prev, schedules: data.schedules as FeederSchedule[] } : prev);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError((e as Error).message);
      console.error("Failed to list schedules:", e);
    }
  }, []);

  const addSchedule = useCallback(async (name: string | undefined, cron: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl()}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cron })
      });
      if (!res.ok) throw new Error("Failed to add schedule");
      await listSchedules();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listSchedules]);

  const deleteSchedule = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl()}/schedule/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete schedule");
      await listSchedules();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [listSchedules]);

  const feedNow = useCallback(async (durationSec: number, source = "dashboard") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${baseUrl()}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: durationSec, source })
      });
      if (!res.ok) throw new Error("Feed failed");
      await loadStatus();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loadStatus]);

  useEffect(() => {
    loadStatus();
    listSchedules();
  }, [loadStatus, listSchedules]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) return;
    const s = io(url, { transports: ["websocket"], reconnectionAttempts: 5 });
    socketRef.current = s;
    s.on("feeder:event", (evt) => {
      setEvents((prev) => [...prev.slice(-49), evt]);
      loadStatus();
    });
    return () => {
      s.close();
      socketRef.current = null;
    };
  }, [loadStatus]);

  const value = useMemo(() => ({
    status,
    events,
    loading,
    error,
    addSchedule,
    deleteSchedule,
    feedNow,
    reload: loadStatus,
  }), [status, events, loading, error, addSchedule, deleteSchedule, feedNow, loadStatus]);

  return value;
}


