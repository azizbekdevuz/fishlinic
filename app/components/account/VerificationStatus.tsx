"use client";

import { useAuth } from "@/app/hooks/useAuth";
import { formatDateTime } from "@/app/lib/format";
import Link from "next/link";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  QrCode,
  ArrowRight
} from "lucide-react";

export function VerificationStatus() {
  const { user, isVerified } = useAuth();

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Account Verification
        </h2>
      </div>

      <div className="space-y-4">
        {/* Verification Status */}
        <div className={`p-4 rounded-lg border ${
          isVerified 
            ? "bg-green-500/10 border-green-500/20" 
            : "bg-yellow-500/10 border-yellow-500/20"
        }`}>
          <div className="flex items-start gap-3">
            {isVerified ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-medium mb-2 ${
                isVerified ? "text-green-400" : "text-yellow-400"
              }`}>
                {isVerified ? "Account Verified" : "Verification Required"}
              </h3>
              
              {isVerified ? (
                <div>
                  <p className="text-sm mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                    Your account has been successfully verified and you have full access to all features.
                  </p>
                  {user?.verifiedAt && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                      <Clock className="w-3 h-3" />
                      <span>Verified on {formatDateTime(user.verifiedAt)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-3" style={{ color: "rgb(var(--text-primary))" }}>
                    Complete account verification to access all dashboard features and ensure account security.
                  </p>
                  <Link
                    href="/verify"
                    className="inline-flex items-center gap-2 btn btn-sm btn-primary"
                  >
                    <QrCode className="w-4 h-4" />
                    Verify Account
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Benefits */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            Verification Benefits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border border-white/10 ${
              isVerified ? "bg-green-500/5" : "bg-white/5"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                )}
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Dashboard Access
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Full access to telemetry data and analytics
              </p>
            </div>

            <div className={`p-3 rounded-lg border border-white/10 ${
              isVerified ? "bg-green-500/5" : "bg-white/5"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                )}
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  AI Assistant
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Access to AI-powered water quality analysis
              </p>
            </div>

            <div className={`p-3 rounded-lg border border-white/10 ${
              isVerified ? "bg-green-500/5" : "bg-white/5"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                )}
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Data Export
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Export your data in multiple formats
              </p>
            </div>

            <div className={`p-3 rounded-lg border border-white/10 ${
              isVerified ? "bg-green-500/5" : "bg-white/5"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isVerified ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                )}
                <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Enhanced Security
                </span>
              </div>
              <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Additional security features and protection
              </p>
            </div>
          </div>
        </div>

        {/* Verification Process */}
        {!isVerified && (
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <h4 className="text-sm font-medium text-blue-400 mb-2">How Verification Works</h4>
            <ol className="text-xs space-y-1" style={{ color: "rgb(var(--text-muted))" }}>
              <li>1. Click &quot;Verify Account&quot; to generate a QR code</li>
              <li>2. Scan the QR code with the Python Virtual Assistant</li>
              <li>3. Your account will be verified automatically</li>
              <li>4. Gain full access to all dashboard features</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
