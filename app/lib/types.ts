export type MetricKey = "overall" | "pH" | "temp" | "DO";

export type Telemetry = {
  timestamp: string;
  pH: number;
  temp_c: number;
  do_mg_l: number;
  fish_health?: number;
};

export type Status = "good" | "average" | "alert";

export type MetricField = keyof Pick<Telemetry, "pH" | "temp_c" | "do_mg_l">;