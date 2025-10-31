"use client";

import type { Status } from "@/app/lib/types";
import { CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

type StatusCardProps = {
  status: Status;
};

export function StatusCard({ status }: StatusCardProps) {
  const statusConfig = {
    good: {
      icon: CheckCircle,
      title: "System Healthy",
      description: "All parameters within optimal range",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
      borderColor: "border-emerald-500/30",
      glowColor: "shadow-emerald-500/20"
    },
    average: {
      icon: AlertTriangle,
      title: "Attention Needed",
      description: "Some parameters need monitoring",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      borderColor: "border-yellow-500/30",
      glowColor: "shadow-yellow-500/20"
    },
    alert: {
      icon: AlertCircle,
      title: "Critical Alert",
      description: "Immediate action required",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
      glowColor: "shadow-red-500/20"
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  const recommendations = {
    good: [
      "Continue current maintenance routine",
      "Monitor trends for early detection",
      "Schedule regular equipment checks"
    ],
    average: [
      "Check water filtration system",
      "Consider partial water change",
      "Monitor fish behavior closely"
    ],
    alert: [
      "Immediate water quality correction",
      "Check all equipment functionality",
      "Consider emergency protocols"
    ]
  };

  return (
    <div className={`glass p-6 rounded-xl border ${config.borderColor} ${config.bgColor} ${config.glowColor} shadow-lg animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <IconComponent className={`w-8 h-8 ${config.color} animate-pulse`} />
        <div>
          <h3 className={`text-lg font-bold ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            {config.description}
          </p>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            System Status
          </span>
          <span className={`text-sm font-bold ${config.color}`}>
            {status.toUpperCase()}
          </span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              status === "good" ? "bg-gradient-to-r from-emerald-500 to-green-400 w-full" :
              status === "average" ? "bg-gradient-to-r from-yellow-500 to-amber-400 w-2/3" :
              "bg-gradient-to-r from-red-500 to-rose-400 w-1/3 animate-pulse"
            }`}
          ></div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold mb-3" style={{ color: "rgb(var(--text-primary))" }}>
          Recommendations
        </h4>
        <div className="space-y-2">
          {recommendations[status].map((rec, index) => (
            <div 
              key={index}
              className="flex items-start gap-2 text-xs animate-slide-in"
              style={{ 
                color: "rgb(var(--text-secondary))",
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                status === "good" ? "bg-emerald-400" :
                status === "average" ? "bg-yellow-400" :
                "bg-red-400"
              }`}></div>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <button className={`btn btn-sm w-full ${
          status === "alert" ? "btn-primary animate-glow" : "btn-ghost"
        }`}>
          {status === "alert" ? (
            <>
              <AlertCircle className="w-4 h-4" />
              Take Action
            </>
          ) : status === "average" ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              View Details
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              All Good
            </>
          )}
        </button>
      </div>
    </div>
  );
}