"use client";

import { 
  Code, 
  Database, 
  Smartphone, 
  Brain,
  Shield,
  Zap,
  Layers
} from "lucide-react";

export function TechnologyStack() {
  const techCategories = [
    {
      title: "Frontend",
      icon: Smartphone,
      color: "text-blue-400",
      technologies: [
        { name: "Next.js 15", version: "15.5.3", description: "React framework with App Router" },
        { name: "React", version: "19.1.0", description: "UI library with hooks and context" },
        { name: "TypeScript", version: "5.x", description: "Type-safe JavaScript" },
        { name: "Tailwind CSS", version: "4.x", description: "Utility-first CSS framework" },
        { name: "Lucide React", version: "0.548.0", description: "Beautiful icon library" }
      ]
    },
    {
      title: "Backend & API",
      icon: Code,
      color: "text-green-400",
      technologies: [
        { name: "Next.js API Routes", version: "15.x", description: "Serverless API endpoints" },
        { name: "NextAuth.js", version: "4.24.13", description: "Authentication solution" },
        { name: "Prisma", version: "6.19.0", description: "Database ORM and migrations" },
        { name: "Socket.IO", version: "4.8.1", description: "Real-time WebSocket communication" },
        { name: "Express.js", version: "5.1.0", description: "Mock server framework" }
      ]
    },
    {
      title: "Database & Storage",
      icon: Database,
      color: "text-purple-400",
      technologies: [
        { name: "PostgreSQL", version: "Latest", description: "Primary database via Neon" },
        { name: "Neon Database", version: "1.0.2", description: "Serverless PostgreSQL" },
        { name: "Local Storage", version: "Browser", description: "Client-side preferences" },
        { name: "File System", version: "Node.js", description: "Avatar and file uploads" }
      ]
    },
    {
      title: "AI & Analytics",
      icon: Brain,
      color: "text-orange-400",
      technologies: [
        { name: "Ollama", version: "Latest", description: "Local LLM for AI assistant" },
        { name: "ECharts", version: "5.5.0", description: "Data visualization library" },
        { name: "Custom AI Models", version: "1.0", description: "Water quality scoring algorithms" },
        { name: "Real-time Analytics", version: "Custom", description: "Live data processing" }
      ]
    },
    {
      title: "Security & Auth",
      icon: Shield,
      color: "text-red-400",
      technologies: [
        { name: "OAuth 2.0", version: "Standard", description: "Google & Kakao integration" },
        { name: "JWT Tokens", version: "Standard", description: "Secure session management" },
        { name: "QR Code Verification", version: "Custom", description: "Python VA integration" },
        { name: "CSRF Protection", version: "Built-in", description: "Cross-site request forgery protection" }
      ]
    },
    {
      title: "Development & Tools",
      icon: Zap,
      color: "text-cyan-400",
      technologies: [
        { name: "ESLint", version: "9.x", description: "Code linting and quality" },
        { name: "npm-run-all", version: "4.1.5", description: "Parallel script execution" },
        { name: "cross-env", version: "10.1.0", description: "Cross-platform environment variables" },
        { name: "tsx", version: "4.20.5", description: "TypeScript execution" }
      ]
    }
  ];

  const architectureFeatures = [
    {
      title: "Microservices Architecture",
      description: "Modular design with separate UI, API, and mock server components"
    },
    {
      title: "Real-time Data Flow",
      description: "WebSocket connections for live telemetry updates and notifications"
    },
    {
      title: "Responsive Design",
      description: "Mobile-first approach with desktop enhancements and touch optimization"
    },
    {
      title: "Type Safety",
      description: "End-to-end TypeScript implementation with strict type checking"
    },
    {
      title: "Performance Optimization",
      description: "Code splitting, lazy loading, and efficient state management"
    },
    {
      title: "Security First",
      description: "Multi-layer security with authentication, authorization, and data validation"
    }
  ];

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-8">
        <Layers className="w-8 h-8 text-purple-400" />
        <h2 className="text-2xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
          Technology Stack
        </h2>
      </div>

      {/* Technology Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {techCategories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div key={category.title} className="p-6 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <IconComponent className={`w-6 h-6 ${category.color}`} />
                <h3 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {category.title}
                </h3>
              </div>
              
              <div className="space-y-3">
                {category.technologies.map((tech) => (
                  <div key={tech.name} className="border-l-2 border-blue-500/30 pl-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                        {tech.name}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                        {tech.version}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      {tech.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Features */}
      <div>
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Architecture & Design Principles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {architectureFeatures.map((feature, index) => (
            <div key={feature.title} className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-blue-400">{index + 1}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                    {feature.title}
                  </h4>
                  <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
        <h4 className="text-lg font-medium mb-4 text-emerald-400">
          Performance & Capabilities
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">99.9%</div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Uptime Target</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">&lt;100ms</div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>API Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">Real-time</div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Data Updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 mb-1">Multi-user</div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Concurrent Access</div>
          </div>
        </div>
      </div>
    </div>
  );
}
