"use client";

import { useMemo } from "react";
import type { Telemetry } from "@/app/lib/types";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

type StatisticsCardProps = {
  history: Telemetry[];
  latest?: Telemetry;
};

type MetricStats = {
  label: string;
  current: number;
  min: number;
  max: number;
  avg: number;
  trend: "up" | "down" | "stable";
  unit: string;
};

export function StatisticsCard({ history, latest }: StatisticsCardProps) {
  const stats = useMemo<MetricStats[]>(() => {
    if (history.length === 0 || !latest) return [];

    const phValues = history.map(h => h.pH);
    const tempValues = history.map(h => h.temp_c).filter((v): v is number => v !== undefined);
    const doValues = history.map(h => h.do_mg_l);

    const calculateStats = (
      values: number[],
      current: number,
      label: string,
      unit: string
    ): MetricStats => {
      if (values.length === 0) {
        return {
          label,
          current,
          min: current,
          max: current,
          avg: current,
          trend: "stable",
          unit
        };
      }

      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      // Calculate trend: compare current to average of last 25% of data
      const recentCount = Math.max(1, Math.floor(values.length * 0.25));
      const recentValues = values.slice(-recentCount);
      const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      
      let trend: "up" | "down" | "stable" = "stable";
      const diff = current - recentAvg;
      const threshold = (max - min) * 0.05; // 5% of range
      if (Math.abs(diff) > threshold) {
        trend = diff > 0 ? "up" : "down";
      }

      return { label, current, min, max, avg, trend, unit };
    };

    return [
      calculateStats(phValues, latest.pH, "pH Level", ""),
      calculateStats(tempValues, latest.temp_c ?? 0, "Temperature", "°C"),
      calculateStats(doValues, latest.do_mg_l, "Dissolved O₂", "mg/L")
    ];
  }, [history, latest]);

  if (stats.length === 0) {
    return (
      <div className="card-glass p-6 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          No statistics available
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass animate-slide-in">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
        <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Statistics
        </h3>
      </div>
      
      <div className="space-y-4">
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {stats.map((stat, index) => {
          const TrendIcon = stat.trend === "up" ? TrendingUp : 
                           stat.trend === "down" ? TrendingDown : Minus;
          const trendColor = stat.trend === "up" ? "text-emerald-400" :
                            stat.trend === "down" ? "text-red-400" :
                            "text-gray-400";

          return (
            <div
              key={stat.label}
              className="p-4 rounded-lg"
              style={{
                background: "rgb(var(--surface-elevated))",
                border: "1px solid var(--border)"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  {stat.label}
                </span>
                <div className="flex items-center gap-1">
                  <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                  <span className={`text-xs font-medium ${trendColor}`}>
                    {stat.trend === "up" ? "Rising" : stat.trend === "down" ? "Falling" : "Stable"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-xs mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                    Current
                  </div>
                  <div className="font-bold text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                    {stat.current.toFixed(stat.label === "Temperature" ? 1 : 2)}{stat.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                    Average
                  </div>
                  <div className="font-semibold" style={{ color: "rgb(var(--text-secondary))" }}>
                    {stat.avg.toFixed(stat.label === "Temperature" ? 1 : 2)}{stat.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                    Min
                  </div>
                  <div className="font-semibold text-blue-400">
                    {stat.min.toFixed(stat.label === "Temperature" ? 1 : 2)}{stat.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                    Max
                  </div>
                  <div className="font-semibold text-red-400">
                    {stat.max.toFixed(stat.label === "Temperature" ? 1 : 2)}{stat.unit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

