"use client";

import { useMemo, useState, useCallback, memo, type ChangeEvent, useEffect, useRef } from "react";
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
import { FeederPanel } from "@/app/components/FeederPanel";
import { SimpleGame } from "@/app/components/SimpleGame";
import { ProtectedPage } from "@/app/components/ProtectedPage";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { getToastFromUrl } from "@/app/lib/toast-server";
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
import { ExportDataModal } from "@/app/components/ExportDataModal";
import { AlertSettingsModal } from "@/app/components/AlertSettingsModal";
import { AskAIModal } from "@/app/components/AskAIModal";
import { SettingsModal } from "@/app/components/SettingsModal";
import { AlertBanner } from "@/app/components/AlertBanner";
import { StatisticsCard } from "@/app/components/StatisticsCard";
import { VerificationBanner } from "@/app/components/VerificationBanner";
import { useAlerts } from "@/app/hooks/useAlerts";
import { useSettings } from "@/app/hooks/useSettings";
import { RefreshCw, Filter } from "lucide-react";

// Memoized components to prevent unnecessary re-renders
const MemoizedGauge = memo(Gauge);
const MemoizedTelemetryChart = memo(TelemetryChart);
const MemoizedQuickStatsCard = memo(QuickStatsCard);
const MemoizedStatusCard = memo(StatusCard);
const MemoizedTelemetryTable = memo(TelemetryTable);
const MemoizedCameraPanel = memo(CameraPanel);

