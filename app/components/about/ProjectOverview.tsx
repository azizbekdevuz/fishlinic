"use client";

import { 
  Waves, 
  Target, 
  Lightbulb, 
  Users, 
  Calendar,
  MapPin
} from "lucide-react";

export function ProjectOverview() {
  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-6">
        <Waves className="w-8 h-8 text-blue-400" />
        <h2 className="text-2xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
          Project Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Description */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
              Smart Aquaculture Management System
            </h3>
            <p className="text-base leading-relaxed mb-4" style={{ color: "rgb(var(--text-muted))" }}>
              Our Smart Aquaculture Management System is an innovative IoT-based solution designed to revolutionize 
              aquaculture monitoring and management. The system combines real-time sensor data, AI-powered analytics, 
              and an intuitive web dashboard to help aquaculture professionals maintain optimal water conditions and 
              ensure healthy fish environments.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
              Developed as a capstone project at Sejong University, this system demonstrates the integration of 
              modern web technologies, IoT sensors, artificial intelligence, and user-centered design principles 
              to solve real-world challenges in aquaculture management.
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-lg font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
              Key Features
            </h4>
            <ul className="space-y-2 text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Real-time monitoring of pH, temperature, dissolved oxygen, and fish health</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>AI-powered water quality analysis and predictive insights</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Intelligent virtual assistant (Veronica) for expert guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Customizable alerts and threshold management</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Comprehensive data visualization and trend analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                <span>Multi-user support with secure account verification</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-6">
          {/* Project Goals */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-blue-400" />
              <h4 className="text-lg font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Project Goals
              </h4>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              <li>• Improve aquaculture productivity through data-driven insights</li>
              <li>• Reduce manual monitoring workload for aquaculture professionals</li>
              <li>• Prevent fish mortality through early warning systems</li>
              <li>• Demonstrate practical IoT and AI applications in agriculture</li>
              <li>• Create an extensible platform for future aquaculture innovations</li>
            </ul>
          </div>

          {/* Innovation Highlights */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-emerald-400" />
              <h4 className="text-lg font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Innovation Highlights
              </h4>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              <li>• QR code-based account verification with Python Virtual Assistant</li>
              <li>• AI-powered water quality scoring and status classification</li>
              <li>• Real-time WebSocket data streaming for instant updates</li>
              <li>• Responsive design optimized for both desktop and mobile</li>
              <li>• Integration of multiple authentication providers (OAuth)</li>
            </ul>
          </div>

          {/* Project Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Timeline
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                2025-2026 Academic Year
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Institution
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Sejong University, Seoul
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Team Size
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Capstone Project Team
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Status
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Active Development
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
