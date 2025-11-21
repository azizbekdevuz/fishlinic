"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/app/hooks/useToast";
import { playAlertSound, requestAudioPermission } from "@/app/lib/sound";
import { 
  Bell, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Activity,
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  Play
} from "lucide-react";

type AlertThresholds = {
  pH: { min: number; max: number; enabled: boolean };
  temp_c: { min: number; max: number; enabled: boolean };
  do_mg_l: { min: number; max: number; enabled: boolean };
  quality_ai: { min: number; max: number; enabled: boolean };
};

type NotificationSettings = {
  toastEnabled: boolean;
  soundEnabled: boolean;
  emailEnabled: boolean;
  frequency: "immediate" | "batched";
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
};

const DEFAULT_THRESHOLDS: AlertThresholds = {
  pH: { min: 6.5, max: 8.0, enabled: true },
  temp_c: { min: 20, max: 30, enabled: true },
  do_mg_l: { min: 5.0, max: 12.0, enabled: true },
  quality_ai: { min: 6.0, max: 10.0, enabled: true }
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  toastEnabled: true,
  soundEnabled: false,
  emailEnabled: false,
  frequency: "immediate",
  quietHours: {
    enabled: false,
    start: "22:00",
    end: "08:00"
  }
};

export function AlertSettings() {
  const toast = useToast();
  const [thresholds, setThresholds] = useState<AlertThresholds>(DEFAULT_THRESHOLDS);
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load thresholds from localStorage
    const savedThresholds = localStorage.getItem("alertThresholds");
    if (savedThresholds) {
      try {
        setThresholds(JSON.parse(savedThresholds));
      } catch {
        // Use defaults if parse fails
      }
    }

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem("notificationSettings");
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications));
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  useEffect(() => {
    const originalThresholds = localStorage.getItem("alertThresholds");
    const originalNotifications = localStorage.getItem("notificationSettings");
    
    const thresholdsChanged = JSON.stringify(thresholds) !== (originalThresholds || JSON.stringify(DEFAULT_THRESHOLDS));
    const notificationsChanged = JSON.stringify(notifications) !== (originalNotifications || JSON.stringify(DEFAULT_NOTIFICATIONS));
    
    setHasChanges(thresholdsChanged || notificationsChanged);
  }, [thresholds, notifications]);

  const handleSave = () => {
    localStorage.setItem("alertThresholds", JSON.stringify(thresholds));
    localStorage.setItem("notificationSettings", JSON.stringify(notifications));
    toast.show("success", "Alert settings saved successfully!", 3000);
    setHasChanges(false);
  };

  const handleTestSound = async () => {
    // Request audio permission first
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
      toast.show("error", "Audio permission required. Please interact with the page first.", 3000);
      return;
    }
    
    // Play test sound
    playAlertSound('warning');
    toast.show("info", "Test sound played!", 2000);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    setNotifications(DEFAULT_NOTIFICATIONS);
  };

  const updateThreshold = (
    metric: keyof AlertThresholds,
    field: keyof AlertThresholds[keyof AlertThresholds],
    value: number | boolean
  ) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: value
      }
    }));
  };

  const updateNotification = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const thresholdConfigs = [
    {
      key: "pH" as const,
      label: "pH Level",
      icon: Droplets,
      unit: "",
      step: 0.1,
      color: "text-blue-400"
    },
    {
      key: "temp_c" as const,
      label: "Temperature",
      icon: Thermometer,
      unit: "°C",
      step: 0.5,
      color: "text-orange-400"
    },
    {
      key: "do_mg_l" as const,
      label: "Dissolved Oxygen",
      icon: Activity,
      unit: "mg/L",
      step: 0.1,
      color: "text-green-400"
    },
    {
      key: "quality_ai" as const,
      label: "AI Quality Score",
      icon: AlertTriangle,
      unit: "/10",
      step: 0.1,
      color: "text-purple-400"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
          Alert Settings
        </h3>
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Configure thresholds and notification preferences for water quality alerts
        </p>
      </div>

      {/* Threshold Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium flex items-center gap-2" style={{ color: "rgb(var(--text-primary))" }}>
          <AlertTriangle className="w-5 h-5" />
          Alert Thresholds
        </h4>
        
        {thresholdConfigs.map((config) => {
          const IconComponent = config.icon;
          const threshold = thresholds[config.key];
          
          return (
            <div key={config.key} className="p-4 rounded-lg border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${config.color}`} />
                  <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    {config.label}
                  </span>
                </div>
                <button
                  onClick={() => updateThreshold(config.key, "enabled", !threshold.enabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    threshold.enabled ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      threshold.enabled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              
              {threshold.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                      Minimum {config.unit}
                    </label>
                    <input
                      type="number"
                      step={config.step}
                      value={threshold.min}
                      onChange={(e) => updateThreshold(config.key, "min", parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                      style={{ color: "rgb(var(--text-primary))" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "rgb(var(--text-muted))" }}>
                      Maximum {config.unit}
                    </label>
                    <input
                      type="number"
                      step={config.step}
                      value={threshold.max}
                      onChange={(e) => updateThreshold(config.key, "max", parseFloat(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                      style={{ color: "rgb(var(--text-primary))" }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium flex items-center gap-2" style={{ color: "rgb(var(--text-primary))" }}>
          <Bell className="w-5 h-5" />
          Notification Preferences
        </h4>

        {/* Notification Types */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
              <div>
                <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Toast Notifications
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  Show alerts in the dashboard
                </div>
              </div>
            </div>
            <button
              onClick={() => updateNotification("toastEnabled", !notifications.toastEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.toastEnabled ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.toastEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-lg border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notifications.soundEnabled ? (
                  <Volume2 className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
                ) : (
                  <VolumeX className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
                )}
                <div>
                  <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    Sound Alerts
                  </div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    Play sound for critical alerts
                  </div>
                </div>
              </div>
              <button
                onClick={() => updateNotification("soundEnabled", !notifications.soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.soundEnabled ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.soundEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            
            {/* Test Sound Button */}
            <button
              onClick={handleTestSound}
              className="w-full btn btn-ghost btn-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Test Sound
            </button>
          </div>
        </div>

        {/* Alert Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Alert Frequency
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateNotification("frequency", "immediate")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                notifications.frequency === "immediate"
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={notifications.frequency !== "immediate" ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">Immediate</div>
              <div className="text-xs opacity-70">Alert as soon as detected</div>
            </button>
            <button
              onClick={() => updateNotification("frequency", "batched")}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                notifications.frequency === "batched"
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={notifications.frequency !== "batched" ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">Batched</div>
              <div className="text-xs opacity-70">Group alerts every 5 minutes</div>
            </button>
          </div>
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
