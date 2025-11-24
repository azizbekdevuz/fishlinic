"use client";

import { 
  BookOpen, 
  ExternalLink, 
  Code, 
  Zap, 
  Database,
  Settings,
  Shield,
  Smartphone
} from "lucide-react";

export function DocumentationLinks() {
  const documentationSections = [
    {
      title: "User Guide",
      icon: BookOpen,
      color: "text-blue-400",
      links: [
        { title: "Getting Started Guide", url: "#getting-started", description: "Complete setup walkthrough" },
        { title: "Dashboard Overview", url: "#dashboard", description: "Understanding your data" },
        { title: "AI Assistant Guide", url: "#ai-assistant", description: "Using Veronica effectively" }
      ]
    },
    {
      title: "Technical Documentation",
      icon: Code,
      color: "text-purple-400",
      links: [
        { title: "API Documentation", url: "/api-docs", description: "REST API reference" },
        { title: "WebSocket Events", url: "#websocket", description: "Real-time data streaming" },
        { title: "Data Schema", url: "#schema", description: "Database structure" }
      ]
    },
    {
      title: "Features & Settings",
      icon: Settings,
      color: "text-green-400",
      links: [
        { title: "Alert Configuration", url: "#alerts", description: "Setting up notifications" },
        { title: "Data Export Options", url: "#export", description: "Backup and download" },
        { title: "Account Security", url: "#security", description: "Privacy and protection" }
      ]
    }
  ];

  const quickLinks = [
    {
      title: "System Status",
      icon: Zap,
      url: "#status",
      description: "Check service availability"
    },
    {
      title: "Database Schema",
      icon: Database,
      url: "#schema",
      description: "Data structure reference"
    },
    {
      title: "Security Guide",
      icon: Shield,
      url: "#security",
      description: "Best practices"
    },
    {
      title: "Mobile App",
      icon: Smartphone,
      url: "#mobile",
      description: "Coming soon"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Documentation Sections */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
          <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            Documentation
          </h2>
        </div>

        <div className="space-y-6">
          {documentationSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-3">
                  <IconComponent className={`w-4 h-4 ${section.color}`} />
                  <h3 className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    {section.title}
                  </h3>
                </div>
                
                <div className="space-y-2 ml-6">
                  {section.links.map((link) => (
                    <a
                      key={link.title}
                      href={link.url}
                      className="block p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium group-hover:text-blue-400 transition-colors" 
                            style={{ color: "rgb(var(--text-primary))" }}>
                            {link.title}
                          </div>
                          <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                            {link.description}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                          style={{ color: "rgb(var(--text-muted))" }} />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
          Quick Links
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <a
                key={link.title}
                href={link.url}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <IconComponent className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
                <div className="flex-1">
                  <div className="text-sm font-medium group-hover:text-blue-400 transition-colors" 
                    style={{ color: "rgb(var(--text-primary))" }}>
                    {link.title}
                  </div>
                  <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {link.description}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                  style={{ color: "rgb(var(--text-muted))" }} />
              </a>
            );
          })}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="card-glass p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
          Additional Resources
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
            <span style={{ color: "rgb(var(--text-primary))" }}>Video Tutorials</span>
            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Coming Soon</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
            <span style={{ color: "rgb(var(--text-primary))" }}>Community Forum</span>
            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Coming Soon</span>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
            <span style={{ color: "rgb(var(--text-primary))" }}>Knowledge Base</span>
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">Available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
