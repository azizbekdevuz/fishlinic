"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { formatDateTime } from "@/app/lib/format";
import { 
  Activity, 
  LogIn, 
  Settings, 
  Download, 
  Upload, 
  Shield,
  User,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

type ActivityItem = {
  id: string;
  type: "login" | "settings" | "export" | "upload" | "verification" | "profile" | "alert";
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export function ProfileActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user/activity?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setActivities(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch user activity:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [user?.id]);

  // Mock activity data for demonstration (remove when API is implemented)
  useEffect(() => {
    if (!isLoading && activities.length === 0) {
      const mockActivities: ActivityItem[] = [
        {
          id: "1",
          type: "login",
          description: "Signed in to dashboard",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          type: "settings",
          description: "Updated dashboard preferences",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "verification",
          description: "Account verification completed",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          type: "profile",
          description: "Updated profile information",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "5",
          type: "export",
          description: "Exported telemetry data (CSV format)",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      setActivities(mockActivities);
    }
  }, [isLoading, activities.length]);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return LogIn;
      case "settings":
        return Settings;
      case "export":
        return Download;
      case "upload":
        return Upload;
      case "verification":
        return Shield;
      case "profile":
        return User;
      case "alert":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "login":
        return "text-green-400";
      case "settings":
        return "text-blue-400";
      case "export":
        return "text-purple-400";
      case "upload":
        return "text-orange-400";
      case "verification":
        return "text-emerald-400";
      case "profile":
        return "text-cyan-400";
      case "alert":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateTime(time.toISOString()).split(' ')[0]; // Just the date
  };

  if (isLoading) {
    return (
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded mb-1"></div>
                <div className="h-3 bg-white/5 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Recent Activity
        </h3>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-ghost btn-sm flex items-center gap-1"
          title="Refresh activity"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "rgb(var(--text-muted))" }} />
          <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
            No recent activity to display
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type);
            const iconColor = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                {/* Timeline */}
                <div className="relative">
                  <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${
                    index === 0 ? 'ring-2 ring-blue-500/30' : ''
                  }`}>
                    <IconComponent className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="absolute top-8 left-1/2 w-px h-6 bg-white/10 transform -translate-x-1/2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      {getRelativeTime(activity.timestamp)}
                    </span>
                    {index === 0 && (
                      <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                  
                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="mt-2 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span key={key} className="mr-3">
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  {activity.type === "verification" && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View More */}
      {activities.length >= 10 && (
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button className="btn btn-ghost btn-sm">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}
