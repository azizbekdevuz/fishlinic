"use client";

import { Suspense } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useSearchParams } from "next/navigation";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const errorMessage = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="bg-gradient-main min-h-screen flex items-center justify-center p-4 -mt-24 sm:-mt-28">
      <div className="w-full max-w-md">
        <div className="card-glass p-8 animate-fade-in text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold mb-4 text-gradient">
            Authentication Error
          </h1>

          <p className="text-sm mb-8" style={{ color: "rgb(var(--text-secondary))" }}>
            {errorMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/signin" className="btn btn-primary">
              <ArrowLeft className="w-4 h-4" />
              Try Again
            </Link>
            <Link href="/" className="btn btn-ghost">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="bg-gradient-main min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Loading...
          </p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}

