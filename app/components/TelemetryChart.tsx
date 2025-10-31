"use client";

import { useMemo, useState } from "react";
import type { Telemetry } from "@/app/lib/types";
import { TestTube, Thermometer, Wind, Eye, EyeOff } from "lucide-react";

type TelemetryChartProps = {
  history: Telemetry[];
};

type MetricType = 'pH' | 'temp' | 'do';

export function TelemetryChart({ history }: TelemetryChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricType>>(new Set(['pH', 'temp', 'do']));

  const chartData = useMemo(() => {
    if (history.length === 0) return null;

    // Take a reasonable sample of data points for clean visualization
    const maxPoints = 100;
    const step = Math.max(1, Math.floor(history.length / maxPoints));
    const sampledHistory = history.filter((_, index) => index % step === 0);

    // Chart dimensions
    const width = 800;
    const height = 300;
    const padding = 40;

    // Normalize each metric to its own scale for better visualization
    const normalizeToScale = (values: number[], targetMin: number, targetMax: number) => {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min || 1;
      
      return values.map(value => {
        const normalized = (value - min) / range;
        return targetMin + normalized * (targetMax - targetMin);
      });
    };

    // Get values for each metric
    const phValues = sampledHistory.map(h => h.pH);
    const tempValues = sampledHistory.map(h => h.temp_c);
    const doValues = sampledHistory.map(h => h.do_mg_l);

    // Create separate Y scales for each metric to avoid overlap
    const phScale = normalizeToScale(phValues, height - padding - 80, padding + 20);
    const tempScale = normalizeToScale(tempValues, height - padding - 40, padding + 60);
    const doScale = normalizeToScale(doValues, height - padding, padding + 100);

    // Create points for each metric
    const points = sampledHistory.map((item, index) => {
      const x = padding + (index / (sampledHistory.length - 1)) * (width - 2 * padding);
      
      return {
        x,
        ph: phScale[index],
        temp: tempScale[index],
        do: doScale[index],
        timestamp: item.timestamp,
        values: {
          pH: item.pH,
          temp_c: item.temp_c,
          do_mg_l: item.do_mg_l
        }
      };
    });

    // Create smooth SVG paths
    const createPath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return "";
      if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
      
      let path = `M ${points[0].x},${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        const curr = points[i];
        path += ` L ${curr.x},${curr.y}`;
      }
      
      return path;
    };

    const phPath = createPath(points.map(p => ({ x: p.x, y: p.ph })));
    const tempPath = createPath(points.map(p => ({ x: p.x, y: p.temp })));
    const doPath = createPath(points.map(p => ({ x: p.x, y: p.do })));

    return {
      points,
      paths: { ph: phPath, temp: tempPath, do: doPath },
      current: {
        ph: phValues[phValues.length - 1],
        temp: tempValues[tempValues.length - 1],
        do: doValues[doValues.length - 1]
      },
      ranges: {
        ph: { min: Math.min(...phValues), max: Math.max(...phValues) },
        temp: { min: Math.min(...tempValues), max: Math.max(...tempValues) },
        do: { min: Math.min(...doValues), max: Math.max(...doValues) }
      },
      sampledCount: sampledHistory.length,
      totalCount: history.length,
      width,
      height
    };
  }, [history]);

  const toggleMetric = (metric: MetricType) => {
    const newVisible = new Set(visibleMetrics);
    if (newVisible.has(metric)) {
      newVisible.delete(metric);
    } else {
      newVisible.add(metric);
    }
    setVisibleMetrics(newVisible);
  };

  const metrics = [
    { 
      key: 'pH' as MetricType, 
      label: 'pH Level', 
      icon: TestTube, 
      color: '#10b981', 
      unit: '',
      optimal: '6.5-8.0'
    },
    { 
      key: 'temp' as MetricType, 
      label: 'Temperature', 
      icon: Thermometer, 
      color: '#f59e0b', 
      unit: '°C',
      optimal: '20-30°C'
    },
    { 
      key: 'do' as MetricType, 
      label: 'Dissolved O₂', 
      icon: Wind, 
      color: '#3b82f6', 
      unit: 'mg/L',
      optimal: '>5.0 mg/L'
    }
  ];

  if (!chartData || history.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/10 flex items-center justify-center">
            <TestTube className="w-8 h-8 text-gray-400" />
          </div>
          <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            No data available for chart
          </div>
          <div className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
            Data will appear as measurements are collected
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            const isVisible = visibleMetrics.has(metric.key);
            const rangeKey = metric.key === 'pH' ? 'ph' : metric.key;
            const currentValue = chartData.current[rangeKey as keyof typeof chartData.current];
            
            return (
              <button
                key={metric.key}
                onClick={() => toggleMetric(metric.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isVisible 
                    ? 'bg-white/20 border border-white/30' 
                    : 'bg-white/5 border border-white/10 opacity-60 hover:opacity-100'
                }`}
                style={{ 
                  borderLeftColor: isVisible ? metric.color : 'transparent',
                  borderLeftWidth: '3px'
                }}
              >
                <IconComponent className="w-3 h-3" />
                <span>{metric.label}</span>
                <span className="font-bold" style={{ color: metric.color }}>
                  {currentValue ? currentValue.toFixed(metric.key === 'temp' ? 1 : 2) : '--'}{metric.unit}
                </span>
                {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
        
        <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          {chartData.sampledCount} of {chartData.totalCount} points
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-50/5 to-slate-100/5 rounded-xl border border-white/10">
        <svg 
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="phGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="1"/>
            </linearGradient>
            
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#d97706" stopOpacity="1"/>
            </linearGradient>
            
            <linearGradient id="doGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="1"/>
            </linearGradient>

            {/* Grid lines */}
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          
          {/* Background Grid */}
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
          
          {/* Chart Lines */}
          {visibleMetrics.has('pH') && (
            <path
              d={chartData.paths.ph}
              fill="none"
              stroke="url(#phGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.3))'
              }}
            />
          )}
          
          {visibleMetrics.has('temp') && (
            <path
              d={chartData.paths.temp}
              fill="none"
              stroke="url(#tempGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.3))'
              }}
            />
          )}
          
          {visibleMetrics.has('do') && (
            <path
              d={chartData.paths.do}
              fill="none"
              stroke="url(#doGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.3))'
              }}
            />
          )}

          {/* Y-axis labels */}
          <g className="text-xs" fill="rgba(255,255,255,0.6)">
            {visibleMetrics.has('pH') && (
              <text x="10" y="40" fontSize="10">pH: {chartData.ranges.ph.min.toFixed(1)}-{chartData.ranges.ph.max.toFixed(1)}</text>
            )}
            {visibleMetrics.has('temp') && (
              <text x="10" y="80" fontSize="10">Temp: {chartData.ranges.temp.min.toFixed(1)}-{chartData.ranges.temp.max.toFixed(1)}°C</text>
            )}
            {visibleMetrics.has('do') && (
              <text x="10" y="120" fontSize="10">DO: {chartData.ranges.do.min.toFixed(1)}-{chartData.ranges.do.max.toFixed(1)} mg/L</text>
            )}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass p-3 rounded-lg">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {metrics.map((metric) => {
                const isVisible = visibleMetrics.has(metric.key);
                const rangeKey = metric.key === 'pH' ? 'ph' : metric.key;
                const range = chartData.ranges[rangeKey as keyof typeof chartData.ranges];
                
                if (!isVisible || !range) return null;
                
                return (
                  <div key={metric.key} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-0.5 rounded-full" 
                      style={{ backgroundColor: metric.color }}
                    ></div>
                    <span style={{ color: "rgb(var(--text-secondary))" }}>
                      {metric.label}: {range.min.toFixed(1)}-{range.max.toFixed(1)}{metric.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}