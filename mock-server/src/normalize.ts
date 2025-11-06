import { Telemetry } from "../../app/lib/types";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickNumber(obj: Record<string, unknown>, keys: readonly string[]): number | undefined {
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string") {
      const n = Number(val.trim());
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function pickNumberOrNull(obj: Record<string, unknown>, keys: readonly string[]): number | undefined {
  for (const k of keys) {
    const val = obj[k];
    if (val === null || val === undefined) continue;
    if (typeof val === "number" && Number.isFinite(val)) return val;
    if (typeof val === "string") {
      const n = Number(val.trim());
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function normalize(raw: unknown): Telemetry | null {
  if (!isRecord(raw)) return null;

  const pH = pickNumber(raw, ["pH", "ph", "PH"] as const);
  const DOx = pickNumber(raw, ["do_mg_l", "do", "DO", "dox"] as const);
  const temp = pickNumberOrNull(raw, ["temp_c", "temp", "temperature"] as const);
  if (pH === undefined || DOx === undefined) return null;

  const pHSafe = clamp(pH, 0, 14);
  const DOsafe = clamp(DOx, 0, 30);
  const tempSafe = temp === undefined ? Number.NaN : temp;

  const ts =
    typeof (raw as any)["timestamp"] === "string" && !Number.isNaN(Date.parse((raw as any)["timestamp"] as string))
      ? ((raw as any)["timestamp"] as string)
      : new Date().toISOString();

  const fish = pickNumberOrNull(raw, ["fish_health", "health"] as const);

  const out: Telemetry = {
    timestamp: ts,
    pH: pHSafe,
    do_mg_l: DOsafe,
    temp_c: tempSafe,
    ...(fish !== undefined ? { fish_health: clamp(fish, 0, 100) } : {}),
  };
  return out;
}


