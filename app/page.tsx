"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Bot, 
  TrendingUp, 
  Bell, 
  Smartphone, 
  Microscope,
  Clock,
  Zap,
  Brain,
  Rocket,
  Book,
  Palette,
  Code,
  Plug
} from "lucide-react";
import { FaAtom } from "react-icons/fa";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: "Real-time Monitoring",
      description: "Track water quality parameters with live data visualization and AI-powered insights.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Bot,
      title: "AI Assistant",
      description: "Get instant answers about your aquarium with our intelligent virtual assistant Veronica.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Analyze historical data patterns to optimize your aquaculture management strategy.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Receive proactive notifications when parameters exceed optimal ranges.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Ready",
      description: "Access your dashboard from any device with our responsive design.",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      icon: Microscope,
      title: "Scientific Accuracy",
      description: "Built with precision instruments and validated algorithms for reliable results.",
      gradient: "from-teal-500 to-green-500"
    }
  ];

  const stats = [
    { value: "24/7", label: "Monitoring", icon: Clock },
    { value: "99.9%", label: "Uptime", icon: Rocket },
    { value: "AI", label: "Powered", icon: Brain },
    { value: "Real-time", label: "Data", icon: Zap }
  ];

  if (!mounted) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center">
        <div className="loading w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-main min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 max-w-7xl">
          <div className="text-center animate-fade-in">
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Sejong University Capstone Project 2025
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-in">
              <span className="text-gradient">Smart Aquaculture</span>
              <br />
              <span style={{ color: "rgb(var(--text-primary))" }}>Management System</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto animate-slide-in" 
               style={{ 
                 color: "rgb(var(--text-secondary))",
                 animationDelay: "200ms"
               }}>
              Monitor, analyze, and optimize your aquarium with AI-powered insights and real-time data visualization.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <Link href="/dashboard" className="btn btn-primary btn-lg animate-glow">
                <Rocket className="w-5 h-5" />
                Launch Dashboard
              </Link>
              <Link href="/vassistant" className="btn btn-secondary btn-lg">
                <Bot className="w-5 h-5" />
                Meet Veronica AI
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "600ms" }}>
              {stats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <div key={stat.label} className="glass p-4 rounded-xl text-center">
                    <IconComponent className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-gradient mb-1">{stat.value}</div>
                    <div className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Powerful Features
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "rgb(var(--text-secondary))" }}>
              Everything you need to manage your aquaculture system with confidence and precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="card-glass group hover:scale-105 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:shadow-lg transition-all duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
                    {feature.title}
                  </h3>
                  
                  <p className="leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
                    {feature.description}
                  </p>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                      <span>Learn more</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Built with Modern Technology
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "rgb(var(--text-secondary))" }}>
              Leveraging cutting-edge tools and frameworks for optimal performance and reliability.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: "Next.js", icon: FaAtom },
              { name: "TypeScript", icon: Book },
              { name: "Tailwind CSS", icon: Palette },
              { name: "Python", icon: Code },
              { name: "AI/ML", icon: Bot },
              { name: "WebSocket", icon: Plug }
            ].map((tech, index) => {
              const IconComponent = tech.icon;
              return (
                <div 
                  key={tech.name}
                  className="glass p-6 rounded-xl text-center hover:bg-white/10 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-3" style={{ color: "rgb(var(--primary))" }} />
                  <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    {tech.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="glass-strong p-12 text-center rounded-3xl animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: "rgb(var(--text-secondary))" }}>
              Experience the future of aquaculture management with our intelligent monitoring system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard" className="btn btn-primary btn-lg animate-glow">
                <Rocket className="w-5 h-5" />
                Start Monitoring
              </Link>
              <Link href="/vassistant" className="btn btn-ghost btn-lg">
                <Bot className="w-5 h-5" />
                Try AI Assistant
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                Developed by Team Fishlinic • Sejong University Capstone Design Course
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gradient">Smart Aquaculture</div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  AI-Powered Monitoring System
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <a 
                href="https://github.com/azizbekdevuz/fishlinic" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://portfolio-next-silk-two.vercel.app/" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Portfolio
              </a>
              <a 
                href="https://www.linkedin.com/in/azizbek-arzikulov" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                LinkedIn
              </a>
            </div>

            <div className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              © {new Date().getFullYear()} Team Fishlinic
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}