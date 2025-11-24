"use client";

import Link from "next/link";
import { 
  Zap, 
  BarChart3, 
  Bot, 
  Shield, 
  Settings, 
  User,
  ArrowRight
} from "lucide-react";

type QuickHelpProps = {
  searchQuery: string;
};

export function QuickHelp({ searchQuery }: QuickHelpProps) {
  const quickHelpItems = [
    {
      icon: Zap,
      title: "Getting Started",
      description: "Set up your account and start monitoring",
      link: "#getting-started",
      keywords: ["setup", "start", "begin", "account", "first time"]
    },
    {
      icon: BarChart3,
      title: "Dashboard Guide",
      description: "Navigate and understand your dashboard",
      link: "/dashboard",
      keywords: ["dashboard", "charts", "data", "telemetry", "monitoring"]
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Learn how to use Veronica effectively",
      link: "/vassistant",
      keywords: ["ai", "assistant", "veronica", "chat", "questions"]
    },
    {
      icon: Shield,
      title: "Account Verification",
      description: "Complete your account verification",
      link: "/verify",
      keywords: ["verify", "verification", "qr", "code", "security"]
    },
    {
      icon: Settings,
      title: "Settings & Preferences",
      description: "Customize your dashboard experience",
      link: "/settings",
      keywords: ["settings", "preferences", "customize", "configure"]
    },
    {
      icon: User,
      title: "Profile Management",
      description: "Update your profile and avatar",
      link: "/profile",
      keywords: ["profile", "avatar", "picture", "name", "personal"]
    }
  ];

  // Filter items based on search query
  const filteredItems = searchQuery 
    ? quickHelpItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : quickHelpItems;

  if (searchQuery && filteredItems.length === 0) {
    return (
      <div className="card-glass p-8 text-center">
        <div className="text-lg font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
          No quick help found
        </div>
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Try searching for different terms or browse the FAQ section below
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
        Quick Help
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.title}
              href={item.link}
              className="card-glass p-6 group hover:scale-105 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all duration-300">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors" 
                    style={{ color: "rgb(var(--text-primary))" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
                    {item.description}
                  </p>
                </div>
                
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" 
                  style={{ color: "rgb(var(--text-muted))" }} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
