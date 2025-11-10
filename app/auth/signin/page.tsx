"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : "An error occurred. Please try again.");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        // Use window.location for a full page reload to ensure session is established
        window.location.href = callbackUrl;
        // Don't set loading to false here as we're redirecting
        return;
      }

      // If we get here, something unexpected happened
      setError("Authentication failed. Please try again.");
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

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
                ? "New accounts are created automatically on first sign in"
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

