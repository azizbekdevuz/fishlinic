import { Status } from "@/app/lib/types";

export function StatusCard({ status }: { status: Status }) {
  return (
    <div className="rounded-xl p-3 shadow-sm border border-white/15" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(248,250,252,0.12))", backdropFilter: "saturate(170%) blur(8px)" }}>
      <div className="text-xs text-slate-300">Status</div>
      <div className="mt-2">
        {status === "alert" ? (
          <div className="text-red-300">Immediate action required — water quality critical</div>
        ) : status === "average" ? (
          <div className="text-yellow-200">Warning — check conditions</div>
        ) : (
          <div className="text-slate-200">All systems normal</div>
        )}
      </div>
    </div>
  );
}


