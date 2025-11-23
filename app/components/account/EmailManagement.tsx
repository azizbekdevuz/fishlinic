"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Send,
  Clock
} from "lucide-react";

export function EmailManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // For demo purposes, we'll assume email is always verified for OAuth users
  // In production, you'd track email verification separately
  const isEmailVerified = true; // This would come from user data

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    
    try {
      const response = await fetch('/api/user/email/verify', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send verification email');
      }

      toast.show("success", "Verification email sent! Check your inbox.", 5000);
    } catch (error) {
      console.error('Email verification error:', error);
      toast.show("error", "Failed to send verification email. Please try again.", 3000);
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Email Management
        </h2>
      </div>

      <div className="space-y-6">
        {/* Current Email */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            Email Address
          </h3>
          
          <div className="p-4 rounded-lg border border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    {user?.email}
                  </span>
                  {isEmailVerified ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Unverified</span>
                    </div>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
                  This is your primary email address for account notifications
                </p>
              </div>
              
              {!isEmailVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                  className="btn btn-sm btn-primary flex items-center gap-2"
                >
                  {isResendingVerification ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3 h-3" />
                      Verify
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Email Change (Future Feature) */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            Change Email Address
          </h3>
          
          <div className="p-4 rounded-lg border border-white/10 bg-white/5 opacity-60">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5" style={{ color: "rgb(var(--text-muted))" }} />
              <span className="text-sm font-medium" style={{ color: "rgb(var(--text-muted))" }}>
                Coming Soon
              </span>
            </div>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              Email address changes will be available in a future update. This feature will require verification of both your current and new email addresses.
            </p>
          </div>
        </div>

        {/* Email Preferences */}
        <div>
          <h3 className="text-lg font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            Email Preferences
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
              <div>
                <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Security Notifications
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  Password changes, login alerts, and security updates
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
              <div>
                <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  System Alerts
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  Water quality alerts and system notifications
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
              <div>
                <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Product Updates
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  New features, improvements, and announcements
                </div>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 transition-colors">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
