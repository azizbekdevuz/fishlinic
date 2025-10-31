"use client";

import { useMemo, useState, useCallback, memo, type ChangeEvent } from "react";
import { useTelemetry } from "@/app/hooks/useTelemetry";
import { computeOverallScore, statusForReading } from "@/app/lib/status";
import { formatDateTime } from "@/app/lib/format";
import type { MetricKey } from "@/app/lib/types";
import { Gauge } from "@/app/components/Gauge";
import { TelemetryChart } from "@/app/components/TelemetryChart";
import { MetricToggle } from "@/app/components/MetricToggle";
import { QuickStatsCard } from "@/app/components/QuickStatsCard";
import { StatusCard } from "@/app/components/StatusCard";
import { TelemetryTable } from "@/app/components/TelemetryTable";
import { CameraPanel } from "../components/CameraPanel";
import { SimpleGame } from "@/app/components/SimpleGame";
import { 
  Wifi, 
  WifiOff, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Download,
  Bell,
  Bot,
  Settings
} from "lucide-react";

// Memoized components to prevent unnecessary re-renders
const MemoizedGauge = memo(Gauge);
const MemoizedTelemetryChart = memo(TelemetryChart);
const MemoizedQuickStatsCard = memo(QuickStatsCard);
const MemoizedStatusCard = memo(StatusCard);
const MemoizedTelemetryTable = memo(TelemetryTable);
const MemoizedCameraPanel = memo(CameraPanel);

