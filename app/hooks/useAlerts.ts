"use client";

import { useEffect, useState, useCallback } from "react";
import type { Telemetry } from "@/app/lib/types";

type AlertThresholds = {
  pH: { min: number; max: number; enabled: boolean };
  temp_c: { min: number; max: number; enabled: boolean };
  do_mg_l: { min: number; max: number; enabled: boolean };
  quality_ai: { min: number; max: number; enabled: boolean };
};

const DEFAULT_THRESHOLDS: AlertThresholds = {
  pH: { min: 6.5, max: 8.0, enabled: true },
  temp_c: { min: 20, max: 30, enabled: true },
  do_mg_l: { min: 5.0, max: 12.0, enabled: true },
  quality_ai: { min: 6.0, max: 10.0, enabled: true }
};

export type ActiveAlert = {
  metric: keyof AlertThresholds;
  value: number;
  threshold: { min: number; max: number };
  severity: "warning" | "alert";
  message: string;
};

export function useAlerts(latest?: Telemetry) {
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);

  // Load thresholds from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("alertThresholds");
    if (saved) {
      try {
        setThresholds(JSON.parse(saved));
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  // Check for active alerts
  const checkAlerts = useCallback((telemetry: Telemetry | undefined, thresholds: AlertThresholds): ActiveAlert[] => {
    if (!telemetry) return [];

    const alerts: ActiveAlert[] = [];

    // Check pH
    if (thresholds.pH.enabled) {
      const { min, max } = thresholds.pH;
      if (telemetry.pH < min || telemetry.pH > max) {
        alerts.push({
          metric: "pH",
          value: telemetry.pH,
          threshold: { min, max },
          severity: telemetry.pH < min * 0.9 || telemetry.pH > max * 1.1 ? "alert" : "warning",
          message: `pH level ${telemetry.pH.toFixed(2)} is outside safe range (${min}-${max})`
        });
      }
    }

    // Check temperature
    if (thresholds.temp_c.enabled && telemetry.temp_c !== undefined) {
      const { min, max } = thresholds.temp_c;
      if (telemetry.temp_c < min || telemetry.temp_c > max) {
        alerts.push({
          metric: "temp_c",
          value: telemetry.temp_c,
          threshold: { min, max },
          severity: telemetry.temp_c < min * 0.9 || telemetry.temp_c > max * 1.1 ? "alert" : "warning",
          message: `Temperature ${telemetry.temp_c.toFixed(1)}°C is outside safe range (${min}-${max}°C)`
        });
      }
    }

    // Check dissolved oxygen
    if (thresholds.do_mg_l.enabled) {
      const { min, max } = thresholds.do_mg_l;
      if (telemetry.do_mg_l < min || telemetry.do_mg_l > max) {
        alerts.push({
          metric: "do_mg_l",
          value: telemetry.do_mg_l,
          threshold: { min, max },
          severity: telemetry.do_mg_l < min * 0.8 ? "alert" : "warning",
          message: `Dissolved oxygen ${telemetry.do_mg_l.toFixed(2)} mg/L is outside safe range (${min}-${max} mg/L)`
        });
      }
    }

    // Check AI quality score
    if (thresholds.quality_ai.enabled && telemetry.quality_ai !== undefined) {
      const { min, max } = thresholds.quality_ai;
      if (telemetry.quality_ai < min || telemetry.quality_ai > max) {
        alerts.push({
          metric: "quality_ai",
          value: telemetry.quality_ai,
          threshold: { min, max },
          severity: telemetry.quality_ai < min * 0.8 ? "alert" : "warning",
          message: `Quality score ${telemetry.quality_ai.toFixed(1)}/10 is below acceptable range (${min}-${max})`
        });
      }
    }

    return alerts;
  }, []);

  // Update active alerts when telemetry or thresholds change
  useEffect(() => {
    const alerts = checkAlerts(latest, thresholds);
    setActiveAlerts(alerts);
  }, [latest, thresholds, checkAlerts]);

  const hasAlerts = activeAlerts.length > 0;
  const hasCriticalAlerts = activeAlerts.some(a => a.severity === "alert");

  return {
    activeAlerts,
    hasAlerts,
    hasCriticalAlerts,
    thresholds,
    setThresholds
  };
}

