"use client";

import { useMemo, useState, useRef } from "react";
import type { Telemetry } from "@/app/lib/types";
import { TestTube, Thermometer, Wind, Eye, EyeOff } from "lucide-react";

type TelemetryChartProps = {
  history: Telemetry[];
  animated?: boolean;
  chartType?: "line" | "area" | "bar";
  showGridLines?: boolean;
  showDataPoints?: boolean;
  animationSpeed?: "slow" | "normal" | "fast";
};

type MetricType = 'pH' | 'temp' | 'do';

type ChartPoint = {
  x: number;
  ph: number;
  temp: number;
  do: number;
  timestamp: string;
  values: {
    pH: number;
    temp_c: number;
    do_mg_l: number;
  };
};

export function TelemetryChart({ 
  history, 
  animated = true, 
  chartType = "line", // TODO: Implement different chart types
  showGridLines = true,
  showDataPoints = true,
  animationSpeed = "normal"
}: TelemetryChartProps) {
  // Suppress unused variable warning for future implementation
  void chartType;
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricType>>(new Set(['pH', 'temp', 'do']));
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Animation duration based on speed setting
  const animationDuration = useMemo(() => {
    switch (animationSpeed) {
      case "slow": return "2s";
      case "fast": return "0.5s";
      default: return "1s";
    }
  }, [animationSpeed]);

  const chartData = useMemo(() => {
    if (history.length === 0) return null;

    // Take a reasonable sample of data points for clean visualization
    const maxPoints = 150;
    const step = Math.max(1, Math.floor(history.length / maxPoints));
    const sampledHistory = history.filter((_, index) => index % step === 0);

    // Chart dimensions
    const width = 900;
    const height = 350;
    const padding = { top: 20, right: 20, bottom: 50, left: 60 };

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
    const phScale = normalizeToScale(phValues, height - padding.bottom - 100, padding.top + 30);
    const tempScale = normalizeToScale(tempValues, height - padding.bottom - 50, padding.top + 80);
    const doScale = normalizeToScale(doValues, height - padding.bottom, padding.top + 130);

    // Create points for each metric with better spacing
    const points: ChartPoint[] = sampledHistory.map((item, index) => {
      const x = padding.left + (index / (sampledHistory.length - 1 || 1)) * (width - padding.left - padding.right);
      
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

    // Create smooth SVG paths with better curves
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length === 0) return "";
      if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
      
      let path = `M ${points[0].x},${points[0].y}`;
      
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];
        
        if (next) {
          // Use quadratic bezier for smoother curves
          const cp1x = prev.x + (curr.x - prev.x) * 0.5;
          const cp1y = prev.y;
          const cp2x = curr.x - (next.x - curr.x) * 0.5;
          const cp2y = curr.y;
          path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${curr.x},${curr.y}`;
        } else {
          path += ` L ${curr.x},${curr.y}`;
        }
      }
      
      return path;
    };

    const phPath = createSmoothPath(points.map(p => ({ x: p.x, y: p.ph })));
    const tempPath = createSmoothPath(points.map(p => ({ x: p.x, y: p.temp })));
    const doPath = createSmoothPath(points.map(p => ({ x: p.x, y: p.do })));

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
      height,
      padding
    };
  }, [history]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartData || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const y = e.clientY - rect.top;

    // Find closest point
    const scaleX = chartData.width / rect.width;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const scaleY = chartData.height / rect.height;
    const scaledX = x * scaleX;

    let closestPoint: ChartPoint | null = null;
    let minDistance = Infinity;

    chartData.points.forEach(point => {
      const distance = Math.abs(point.x - scaledX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    if (closestPoint && minDistance < 30) {
      setHoveredPoint(closestPoint);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredPoint(null);
      setTooltipPosition(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setTooltipPosition(null);
  };

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
    <div className="w-full h-full flex flex-col relative">
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
                    ? 'bg-white/20 border border-white/30 shadow-lg' 
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
      <div className="flex-1 relative bg-gradient-to-br from-slate-50/5 to-slate-100/5 rounded-xl border border-white/10 overflow-hidden">
        <svg 
          ref={svgRef}
          viewBox={`0 0 ${chartData.width} ${chartData.height}`}
          className="w-full h-full cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="phGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="1"/>
            </linearGradient>
            
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#d97706" stopOpacity="1"/>
            </linearGradient>
            
            <linearGradient id="doGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="#2563eb" stopOpacity="1"/>
            </linearGradient>

            {/* Grid lines pattern */}
            <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
            </pattern>
          </defs>
          
          {/* Background Grid */}
          {showGridLines && <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4"/>}
          
          {/* Chart Lines with better styling */}
          {visibleMetrics.has('pH') && (
            <path
              d={chartData.paths.ph}
              fill="none"
              stroke="url(#phGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animated ? "animate-draw" : ""}
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.4))',
                animation: animated ? `draw ${animationDuration} ease-out` : 'none'
              }}
            />
          )}
          
          {visibleMetrics.has('temp') && (
            <path
              d={chartData.paths.temp}
              fill="none"
              stroke="url(#tempGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animated ? "animate-draw" : ""}
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(245, 158, 11, 0.4))',
                animation: animated ? `draw ${animationDuration} ease-out` : 'none'
              }}
            />
          )}
          
          {visibleMetrics.has('do') && (
            <path
              d={chartData.paths.do}
              fill="none"
              stroke="url(#doGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animated ? "animate-draw" : ""}
              style={{ 
                filter: 'drop-shadow(0 2px 8px rgba(59, 130, 246, 0.4))',
                animation: animated ? `draw ${animationDuration} ease-out` : 'none'
              }}
            />
          )}

          {/* Static data points */}
          {showDataPoints && chartData.points.map((point, index) => (
            <g key={index}>
              {visibleMetrics.has('pH') && (
                <circle
                  cx={point.x}
                  cy={point.ph}
                  r="2"
                  fill="#10b981"
                  opacity="0.8"
                />
              )}
              {visibleMetrics.has('temp') && (
                <circle
                  cx={point.x}
                  cy={point.temp}
                  r="2"
                  fill="#f59e0b"
                  opacity="0.8"
                />
              )}
              {visibleMetrics.has('do') && (
                <circle
                  cx={point.x}
                  cy={point.do}
                  r="2"
                  fill="#3b82f6"
                  opacity="0.8"
                />
              )}
            </g>
          ))}

          {/* Hover indicator line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.x}
              y1={chartData.padding.top}
              x2={hoveredPoint.x}
              y2={chartData.height - chartData.padding.bottom}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          )}

          {/* Hover points */}
          {hoveredPoint && visibleMetrics.has('pH') && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.ph}
              r="5"
              fill="#10b981"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
            />
          )}
          {hoveredPoint && visibleMetrics.has('temp') && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.temp}
              r="5"
              fill="#f59e0b"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
            />
          )}
          {hoveredPoint && visibleMetrics.has('do') && (
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.do}
              r="5"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
              className="animate-pulse"
            />
          )}

          {/* Y-axis labels with better positioning */}
          <g className="text-xs" fill="rgba(255,255,255,0.7)" fontFamily="system-ui">
            {visibleMetrics.has('pH') && (
              <>
                <text x="15" y="35" fontSize="11" fontWeight="500">pH: {chartData.ranges.ph.min.toFixed(1)}-{chartData.ranges.ph.max.toFixed(1)}</text>
              </>
            )}
            {visibleMetrics.has('temp') && (
              <>
                <text x="15" y="85" fontSize="11" fontWeight="500">Temp: {chartData.ranges.temp.min.toFixed(1)}-{chartData.ranges.temp.max.toFixed(1)}°C</text>
              </>
            )}
            {visibleMetrics.has('do') && (
              <>
                <text x="15" y="135" fontSize="11" fontWeight="500">DO: {chartData.ranges.do.min.toFixed(1)}-{chartData.ranges.do.max.toFixed(1)} mg/L</text>
              </>
            )}
          </g>
        </svg>

        {/* Tooltip */}
        {hoveredPoint && tooltipPosition && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 10}px`,
              transform: 'translateY(-100%)'
            }}
          >
            <div 
              className="glass p-3 rounded-lg shadow-xl border border-white/20 min-w-[200px]"
            >
              <div className="text-xs font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                {new Date(hoveredPoint.timestamp).toLocaleString()}
              </div>
              <div className="space-y-1">
                {visibleMetrics.has('pH') && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1" style={{ color: "#10b981" }}>
                      <TestTube className="w-3 h-3" />
                      pH:
                    </span>
                    <span className="font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                      {hoveredPoint.values.pH.toFixed(2)}
                    </span>
                  </div>
                )}
                {visibleMetrics.has('temp') && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1" style={{ color: "#f59e0b" }}>
                      <Thermometer className="w-3 h-3" />
                      Temp:
                    </span>
                    <span className="font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                      {hoveredPoint.values.temp_c.toFixed(1)}°C
                    </span>
                  </div>
                )}
                {visibleMetrics.has('do') && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1" style={{ color: "#3b82f6" }}>
                      <Wind className="w-3 h-3" />
                      DO:
                    </span>
                    <span className="font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                      {hoveredPoint.values.do_mg_l.toFixed(2)} mg/L
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass p-3 rounded-lg border border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              {metrics.map((metric) => {
                const isVisible = visibleMetrics.has(metric.key);
                const rangeKey = metric.key === 'pH' ? 'ph' : metric.key;
                const range = chartData.ranges[rangeKey as keyof typeof chartData.ranges];
                
                if (!isVisible || !range) return null;
                
                return (
                  <div key={metric.key} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-1 rounded-full shadow-sm" 
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
