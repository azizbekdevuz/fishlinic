"use client";

import { 
  Users, 
  Heart, 
  Github,
  Mail,
  GraduationCap
} from "lucide-react";

export function TeamCredits() {
  const teamMembers = [
    {
      name: "Capstone Team",
      role: "Full-Stack Development",
      description: "Complete system architecture, frontend development, and backend implementation",
      contributions: ["System Design", "Frontend Development", "Backend APIs", "Database Design", "UI/UX Design"],
      avatar: "CT"
    }
  ];

  const acknowledgments = [
    {
      category: "Academic Institution",
      items: [
        { name: "Sejong University", description: "Academic support and project guidance" },
        { name: "Computer Science Department", description: "Technical mentorship and resources" },
        { name: "Capstone Program", description: "Project framework and evaluation" }
      ]
    },
    {
      category: "Technology Partners",
      items: [
        { name: "Next.js Team", description: "React framework and development tools" },
        { name: "Vercel", description: "Deployment platform and hosting solutions" },
        { name: "Neon Database", description: "Serverless PostgreSQL database" },
        { name: "Ollama", description: "Local LLM integration for AI assistant" }
      ]
    },
    {
      category: "Open Source Libraries",
      items: [
        { name: "React & React DOM", description: "UI library and rendering" },
        { name: "Prisma", description: "Database ORM and type safety" },
        { name: "NextAuth.js", description: "Authentication and session management" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework" },
        { name: "Lucide React", description: "Beautiful icon library" },
        { name: "Socket.IO", description: "Real-time communication" }
      ]
    }
  ];

  const projectStats = [
    { label: "Lines of Code", value: "10,000+", icon: "📝" },
    { label: "Components", value: "50+", icon: "🧩" },
    { label: "API Endpoints", value: "25+", icon: "🔌" },
    { label: "Development Time", value: "6+ months", icon: "⏱️" }
  ];

  return (
    <div className="card-glass p-8">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-green-400" />
        <h2 className="text-2xl font-bold" style={{ color: "rgb(var(--text-primary))" }}>
          Team & Credits
        </h2>
      </div>

      {/* Team Members */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Development Team
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                  {member.avatar}
                </div>
                <div>
                  <h4 className="text-lg font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                    {member.name}
                  </h4>
                  <p className="text-sm text-blue-400">{member.role}</p>
                </div>
              </div>
              
              <p className="text-sm mb-4" style={{ color: "rgb(var(--text-muted))" }}>
                {member.description}
              </p>
              
              <div className="space-y-2">
                <h5 className="text-xs font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Key Contributions:
                </h5>
                <div className="flex flex-wrap gap-1">
                  {member.contributions.map((contribution) => (
                    <span key={contribution} className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                      {contribution}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Statistics */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Project Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {projectStats.map((stat) => (
            <div key={stat.label} className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-blue-400 mb-1">{stat.value}</div>
              <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgments */}
      <div>
        <h3 className="text-xl font-semibold mb-6" style={{ color: "rgb(var(--text-primary))" }}>
          Acknowledgments
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {acknowledgments.map((section) => (
            <div key={section.category} className="p-6 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-lg font-medium mb-4 text-emerald-400">
                {section.category}
              </h4>
              
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div key={item.name} className="border-l-2 border-emerald-500/30 pl-3">
                    <div className="font-medium text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                      {item.name}
                    </div>
                    <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Thanks */}
      <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-pink-400" />
          <h4 className="text-lg font-medium text-pink-400">Special Thanks</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
              Academic Support
            </h5>
            <ul className="space-y-1 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              <li>• Faculty advisors for project guidance</li>
              <li>• Peer reviewers for feedback and testing</li>
              <li>• University resources and facilities</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
              Community & Resources
            </h5>
            <ul className="space-y-1 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              <li>• Open source community contributions</li>
              <li>• Online documentation and tutorials</li>
              <li>• Stack Overflow and developer forums</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h4 className="text-lg font-medium mb-4" style={{ color: "rgb(var(--text-primary))" }}>
          Get In Touch
        </h4>
        
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:support@smartaquaculture.com"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>Email</span>
          </a>
          
          <a
            href="#github"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Github className="w-4 h-4 text-purple-400" />
            <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>GitHub</span>
          </a>
          
          <a
            href="#university"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-green-400" />
            <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>University</span>
          </a>
        </div>
      </div>
    </div>
  );
}
