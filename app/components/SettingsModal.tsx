"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Settings, Save, RotateCcw } from "lucide-react";

type Settings = {
  temperatureUnit: "celsius" | "fahrenheit";
  defaultTimeRange: "24h" | "1w" | "1m";
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  chartAnimation: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  temperatureUnit: "celsius",
  defaultTimeRange: "1w",
  autoRefresh: true,
  refreshInterval: 5,
  chartAnimation: true
};

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: Settings) => void;
};

export function SettingsModal({ isOpen, onClose, onSettingsChange }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("dashboardSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("dashboardSettings", JSON.stringify(settings));
    onSettingsChange?.(settings);
    alert("Settings saved successfully!");
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Dashboard Settings" size="md">
      <div className="space-y-6">
        {/* Temperature Unit */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Temperature Unit
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateSetting("temperatureUnit", "celsius")}
              className={`btn ${settings.temperatureUnit === "celsius" ? "btn-primary" : "btn-secondary"}`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => updateSetting("temperatureUnit", "fahrenheit")}
              className={`btn ${settings.temperatureUnit === "fahrenheit" ? "btn-primary" : "btn-secondary"}`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        {/* Default Time Range */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Default Time Range
          </label>
          <select
            value={settings.defaultTimeRange}
            onChange={(e) => updateSetting("defaultTimeRange", e.target.value as "24h" | "1w" | "1m")}
            className="input w-full"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
          </select>
        </div>

        {/* Auto Refresh */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Auto Refresh
          </label>
          <div 
            className="flex items-center justify-between p-4 rounded-lg"
            style={{
              background: "rgb(var(--surface-elevated))",
              border: "1px solid var(--border)"
            }}
          >
            <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Automatically refresh data
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => updateSetting("autoRefresh", e.target.checked)}
                className="sr-only peer"
              />
              <div 
                className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: "rgb(var(--surface-elevated))",
                  border: "1px solid var(--border)"
                }}
              >
                <div 
                  className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-all"
                  style={{
                    backgroundColor: settings.autoRefresh ? "rgb(var(--primary))" : "rgb(var(--text-muted))",
                    transform: settings.autoRefresh ? "translateX(calc(1.5rem - 2px))" : "translateX(0)"
                  }}
                ></div>
              </div>
            </label>
          </div>
        </div>

        {/* Refresh Interval */}
        {settings.autoRefresh && (
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
              Refresh Interval
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="2"
                max="60"
                step="1"
                value={settings.refreshInterval}
                onChange={(e) => updateSetting("refreshInterval", parseInt(e.target.value))}
                className="w-full"
                style={{
                  accentColor: "rgb(var(--primary))"
                }}
              />
              <div className="flex justify-between text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                <span>2 seconds</span>
                <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {settings.refreshInterval} seconds
                </span>
                <span>60 seconds</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart Animation */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Chart Animation
          </label>
          <div 
            className="flex items-center justify-between p-4 rounded-lg"
            style={{
              background: "rgb(var(--surface-elevated))",
              border: "1px solid var(--border)"
            }}
          >
            <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Enable chart animations
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chartAnimation}
                onChange={(e) => updateSetting("chartAnimation", e.target.checked)}
                className="sr-only peer"
              />
              <div 
                className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{
                  backgroundColor: "rgb(var(--surface-elevated))",
                  border: "1px solid var(--border)"
                }}
              >
                <div 
                  className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-all"
                  style={{
                    backgroundColor: settings.chartAnimation ? "rgb(var(--primary))" : "rgb(var(--text-muted))",
                    transform: settings.chartAnimation ? "translateX(calc(1.5rem - 2px))" : "translateX(0)"
                  }}
                ></div>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={handleReset} className="btn btn-ghost flex-1 flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset
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

