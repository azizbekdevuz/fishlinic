import { Status } from "@/app/lib/types";

export function StatusCard({ status }: { status: Status }) {
  return (
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
  );
}


