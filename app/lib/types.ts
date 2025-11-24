export type MetricKey = "overall" | "pH" | "temp" | "DO";

export type Telemetry = {
  timestamp: string;
  pH: number;
  temp_c: number;
  do_mg_l: number;
  fish_health?: number;
  // AI-enriched (optional)
  quality_ai?: number; // 1-10 score predicted by AI
  status_ai?: Status;  // mapped status from AI (good|average|alert)
};

export type TelemetryWhereInput = {
  userId?: string | undefined;
  timestamp?: {
    gte?: Date | undefined;
    lte?: Date | undefined;
  };
};

export type Status = "good" | "average" | "alert";

export type MetricField = keyof Pick<Telemetry, "pH" | "temp_c" | "do_mg_l">;