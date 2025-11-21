"use client";

import { 
  Shield, 
  FileText, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

export function LicenseInfo() {
  const licenses = [
    {
      name: "Smart Aquaculture System",
      type: "Academic Project",
      description: "Capstone project developed for educational purposes at Sejong University",
      status: "Academic Use",
      color: "text-blue-400"
    },
    {
      name: "Next.js",
      type: "MIT License",
      description: "React framework for production-grade applications",
      status: "Open Source",
      color: "text-green-400"
    },
    {
      name: "React",
      type: "MIT License", 
      description: "JavaScript library for building user interfaces",
      status: "Open Source",
      color: "text-green-400"
    },
    {
      name: "Tailwind CSS",
      type: "MIT License",
      description: "Utility-first CSS framework",
      status: "Open Source",
      color: "text-green-400"
    },
    {
      name: "Prisma",
      type: "Apache 2.0",
      description: "Database toolkit and ORM",
      status: "Open Source",
      color: "text-green-400"
    },
    {
      name: "NextAuth.js",
      type: "ISC License",
      description: "Authentication library for Next.js",
      status: "Open Source",
      color: "text-green-400"
    }
  ];

  const usageTerms = [
    {
      title: "Academic Use",
      description: "This project is developed as part of a university capstone program and is intended for educational and research purposes.",
      icon: CheckCircle,
      type: "allowed"
    },
    {
      title: "Commercial Use",
      description: "Commercial use of this project requires proper licensing and attribution. Contact the development team for commercial licensing.",
      icon: AlertTriangle,
      type: "restricted"
    },
    {
      title: "Modification & Distribution",
      description: "Modifications and redistribution are allowed for academic purposes with proper attribution to the original authors.",
      icon: Info,
      type: "conditional"
    },
    {
      title: "Third-Party Components",
      description: "This project includes third-party libraries and components, each governed by their respective licenses.",
      icon: FileText,
      type: "info"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open Source":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "Academic Use":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTermIcon = (type: string) => {
    switch (type) {
      case "allowed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "restricted":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "conditional":
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTermColor = (type: string) => {
    switch (type) {
      case "allowed":
        return "border-green-500/20 bg-green-500/10";
      case "restricted":
        return "border-yellow-500/20 bg-yellow-500/10";
      case "conditional":
        return "border-blue-500/20 bg-blue-500/10";
      default:
        return "border-gray-500/20 bg-gray-500/10";
    }
  };

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-purple-400" />
        <h2 className="text-2xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
          License Information
        </h2>
      </div>

      {/* Project License */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Project License
        </h3>
        
        <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                Smart Aquaculture Management System
              </h4>
              <p className="text-sm mb-4" style={{ color: "rgb(var(--text-muted))" }}>
                This project is developed as a capstone project at Sejong University for educational and research purposes. 
                The system demonstrates the integration of IoT sensors, AI analytics, and modern web technologies in 
                aquaculture management.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                  Academic Project
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  Educational Use
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                  Research Purpose
                </span>
              </div>
              
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                © 2025 Sejong University Capstone Team. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Third-Party Licenses */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Third-Party Licenses
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {licenses.map((license) => (
            <div key={license.name} className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  {license.name}
                </h4>
                {getStatusIcon(license.status)}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded ${license.color} bg-current/20`}>
                  {license.type}
                </span>
                <span className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  {license.status}
                </span>
              </div>
              
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                {license.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Terms */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Usage Terms & Conditions
        </h3>
        
        <div className="space-y-4">
          {usageTerms.map((term) => (
            <div key={term.title} className={`p-4 rounded-lg border ${getTermColor(term.type)}`}>
              <div className="flex items-start gap-3">
                {getTermIcon(term.type)}
                <div>
                  <h4 className="text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                    {term.title}
                  </h4>
                  <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {term.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution Requirements */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Attribution Requirements
        </h3>
        
        <div className="p-6 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm mb-4" style={{ color: "rgb(var(--text-muted))" }}>
            If you use, modify, or reference this project, please include the following attribution:
          </p>
          
          <div className="p-4 rounded bg-black/20 border border-white/10 font-mono text-xs">
            <div style={{ color: "rgb(var(--text-primary))" }}>
              Smart Aquaculture Management System<br />
              Developed by Sejong University Capstone Team<br />
              © 2024-2025 - Educational Project<br />
              <br />
              Built with Next.js, React, TypeScript, and Tailwind CSS<br />
              AI Assistant powered by Ollama
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Legal */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
              Legal & Licensing Questions
            </h4>
            <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              For licensing inquiries or legal questions, please contact the development team.
            </p>
          </div>
          
          <div className="flex gap-3">
            <a
              href="mailto:legal@smartaquaculture.com"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              Legal Contact
            </a>
            
            <a
              href="#license-full"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Full License
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
