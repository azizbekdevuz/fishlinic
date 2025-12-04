export type Status = "good" | "average" | "alert";

export type Telemetry = {
  timestamp: string;
  pH: number;         // May be NaN if main Arduino disconnected
  temp_c: number;     // May be NaN if secondary Arduino disconnected
  do_mg_l: number;    // May be NaN if main Arduino disconnected
  fish_health?: number;
  quality_ai?: number;
  status_ai?: Status;
  rtc?: string;       // RTC timestamp from main Arduino
};


