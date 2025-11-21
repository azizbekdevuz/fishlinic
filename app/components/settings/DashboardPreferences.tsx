"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/app/hooks/useSettings";
import { useToast } from "@/app/hooks/useToast";
import { 
  Thermometer, 
  Clock, 
  RefreshCw, 
  BarChart3, 
  Database,
  Save,
  RotateCcw
} from "lucide-react";

export function DashboardPreferences() {
  const { settings, saveSettings, isLoaded } = useSettings();
  const toast = useToast();
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(hasChanges);
  }, [localSettings, settings]);

  const handleSave = () => {
    saveSettings(localSettings);
    toast.show("success", "Dashboard preferences saved successfully!", 3000);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      temperatureUnit: "celsius" as const,
      defaultTimeRange: "1w" as const,
      autoRefresh: true,
      refreshInterval: 5,
      chartAnimation: true,
      chartType: "line" as const,
      tablePagination: 25 as const,
      compactMode: false,
      showGridLines: true,
      showDataPoints: true,
      animationSpeed: "normal" as const,
      bufferSize: 100 as const
    };
    setLocalSettings(defaultSettings);
  };

  const updateSetting = <K extends keyof typeof localSettings>(
    key: K,
    value: typeof localSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
          Dashboard Preferences
        </h3>
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Configure how your dashboard displays data and behaves
        </p>
      </div>

      {/* Temperature Unit */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Temperature Unit
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSetting("temperatureUnit", "celsius")}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              localSettings.temperatureUnit === "celsius"
                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                : "border-white/10 hover:bg-white/5"
            }`}
            style={localSettings.temperatureUnit !== "celsius" ? { color: "rgb(var(--text-primary))" } : {}}
          >
            <div className="text-sm font-medium">Celsius (°C)</div>
            <div className="text-xs opacity-70">Metric system</div>
          </button>
          <button
            onClick={() => updateSetting("temperatureUnit", "fahrenheit")}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              localSettings.temperatureUnit === "fahrenheit"
                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                : "border-white/10 hover:bg-white/5"
            }`}
            style={localSettings.temperatureUnit !== "fahrenheit" ? { color: "rgb(var(--text-primary))" } : {}}
          >
            <div className="text-sm font-medium">Fahrenheit (°F)</div>
            <div className="text-xs opacity-70">Imperial system</div>
          </button>
        </div>
      </div>

      {/* Default Time Range */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Default Time Range
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "24h", label: "24 Hours", desc: "Last day" },
            { value: "1w", label: "1 Week", desc: "Last 7 days" },
            { value: "1m", label: "1 Month", desc: "Last 30 days" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting("defaultTimeRange", option.value as any)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                localSettings.defaultTimeRange === option.value
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={localSettings.defaultTimeRange !== option.value ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-70">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Auto Refresh */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Auto Refresh
          </label>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Enable Auto Refresh
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Automatically update dashboard data
            </div>
          </div>
          <button
            onClick={() => updateSetting("autoRefresh", !localSettings.autoRefresh)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.autoRefresh ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.autoRefresh ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Refresh Interval */}
      {localSettings.autoRefresh && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
            <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Refresh Interval
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                {localSettings.refreshInterval} seconds
              </span>
              <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                1s - 60s
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={localSettings.refreshInterval}
              onChange={(e) => updateSetting("refreshInterval", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      )}

      {/* Chart Animation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Chart Animation
          </label>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Enable Chart Animations
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Smooth transitions and hover effects
            </div>
          </div>
          <button
            onClick={() => updateSetting("chartAnimation", !localSettings.chartAnimation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.chartAnimation ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.chartAnimation ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Buffer Size */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Data Buffer Size
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 50, label: "Small", desc: "50 readings" },
            { value: 100, label: "Medium", desc: "100 readings" },
            { value: 200, label: "Large", desc: "200 readings" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting("bufferSize", option.value as any)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                localSettings.bufferSize === option.value
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={localSettings.bufferSize !== option.value ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-70">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          onClick={handleReset}
          className="btn btn-ghost btn-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`btn btn-sm flex items-center gap-2 ${
            hasChanges 
              ? "btn-primary" 
              : "btn-ghost opacity-50 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
