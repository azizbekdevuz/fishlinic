"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/app/hooks/useToast";
import { useTheme } from "next-themes";
import { useSettings } from "@/app/hooks/useSettings";
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Smartphone,
  BarChart3,
  Table,
  Minimize2,
  Save,
  RotateCcw
} from "lucide-react";

export function DisplayPreferences() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const { settings, saveSettings, isLoaded } = useSettings();
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
    toast.show("success", "Display preferences saved successfully!", 3000);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultSettings = {
      ...settings,
      chartType: "line" as const,
      tablePagination: 25 as const,
      compactMode: false,
      showGridLines: true,
      showDataPoints: true,
      animationSpeed: "normal" as const
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
          Display Preferences
        </h3>
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Customize the visual appearance and layout of your dashboard
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Theme
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              theme === "light"
                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                : "border-white/10 hover:bg-white/5"
            }`}
            style={theme !== "light" ? { color: "rgb(var(--text-primary))" } : {}}
          >
            <Sun className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Light</div>
            <div className="text-xs opacity-70">Bright theme</div>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              theme === "dark"
                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                : "border-white/10 hover:bg-white/5"
            }`}
            style={theme !== "dark" ? { color: "rgb(var(--text-primary))" } : {}}
          >
            <Moon className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">Dark</div>
            <div className="text-xs opacity-70">Dark theme</div>
          </button>
          <button
            onClick={() => setTheme("system")}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              theme === "system"
                ? "bg-blue-500/20 border-blue-500 text-blue-400"
                : "border-white/10 hover:bg-white/5"
            }`}
            style={theme !== "system" ? { color: "rgb(var(--text-primary))" } : {}}
          >
            <Monitor className="w-5 h-5 mx-auto mb-1" />
            <div className="text-sm font-medium">System</div>
            <div className="text-xs opacity-70">Auto detect</div>
          </button>
        </div>
      </div>

      {/* Chart Preferences */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Chart Type
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "line", label: "Line Chart", desc: "Connected points" },
            { value: "area", label: "Area Chart", desc: "Filled regions" },
            { value: "bar", label: "Bar Chart", desc: "Vertical bars" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting("chartType", option.value as "line" | "area" | "bar")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                localSettings.chartType === option.value
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={localSettings.chartType !== option.value ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-70">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
          Chart Options
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
            <div>
              <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Show Grid Lines
              </div>
              <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Display background grid for better readability
              </div>
            </div>
            <button
            onClick={() => updateSetting("showGridLines", !localSettings.showGridLines)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.showGridLines ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.showGridLines ? "translate-x-6" : "translate-x-1"
              }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
            <div>
              <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Show Data Points
              </div>
              <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Display individual data points on charts
              </div>
            </div>
            <button
            onClick={() => updateSetting("showDataPoints", !localSettings.showDataPoints)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.showDataPoints ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.showDataPoints ? "translate-x-6" : "translate-x-1"
              }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Animation Speed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Animation Speed
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "slow", label: "Slow", desc: "Smooth & relaxed" },
            { value: "normal", label: "Normal", desc: "Balanced speed" },
            { value: "fast", label: "Fast", desc: "Quick & snappy" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting("animationSpeed", option.value as "slow" | "normal" | "fast")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                localSettings.animationSpeed === option.value
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={localSettings.animationSpeed !== option.value ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-70">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Table Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Table Pagination
          </label>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[10, 25, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => updateSetting("tablePagination", size as 10 | 25 | 50 | 100)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                localSettings.tablePagination === size
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={localSettings.tablePagination !== size ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">{size}</div>
              <div className="text-xs opacity-70">rows</div>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Minimize2 className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Layout Options
          </label>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Compact Mode
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Reduce spacing and padding for more content
            </div>
          </div>
          <button
            onClick={() => updateSetting("compactMode", !localSettings.compactMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              localSettings.compactMode ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localSettings.compactMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
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
