"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Calendar, 
  GitBranch, 
  Tag,
  Clock,
  Code,
  ExternalLink
} from "lucide-react";

type VersionInfo = {
  version: string;
  buildDate: string;
  gitCommit?: string;
  environment: string;
  nodeVersion: string;
  nextVersion: string;
};

export function VersionInfo() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVersionInfo();
  }, []);

  const fetchVersionInfo = async () => {
    try {
      const response = await fetch('/api/version');
      if (response.ok) {
        const data = await response.json();
        setVersionInfo(data);
      } else {
        // Fallback to static version info
        setVersionInfo({
          version: "0.1.0",
          buildDate: new Date().toISOString(),
          environment: process.env.NODE_ENV || "development",
          nodeVersion: "20.x",
          nextVersion: "15.5.3"
        });
      }
    } catch (error) {
      console.error('Failed to fetch version info:', error);
      // Fallback version info
      setVersionInfo({
        version: "0.1.0",
        buildDate: new Date().toISOString(),
        environment: "development",
        nodeVersion: "20.x",
        nextVersion: "15.5.3"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case "production":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "development":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "staging":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="card-glass p-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
          <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            Version Information
          </h2>
        </div>
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

  if (!versionInfo) {
    return (
      <div className="card-glass p-6">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
          <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            Version Information
          </h2>
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Version information unavailable
        </p>
      </div>
    );
  }

  const versionDetails = [
    {
      icon: Tag,
      label: "Version",
      value: versionInfo.version,
      color: "text-blue-400"
    },
    {
      icon: Calendar,
      label: "Build Date",
      value: formatDate(versionInfo.buildDate),
      color: "text-green-400"
    },
    {
      icon: Code,
      label: "Environment",
      value: versionInfo.environment,
      color: "text-purple-400",
      badge: true
    },
    {
      icon: Package,
      label: "Next.js",
      value: versionInfo.nextVersion,
      color: "text-orange-400"
    }
  ];

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <Package className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Version Information
        </h2>
      </div>

      <div className="space-y-4">
        {versionDetails.map((detail) => {
          const IconComponent = detail.icon;
          return (
            <div key={detail.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 ${detail.color}`} />
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  {detail.label}
                </span>
              </div>
              
              {detail.badge ? (
                <span className={`text-xs px-2 py-1 rounded border ${getEnvironmentColor(detail.value)}`}>
                  {detail.value}
                </span>
              ) : (
                <span className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                  {detail.value}
                </span>
              )}
            </div>
          );
        })}

        {versionInfo.gitCommit && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Git Commit
              </span>
            </div>
            <span className="text-sm font-mono" style={{ color: "rgb(var(--text-muted))" }}>
              {versionInfo.gitCommit.substring(0, 8)}
            </span>
          </div>
        )}
      </div>

      {/* Additional Information */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <h3 className="text-sm font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
          Runtime Information
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-2 rounded bg-white/5">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3" style={{ color: "rgb(var(--text-muted))" }} />
              <span style={{ color: "rgb(var(--text-muted))" }}>Uptime</span>
            </div>
            <span style={{ color: "rgb(var(--text-primary))" }}>
              {Math.floor(performance.now() / 1000 / 60)} minutes
            </span>
          </div>
          
          <div className="p-2 rounded bg-white/5">
            <div className="flex items-center gap-1 mb-1">
              <Package className="w-3 h-3" style={{ color: "rgb(var(--text-muted))" }} />
              <span style={{ color: "rgb(var(--text-muted))" }}>Node.js</span>
            </div>
            <span style={{ color: "rgb(var(--text-primary))" }}>
              {versionInfo.nodeVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Release Notes Link */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <a
          href="#changelog"
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Release Notes
        </a>
      </div>
    </div>
  );
}
