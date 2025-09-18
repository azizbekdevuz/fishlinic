import { Telemetry } from "@/app/lib/types";
import { StatusChip } from "@/app/components/StatusChip";
import { highlightClassForStatus, severityForValue, statusForReading } from "@/app/lib/status";
import { targetText } from "@/app/lib/targets";
import { formatDateTime } from "@/app/lib/format";

export function TelemetryTable({ rows }: { rows: Telemetry[] }) {
  return (
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
          {rows.map((r, idx) => {
            const s = statusForReading(r);
            return (
              <tr key={idx} className="text-sm border-b last:border-b-0 hover:bg-slate-50">
                <td className="py-3 align-top" suppressHydrationWarning>{formatDateTime(r.timestamp)}</td>
                <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("pH", r.pH))}>{r.pH.toFixed(2)}</span></td>
                <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("temp_c", r.temp_c))}>{r.temp_c.toFixed(1)}</span></td>
                <td className="py-3 align-top"><span className={highlightClassForStatus(severityForValue("do_mg_l", r.do_mg_l))}>{r.do_mg_l.toFixed(2)}</span></td>
                <td className="py-3 align-top">
                  <div className="text-xs text-slate-600">
                    pH {targetText("pH")} · Temp {targetText("temp_c")} · DO {targetText("do_mg_l")}
                  </div>
                </td>
                <td className="py-3 align-top"><StatusChip status={s} /></td>
                <td className="py-3 align-top">
                  <button className="text-sm text-sky-600 font-medium hover:underline">Acknowledge</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


