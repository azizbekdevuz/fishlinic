export type Status = "good" | "average" | "alert";

export type Telemetry = {
  timestamp: string;
  pH: number;
  temp_c: number;
  do_mg_l: number;
  fish_health?: number;
  quality_ai?: number;
  status_ai?: Status;
};


