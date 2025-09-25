export const TARGETS = {
  pH: { good: [6.5, 8.0] as [number, number], warn: [6.0, 8.5] as [number, number] },
  temp_c: { good: [22, 28] as [number, number], warn: [20, 30] as [number, number] },
  do_mg_l: { good: [5, Infinity] as [number, number], warn: [3.5, Infinity] as [number, number] }
};

export function targetText(metric: keyof typeof TARGETS): string {
  const g = TARGETS[metric].good;
  if (metric === "do_mg_l") return `≥ ${g[0]} mg/L`;
  return `${g[0]} – ${g[1]}${metric === "temp_c" ? " °C" : ""}`;
}