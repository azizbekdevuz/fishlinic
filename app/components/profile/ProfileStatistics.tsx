"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { 
  Activity, 
  Database, 
  Calendar, 
  TrendingUp,
  BarChart3,
  Clock
} from "lucide-react";

type UserStats = {
  totalReadings: number;
  readingsLast24h: number;
  readingsLast7d: number;
  averageQuality: number;
  lastActivity: string | null;
  accountAge: number; // in days
};

export function ProfileStatistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user/stats?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
          Statistics
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatAccountAge = () => {
    if (!user?.createdAt) return "Unknown";
    
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months === 1 ? '' : 's'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years === 1 ? '' : 's'}`;
    }
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return "text-green-400";
    if (quality >= 6) return "text-yellow-400";
    return "text-red-400";
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 8) return "Excellent";
    if (quality >= 6) return "Good";
    if (quality >= 4) return "Fair";
    return "Poor";
  };

  const statItems = [
    {
      icon: Database,
      label: "Total Readings",
      value: stats?.totalReadings?.toLocaleString() || "0",
      color: "text-blue-400"
    },
    {
      icon: Activity,
      label: "Last 24 Hours",
      value: stats?.readingsLast24h?.toString() || "0",
      color: "text-green-400"
    },
    {
      icon: TrendingUp,
      label: "Last 7 Days",
      value: stats?.readingsLast7d?.toString() || "0",
      color: "text-purple-400"
    },
    {
      icon: BarChart3,
      label: "Avg. Quality",
      value: stats?.averageQuality ? `${stats.averageQuality.toFixed(1)}/10` : "N/A",
      color: stats?.averageQuality ? getQualityColor(stats.averageQuality) : "text-gray-400",
      subtitle: stats?.averageQuality ? getQualityLabel(stats.averageQuality) : undefined
    },
    {
      icon: Calendar,
      label: "Account Age",
      value: formatAccountAge(),
      color: "text-orange-400"
    },
    {
      icon: Clock,
      label: "Last Activity",
      value: stats?.lastActivity 
        ? new Date(stats.lastActivity).toLocaleDateString()
        : "No activity",
      color: "text-gray-400"
    }
  ];

  return (
    <div className="card-glass p-6">
      <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
        Statistics
      </h3>
      
      <div className="space-y-4">
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <IconComponent className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  {item.label}
                </div>
                <div className={`text-sm font-medium ${item.color}`}>
                  {item.value}
                </div>
                {item.subtitle && (
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {item.subtitle}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Indicators */}
      {stats && stats.totalReadings > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="text-xs mb-2" style={{ color: "rgb(var(--text-muted))" }}>
            Activity Level
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((stats.readingsLast7d / 50) * 100, 100)}%` 
                }}
              />
            </div>
            <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              {Math.min(Math.round((stats.readingsLast7d / 50) * 100), 100)}%
            </span>
          </div>
          <div className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
            Based on weekly activity (target: 50 readings)
          </div>
        </div>
      )}
    </div>
  );
}
