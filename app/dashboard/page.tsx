"use client";

import { useMemo, useState, type ChangeEvent } from "react";
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
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { SimpleGame } from "@/app/components/SimpleGame";

export default function DashboardPage() {
  const { telemetry, latest, socketConnected, serialConnected } = useTelemetry();

  const [metric, setMetric] = useState<MetricKey>("overall");
  const [range, setRange] = useState<"24h" | "1w" | "1m">("1w");

  const status = latest ? statusForReading(latest) : "good";

  const gauge = useMemo(() => {
    if (!latest) return null;
    if (metric === "overall") {
      return {
        value: computeOverallScore(latest),
        min: 1,
        max: 10,
        decimals: 1,
        label: "Overall quality"
      } as const;
    }
    if (metric === "pH") {
      return {
        value: latest.pH,
        min: 0,
        max: 14,
        decimals: 2,
        label: "pH"
      } as const;
    }
    if (metric === "temp") {
      return {
        value: latest.temp_c,
        min: 0,
        max: 40,
        decimals: 1,
        label: "Temperature (°C)"
      } as const;
    }
    return {
      value: latest.do_mg_l,
      min: 0,
      max: 12,
      decimals: 2,
      label: "Dissolved Oxygen (mg/L)"
    } as const;
  }, [latest, metric]);

  const pointsCount = range === "24h" ? 24 : range === "1w" ? 7 * 24 : 30 * 24;
  const historyCutoffMs = (() => {
    const now = Date.now();
    if (range === "24h") return now - 24 * 3600 * 1000;
    if (range === "1w") return now - 7 * 24 * 3600 * 1000;
    return now - 30 * 24 * 3600 * 1000;
  })();
  const history = telemetry.filter(s => new Date(s.timestamp).getTime() >= historyCutoffMs).slice(-pointsCount);
  const tableRows = telemetry.slice(-12).reverse();

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Capstone Water Quality Dashboard</h1>
          <p className="text-xs text-slate-300">Developed by Sejong University Capstone Design students</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-300">
            {serialConnected === false ? "Live: disconnected" : socketConnected ? "Live: connected" : "Live: mock data"}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {serialConnected === false ? (
          <div className="lg:col-span-12">
            <div className="card p-6 text-center">
              <div className="text-lg font-medium text-slate-100">System not connected</div>
              <div className="text-slate-300 mt-1">USB/Serial disconnected. Waiting for reconnection…</div>
              <div className="mt-4 hidden sm:block"><SimpleGame /></div>
              <div className="mt-4 sm:hidden text-sm text-slate-300">
                Try reconnecting your device. Meanwhile, view tips and guidelines below:
                <div className="mt-3 grid grid-cols-1 gap-2 text-left">
                  <div className="rounded-lg p-3 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                    • Ensure the USB cable is firmly connected and not power-only
                  </div>
                  <div className="rounded-lg p-3 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                    • Check that baud rate is 9600 on the Arduino sketch
                  </div>
                  <div className="rounded-lg p-3 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
                    • Reopen the mock bridge app and select the correct COM port
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !latest ? (
          <div className="lg:col-span-12">
            <div className="card p-6 text-center">
              <div className="text-lg font-medium text-slate-100">Waiting for data…</div>
              <div className="text-slate-300 mt-1">No samples received yet. The dashboard will populate automatically.</div>
              <div className="mt-4 hidden sm:block"><SimpleGame /></div>
              <div className="mt-4 sm:hidden text-sm text-slate-300">
                Hang tight! If this takes long, verify the device and bridge are running.
              </div>
            </div>
          </div>
        ) : (
          <>
        <section className="lg:col-span-7">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-slate-100">Realtime Water Quality</h2>
              <div className="text-sm text-slate-300" suppressHydrationWarning>Last update: {formatDateTime(latest.timestamp)}</div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              <div className="w-full lg:w-2/3 max-w-full overflow-hidden">
                {gauge && (
                  <Gauge value={gauge.value} status={status} label={gauge.label} min={gauge.min} max={gauge.max} decimals={gauge.decimals} />
                )}
                <MetricToggle metric={metric} onChange={setMetric} />
              </div>
              <div className="w-full lg:w-1/3 flex flex-col gap-3">
                <QuickStatsCard latest={latest} />
                <StatusCard status={status} />
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-100">Overall Statistics</h2>
              <div className="flex items-center gap-2 text-slate-300">
                <select
                  value={range}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setRange(e.target.value as "24h" | "1w" | "1m")}
                  className="text-sm p-1 rounded border bg-white text-slate-900"
                >
                  <option value="24h">24h</option>
                  <option value="1w">1w</option>
                  <option value="1m">1m</option>
                </select>
              </div>
            </div>
            <div className="w-full h-64 rounded-lg p-3 border border-white/15 bg-white/10 backdrop-blur">
              <TelemetryChart history={history} />
            </div>
            <div className="text-xs text-slate-400">Default window shows ~1 week (latest {pointsCount} samples).
            </div>
          </div>
        </section>

        <section className="lg:col-span-12">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium text-slate-100">Realtime Timetable</h2>
              <div className="text-sm text-slate-400">Latest {tableRows.length} samples</div>
            </div>
            <TelemetryTable rows={tableRows} />
          </div>
        </section>
          </>
        )}
      </main>

      <footer className="mt-6 text-xs text-slate-400 flex items-center justify-between flex-col sm:flex-row gap-3 sm:gap-2">
        <span className="text-center sm:text-left">Sejong University — Capstone Design Course</span>
        <div className="flex items-center gap-3 text-slate-300">
          <span className="text-slate-400">Dashboard by Azizbek Arzikulov</span>
          <a href="https://github.com/azizbekdevuz/fishlinic" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-100">GitHub</a>
          <a href="https://portfolio-next-silk-two.vercel.app/" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-100">Portfolio</a>
          <a href="https://www.linkedin.com/in/azizbek-arzikulov" target="_blank" rel="noreferrer" className="hover:underline hover:text-slate-100">LinkedIn</a>
        </div>
        <span className="text-center sm:text-right">© {new Date().getFullYear()} Team Fishlinic</span>
      </footer>
    </div>
  );
}