export default function DashboardPage() {
  // Use throttled telemetry updates for better performance
  const { telemetry, latest, socketConnected, serialConnected } = useTelemetry({
    updateThrottleMs: 2000, // Update UI every 2 seconds instead of every change
    bufferSize: 150 // Reduce buffer size for better performance
  });
  
  const [metric, setMetric] = useState<MetricKey>("overall");
  const [range, setRange] = useState<"24h" | "1w" | "1m">("1w");

  // Memoize expensive calculations
  const status = useMemo(() => 
    latest ? (latest.status_ai ?? statusForReading(latest)) : "good",
    [latest]
  );

  const gauge = useMemo(() => {
    if (!latest) return null;
    
    const configs = {
      overall: {
        value: latest.quality_ai ?? computeOverallScore(latest),
        min: 1, max: 10, decimals: 1, label: "Overall Quality"
      },
      pH: {
        value: latest.pH,
        min: 0, max: 14, decimals: 2, label: "pH Level"
      },
      temp: {
        value: latest.temp_c,
        min: 0, max: 40, decimals: 1, label: "Temperature (°C)"
      },
      DO: {
        value: latest.do_mg_l,
        min: 0, max: 12, decimals: 2, label: "Dissolved Oxygen (mg/L)"
      }
    };
    
    return configs[metric];
  }, [latest, metric]);

  // Memoize filtered history data
  const { history, tableRows } = useMemo(() => {
    const pointsCount = range === "24h" ? 24 : range === "1w" ? 7 * 24 : 30 * 24;
    const historyCutoffMs = (() => {
      const now = Date.now();
      if (range === "24h") return now - 24 * 3600 * 1000;
      if (range === "1w") return now - 7 * 24 * 3600 * 1000;
      return now - 30 * 24 * 3600 * 1000;
    })();
    
    const filteredHistory = telemetry
      .filter(s => new Date(s.timestamp).getTime() >= historyCutoffMs)
      .slice(-pointsCount);
    
    const recentRows = telemetry.slice(-12).reverse();
    
    return {
      history: filteredHistory,
      tableRows: recentRows
    };
  }, [telemetry, range]);

  // Memoize connection status
  const connectionInfo = useMemo(() => {
    const connectionStatus = serialConnected === false ? "disconnected" : 
                           socketConnected ? "connected" : "mock";
    const connectionColor = connectionStatus === "connected" ? "status-good" : 
                           connectionStatus === "mock" ? "status-warning" : "status-danger";
    
    return { connectionStatus, connectionColor };
  }, [serialConnected, socketConnected]);

  // Memoized callbacks to prevent child re-renders
  const handleMetricChange = useCallback((newMetric: MetricKey) => {
    setMetric(newMetric);
  }, []);

  const handleRangeChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setRange(e.target.value as "24h" | "1w" | "1m");
  }, []);

  const { connectionStatus, connectionColor } = connectionInfo;

  // Loading states with memoized components
  if (serialConnected === false) {
    return (
      <div className="bg-gradient-main min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="card-glass p-8 text-center animate-fade-in">
            <WifiOff className="w-16 h-16 mx-auto mb-6 text-red-400" />
            <h2 className="text-2xl font-bold mb-4 text-gradient">
              System Disconnected
            </h2>
            <p className="text-lg mb-6" style={{ color: "rgb(var(--text-secondary))" }}>
              Hardware connection lost. Reconnecting automatically...
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="card p-4">
                <h3 className="font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                  Check USB Connection
                </h3>
                <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                  Ensure the USB cable is firmly connected and not power-only
                </p>
              </div>
              <div className="card p-4">
                <h3 className="font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                  Verify Baud Rate
                </h3>
                <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                  Check that baud rate is 9600 on the Arduino sketch
                </p>
              </div>
              <div className="card p-4">
                <h3 className="font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                  Restart Bridge
                </h3>
                <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                  Reopen the mock bridge app and select the correct COM port
                </p>
              </div>
            </div>

            <div className="mt-8 hidden sm:block">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                Mini Game - While You Wait
              </h3>
              <SimpleGame />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="bg-gradient-main min-h-screen">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="card-glass p-8 text-center animate-fade-in">
            <Activity className="w-16 h-16 mx-auto mb-6 text-blue-400 animate-pulse" />
            <h2 className="text-2xl font-bold mb-4 text-gradient">
              Initializing Dashboard
            </h2>
            <p className="text-lg mb-6" style={{ color: "rgb(var(--text-secondary))" }}>
              Waiting for telemetry data... The dashboard will populate automatically.
            </p>
            <div className="flex justify-center mb-8">
              <div className="loading w-64 h-2 bg-white/10 rounded-full"></div>
            </div>

            <div className="hidden sm:block">
              <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                Mini Game - While You Wait
              </h3>
              <SimpleGame />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-main min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header - Memoized */}
        <header className="mb-8 animate-fade-in">
          <div className="glass-strong p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                Smart Aquaculture Dashboard
              </h1>
              <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                Real-time monitoring • AI-powered insights • Sejong University Capstone
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className={`badge ${connectionColor}`}>
                {connectionStatus === "connected" ? (
                  <Wifi className="w-3 h-3" />
                ) : connectionStatus === "mock" ? (
                  <Activity className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {connectionStatus === "connected" ? "Live Data" : 
                 connectionStatus === "mock" ? "Mock Data" : "Disconnected"}
              </div>
              
              <div className="badge status-neutral">
                <Clock className="w-3 h-3" />
                <span className="text-xs">
                  Updated {formatDateTime(latest.timestamp)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Optimized Layout */}
        <div className="space-y-6">
          {/* Primary Metrics */}
          <section className="animate-slide-in">
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  Water Quality Monitor
                </h2>
                <div className={`badge ${
                  status === "good" ? "status-good" : 
                  status === "average" ? "status-warning" : "status-danger"
                }`}>
                  {status === "good" ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {status.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                  {gauge && (
                    <MemoizedGauge 
                      value={gauge.value} 
                      status={status} 
                      label={gauge.label} 
                      min={gauge.min} 
                      max={gauge.max} 
                      decimals={gauge.decimals} 
                    />
                  )}
                  <MetricToggle metric={metric} onChange={handleMetricChange} />
                </div>
                
                <div className="space-y-4">
                  <MemoizedQuickStatsCard latest={latest} />
                  <MemoizedStatusCard status={status} />
                </div>
              </div>
            </div>
          </section>

          {/* Chart and Camera - Optimized Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart Section */}
            <section className="xl:col-span-2 animate-slide-in" style={{ animationDelay: "100ms" }}>
              <div className="card-glass">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                    Trend Analysis
                  </h2>
                  <select
                    value={range}
                    onChange={handleRangeChange}
                    className="input text-sm py-2 px-3 w-auto"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="1w">Last Week</option>
                    <option value="1m">Last Month</option>
                  </select>
                </div>
                
                <div className="h-64 sm:h-80 rounded-xl border border-white/10 bg-white/5 p-4">
                  <MemoizedTelemetryChart history={history} />
                </div>
                
                <p className="text-xs mt-4" style={{ color: "rgb(var(--text-muted))" }}>
                  Showing {history.length} data points from the last {range === "24h" ? "24 hours" : range === "1w" ? "week" : "month"}
                </p>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="xl:col-span-1 space-y-6">
              <div className="animate-slide-in" style={{ animationDelay: "200ms" }}>
                <MemoizedCameraPanel 
                  url={process.env.NEXT_PUBLIC_CAM_URL} 
                  title="Live Camera Feed" 
                />
              </div>

              {/* Quick Actions */}
              <div className="card-glass animate-slide-in" style={{ animationDelay: "300ms" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                  Quick Actions
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-secondary btn-sm">
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Bell className="w-4 h-4" />
                    Set Alert
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Bot className="w-4 h-4" />
                    Ask AI
                  </button>
                  <button className="btn btn-secondary btn-sm">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>

              {/* System Health */}
              <div className="card-glass animate-slide-in" style={{ animationDelay: "400ms" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                  System Health
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                      Data Connection
                    </span>
                    <div className={`badge ${connectionColor} text-xs`}>
                      {connectionStatus === "connected" ? "Stable" : 
                       connectionStatus === "mock" ? "Simulated" : "Lost"}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                      AI Processing
                    </span>
                    <div className="badge status-good text-xs">Active</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                      Data Quality
                    </span>
                    <div className="badge status-good text-xs">Excellent</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Data Table - Memoized */}
          <section className="animate-fade-in" style={{ animationDelay: "500ms" }}>
            <div className="card-glass">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  Recent Measurements
                </h2>
                <div className="badge status-neutral">
                  Latest {tableRows.length} readings
                </div>
              </div>
              
              <MemoizedTelemetryTable rows={tableRows} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="glass p-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                Sejong University — Capstone Design Course
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span style={{ color: "rgb(var(--text-muted))" }}>
                  Dashboard by Azizbek Arzikulov
                </span>
                <a 
                  href="https://github.com/azizbekdevuz/fishlinic" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  GitHub
                </a>
                <a 
                  href="https://portfolio-next-silk-two.vercel.app/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Portfolio
                </a>
                <a 
                  href="https://www.linkedin.com/in/azizbek-arzikulov" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  LinkedIn
                </a>
              </div>
              
              <div className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                © {new Date().getFullYear()} Team Fishlinic
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}