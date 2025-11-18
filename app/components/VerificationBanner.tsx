"use client";

import { X, QrCode } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type VerificationBannerProps = {
  isVerified: boolean;
};

export function VerificationBanner({ isVerified }: VerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (isVerified || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-400 shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <QrCode className="w-5 h-5 text-white flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                Account Verification Required
              </div>
              <div className="text-xs text-white/90 mt-1">
                Complete verification to unlock all features and access your personal data
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/verify"
              className="btn btn-sm bg-white text-yellow-600 hover:bg-white/90 font-semibold"
            >
              Verify Now
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-white hover:text-white/80 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

