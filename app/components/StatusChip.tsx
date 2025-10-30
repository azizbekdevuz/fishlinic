import { Status } from "@/app/lib/types";

export function StatusChip({ status }: { status: Status }) {
  if (status === "good") return <span className="badge badge-success">Good</span>;
  if (status === "average") return <span className="badge badge-warning">Warning</span>;
  return <span className="badge badge-danger">Alert</span>;
}


