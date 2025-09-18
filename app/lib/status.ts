import { TARGETS } from "@/app/lib/targets";
import { Telemetry, Status, MetricField } from "@/app/lib/types";
import { clamp } from "@/app/lib/utils";

export function statusForReading(t: Telemetry): Status {
  if (t.pH < 6.0 || t.pH > 8.5 || t.temp_c < 18 || t.temp_c > 32 || t.do_mg_l < 3.5) return "alert";
  if (t.pH < 6.5 || t.pH > 8.0 || t.temp_c < 20 || t.temp_c > 30 || t.do_mg_l < 5.0) return "average";
  return "good";
}

export function severityForValue(metric: MetricField, value: number): Status {
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
  if (value < 3.5) return "alert";
  if (value < 5.0) return "average";
  return "good";
}

export function highlightClassForStatus(s: Status): string {
  if (s === "average") return "bg-yellow-100 text-yellow-800 px-1 rounded";
  if (s === "alert") return "bg-red-100 text-red-800 px-1 rounded";
  return "";
}

export function computeOverallScore(t: Telemetry) {
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


