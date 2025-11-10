"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import Link from "next/link";
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  UserPlus
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const hasShownRedirectToast = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Show toast if redirected from protected page
  useEffect(() => {
    // Check if we were redirected from a protected route
    const protectedPaths = ["/dashboard", "/vassistant"];
    const isFromProtectedPage = protectedPaths.some(path => callbackUrl.startsWith(path));
    
    if (isFromProtectedPage && !hasShownRedirectToast.current) {
      hasShownRedirectToast.current = true;
      toast.alert("Please sign in to access this page");
    }
  }, [callbackUrl, toast]);

  // Redirect if already authenticated (only once)
  const hasRedirected = useRef(false);
  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      // Use full page reload to ensure middleware sees the session
      const targetUrl = callbackUrl.startsWith("/") 
        ? `${window.location.origin}${callbackUrl}`
        : callbackUrl;
      window.location.href = targetUrl;
    }
  }, [isAuthenticated, authLoading, callbackUrl]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);

    try {
      // If sign-up mode, create account first
      if (isSignUp) {
        const signUpResponse = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: email.split("@")[0] }),
        });

        const signUpData = await signUpResponse.json();

        if (!signUpResponse.ok) {
          setError(signUpData.error || "Failed to create account");
          toast.error(signUpData.error || "Failed to create account");
          setLoading(false);
          return;
        }

        // Account created successfully, show success message
        toast.success("Account created successfully! Signing you in...");
      }

      // Sign in (for both sign-in and sign-up flows)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error types
        if (result.error === "InvalidPassword") {
          setError("Incorrect password. Please try again.");
          toast.error("Incorrect password. Please try again.");
        } else if (result.error === "UserNotFound") {
          setError("No account found with this email. Please sign up first.");
          toast.alert("No account found with this email. Please sign up to create an account.");
        } else if (result.error === "CredentialsSignin") {
          setError("Invalid email or password");
          toast.error("Invalid email or password");
        } else {
          setError("An error occurred. Please try again.");
          toast.error("An error occurred. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Small delay to ensure session cookie is set
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Redirect to dashboard (or callbackUrl) with full page reload
        // This ensures the middleware can read the session cookie
        const targetUrl = callbackUrl.startsWith("/") 
          ? `${window.location.origin}${callbackUrl}`
          : callbackUrl;
        window.location.replace(targetUrl); // Use replace instead of href to prevent back button issues
        return;
      }

      // If we get here, something unexpected happened
      setError("Authentication failed. Please try again.");
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Show loading if checking auth status
  if (authLoading) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center p-4 -mt-24 sm:-mt-28">
        <div className="text-center">
          <div className="loading w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Show redirecting message if already authenticated
  if (isAuthenticated) {
    return (
      <div className="bg-gradient-main min-h-screen flex items-center justify-center p-4 -mt-24 sm:-mt-28">
        <div className="text-center">
          <div className="loading w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
            Redirecting to dashboard...
          </p>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            You are already signed in
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-main min-h-screen flex items-center justify-center p-4 -mt-24 sm:-mt-28">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-sm hover:text-blue-400 transition-colors"
          style={{ color: "rgb(var(--text-secondary))" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Auth Card */}
        <div className="card-glass p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              {isSignUp ? (
                <UserPlus className="w-8 h-8 text-white" />
              ) : (
                <LogIn className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2 text-gradient">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              {isSignUp 
                ? "Sign up to start monitoring your aquarium" 
                : "Sign in to access your dashboard"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium mb-2"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10" 
                  style={{ color: "rgb(var(--text-muted))" }} 
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input w-full pl-11 pr-4"
                  disabled={loading}
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium mb-2"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-10" 
                  style={{ color: "rgb(var(--text-muted))" }} 
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="input w-full pl-11 pr-4"
                  disabled={loading}
                  style={{ paddingLeft: "2.75rem" }}
                />
              </div>
              {isSignUp && (
                <p className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {isSignUp ? "Sign Up" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm mb-3" style={{ color: "rgb(var(--text-secondary))" }}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isSignUp ? "Sign In instead" : "Sign Up here"}
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-center" style={{ color: "rgb(var(--text-muted))" }}>
              {isSignUp 
                ? "Create a new account to access the dashboard"
                : "Use your email and password to sign in"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            Sejong University Capstone Project
          </p>
        </div>
      </div>
    </div>
  );
}

