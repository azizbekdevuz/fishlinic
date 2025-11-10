"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Bell, Save, AlertTriangle } from "lucide-react";
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

type AlertSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  latest?: Telemetry;
};

export function AlertSettingsModal({ isOpen, onClose, latest }: AlertSettingsModalProps) {
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("alertThresholds");
    if (saved) {
      try {
        setThresholds(JSON.parse(saved));
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("alertThresholds", JSON.stringify(thresholds));
    alert("Alert thresholds saved successfully!");
    onClose();
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
  };

  const updateThreshold = (metric: keyof AlertThresholds, field: "min" | "max" | "enabled", value: number | boolean) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: value
      }
    }));
  };

  const getCurrentValue = (metric: keyof AlertThresholds): number | null => {
    if (!latest) return null;
    if (metric === "quality_ai") return latest.quality_ai ?? null;
    return latest[metric] ?? null;
  };

  const getStatus = (metric: keyof AlertThresholds): "good" | "warning" | "alert" | null => {
    const current = getCurrentValue(metric);
    if (current === null || !thresholds[metric].enabled) return null;
    const { min, max } = thresholds[metric];
    if (current < min || current > max) return "alert";
    if (current < min * 1.1 || current > max * 0.9) return "warning";
    return "good";
  };

  const metrics = [
    { key: "pH" as const, label: "pH Level", unit: "", min: 0, max: 14, step: 0.1 },
    { key: "temp_c" as const, label: "Temperature", unit: "°C", min: 0, max: 40, step: 0.1 },
    { key: "do_mg_l" as const, label: "Dissolved Oxygen", unit: "mg/L", min: 0, max: 15, step: 0.1 },
    { key: "quality_ai" as const, label: "AI Quality Score", unit: "/10", min: 1, max: 10, step: 0.1 }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alert Settings" size="lg">
      <div className="space-y-6">
        <div 
          className="p-4 rounded-lg"
          style={{
            background: "rgb(var(--surface-elevated))",
            border: "1px solid var(--border)"
          }}
        >
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Set custom thresholds for each metric. You'll be alerted when values go outside these ranges.
          </p>
        </div>

        {metrics.map((metric) => {
          const threshold = thresholds[metric.key];
          const current = getCurrentValue(metric.key);
          const status = getStatus(metric.key);

          return (
            <div 
              key={metric.key} 
              className="p-4 rounded-lg space-y-3"
              style={{
                background: "rgb(var(--surface-elevated))",
                border: "1px solid var(--border)"
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={threshold.enabled}
                    onChange={(e) => updateThreshold(metric.key, "enabled", e.target.checked)}
                    className="w-4 h-4"
                    style={{ 
                      accentColor: "rgb(var(--primary))",
                      cursor: "pointer"
                    }}
                  />
                  <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    {metric.label}
                  </label>
                </div>
                {current !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Current:</span>
                    <span className={`text-sm font-bold ${
                      status === "alert" ? "text-red-400" :
                      status === "warning" ? "text-yellow-400" :
                      "text-emerald-400"
                    }`}>
                      {current.toFixed(metric.key === "temp_c" ? 1 : 2)}{metric.unit}
                    </span>
                  </div>
                )}
              </div>

              {threshold.enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs block mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                      Minimum {metric.unit}
                    </label>
                    <input
                      type="number"
                      min={metric.min}
                      max={metric.max}
                      step={metric.step}
                      value={threshold.min}
                      onChange={(e) => updateThreshold(metric.key, "min", parseFloat(e.target.value))}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs block mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                      Maximum {metric.unit}
                    </label>
                    <input
                      type="number"
                      min={metric.min}
                      max={metric.max}
                      step={metric.step}
                      value={threshold.max}
                      onChange={(e) => updateThreshold(metric.key, "max", parseFloat(e.target.value))}
                      className="input w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={handleReset} className="btn btn-ghost flex-1">
            Reset to Defaults
          </button>
          <button onClick={handleSave} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
}

