import { Telemetry } from "@/app/lib/types";
import { highlightClassForStatus, severityForValue } from "@/app/lib/status";

export function QuickStatsCard({ latest }: { latest: Telemetry }) {
  return (
    <div className="rounded-xl p-3 shadow-sm border border-white/15" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(248,250,252,0.12))", backdropFilter: "saturate(170%) blur(8px)" }}>
      <div className="text-xs text-slate-300">Quick Stats</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="p-2 rounded border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs text-slate-400">pH</div>
          <div className={`text-lg font-semibold ${highlightClassForStatus(severityForValue("pH", latest.pH))}`}>{latest.pH.toFixed(2)}</div>
        </div>
        <div className="p-2 rounded border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs text-slate-400">Temp (°C)</div>
          <div className={`text-lg font-semibold ${highlightClassForStatus(severityForValue("temp_c", latest.temp_c))}`}>{latest.temp_c.toFixed(1)}</div>
        </div>
        <div className="p-2 rounded border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs text-slate-400">DO (mg/L)</div>
          <div className={`text-lg font-semibold ${highlightClassForStatus(severityForValue("do_mg_l", latest.do_mg_l))}`}>{latest.do_mg_l.toFixed(2)}</div>
        </div>
        <div className="p-2 rounded border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="text-xs text-slate-400">Fish Health</div>
          <div className="text-lg font-semibold">{latest.fish_health ?? 80}</div>
        </div>
      </div>
    </div>
  );
}


