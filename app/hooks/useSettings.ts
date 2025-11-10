"use client";

import { useState, useEffect, useCallback } from "react";

export type DashboardSettings = {
  temperatureUnit: "celsius" | "fahrenheit";
  defaultTimeRange: "24h" | "1w" | "1m";
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
  chartAnimation: boolean;
};

const DEFAULT_SETTINGS: DashboardSettings = {
  temperatureUnit: "celsius",
  defaultTimeRange: "1w",
  autoRefresh: true,
  refreshInterval: 5,
  chartAnimation: true
};

export function useSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dashboardSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        // Use defaults if parse fails
      }
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: DashboardSettings) => {
    setSettings(newSettings);
    localStorage.setItem("dashboardSettings", JSON.stringify(newSettings));
  }, []);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof DashboardSettings>(
    key: K,
    value: DashboardSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Convert temperature based on unit setting
  const formatTemperature = useCallback((tempC: number): { value: number; unit: string } => {
    if (settings.temperatureUnit === "fahrenheit") {
      return {
        value: (tempC * 9/5) + 32,
        unit: "°F"
      };
    }
    return {
      value: tempC,
      unit: "°C"
    };
  }, [settings.temperatureUnit]);

  return {
    settings,
    isLoaded,
    saveSettings,
    updateSetting,
    formatTemperature
  };
}

