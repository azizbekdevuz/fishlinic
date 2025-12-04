"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { UserMenuDropdown } from "@/app/components/UserMenuDropdown";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";
import { Home, BarChart3, Bot, Menu, X, LogIn, LogOut, User, CheckCircle, AlertCircle, Settings, Shield, HelpCircle, Info, Users } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/vassistant", label: "AI Assistant", icon: Bot },
] as const;

export function SiteNav() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoading, signOut, isVerified } = useAuth();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setDevice("mobile");
    } else {
      setDevice("desktop");
    }
  }, []);
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
          
          {/* Auth Controls - Desktop */}
          {!isLoading && (
            <div className="hidden md:flex items-center">
              {isAuthenticated ? (
                <UserMenuDropdown />
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
            {device === "mobile" && (
              <button
                className="md:hidden btn btn-ghost btn-sm"
                aria-label="Toggle navigation"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
              >
                {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            )}
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
              {isAuthenticated ? (
                <div className="space-y-2">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
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
                  
                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <User className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
                      <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Settings className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
                      <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>Settings</span>
                    </Link>
                    <Link
                      href="/account"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Shield className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
                      <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>Account</span>
                    </Link>
                    <Link
                      href="/help"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <HelpCircle className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
                      <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>Help & Support</span>
                    </Link>
                    <Link
                      href="/about"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Info className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
                      <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>About</span>
                    </Link>
                    <Link
                      href="/our-team"
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <Users className="w-5 h-5" style={{ color: "rgb(var(--text-primary))" }} />
                      <span className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>Our Team</span>
                    </Link>
                  </div>

                  {/* Sign Out */}
                  <button
                    onClick={() => signOut()}
                    className="w-full btn btn-ghost flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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