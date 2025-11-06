import { AI_BASE_URL } from "./config";
import { Telemetry } from "../../app/lib/types";

export async function enrichWithAI(telemetry: Telemetry): Promise<Telemetry> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`${AI_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pH: telemetry.pH, temp_c: telemetry.temp_c, do_mg_l: telemetry.do_mg_l }),
      signal: controller.signal as any
    } as any);
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const quality_ai = typeof data?.quality_ai === "number" ? data.quality_ai : undefined;
      const status_ai = typeof data?.status_ai === "string" ? data.status_ai : undefined;
      return { ...telemetry, ...(quality_ai !== undefined ? { quality_ai } : {}), ...(status_ai ? { status_ai } : {}) };
    }
  } catch {}
  return telemetry;
}


