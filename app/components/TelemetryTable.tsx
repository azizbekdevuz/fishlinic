"use client";

import { formatDateTime } from "@/app/lib/format";
import type { Telemetry } from "@/app/lib/types";
import { 
  Clock, 
  TestTube, 
  Thermometer, 
  Wind, 
  Fish, 
  Brain,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  HelpCircle
} from "lucide-react";

type TelemetryTableProps = {
  rows: Telemetry[];
};

export function TelemetryTable({ rows }: TelemetryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 mx-auto mb-3 text-gray-400" />
        <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          No telemetry data available
        </div>
        <div className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
          Data will appear as measurements are collected
        </div>
      </div>
    );
  }

  const getStatusColor = (value: number, type: 'ph' | 'temp' | 'do') => {
    switch (type) {
      case 'ph':
        if (value >= 6.5 && value <= 8.0) return "text-emerald-400";
        if (value >= 6.0 && value <= 8.5) return "text-yellow-400";
        return "text-red-400";
      case 'temp':
        if (value >= 20 && value <= 30) return "text-emerald-400";
        if (value >= 18 && value <= 32) return "text-yellow-400";
        return "text-red-400";
      case 'do':
        if (value >= 5.0) return "text-emerald-400";
        if (value >= 3.5) return "text-yellow-400";
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (value: number, type: 'ph' | 'temp' | 'do') => {
    const color = getStatusColor(value, type);
    if (color.includes("emerald")) return CheckCircle;
    if (color.includes("yellow")) return AlertTriangle;
    return AlertCircle;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        {/* Table Header */}
        <div className="bg-white/5 border-b border-white/10">
          <div className="grid grid-cols-6 gap-4 p-4 text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Timestamp</span>
            </div>
            <div className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              <span>pH Level</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              <span>Temperature</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span>Dissolved O₂</span>
            </div>
            <div className="flex items-center gap-2">
              <Fish className="w-4 h-4" />
              <span>Fish Health</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>AI Score</span>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="max-h-96 overflow-y-auto">
          {rows.map((row, index) => (
            <div
              key={`${row.timestamp}-${index}`}
              className={`grid grid-cols-6 gap-4 p-4 text-sm border-b border-white/5 hover:bg-white/5 transition-colors animate-fade-in ${
                index % 2 === 0 ? "bg-white/2" : ""
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Timestamp */}
              <div className="flex flex-col">
                <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  {formatDateTime(row.timestamp)}
                </span>
                <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  {new Date(row.timestamp).toLocaleDateString()}
                </span>
              </div>

              {/* pH */}
              <div className="flex items-center gap-2">
                {(() => {
                  const StatusIcon = getStatusIcon(row.pH, 'ph');
                  return <StatusIcon className="w-4 h-4" />;
                })()}
                <div className="flex flex-col">
                  <span className={`font-bold ${getStatusColor(row.pH, 'ph')}`}>
                    {row.pH?.toFixed(2) ?? "--"}
                  </span>
                  <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    pH units
                  </span>
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-2">
                {(() => {
                  const StatusIcon = getStatusIcon(row.temp_c, 'temp');
                  return <StatusIcon className="w-4 h-4" />;
                })()}
                <div className="flex flex-col">
                  <span className={`font-bold ${getStatusColor(row.temp_c, 'temp')}`}>
                    {row.temp_c?.toFixed(1) ?? "--"}°C
                  </span>
                  <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {row.temp_c != null ? ((row.temp_c * 9/5) + 32).toFixed(1) : "--"}°F
                  </span>
                </div>
              </div>

              {/* Dissolved Oxygen */}
              <div className="flex items-center gap-2">
                {(() => {
                  const StatusIcon = getStatusIcon(row.do_mg_l, 'do');
                  return <StatusIcon className="w-4 h-4" />;
                })()}
                <div className="flex flex-col">
                  <span className={`font-bold ${getStatusColor(row.do_mg_l, 'do')}`}>
                    {row.do_mg_l?.toFixed(2) ?? "--"}
                  </span>
                  <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    mg/L
                  </span>
                </div>
              </div>

              {/* Fish Health */}
              <div className="flex items-center gap-2">
                {row.fish_health ? (
                  <>
                    {row.fish_health >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : row.fish_health >= 60 ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div className="flex flex-col">
                      <span className={`font-bold ${
                        row.fish_health >= 80 ? "text-emerald-400" :
                        row.fish_health >= 60 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {row.fish_health}%
                      </span>
                      <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        Health score
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 opacity-50" />
                    <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      No data
                    </span>
                  </div>
                )}
              </div>

              {/* AI Quality Score */}
              <div className="flex items-center gap-2">
                {row.quality_ai ? (
                  <>
                    <Brain className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                      <span className={`font-bold ${
                        row.quality_ai >= 8 ? "text-emerald-400" :
                        row.quality_ai >= 6 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {row.quality_ai.toFixed(1)}
                      </span>
                      <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        /10 AI score
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 opacity-50" />
                    <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      Processing...
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {rows.map((row, index) => (
          <div
            key={`${row.timestamp}-${index}`}
            className="card p-4 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header with timestamp */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                <span className="font-medium text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                  {formatDateTime(row.timestamp)}
                </span>
              </div>
              {row.quality_ai && (
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className={`text-sm font-bold ${
                    row.quality_ai >= 8 ? "text-emerald-400" :
                    row.quality_ai >= 6 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {row.quality_ai.toFixed(1)}/10
                  </span>
                </div>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* pH */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  {(() => {
                    const StatusIcon = getStatusIcon(row.pH, 'ph');
                    return <StatusIcon className="w-3 h-3" />;
                  })()}
                </div>
                <div>
                  <div className={`font-bold text-sm ${getStatusColor(row.pH, 'ph')}`}>
                    {row.pH?.toFixed(2) ?? "--"}
                  </div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    pH
                  </div>
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  {(() => {
                    const StatusIcon = getStatusIcon(row.temp_c, 'temp');
                    return <StatusIcon className="w-3 h-3" />;
                  })()}
                </div>
                <div>
                  <div className={`font-bold text-sm ${getStatusColor(row.temp_c, 'temp')}`}>
                    {row.temp_c?.toFixed(1) ?? "--"}°C
                  </div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {row.temp_c != null ? ((row.temp_c * 9/5) + 32).toFixed(1) : "--"}°F
                  </div>
                </div>
              </div>

              {/* Dissolved Oxygen */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  {(() => {
                    const StatusIcon = getStatusIcon(row.do_mg_l, 'do');
                    return <StatusIcon className="w-3 h-3" />;
                  })()}
                </div>
                <div>
                  <div className={`font-bold text-sm ${getStatusColor(row.do_mg_l, 'do')}`}>
                    {row.do_mg_l?.toFixed(2) ?? "--"}
                  </div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    mg/L O₂
                  </div>
                </div>
              </div>

              {/* Fish Health */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Fish className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  {row.fish_health ? (
                    row.fish_health >= 80 ? (
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    ) : row.fish_health >= 60 ? (
                      <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    )
                  ) : (
                    <HelpCircle className="w-3 h-3 opacity-50" />
                  )}
                </div>
                <div>
                  {row.fish_health ? (
                    <>
                      <div className={`font-bold text-sm ${
                        row.fish_health >= 80 ? "text-emerald-400" :
                        row.fish_health >= 60 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {row.fish_health}%
                      </div>
                      <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        Health
                      </div>
                    </>
                  ) : (
                    <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      No data
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Footer */}
      <div className="bg-white/5 border-t border-white/10 p-4">
        <div className="flex items-center justify-between text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <span>Optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Acceptable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span>Critical</span>
            </div>
          </div>
          <div>
            Showing {rows.length} most recent measurements
          </div>
        </div>
      </div>
    </div>
  );
}