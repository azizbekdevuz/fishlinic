"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* ----------------------------- Types & Helpers ----------------------------- */

type MetricKey = "overall" | "pH" | "temp" | "DO";

type Telemetry = {
  timestamp: string; // ISO
  pH: number;        // pH value
  temp_c: number;    // temperature in °C
  do_mg_l: number;   // dissolved oxygen mg/L
  fish_health?: number; // 0..100
};

type Status = "good" | "average" | "alert";

const nowISO = () => new Date().toISOString();
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Editable thresholds for status calculation and “targets” shown in the table */
const TARGETS = {
  pH: { good: [6.5, 8.0], warn: [6.0, 8.5] },
  temp_c: { good: [22, 28], warn: [20, 30] },
  do_mg_l: { good: [5, Infinity], warn: [3.5, Infinity] }
};

function statusForReading(t: Telemetry): Status {
  // alert if clearly outside warn bounds
  if (t.pH < 6.0 || t.pH > 8.5 || t.temp_c < 18 || t.temp_c > 32 || t.do_mg_l < 3.5) return "alert";
  // average if within warn bounds but outside good range
  if (t.pH < 6.5 || t.pH > 8.0 || t.temp_c < 20 || t.temp_c > 30 || t.do_mg_l < 5.0) return "average";
  return "good";
}

type MetricField = keyof Pick<Telemetry, "pH" | "temp_c" | "do_mg_l">;

function severityForValue(metric: MetricField, value: number): Status {
  if (metric === "pH") {
    if (value < 6.0 || value > 8.5) return "alert";
    if (value < 6.5 || value > 8.0) return "average";
    return "good";
  }
  if (metric === "temp_c") {
    if (value < 18 || value > 32) return "alert";
    if (value < 20 || value > 30) return "average";
    return "good";
  }
  // do_mg_l
  if (value < 3.5) return "alert";
  if (value < 5.0) return "average";
  return "good";
}

function highlightClassForStatus(s: Status): string {
  if (s === "average") return "bg-yellow-100 text-yellow-800 px-1 rounded";
  if (s === "alert") return "bg-red-100 text-red-800 px-1 rounded";
  return "";
}

function computeOverallScore(t: Telemetry) {
  // Convert each metric to a 0..1 score, then weight → 1..10 scale
  const phScore = (() => {
    const [gl, gh] = TARGETS.pH.good;
    const center = (gl + gh) / 2;
    const gap = 1.5;
    if (t.pH >= gl && t.pH <= gh) return 1;
    return Math.max(0, 1 - Math.abs(t.pH - center) / gap);
  })();
  const tempScore = (() => {
    const [gl, gh] = TARGETS.temp_c.good;
    const center = (gl + gh) / 2;
    const gap = 6;
    if (t.temp_c >= gl && t.temp_c <= gh) return 1;
    return Math.max(0, 1 - Math.abs(t.temp_c - center) / gap);
  })();
  const doScore = (() => {
    const ideal = 6, gap = 3;
    return Math.max(0, 1 - Math.abs(t.do_mg_l - ideal) / gap);
  })();
  const fishScore = clamp((t.fish_health ?? 80) / 100, 0, 1);

  const weighted = phScore * 0.28 + tempScore * 0.24 + doScore * 0.30 + fishScore * 0.18;
  return clamp(Math.round((weighted * 9 + 1) * 10) / 10, 1, 10);
}

/* ------------------------------- Fancy Gauge -------------------------------

Design goals:
- Smooth needle animation with easing
- Neutral “no-color” look when status is GOOD
- Yellow rim + subtle glow for AVERAGE (warning)
- Red rim + stronger glow for ALERT (danger)
- Crisp ticks, glassy inner card, subtle shadow
- 4 buttons directly under the gauge, per requirement

Implementation:
- SVG semicircle gauge (−90°..+90°)
- CSS transitions on the needle (transform) and dial rim color
----------------------------------------------------------------------------- */

