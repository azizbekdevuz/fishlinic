"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { getToastFromUrl } from "@/app/lib/toast-server";

type ProtectedPageProps = {
  children: React.ReactNode;
  redirectTo?: string;
};

export function ProtectedPage({ children, redirectTo = "/auth/signin" }: ProtectedPageProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const hasShownToast = useRef(false);
  const hasRedirected = useRef(false);

  // Check for server-initiated toast in URL (only once)
  useEffect(() => {
    const urlToast = getToastFromUrl();
    if (urlToast && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.show(urlToast.type as "success" | "error" | "info" | "warning" | "alert" | "update", urlToast.message);
    }
  }, [toast]);

  // Redirect if not authenticated (only once, prevent loops)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      // Show toast only if we haven't shown one yet
      if (!hasShownToast.current) {
        toast.error("Only authenticated users can access this page");
      }
      // Use window.location for reliable redirect
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo, toast]);

  if (isLoading) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

