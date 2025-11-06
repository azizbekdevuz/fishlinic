import { ctx, pushTelemetry } from "./context";
import { enrichWithAI } from "./ai";
import { Telemetry } from "../../app/lib/types";

function generateMockTelemetry(): Telemetry {
  const now = new Date();
  const basePH = 7.2;
  const baseTemp = 25.0;
  const baseDO = 6.5;

  const phVariation = (Math.random() - 0.5) * 0.3;
  const tempVariation = (Math.random() - 0.5) * 2.0;
  const doVariation = (Math.random() - 0.5) * 1.0;
  const spikeChance = Math.random() < 0.05;
  const phSpike = spikeChance ? (Math.random() < 0.5 ? -0.8 : 0.8) : 0;
  const tempSpike = spikeChance ? (Math.random() < 0.5 ? -2.0 : 2.0) : 0;

  const pH = Math.max(0, Math.min(14, basePH + phVariation + phSpike));
  const temp_c = Math.max(0, Math.min(40, baseTemp + tempVariation + tempSpike));
  const do_mg_l = Math.max(0, Math.min(15, baseDO + doVariation));
  const fish_health = Math.round(75 + (Math.random() - 0.5) * 20);

  return {
    timestamp: now.toISOString(),
    pH: Math.round(pH * 100) / 100,
    temp_c: Math.round(temp_c * 10) / 10,
    do_mg_l: Math.round(do_mg_l * 100) / 100,
    fish_health,
  };
}

let mockDataInterval: NodeJS.Timeout | null = null;

export function startMockDataGeneration() {
  if (mockDataInterval) return;
  console.log("[mock] Starting mock data generation for testing without hardware");
  ctx.isMockMode = true;
  mockDataInterval = setInterval(async () => {
    const mockTelemetry = generateMockTelemetry();
    const enriched = await enrichWithAI(mockTelemetry);
    pushTelemetry(enriched);
    console.log("[mock] →", enriched);
  }, 3000);
}

export function stopMockDataGeneration() {
  if (mockDataInterval) {
    clearInterval(mockDataInterval);
    mockDataInterval = null;
    ctx.isMockMode = false;
    console.log("[mock] Stopped mock data generation");
  }
}


