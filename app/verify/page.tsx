"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { getToastFromUrl } from "@/app/lib/toast-server";
import QRCodeSVG from "react-qr-code";
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { ProtectedPage } from "@/app/components/ProtectedPage";

type VerificationStatus = {
  token: string;
  verifyUrl: string;
  expiresAt: string;
  expiresIn: number;
};

type VerificationState = 
  | { type: "idle" }
  | { type: "generating" }
  | { type: "active"; data: VerificationStatus }
  | { type: "error"; message: string }
  | { type: "success" };

function VerifyContent() {
  const { isAuthenticated, isVerified, refreshSession } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<VerificationState>({ type: "idle" });
  const [timeLeft, setTimeLeft] = useState(0);
  const [polling, setPolling] = useState(false);
  const hasCheckedToast = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for server-initiated toast (only once)
  useEffect(() => {
    if (!hasCheckedToast.current) {
      hasCheckedToast.current = true;
      const urlToast = getToastFromUrl();
      if (urlToast) {
        toast.show(urlToast.type as "success" | "error" | "info" | "warning" | "alert" | "update", urlToast.message);
      }
    }
  }, [toast]);

  // Redirect if already verified
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isVerified, router]);

  // Generate verification token
  const generateToken = async () => {
    setState({ type: "generating" });
    try {
      const res = await fetch("/api/auth/verification/generate", {
        method: "POST",
        credentials: "include"
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate verification code");
      }

      const data = await res.json();
      setState({ 
        type: "active", 
        data: {
          token: data.token,
          verifyUrl: data.verifyUrl,
          expiresAt: data.expiresAt,
          expiresIn: data.expiresIn
        }
      });
      setTimeLeft(data.expiresIn);
      setPolling(true);
    } catch (error) {
      setState({ 
        type: "error", 
        message: error instanceof Error ? error.message : "Failed to generate verification code"
      });
    }
  };

  // Poll for verification status
  useEffect(() => {
    if (!polling || state.type !== "active") return;

    const token = state.type === "active" ? state.data.token : null;
    if (!token) return;

    // Start polling for verification completion
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/verification/status?token=${token}`);
        const data = await res.json();
        
        if (data.valid === false) {
          if (data.used) {
            // Verification completed!
            setPolling(false);
            setState({ type: "success" });
            
            // Show success toast
            toast.success("Verification successful! Please wait...", 10000);
            
            // Refresh session
            await refreshSession();
            
            // Wait a bit for session to update, then redirect
            setTimeout(() => {
              router.push("/dashboard");
            }, 2000);
          } else if (data.expired) {
            setPolling(false);
            setState({ 
              type: "error", 
              message: "Verification code expired. Please generate a new one."
            });
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds

    // Start countdown
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setPolling(false);
          setState(prevState => {
            if (prevState.type === "active") {
              return { 
                type: "error", 
                message: "Verification code expired. Please generate a new one."
              };
            }
            return prevState;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [polling, state, toast, router, refreshSession]);

  // Auto-generate on mount if not verified
  useEffect(() => {
    if (isAuthenticated && !isVerified && state.type === "idle") {
      generateToken();
    }
  }, [isAuthenticated, isVerified, state.type]);

  const handleRetry = () => {
    setState({ type: "idle" });
    setTimeLeft(0);
    setPolling(false);
    generateToken();
  };

  if (!isAuthenticated) {
    return null; // ProtectedPage handles redirect
  }

  if (isVerified) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center p-4">
        <div className="card-glass max-w-md w-full text-center animate-fade-in">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gradient mb-2">Already Verified</h1>
          <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>
            Your account is already verified. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-main min-h-screen p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <div className="card-glass animate-fade-in">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Verify Your Account
            </h1>
            <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              Scan the QR code with the Virtual Assistant to complete verification
            </p>
          </div>

          {state.type === "generating" && (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "rgb(var(--primary))" }} />
              <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                Generating verification code...
              </p>
            </div>
          )}

          {state.type === "active" && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="bg-white p-6 rounded-xl shadow-xl">
                  <QRCodeSVG 
                    value={state.data.verifyUrl} 
                    size={256}
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  <span className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  Waiting for verification...
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <button
                  onClick={handleRetry}
                  className="btn btn-secondary w-full"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New Code
                </button>
              </div>
            </div>
          )}

          {state.type === "error" && (
            <div className="text-center py-8 space-y-4">
              <XCircle className="w-16 h-16 mx-auto" style={{ color: "rgb(var(--danger))" }} />
              <div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                  Verification Failed
                </h2>
                <p className="text-sm mb-6" style={{ color: "rgb(var(--text-secondary))" }}>
                  {state.message}
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="btn btn-primary"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

          {state.type === "success" && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <div>
                <h2 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                  Verification Successful!
                </h2>
                <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 card-glass">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgb(var(--warning))" }} />
            <div className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              <p className="font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
                How to verify:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open the Virtual Assistant application</li>
                <li>Use the camera to scan this QR code</li>
                <li>Wait for verification to complete automatically</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <ProtectedPage>
      <VerifyContent />
    </ProtectedPage>
  );
}

