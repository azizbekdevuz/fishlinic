"use client";

import type { Telemetry } from "@/app/lib/types";
import { TestTube, Thermometer, Wind, Fish } from "lucide-react";

type QuickStatsCardProps = {
  latest: Telemetry;
};

export function QuickStatsCard({ latest }: QuickStatsCardProps) {
  const stats = [
    {
      label: "pH Level",
      value: latest.pH.toFixed(2),
      unit: "",
      icon: TestTube,
      status: latest.pH >= 6.5 && latest.pH <= 8.0 ? "good" : 
              latest.pH >= 6.0 && latest.pH <= 8.5 ? "average" : "alert"
    },
    {
      label: "Temperature",
      value: latest.temp_c.toFixed(1),
      unit: "°C",
      icon: Thermometer,
      status: latest.temp_c >= 20 && latest.temp_c <= 30 ? "good" : 
              latest.temp_c >= 18 && latest.temp_c <= 32 ? "average" : "alert"
    },
    {
      label: "Dissolved O₂",
      value: latest.do_mg_l.toFixed(2),
      unit: "mg/L",
      icon: Wind,
      status: latest.do_mg_l >= 5.0 ? "good" : 
              latest.do_mg_l >= 3.5 ? "average" : "alert"
    },
    ...(latest.fish_health ? [{
      label: "Fish Health",
      value: latest.fish_health.toString(),
      unit: "%",
      icon: Fish,
      status: latest.fish_health >= 80 ? "good" : 
              latest.fish_health >= 60 ? "average" : "alert"
    }] : [])
  ];

  return (
    <div className="space-y-3">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div 
            key={stat.label}
            className="glass p-4 rounded-xl animate-fade-in hover:bg-white/10 transition-all duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconComponent className="w-6 h-6" style={{ color: "rgb(var(--text-muted))" }} />
                <div>
                  <div className="text-xs font-medium" style={{ color: "rgb(var(--text-muted))" }}>
                    {stat.label}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                      {stat.value}
                    </span>
                    {stat.unit && (
                      <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        {stat.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`w-3 h-3 rounded-full ${
                stat.status === "good" ? "bg-emerald-400 shadow-emerald-400/50" :
                stat.status === "average" ? "bg-yellow-400 shadow-yellow-400/50" :
                "bg-red-400 shadow-red-400/50"
              } shadow-lg animate-pulse`}></div>
            </div>
            
            {/* Mini trend indicator */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    stat.status === "good" ? "bg-gradient-to-r from-emerald-500 to-green-400" :
                    stat.status === "average" ? "bg-gradient-to-r from-yellow-500 to-amber-400" :
                    "bg-gradient-to-r from-red-500 to-rose-400"
                  }`}
                  style={{ 
                    width: stat.status === "good" ? "85%" : 
                           stat.status === "average" ? "60%" : "30%" 
                  }}
                ></div>
              </div>
              <span className={`text-xs font-medium ${
                stat.status === "good" ? "text-emerald-400" :
                stat.status === "average" ? "text-yellow-400" :
                "text-red-400"
              }`}>
                {stat.status === "good" ? "Optimal" :
                 stat.status === "average" ? "OK" : "Alert"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}