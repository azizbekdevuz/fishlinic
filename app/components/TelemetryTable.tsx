import { Telemetry } from "@/app/lib/types";
import { StatusChip } from "@/app/components/StatusChip";
import { highlightClassForStatus, severityForValue, statusForReading } from "@/app/lib/status";
import { targetText } from "@/app/lib/targets";
import { formatDateTime } from "@/app/lib/format";

export function TelemetryTable({ rows }: { rows: Telemetry[] }) {
  return (
    <div>
      {/* Mobile: Card list */}
      <div className="sm:hidden space-y-3">
        {rows.map((r, idx) => {
          const s = statusForReading(r);
          return (
            <div key={idx} className="rounded-xl p-3 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-300" suppressHydrationWarning>{formatDateTime(r.timestamp)}</div>
                <StatusChip status={s} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[11px] text-slate-400">pH</div>
                  <div className={`text-sm font-semibold ${highlightClassForStatus(severityForValue("pH", r.pH))}`}>{r.pH.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Temp (°C)</div>
                  <div className={`text-sm font-semibold ${highlightClassForStatus(severityForValue("temp_c", r.temp_c))}`}>{r.temp_c.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">DO (mg/L)</div>
                  <div className={`text-sm font-semibold ${highlightClassForStatus(severityForValue("do_mg_l", r.do_mg_l))}`}>{r.do_mg_l.toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                pH {targetText("pH")} · Temp {targetText("temp_c")} · DO {targetText("do_mg_l")}
              </div>
              <div className="mt-2 flex items-center justify-end">
                <button className="text-sm text-sky-300 font-medium hover:underline">Acknowledge</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Table */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full table-auto text-slate-200">
          <thead>
            <tr className="text-left text-slate-300 text-sm border-b border-white/10">
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
            {rows.map((r, idx) => {
              const s = statusForReading(r);
              return (
                <tr key={idx} className="text-sm border-b border-white/5 last:border-b-0 hover:bg-white/[0.03]">
                  <td className="py-3 align-top" suppressHydrationWarning>{formatDateTime(r.timestamp)}</td>
                  <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("pH", r.pH))}>{r.pH.toFixed(2)}</span></td>
                  <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("temp_c", r.temp_c))}>{r.temp_c.toFixed(1)}</span></td>
                  <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("do_mg_l", r.do_mg_l))}>{r.do_mg_l.toFixed(2)}</span></td>
                  <td className="py-3 align-top">
                    <div className="text-xs text-slate-400">
                      pH {targetText("pH")} · Temp {targetText("temp_c")} · DO {targetText("do_mg_l")}
                    </div>
                  </td>
                  <td className="py-3 align-top"><StatusChip status={s} /></td>
                  <td className="py-3 align-top">
                    <button className="text-sm text-sky-300 font-medium hover:underline">Acknowledge</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


