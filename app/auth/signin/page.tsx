"use client";

import { Suspense, useState, FormEvent, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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

function SignInContent() {
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
      setError(`An unexpected error occurred. Please try again. Error: ${err instanceof Error ? err.message : "Unknown error"}`);
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

          {/* OAuth Providers - Works for both Sign In and Sign Up */}
          <div className="mb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span style={{ color: "rgb(var(--text-muted))" }} className="px-2 bg-transparent">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                disabled={loading}
                className="btn btn-secondary flex items-center justify-center gap-2"
                title="Sign in or sign up with Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              
              <button
                type="button"
                onClick={() => signIn("kakao", { callbackUrl })}
                disabled={loading}
                className="btn btn-secondary flex items-center justify-center gap-2"
                style={{ backgroundColor: "#FEE500", color: "#000000" }}
                title="Sign in or sign up with Kakao"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#191919"
                    d="M12 3C7.031 3 3 6.238 3 10.25c0 2.531 1.641 4.781 4.156 6.063l-.969 3.531c-.094.375.188.656.531.469l4.281-2.844c.313.031.625.031.969.031 4.969 0 9-3.281 9-7.25S16.969 3 12 3z"
                  />
                </svg>
                Kakao
              </button>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: "rgb(var(--text-muted))" }}>
              {isSignUp ? "New accounts will be created automatically" : "Works for both new and existing accounts"}
            </p>
          </div>

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

export default function SignInPage() {
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
      <SignInContent />
    </Suspense>
  );
}

