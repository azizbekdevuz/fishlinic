import { Telemetry } from "@/app/lib/types";
import { highlightClassForStatus, severityForValue } from "@/app/lib/status";

export function QuickStatsCard({ latest }: { latest: Telemetry }) {
  return (
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
  );
}


