"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useTelemetry } from "@/app/hooks/useTelemetry";
import { computeOverallScore, statusForReading } from "@/app/lib/status";
import { clamp } from "@/app/lib/utils";
import { formatDateTime } from "@/app/lib/format";
import type { MetricKey } from "@/app/lib/types";
import { Gauge } from "@/app/components/Gauge";
import { TelemetryChart } from "@/app/components/TelemetryChart";
import { MetricToggle } from "@/app/components/MetricToggle";
import { QuickStatsCard } from "@/app/components/QuickStatsCard";
import { StatusCard } from "@/app/components/StatusCard";
import { TelemetryTable } from "@/app/components/TelemetryTable";

export default function Page() {
  const { telemetry, latest, socketConnected } = useTelemetry();

  const [metric, setMetric] = useState<MetricKey>("overall");
  const [range, setRange] = useState<"24h" | "1w" | "1m">("1w");

  const status = statusForReading(latest);

  const currentValue = useMemo(() => {
    if (metric === "overall") return computeOverallScore(latest);
    if (metric === "pH") return clamp(((latest.pH - 4) / 4) * 9 + 1, 1, 10);
    if (metric === "temp") return clamp(((latest.temp_c - 15) / 17) * 9 + 1, 1, 10);
    return clamp((latest.do_mg_l / 8) * 9 + 1, 1, 10);
  }, [latest, metric]);

  const pointsCount = range === "24h" ? 24 : range === "1w" ? 40 : 120;
  const history = telemetry.slice(-pointsCount);
  const tableRows = telemetry.slice(-12).reverse();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Capstone Water Quality Dashboard</h1>
        <div className="text-sm text-slate-600">{socketConnected ? "Live: connected" : "Live: mock data"}</div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        <section className="col-span-7">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Realtime Water Quality</h2>
              <div className="text-sm text-slate-500" suppressHydrationWarning>Last update: {formatDateTime(latest.timestamp)}</div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-2/3">
                <Gauge value={currentValue} status={status} label="meter (1 - 10)" />
                <MetricToggle metric={metric} onChange={setMetric} />
              </div>
              <div className="w-1/3 flex flex-col gap-3">
                <QuickStatsCard latest={latest} />
                <StatusCard status={status} />
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-5">
          <div className="card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Overall Statistics</h2>
              <div className="flex items-center gap-2">
                <select
                  value={range}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setRange(e.target.value as "24h" | "1w" | "1m")}
                  className="text-sm p-1 rounded border"
                >
                  <option value="24h">24h</option>
                  <option value="1w">1w</option>
                  <option value="1m">1m</option>
                </select>
              </div>
            </div>
            <div className="w-full h-64 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <TelemetryChart history={history} />
            </div>
            <div className="text-xs text-slate-500">Default window shows ~1 week (latest {pointsCount} samples).</div>
          </div>
        </section>

        <section className="col-span-12">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Realtime Timetable</h2>
              <div className="text-sm text-slate-500">Latest {tableRows.length} samples</div>
            </div>
            <TelemetryTable rows={tableRows} />
          </div>
        </section>
      </main>

      <footer className="mt-6 text-xs text-slate-400">
        Note: This is the demo version and all data is mocked.
      </footer>
    </div>
  );
}


