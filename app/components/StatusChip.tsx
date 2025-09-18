import { Status } from "@/app/lib/types";

export function StatusChip({ status }: { status: Status }) {
  if (status === "good") return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-slate-200">Good</span>;
  if (status === "average") return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Warning</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-red-100 text-red-800">Alert</span>;
}


