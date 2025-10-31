"use client";

import { useMemo } from "react";
import type { Status } from "@/app/lib/types";

type GaugeProps = {
  value: number;
  min: number;
  max: number;
  decimals: number;
  label: string;
  status: Status;
};

export function Gauge({ value, min, max, decimals, label, status }: GaugeProps) {
  const percentage = useMemo(() => {
    const clamped = Math.max(min, Math.min(max, value));
    return ((clamped - min) / (max - min)) * 100;
  }, [value, min, max]);

  const statusColor = useMemo(() => {
    switch (status) {
      case "good": return "rgb(var(--accent))";
      case "average": return "rgb(var(--warning))";
      case "alert": return "rgb(var(--danger))";
      default: return "rgb(var(--primary))";
    }
  }, [status]);

  const statusGradient = useMemo(() => {
    switch (status) {
      case "good": return "from-emerald-500 to-green-400";
      case "average": return "from-yellow-500 to-amber-400";
      case "alert": return "from-red-500 to-rose-400";
      default: return "from-blue-500 to-cyan-400";
    }
  }, [status]);

  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Circular Gauge */}
      <div className="relative w-48 h-48 mb-6">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="transparent"
            className="drop-shadow-sm"
          />
          
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={statusColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 8px ${statusColor}40)`
            }}
          />
          
          {/* Glow effect */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke={statusColor}
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="opacity-60 animate-pulse"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <div 
              className="text-4xl font-bold mb-2 animate-fade-in"
              style={{ color: statusColor }}
            >
              {value.toFixed(decimals)}
            </div>
            <div className="text-xs font-medium opacity-80" style={{ color: "rgb(var(--text-muted))" }}>
              {min} - {max}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${statusGradient} animate-pulse shadow-lg`}>
            <div className="w-full h-full rounded-full bg-white/20"></div>
          </div>
        </div>
      </div>

      {/* Label and Status */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          {label}
        </h3>
        
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
          status === "good" ? "status-good" : 
          status === "average" ? "status-warning" : "status-danger"
        }`}>
          <div className={`w-2 h-2 rounded-full bg-current animate-pulse`}></div>
          {status === "good" ? "Optimal" : 
           status === "average" ? "Acceptable" : "Critical"}
        </div>
      </div>

      {/* Progress Bar Alternative for Mobile */}
      <div className="w-full mt-4 sm:hidden">
        <div className="flex justify-between text-xs mb-1" style={{ color: "rgb(var(--text-muted))" }}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${statusGradient} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}