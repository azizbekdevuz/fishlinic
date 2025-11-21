"use client";

import { useState } from "react";
import { DashboardPreferences } from "./DashboardPreferences";
import { AlertSettings } from "./AlertSettings";
import { DisplayPreferences } from "./DisplayPreferences";
import { DataExportSettings } from "./DataExportSettings";
import { 
  Monitor, 
  Bell, 
  Palette, 
  Download,
  Settings as SettingsIcon
} from "lucide-react";

type SettingsTab = "dashboard" | "alerts" | "display" | "data";

const tabs = [
  {
    id: "dashboard" as const,
    label: "Dashboard",
    icon: Monitor,
    description: "Temperature, refresh, and chart preferences"
  },
  {
    id: "alerts" as const,
    label: "Alerts",
    icon: Bell,
    description: "Threshold settings and notifications"
  },
  {
    id: "display" as const,
    label: "Display",
    icon: Palette,
    description: "Theme, layout, and visual preferences"
  },
  {
    id: "data" as const,
    label: "Data & Export",
    icon: Download,
    description: "Export formats and data management"
  }
];

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPreferences />;
      case "alerts":
        return <AlertSettings />;
      case "display":
        return <DisplayPreferences />;
      case "data":
        return <DataExportSettings />;
      default:
        return <DashboardPreferences />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <div className="card-glass p-4 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
            <h2 className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
              Categories
            </h2>
          </div>
          
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-white" : ""}`} 
                      style={!isActive ? { color: "rgb(var(--text-primary))" } : {}} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${isActive ? "text-white" : ""}`}
                        style={!isActive ? { color: "rgb(var(--text-primary))" } : {}}>
                        {tab.label}
                      </div>
                      <div className={`text-xs ${isActive ? "text-white/80" : ""}`}
                        style={!isActive ? { color: "rgb(var(--text-muted))" } : {}}>
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="card-glass p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
