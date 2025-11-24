"use client";

import { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Wifi, 
  Database, 
  Bot, 
  Shield,
  ChevronDown,
  ChevronRight
} from "lucide-react";

type TroubleshootingGuideProps = {
  searchQuery: string;
};

type TroubleshootingItem = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  steps: string[];
  keywords: string[];
};

export function TroubleshootingGuide({ searchQuery }: TroubleshootingGuideProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const troubleshootingItems: TroubleshootingItem[] = [
    {
      id: "connection",
      title: "Connection Issues",
      description: "Dashboard not receiving data or showing offline status",
      icon: Wifi,
      color: "text-red-400",
      steps: [
        "Check if the mock server is running on port 3001",
        "Verify WebSocket connection in browser developer tools",
        "Refresh the dashboard page",
        "Check network connectivity and firewall settings",
        "Restart the development server (npm run dev)",
        "Clear browser cache and cookies"
      ],
      keywords: ["connection", "offline", "websocket", "server", "network", "data"]
    },
    {
      id: "verification",
      title: "Account Verification Problems",
      description: "QR code not working or verification failing",
      icon: Shield,
      color: "text-yellow-400",
      steps: [
        "Ensure the Python Virtual Assistant is running",
        "Generate a new QR code if the current one expired",
        "Check that the VA has database access",
        "Verify the QR code is clear and not corrupted",
        "Try scanning from different angles or distances",
        "Contact support if the issue persists"
      ],
      keywords: ["verification", "qr", "code", "python", "assistant", "scan"]
    },
    {
      id: "ai-assistant",
      title: "AI Assistant Not Responding",
      description: "Veronica not responding or giving errors",
      icon: Bot,
      color: "text-purple-400",
      steps: [
        "Click 'Initiate Assistant' to start a new session",
        "Check if Ollama is running and accessible",
        "Verify your account is verified",
        "Try asking simpler questions first",
        "Clear the conversation and start fresh",
        "Check browser console for error messages"
      ],
      keywords: ["ai", "assistant", "veronica", "ollama", "chat", "response"]
    },
    {
      id: "data-issues",
      title: "Incorrect or Missing Data",
      description: "Readings appear wrong or data is not updating",
      icon: Database,
      color: "text-orange-400",
      steps: [
        "Check sensor connections and calibration",
        "Verify the mock data server is generating data",
        "Refresh the dashboard manually",
        "Check if filters are applied that might hide data",
        "Verify your user account has data associated",
        "Check the telemetry API endpoints are working"
      ],
      keywords: ["data", "readings", "sensors", "incorrect", "missing", "update"]
    },
    {
      id: "login-issues",
      title: "Login and Authentication Problems",
      description: "Cannot sign in or authentication errors",
      icon: XCircle,
      color: "text-red-400",
      steps: [
        "Check your email and password are correct",
        "Try signing in with Google or Kakao if available",
        "Clear browser cookies and cache",
        "Disable browser extensions that might interfere",
        "Check if Caps Lock is on",
        "Reset your password if you've forgotten it"
      ],
      keywords: ["login", "signin", "authentication", "password", "oauth", "google", "kakao"]
    },
    {
      id: "performance",
      title: "Slow Performance or Loading Issues",
      description: "Dashboard is slow or pages won't load",
      icon: CheckCircle,
      color: "text-blue-400",
      steps: [
        "Check your internet connection speed",
        "Close unnecessary browser tabs",
        "Disable browser extensions temporarily",
        "Clear browser cache and reload",
        "Try using a different browser",
        "Check if your device has sufficient memory"
      ],
      keywords: ["slow", "performance", "loading", "speed", "browser", "memory"]
    }
  ];

  // Filter items based on search query
  const filteredItems = searchQuery 
    ? troubleshootingItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : troubleshootingItems;

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-2xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Troubleshooting Guide
        </h2>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
            No troubleshooting guides found
          </p>
          <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
            Try searching for different terms or contact support for help
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const IconComponent = item.icon;
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <div key={item.id} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full p-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-5 h-5 ${item.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
                        {item.title}
                      </h3>
                      <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                        {item.description}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" style={{ color: "rgb(var(--text-muted))" }} />
                    ) : (
                      <ChevronRight className="w-5 h-5" style={{ color: "rgb(var(--text-muted))" }} />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/10 bg-white/5">
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
                        Steps to resolve:
                      </h4>
                      <ol className="space-y-2">
                        {item.steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span style={{ color: "rgb(var(--text-muted))" }}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* General Tips */}
      <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-400 mb-2">General Troubleshooting Tips</h4>
        <ul className="text-xs space-y-1" style={{ color: "rgb(var(--text-muted))" }}>
          <li>• Try refreshing the page or restarting your browser</li>
          <li>• Check the browser console (F12) for error messages</li>
          <li>• Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)</li>
          <li>• Disable ad blockers or privacy extensions temporarily</li>
          <li>• Contact support if problems persist after trying these steps</li>
        </ul>
      </div>
    </div>
  );
}
