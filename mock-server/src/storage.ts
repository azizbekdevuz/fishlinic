import fs from "fs";
import path from "path";
import readline from "readline";
import { DATA_DIR } from "./config";
import { Telemetry } from "./types";

export function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

function dateToYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function filePathForDate(d: Date) {
  return path.join(DATA_DIR, `${dateToYMD(d)}.jsonl`);
}

export function appendTelemetry(t: Telemetry) {
  const ts = new Date(t.timestamp);
  const fp = filePathForDate(ts);
  // Convert NaN values to null for proper JSON serialization
  const normalized = {
    ...t,
    pH: Number.isFinite(t.pH) ? t.pH : null,
    do_mg_l: Number.isFinite(t.do_mg_l) ? t.do_mg_l : null,
    temp_c: Number.isFinite(t.temp_c) ? t.temp_c : null,
    fish_health: t.fish_health !== undefined && Number.isFinite(t.fish_health) ? t.fish_health : undefined,
    quality_ai: t.quality_ai !== undefined && Number.isFinite(t.quality_ai) ? t.quality_ai : undefined,
  };
  fs.appendFile(fp, JSON.stringify(normalized) + "\n", { encoding: "utf8" }, () => {});
}

function* daysBetween(start: Date, end: Date) {
  const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const until = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  for (; d <= until; d.setUTCDate(d.getUTCDate() + 1)) {
    yield new Date(d);
  }
}

export async function readHistory(fromISO: string, toISO: string, max: number): Promise<Telemetry[]> {
  const from = new Date(fromISO);
  const to = new Date(toISO);
  const results: Telemetry[] = [];
  for (const day of daysBetween(from, to)) {
    const fp = filePathForDate(day);
    if (!fs.existsSync(fp)) continue;
    const file = fs.createReadStream(fp, { encoding: "utf8" });
    const rl = readline.createInterface({ input: file, crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line) continue;
      try {
        const obj = JSON.parse(line);
        if (!obj?.timestamp) continue;
        const ts = new Date(obj.timestamp).getTime();
        if (ts >= from.getTime() && ts <= to.getTime()) {
          results.push(obj as Telemetry);
          if (results.length >= max) {
            rl.close();
            file.close?.();
            return results;
          }
        }
      } catch {}
    }
  }
  return results;
}


