"use client";

import { useMemo, useState } from "react";
import { useFeeder } from "@/app/hooks/useFeeder";

export function FeederPanel() {
  const { status, events, loading, error, addSchedule, deleteSchedule, feedNow } = useFeeder();
  const [duration, setDuration] = useState<number>(1.0);
  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<string>("07:30");

  const lastFeed = status?.last_feed ?? null;

  const disabled = loading;

  const nextRuns = useMemo(() => {
    const schedules = status?.schedules ?? [];
    return schedules.map(s => ({ 
      id: s.id, 
      label: `${s.name || "(unnamed)"} • ${s.cron}`, 
      next: s.next_run ? new Date(s.next_run).toLocaleString() : "-" 
    }));
  }, [status?.schedules]);

  return (
    <div className="card-glass animate-slide-in" style={{ animationDelay: "350ms" }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
        Feeder Control
      </h3>

      {error && (
        <div className="mb-3 text-sm text-red-300">{error}</div>
      )}

      <div className="space-y-4">
        {/* Manual Feed */}
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>Duration (seconds)</label>
              <input
                type="number"
                step={0.5}
                min={0.5}
                max={10}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input w-full"
              />
            </div>
            <button
              className="btn btn-primary"
              disabled={disabled}
              onClick={() => feedNow(duration)}
            >
              {disabled ? "Feeding..." : "Feed Now"}
            </button>
          </div>
          {lastFeed && (
            <p className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
              Last feed: {new Date(lastFeed.timestamp).toLocaleString()} ({lastFeed.source})
            </p>
          )}
        </div>

        {/* Schedules */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>Name</label>
              <input
                type="text"
                placeholder="Morning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-sm block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>Time (HH:MM)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
              />
            </div>
            <button
              className="btn btn-secondary"
              disabled={disabled || !/^\d{2}:\d{2}$/.test(time)}
              onClick={() => addSchedule(name || undefined, time)}
            >
              Add
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {nextRuns.length === 0 && (
              <li className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>No schedules yet.</li>
            )}
            {nextRuns.map((n) => (
              <li key={n.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>{n.label}</div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Next: {n.next}</div>
                </div>
                <button className="btn btn-danger btn-sm" disabled={disabled} onClick={() => deleteSchedule(n.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent feeder events */}
        {events.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <div className="text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>Recent Events</div>
            <ul className="space-y-1 max-h-28 overflow-auto pr-1">
              {[...events].slice(-8).reverse().map((e, i) => (
                <li key={i} className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  {typeof e === "string" ? e : JSON.stringify(e)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}


