"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useEffect, useState } from "react";
import { Home, BarChart3, Bot, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/vassistant", label: "AI Assistant", icon: Bot },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="nav-glass animate-fade-in">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold text-gradient">
              Smart Aquaculture
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              AI-Powered Monitoring
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const IconComponent = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "hover:bg-white/10 hover:shadow-lg"
                }`}
                style={{ 
                  color: isActive ? "white" : "rgb(var(--text-primary))" 
                }}
              >
                <IconComponent className="w-4 h-4" />
                <span>{link.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden btn btn-ghost btn-sm"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {open && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10 animate-fade-in">
          <div className="space-y-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "hover:bg-white/10"
                  }`}
                  style={{ 
                    color: isActive ? "white" : "rgb(var(--text-primary))" 
                  }}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Mobile Footer */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Sejong University Capstone Project
            </div>
          </div>
        </div>
      )}
    </div>
  );
}