"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { useEffect, useState } from "react";
import { Home, BarChart3, Bot, Menu, X, LogIn, LogOut, User, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/vassistant", label: "AI Assistant", icon: Bot },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoading, signOut, isVerified } = useAuth();
  const toast = useToast();
  const [toastTypeIndex, setToastTypeIndex] = useState(0);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Test toast function - cycles through different types
  const testToast = () => {
    const types: Array<{ type: "error" | "success" | "alert" | "info" | "update" | "warning"; message: string }> = [
      { type: "success", message: "Water quality is excellent! All parameters are optimal." },
      { type: "error", message: "Critical alert: pH level is outside safe range!" },
      { type: "info", message: "New telemetry data has been received." },
      { type: "warning", message: "Temperature is slightly above optimal range." },
      { type: "alert", message: "Dissolved oxygen levels need attention." },
      { type: "update", message: "System update completed successfully." },
    ];
    
    const current = types[toastTypeIndex];
    toast.show(current.type, current.message, 5000);
    setToastTypeIndex((prev) => (prev + 1) % types.length);
  };

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
          {/* Test Toast Button - Desktop */}
          <button
            onClick={testToast}
            className="hidden md:flex btn btn-ghost btn-sm items-center gap-2"
            title="Test toast notification"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden lg:inline">Test Toast</span>
          </button>

          <ThemeToggle />
          
          {/* Auth Controls - Desktop */}
          {!isLoading && (
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <User className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                    <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                      {user?.name || user?.email?.split("@")[0]}
                    </span>
                    {isVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-ghost btn-sm flex items-center gap-2"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign In</span>
                </Link>
              )}
            </div>
          )}
          
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
          
          {/* Mobile Auth Controls */}
          {!isLoading && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
              {/* Test Toast Button - Mobile */}
              <button
                onClick={testToast}
                className="w-full btn btn-ghost flex items-center justify-center gap-2"
                title="Test toast notification"
              >
                <Sparkles className="w-4 h-4" />
                Test Toast
              </button>

              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <User className="w-5 h-5" style={{ color: "rgb(var(--text-muted))" }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                          {user?.name || "User"}
                        </div>
                        {isVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        {user?.email}
                      </div>
                      {!isVerified && (
                        <Link
                          href="/verify"
                          className="mt-2 text-xs btn btn-sm bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30 w-full"
                        >
                          Verify Account
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full btn btn-ghost flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              )}
            </div>
          )}
          
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