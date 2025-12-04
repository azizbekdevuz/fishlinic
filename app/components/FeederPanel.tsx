"use client";

import { useMemo, useState } from "react";
import { useFeeder, FeederEvent } from "@/app/hooks/useFeeder";
import { useAuth } from "@/app/hooks/useAuth";
import { Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";

// Only allow 1, 2, 3, 4, 5 for duration (number of feed cycles)
const ALLOWED_DURATIONS = [1, 2, 3, 4, 5];

// Convert JSON feeder events to human-readable text
function formatFeederEvent(event: FeederEvent): React.ReactNode {
  if (typeof event === "string") return event;
  
  const { type, ack, error, ts, source, ok, duration, cycles, msg } = event as Record<string, unknown>;
  
  // Handle acknowledgment events from Arduino
  if (ack === "feed_start") {
    const cycleCount = cycles || duration || "?";
    return (
      <span className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-blue-400" />
        <span>Feeding started ({cycleCount as string} {Number(cycleCount) === 1 ? "cycle" : "cycles"})</span>
      </span>
    );
  }
  
  if (ack === "feed_complete") {
    return (
      <span className="flex items-center gap-1.5">
        <CheckCircle className="w-3 h-3 text-green-400" />
        <span>Feeding completed successfully</span>
      </span>
    );
  }
  
  // Handle error events
  if (error) {
    const errorMsg = typeof error === "string" ? error : "Unknown error";
    return (
      <span className="flex items-center gap-1.5">
        <XCircle className="w-3 h-3 text-red-400" />
        <span className="text-red-300">Error: {errorMsg.replace(/_/g, " ")}</span>
      </span>
    );
  }
  
  // Handle log events from server
  if (type === "log") {
    const timestamp = ts ? new Date(ts as string).toLocaleTimeString() : "";
    const sourceText = source === "scheduler" ? "Scheduled" : source === "dashboard" ? "Manual" : String(source || "API");
    const success = ok === true;
    
    return (
      <span className="flex items-center gap-1.5">
        {success ? (
          <CheckCircle className="w-3 h-3 text-green-400" />
        ) : (
          <XCircle className="w-3 h-3 text-red-400" />
        )}
        <span>
          {timestamp && <span className="opacity-60">[{timestamp}]</span>} {sourceText} feed {success ? "succeeded" : "failed"}
          {duration != null && <span className="opacity-60"> ({String(duration)} {Number(duration) === 1 ? "cycle" : "cycles"})</span>}
          {!success && msg != null && <span className="text-red-300"> - {String(msg)}</span>}
        </span>
      </span>
    );
  }
  
  // Fallback for unknown event types
  return (
    <span className="opacity-60">
      {JSON.stringify(event)}
    </span>
  );
}

export function FeederPanel() {
  // Get current user for user-specific schedules
  const { user } = useAuth();
  const userId = user?.id;
  
  // Pass userId to useFeeder to filter schedules by user
  const { status, events, loading, error, addSchedule, deleteSchedule, feedNow, hardwareStatus } = useFeeder({ userId });
  
  const [duration, setDuration] = useState<number>(2);
  const [name, setName] = useState<string>("");
  const [time, setTime] = useState<string>("07:30");
  const [inputError, setInputError] = useState<string | null>(null);

  const lastFeed = status?.last_feed ?? null;
  const isHardwareConnected = hardwareStatus?.secondary === true;

  const disabled = loading;

  // Validate duration input
  const handleDurationChange = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      setInputError("Please enter a number");
      return;
    }
    if (!ALLOWED_DURATIONS.includes(num)) {
      setInputError("Only 1, 2, 3, 4, or 5 allowed");
      setDuration(num); // Still update for display
      return;
    }
    setInputError(null);
    setDuration(num);
  };

  const isValidDuration = ALLOWED_DURATIONS.includes(duration);

  const nextRuns = useMemo(() => {
    const schedules = status?.schedules ?? [];
    return schedules.map(s => ({ 
      id: s.id, 
      label: `${s.name || "(unnamed)"} • ${s.cron}`, 
      duration: s.duration ?? 2,
      next: s.next_run ? new Date(s.next_run).toLocaleString() : "-" 
    }));
  }, [status?.schedules]);

  return (
    <div className="card-glass animate-slide-in" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Feeder Control
        </h3>
        
        {/* Hardware Status Indicator */}
        <div className={`badge ${isHardwareConnected ? "status-good" : "status-warning"} text-xs`}>
          {isHardwareConnected ? (
            <>
              <Wifi className="w-3 h-3" />
              Connected
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              Not Connected
            </>
          )}
        </div>
      </div>

      {/* Hardware Warning */}
      {!isHardwareConnected && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <span className="font-medium">Feeder hardware not detected.</span>
            <p className="text-xs mt-1 opacity-80">
              Connect the secondary Arduino (servo controller) to enable feeding. Schedules will still be saved.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2 rounded bg-red-500/20 border border-red-500/30 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Manual Feed */}
        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>
                Feed Cycles (1-5)
              </label>
              <select
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="input w-full"
              >
                {ALLOWED_DURATIONS.map(d => (
                  <option key={d} value={d}>{d} {d === 1 ? "cycle" : "cycles"}</option>
                ))}
              </select>
              <p className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
                Each cycle = 1 full rotation (0°→180°→0°)
              </p>
            </div>
            <button
              className={`btn ${isHardwareConnected && isValidDuration ? "btn-primary" : "btn-secondary"}`}
              disabled={disabled || !isHardwareConnected || !isValidDuration}
              onClick={() => feedNow(duration)}
              title={!isHardwareConnected ? "Connect feeder hardware first" : !isValidDuration ? "Invalid duration" : "Feed fish now"}
            >
              {loading ? "Feeding..." : "Feed Now"}
            </button>
          </div>
          {inputError && (
            <p className="text-xs mt-1 text-red-400">{inputError}</p>
          )}
          {lastFeed && (
            <p className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
              Last feed: {new Date(lastFeed.timestamp).toLocaleString()} 
              ({lastFeed.source}) 
              {lastFeed.success === false && <span className="text-red-400"> - Failed</span>}
            </p>
          )}
        </div>

        {/* Schedules */}
        <div className="border-t border-white/10 pt-4">
          <div className="text-sm font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            Scheduled Feeds
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[100px]">
              <label className="text-xs block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>Name</label>
              <input
                type="text"
                placeholder="Morning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
            <div className="w-24">
              <label className="text-xs block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input w-full text-sm"
              />
            </div>
            <div className="w-20">
              <label className="text-xs block mb-1" style={{ color: "rgb(var(--text-secondary))" }}>Cycles</label>
              <select
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="input w-full text-sm"
              >
                {ALLOWED_DURATIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              disabled={disabled || !/^\d{2}:\d{2}$/.test(time) || !isValidDuration}
              onClick={() => addSchedule(name || undefined, time, duration)}
            >
              Add
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {nextRuns.length === 0 && (
              <li className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                No schedules yet. Add a schedule above.
              </li>
            )}
            {nextRuns.map((n) => (
              <li key={n.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                <div>
                  <div className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                    {n.label} <span className="text-xs opacity-60">({n.duration} {n.duration === 1 ? "cycle" : "cycles"})</span>
                  </div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    Next: {n.next}
                  </div>
                </div>
                <button 
                  className="btn btn-danger btn-sm" 
                  disabled={disabled} 
                  onClick={() => deleteSchedule(n.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent feeder events */}
        {events.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <div className="text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
              Recent Events
            </div>
            <ul className="space-y-1 max-h-28 overflow-auto pr-1">
              {[...events].slice(-8).reverse().map((e, i) => (
                <li key={i} className="text-xs p-1.5 rounded bg-white/5" style={{ color: "rgb(var(--text-muted))" }}>
                  {formatFeederEvent(e)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
