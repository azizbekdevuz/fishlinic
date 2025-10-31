"use client";

import type { MetricKey } from "@/app/lib/types";
import { Target, TestTube, Thermometer, Wind } from "lucide-react";

type MetricToggleProps = {
  metric: MetricKey;
  onChange: (metric: MetricKey) => void;
};

const metrics = [
  { key: "overall" as MetricKey, label: "Overall", icon: Target, color: "from-blue-500 to-purple-600" },
  { key: "pH" as MetricKey, label: "pH Level", icon: TestTube, color: "from-emerald-500 to-teal-600" },
  { key: "temp" as MetricKey, label: "Temperature", icon: Thermometer, color: "from-orange-500 to-red-600" },
  { key: "DO" as MetricKey, label: "Oxygen", icon: Wind, color: "from-cyan-500 to-blue-600" }
];

export function MetricToggle({ metric, onChange }: MetricToggleProps) {
  return (
    <div className="glass p-2 rounded-xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {metrics.map((m, index) => {
          const isActive = metric === m.key;
          const IconComponent = m.icon;
          
          return (
            <button
              key={m.key}
              onClick={() => onChange(m.key)}
              className={`relative p-3 rounded-lg transition-all duration-200 animate-fade-in ${
                isActive 
                  ? "bg-white/20 border border-white/30 shadow-lg transform scale-105" 
                  : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Background Gradient for Active */}
              {isActive && (
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-20 rounded-lg`}
                ></div>
              )}
              
              {/* Content */}
              <div className="relative flex flex-col items-center gap-2">
                <IconComponent className="w-6 h-6" style={{ 
                  color: isActive ? "rgb(var(--text-primary))" : "rgb(var(--text-secondary))" 
                }} />
                <div className="text-xs font-medium text-center" style={{ 
                  color: isActive ? "rgb(var(--text-primary))" : "rgb(var(--text-secondary))" 
                }}>
                  {m.label}
                </div>
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
              )}
              
              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              } bg-gradient-to-br ${m.color} blur-xl -z-10`}></div>
            </button>
          );
        })}
      </div>
      
      {/* Description */}
      <div className="mt-3 text-center">
        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          {metric === "overall" && "Combined water quality score based on all parameters"}
          {metric === "pH" && "Acidity/alkalinity level - optimal range: 6.5-8.0"}
          {metric === "temp" && "Water temperature - optimal range: 20-30°C"}
          {metric === "DO" && "Dissolved oxygen concentration - minimum: 5.0 mg/L"}
        </p>
      </div>
    </div>
  );
}