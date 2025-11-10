"use client";

import { X, AlertTriangle, AlertCircle } from "lucide-react";
import type { ActiveAlert } from "@/app/hooks/useAlerts";
import { useState } from "react";

type AlertBannerProps = {
  alerts: ActiveAlert[];
  onDismiss?: () => void;
};

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (alerts.length === 0 || dismissed) return null;

  const criticalAlerts = alerts.filter(a => a.severity === "alert");
  const warnings = alerts.filter(a => a.severity === "warning");
  const hasCritical = criticalAlerts.length > 0;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 animate-slide-down ${
        hasCritical ? "bg-red-500/90" : "bg-yellow-500/90"
      } backdrop-blur-sm border-b ${
        hasCritical ? "border-red-400" : "border-yellow-400"
      } shadow-lg`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {hasCritical ? (
              <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                {hasCritical 
                  ? `${criticalAlerts.length} Critical Alert${criticalAlerts.length > 1 ? 's' : ''}`
                  : `${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`
                }
              </div>
              <div className="text-xs text-white/90 mt-1">
                {alerts[0]?.message}
                {alerts.length > 1 && ` (+${alerts.length - 1} more)`}
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-white/80 transition-colors p-1"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

