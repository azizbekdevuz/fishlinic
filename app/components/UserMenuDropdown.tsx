"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { 
  User, 
  Settings, 
  Shield, 
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronDown,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function UserMenuDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, signOut, isVerified } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when navigating
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    signOut();
  };

  const menuItems = [
    {
      href: "/profile",
      icon: User,
      label: "Profile",
      description: "Manage your profile information"
    },
    {
      href: "/settings", 
      icon: Settings,
      label: "Settings",
      description: "Dashboard and display preferences"
    },
    {
      href: "/account",
      icon: Shield,
      label: "Account",
      description: "Security and verification settings"
    },
    {
      href: "/help",
      icon: HelpCircle,
      label: "Help & Support",
      description: "Get help and contact support"
    },
    {
      href: "/about",
      icon: Info,
      label: "About",
      description: "Project information and credits"
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
        </div>
        
        {/* User Info */}
        <div className="flex flex-col items-start min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate max-w-32" style={{ color: "rgb(var(--text-primary))" }}>
              {user?.name || user?.email?.split("@")[0] || "User"}
            </span>
            {isVerified ? (
              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <span className="text-xs truncate max-w-32" style={{ color: "rgb(var(--text-muted))" }}>
            {user?.email}
          </span>
        </div>

        {/* Dropdown Arrow */}
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "rgb(var(--text-muted))" }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 animate-fade-in">
          <div className="card-glass border border-white/10 shadow-2xl">
            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <IconComponent className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                        {item.label}
                      </div>
                      <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mx-2"></div>

            {/* Sign Out */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 transition-all duration-200 group text-red-400 hover:text-red-300"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">Sign Out</div>
                  <div className="text-xs opacity-70">End your current session</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