function DashboardContent() {
  const { user, isVerified } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { settings, isLoaded, formatTemperature } = useSettings();
  
  // Use throttled telemetry updates for better performance with user filtering
  const { telemetry, latest, socketConnected, serialConnected, refresh } = useTelemetry({
    updateThrottleMs: settings.refreshInterval * 1000 || 2000,
    bufferSize: settings.bufferSize || 100,
    userId: user?.id // Filter by user ID
  });
  
  const [metric, setMetric] = useState<MetricKey>("overall");
  const [range, setRange] = useState<"24h" | "1w" | "1m">(settings.defaultTimeRange || "1w");
  const [tableRange, setTableRange] = useState<"12" | "24" | "50" | "100">("12");
  const [tableFilter, setTableFilter] = useState<"all" | "good" | "average" | "alert">("all");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toast = useToast();
  const hasCheckedToast = useRef(false);
  
  // Apply default time range from settings on load
  useEffect(() => {
    if (isLoaded && settings.defaultTimeRange) {
      setRange(settings.defaultTimeRange);
    }
  }, [isLoaded, settings.defaultTimeRange]);

  // Check for server-initiated toast (only once)
  useEffect(() => {
    if (!hasCheckedToast.current) {
      hasCheckedToast.current = true;
      const urlToast = getToastFromUrl();
      if (urlToast) {
        toast.show(urlToast.type as "success" | "error" | "info" | "warning" | "alert" | "update", urlToast.message);
      }
    }
  }, [toast]);

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
      temp: (() => {
        const tempFormatted = formatTemperature(latest.temp_c || 0);
        return {
          value: tempFormatted.value,
          min: settings.temperatureUnit === "fahrenheit" ? 32 : 0,
          max: settings.temperatureUnit === "fahrenheit" ? 104 : 40,
          decimals: 1,
          label: `Temperature (${tempFormatted.unit})`
        };
      })(),
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
    
    // Filter table rows by count and status (use settings pagination if tableRange is default)
    const rowCount = tableRange === "12" ? settings.tablePagination || 25 : parseInt(tableRange);
    let filteredRows = telemetry.slice(-rowCount).reverse();
    
    if (tableFilter !== "all") {
      filteredRows = filteredRows.filter(row => {
        const status = row.status_ai ?? statusForReading(row);
        return status === tableFilter;
      });
    }
    
    return {
      history: filteredHistory,
      tableRows: filteredRows
    };
  }, [telemetry, range, tableRange, tableFilter]);
  
  // Alert monitoring
  const { activeAlerts, hasAlerts, hasCriticalAlerts } = useAlerts(latest);
  
  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  // Memoize connection status
  const connectionInfo = useMemo(() => {
    const connectionStatus = socketConnected
      ? (serialConnected === false ? "mock" : "connected")
      : "disconnected";
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
  if (serialConnected === false && telemetry.length === 0) {
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
      {/* Verification Banner */}
      <VerificationBanner isVerified={isVerified} />
      
      {/* Alert Banner */}
      {hasAlerts && <AlertBanner alerts={activeAlerts} />}
      
      <div className="container mx-auto px-4 py-6 max-w-7xl" style={{ marginTop: (hasAlerts || !isVerified) ? "60px" : "0" }}>
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
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-ghost btn-sm"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
              
              {hasAlerts && (
                <div className={`badge ${hasCriticalAlerts ? "status-danger" : "status-warning"}`}>
                  <AlertTriangle className="w-3 h-3" />
                  {activeAlerts.length} Alert{activeAlerts.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content - Clean 12-col Layout */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column: KPI + Trends */}
            <section className="xl:col-span-8 space-y-6">
              <div className="card-glass animate-slide-in">
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
                    <StatisticsCard history={history} latest={latest} />
                  </div>
                </div>
              </div>
              <div className="card-glass animate-slide-in" style={{ animationDelay: "100ms" }}>
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
                  <MemoizedTelemetryChart 
                    history={history} 
                    animated={settings.chartAnimation}
                    chartType={settings.chartType}
                    showGridLines={settings.showGridLines}
                    showDataPoints={settings.showDataPoints}
                    animationSpeed={settings.animationSpeed}
                  />
                </div>
                <p className="text-xs mt-4" style={{ color: "rgb(var(--text-muted))" }}>
                  Showing {history.length} data points from the last {range === "24h" ? "24 hours" : range === "1w" ? "week" : "month"}
                </p>
              </div>
            </section>
            {/* Right Column: Camera + Feeder + Utilities */}
            <aside className="xl:col-span-4 space-y-6">
              <div className="animate-slide-in" style={{ animationDelay: "200ms" }}>
                <MemoizedCameraPanel 
                  url={process.env.NEXT_PUBLIC_CAM_URL} 
                  title="Live Camera Feed" 
                />
              </div>
              <FeederPanel />
              <div className="card-glass animate-slide-in" style={{ animationDelay: "300ms" }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setExportModalOpen(true)}
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAlertModalOpen(true)}
                  >
                    <Bell className="w-4 h-4" />
                    Set Alert
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAiModalOpen(true)}
                  >
                    <Bot className="w-4 h-4" />
                    Ask AI
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSettingsModalOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>
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
          <section className="animate-fade-in" style={{ animationDelay: "500ms" }} data-telemetry-table>
            <div className="card-glass">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  Recent Measurements
                </h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                    <select
                      value={tableFilter}
                      onChange={(e) => setTableFilter(e.target.value as typeof tableFilter)}
                      className="input text-sm py-1.5 px-2 w-auto"
                    >
                      <option value="all">All Status</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="alert">Alert</option>
                    </select>
                  </div>
                  <select
                    value={tableRange}
                    onChange={(e) => setTableRange(e.target.value as typeof tableRange)}
                    className="input text-sm py-1.5 px-2 w-auto"
                  >
                    <option value="12">Last 12</option>
                    <option value="24">Last 24</option>
                    <option value="50">Last 50</option>
                    <option value="100">Last 100</option>
                  </select>
                <div className="badge status-neutral">
                    {tableRows.length} reading{tableRows.length !== 1 ? "s" : ""}
                  </div>
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

        {/* Modals */}
        <ExportDataModal 
          isOpen={exportModalOpen} 
          onClose={() => setExportModalOpen(false)} 
          telemetry={telemetry}
        />
        <AlertSettingsModal 
          isOpen={alertModalOpen} 
          onClose={() => setAlertModalOpen(false)}
          latest={latest}
        />
        <AskAIModal 
          isOpen={aiModalOpen} 
          onClose={() => setAiModalOpen(false)}
          latest={latest}
        />
        <SettingsModal 
          isOpen={settingsModalOpen} 
          onClose={() => setSettingsModalOpen(false)}
          onSettingsChange={(newSettings) => {
            // Apply settings immediately
            if (newSettings.defaultTimeRange) {
              setRange(newSettings.defaultTimeRange);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPage>
      <DashboardContent />
    </ProtectedPage>
  );
}