function Gauge({
  value,
  status,
  label = "meter (1 - 10)"
}: {
  value: number;
  status: Status;
  label?: string;
}) {
  // geometry
  const min = 1, max = 10;
  const ratio = (value - min) / (max - min);
  const angle = -90 + ratio * 180;
  const size = 300;
  const cx = size / 2;
  const cy = size / 2 + 12;
  const r = 110;

  // helpers
  function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const a = ((angleInDegrees - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function arc(start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const large = end - start <= 180 ? "0" : "1";
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  }

  // colors based on status (neutral when good)
  const colors = {
    ring: status === "good" ? "#e9edf3" : status === "average" ? "#FACC15" : "#EF4444",
    glow: status === "good" ? "transparent" : status === "average" ? "rgba(250, 204, 21, .35)" : "rgba(239, 68, 68, .45)"
  };

  const valueFill = status === "good" ? "#0F172A" : status === "average" ? "#CA8A04" : "#B91C1C";

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        className="w-full rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(248,250,252,0.85))",
          boxShadow:
            "0 1px 0 rgba(15,23,42,0.04), 0 8px 30px rgba(2,6,23,0.06), inset 0 0 0 1px rgba(148,163,184,0.15)"
        }}
      >
        <svg width={size} height={size / 1.35} viewBox={`0 0 ${size} ${size / 1.35}`}>
          {/* base track */}
          <path d={arc(-90, 90)} stroke="#EEF2F7" strokeWidth={18} fill="none" strokeLinecap="round" />

          {/* dynamic rim (status-driven) */}
          <path
            d={arc(-90, 90)}
            stroke={colors.ring}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
          />

          {/* major ticks */}
          {[...Array(9)].map((_, i) => {
            const a = -90 + (i * 180) / 8;
            const inner = polarToCartesian(cx, cy, r - 18, a);
            const outer = polarToCartesian(cx, cy, r - 4, a);
            return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#CBD5E1" strokeWidth={2} />;
          })}

          {/* needle (smooth transition) */}
          <g
            transform={`rotate(${angle} ${cx} ${cy})`}
            style={{ transition: "transform 600ms cubic-bezier(.22,1,.36,1)" }}
          >
            {/* needle body */}
            <rect x={cx - 2.5} y={cy - r + 10} width={5} height={r - 18} rx={2.5} fill="#0F172A" />
            {/* needle head */}
            <circle cx={cx} cy={cy - r + 12} r={5} fill="#0F172A" />
          </g>

          {/* hub */}
          <circle cx={cx} cy={cy} r={9} fill="#0F172A" />
          <circle cx={cx} cy={cy} r={15} fill="white" opacity={0.85} />
          <circle cx={cx} cy={cy} r={6} fill="#0F172A" />

          {/* labels */}
          <text x={cx} y={cy + 50} fontSize={34} fontWeight={800} textAnchor="middle" fill={valueFill}>
            {value.toFixed(1)}
          </text>
          <text x={cx} y={cy + 70} fontSize={12} textAnchor="middle" fill="#64748B">
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */

export default function Page() {
  /* ------------------------------ Telemetry state ------------------------------ */
  const [telemetry, setTelemetry] = useState<Telemetry[]>(() => {
    const base: Telemetry[] = [];
    let ph = 7.2, temp = 25.0, dox = 6.2;
    for (let i = 0; i < 40; i++) {
      ph += (Math.random() - 0.5) * 0.12;
      temp += (Math.random() - 0.5) * 0.6;
      dox += (Math.random() - 0.5) * 0.24;
      base.push({
        timestamp: new Date(Date.now() - (40 - i) * 60 * 60 * 1000).toISOString(),
        pH: +ph.toFixed(2),
        temp_c: +temp.toFixed(2),
        do_mg_l: +dox.toFixed(2),
        fish_health: Math.round(80 + (Math.random() - 0.5) * 10)
      });
    }
    return base;
  });

  const [metric, setMetric] = useState<MetricKey>("overall");
  const [range, setRange] = useState<"24h" | "1w" | "1m">("1w");
  const [socketConnected, setSocketConnected] = useState(false);

  /* ----------------------------- Socket.IO (live) ----------------------------- */
  const socketRef = useRef<Socket | null>(null);
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) return; // fallback to mock interval when no WS

    const socket: Socket = io(wsUrl, { transports: ["websocket"], reconnectionAttempts: 5 });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));
    socket.on("telemetry", (payload: Telemetry) => setTelemetry(prev => [...prev.slice(-199), payload]));
    socket.on("telemetry:update", (payload: Telemetry) => setTelemetry(prev => [...prev.slice(-199), payload]));

    return () => {
      socket.disconnect(); // cleanup returns void
      socketRef.current = null;
    };
  }, []);

  /* ----------------------- Mock updates (when no WS URL) ---------------------- */
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WS_URL) return;
    const id = setInterval(() => {
      setTelemetry(prev => {
        const last = prev[prev.length - 1];
        let ph = last.pH + (Math.random() - 0.5) * 0.08;
        let temp = last.temp_c + (Math.random() - 0.5) * 0.4;
        let dox = last.do_mg_l + (Math.random() - 0.5) * 0.2;
        if (Math.random() < 0.05) ph += (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.2);
        const next: Telemetry = {
          timestamp: nowISO(),
          pH: +ph.toFixed(2),
          temp_c: +temp.toFixed(1),
          do_mg_l: +dox.toFixed(2),
          fish_health: Math.round(78 + (Math.random() - 0.5) * 12)
        };
        return [...prev.slice(-199), next];
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  /* --------------------------- Derived display values -------------------------- */
  const latest = telemetry[telemetry.length - 1];
  const status = statusForReading(latest);

  const currentValue = useMemo(() => {
    if (metric === "overall") return computeOverallScore(latest);
    if (metric === "pH") return clamp(((latest.pH - 4) / 4) * 9 + 1, 1, 10);
    if (metric === "temp") return clamp(((latest.temp_c - 15) / 17) * 9 + 1, 1, 10);
    return clamp((latest.do_mg_l / 8) * 9 + 1, 1, 10);
  }, [latest, metric]);

  const pointsCount = range === "24h" ? 24 : range === "1w" ? 40 : 120;
  const history = telemetry.slice(-pointsCount);

  /* ------------------------------- Chart (ECharts) ------------------------------ */
  const chartOption = useMemo(() => {
    return {
      grid: { top: 28, left: 40, right: 16, bottom: 28 },
      tooltip: { trigger: "axis" },
      legend: {
        data: ["pH", "Temperature", "DO", "Fish Health"],
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: history.map(s => new Date(s.timestamp).toLocaleString())
      },
      yAxis: [
        { type: "value", name: "pH / DO", splitLine: { show: true } },
        { type: "value", name: "Temp / Health", position: "right", splitLine: { show: false } }
      ],
      series: [
        { name: "pH", type: "line", data: history.map(s => s.pH), smooth: true, lineStyle: { width: 2 } },
        { name: "Temperature", yAxisIndex: 1, type: "line", data: history.map(s => s.temp_c), smooth: true, lineStyle: { width: 2 } },
        { name: "DO", type: "line", data: history.map(s => s.do_mg_l), smooth: true, lineStyle: { width: 2 } },
        { name: "Fish Health", yAxisIndex: 1, type: "line", data: history.map(s => s.fish_health ?? 80), smooth: true, lineStyle: { width: 2 }, areaStyle: { opacity: 0.08 } }
      ]
    };
  }, [history]);

  /* ------------------------------- Table helper UI ------------------------------ */
  const tableRows = telemetry.slice(-12).reverse();

  function targetText(metric: keyof typeof TARGETS): string {
    const g = TARGETS[metric].good;
    if (metric === "do_mg_l") return `≥ ${g[0]} mg/L`;
    return `${g[0]} – ${g[1]}${metric === "temp_c" ? " °C" : ""}`;
  }

  function statusChip(s: Status) {
    if (s === "good") return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-slate-200">Good</span>;
    if (s === "average") return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Warning</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Alert</span>;
  }

  /* ---------------------------------- Render ---------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Capstone Water Quality Dashboard</h1>
        <div className="text-sm text-slate-600">{socketConnected ? "Live: connected" : "Live: mock data"}</div>
      </header>

      <main className="grid grid-cols-12 gap-6">
        {/* Left: Meter + Controls */}
        <section className="col-span-7">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Realtime Water Quality</h2>
              <div className="text-sm text-slate-500">Last update: {new Date(latest.timestamp).toLocaleString()}</div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-2/3">
                <Gauge value={currentValue} status={status} label="meter (1 - 10)" />

                {/* Buttons under the meter */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {(["overall", "pH", "temp", "DO"] as MetricKey[]).map((m) => {
                    const active = metric === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMetric(m)}
                        className={
                          "px-3 py-1.5 rounded-full text-sm font-medium transition " +
                          (active ? "bg-sky-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                        }
                        aria-pressed={active}
                      >
                        {m === "overall" ? "Overall" : m === "temp" ? "Temperature" : m.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick stats + status card */}
              <div className="w-1/3 flex flex-col gap-3">
                <div className="rounded-xl bg-gradient-to-b from-white/80 to-slate-50 p-3 shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500">Quick Stats</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-white shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">pH</div>
                      <div className={`text-lg font-semibold ${highlightClassForStatus(severityForValue("pH", latest.pH))}`}>{latest.pH.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-white shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">Temp (°C)</div>
                      <div className={`text-lg font-semibold ${highlightClassForStatus(severityForValue("temp_c", latest.temp_c))}`}>{latest.temp_c.toFixed(1)}</div>
                    </div>
                    <div className="p-2 rounded bg-white shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">DO (mg/L)</div>
                      <div className={`text-lg font-semibold ${highlightClassForStatus(severityForValue("do_mg_l", latest.do_mg_l))}`}>{latest.do_mg_l.toFixed(2)}</div>
                    </div>
                    <div className="p-2 rounded bg-white shadow-sm border border-slate-100">
                      <div className="text-xs text-slate-400">Fish Health</div>
                      <div className="text-lg font-semibold">{latest.fish_health ?? 80}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500">Status</div>
                  <div className="mt-2">
                    {status === "alert" ? (
                      <div className="text-red-700">Immediate action required — water quality critical</div>
                    ) : status === "average" ? (
                      <div className="text-yellow-700">Warning — check conditions</div>
                    ) : (
                      <div className="text-slate-600">All systems normal</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Overall Statistics */}
        <section className="col-span-5">
          <div className="card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Overall Statistics</h2>
              <div className="flex items-center gap-2">
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value as any)}
                  className="text-sm p-1 rounded border"
                >
                  <option value="24h">24h</option>
                  <option value="1w">1w</option>
                  <option value="1m">1m</option>
                </select>
              </div>
            </div>

            <div className="w-full h-64 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <ReactECharts option={chartOption as any} style={{ height: "100%", width: "100%" }} />
            </div>
            <div className="text-xs text-slate-500">Default window shows ~1 week (latest {pointsCount} samples).</div>
          </div>
        </section>

        {/* Full-width: Real-time timetable */}
        <section className="col-span-12">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Realtime Timetable</h2>
              <div className="text-sm text-slate-500">Latest {tableRows.length} samples</div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="text-left text-slate-500 text-sm border-b">
                    <th className="py-2">Timestamp</th>
                    <th className="py-2">pH</th>
                    <th className="py-2">Temp (°C)</th>
                    <th className="py-2">DO (mg/L)</th>
                    <th className="py-2">Target</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r, idx) => {
                    const s = statusForReading(r);
                    return (
                      <tr key={idx} className="text-sm border-b last:border-b-0 hover:bg-slate-50">
                        <td className="py-3 align-top">{new Date(r.timestamp).toLocaleString()}</td>
                        <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("pH", r.pH))}>{r.pH.toFixed(2)}</span></td>
                        <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("temp_c", r.temp_c))}>{r.temp_c.toFixed(1)}</span></td>
                        <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("do_mg_l", r.do_mg_l))}>{r.do_mg_l.toFixed(2)}</span></td>
                        <td className="py-3 align-top">
                          <div className="text-xs text-slate-600">
                            pH {targetText("pH")} · Temp {targetText("temp_c")} · DO {targetText("do_mg_l")}
                          </div>
                        </td>
                        <td className="py-3 align-top">{statusChip(s)}</td>
                        <td className="py-3 align-top">
                          <button className="text-sm text-sky-600 font-medium hover:underline">Acknowledge</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-6 text-xs text-slate-400">
        Tip: set <code>NEXT_PUBLIC_WS_URL</code> in <code>.env.local</code> to connect to your telemetry server.
      </footer>
    </div>
  );
}