"use client";

import { MetricKey } from "@/app/lib/types";

export function MetricToggle({ metric, onChange }: { metric: MetricKey; onChange: (m: MetricKey) => void }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {(["overall", "pH", "temp", "DO"] as MetricKey[]).map((m) => {
        const active = metric === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
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
  );
}


