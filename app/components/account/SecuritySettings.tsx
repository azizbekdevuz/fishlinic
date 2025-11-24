"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export function SecuritySettings() {
  const { user } = useAuth();
  const toast = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: ""
  });

  // Check if user is OAuth-only (no password)
  const isOAuthUser = !user?.email?.includes("@") || user?.name?.includes("OAuth");
  
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = "";

    if (password.length === 0) {
      return { score: 0, feedback: "" };
    }

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = "Very weak";
        break;
      case 2:
      case 3:
        feedback = "Weak";
        break;
      case 4:
        feedback = "Good";
        break;
      case 5:
        feedback = "Strong";
        break;
      case 6:
        feedback = "Very strong";
        break;
      default:
        feedback = "Very weak";
    }

    return { score, feedback };
  };

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    const newPasswords = { ...passwords, [field]: value };
    setPasswords(newPasswords);

    if (field === "new") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.show("error", "Please fill in all password fields", 3000);
      return;
    }

    if (passwords.new !== passwords.confirm) {
      toast.show("error", "New passwords do not match", 3000);
      return;
    }

    if (passwords.new.length < 8) {
      toast.show("error", "New password must be at least 8 characters long", 3000);
      return;
    }

    if (passwordStrength.score < 3) {
      toast.show("error", "Please choose a stronger password", 3000);
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      toast.show("success", "Password changed successfully!", 3000);
      setPasswords({ current: "", new: "", confirm: "" });
      setPasswordStrength({ score: 0, feedback: "" });
    } catch (error) {
      console.error('Password change error:', error);
      toast.show("error", error instanceof Error ? error.message : "Failed to change password", 3000);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-blue-500";
      case 5:
      case 6:
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStrengthWidth = (score: number) => {
    return `${(score / 6) * 100}%`;
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Security Settings
        </h2>
      </div>

      {/* Password Change Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Password
            </h3>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              {isOAuthUser 
                ? "You signed in with a social account. Password change is not available."
                : "Change your account password to keep your account secure"
              }
            </p>
          </div>
          {isOAuthUser && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">OAuth Account</span>
            </div>
          )}
        </div>

        {!isOAuthUser && (
          <div className="space-y-4 p-4 rounded-lg border border-white/10 bg-white/5">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange("current", e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm"
                  style={{ color: "rgb(var(--text-primary))" }}
                  placeholder="Enter your current password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isChangingPassword}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange("new", e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm"
                  style={{ color: "rgb(var(--text-primary))" }}
                  placeholder="Enter your new password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isChangingPassword}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwords.new && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span style={{ color: "rgb(var(--text-muted))" }}>Password Strength</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 2 ? "text-red-400" :
                      passwordStrength.score <= 4 ? "text-yellow-400" : "text-green-400"
                    }`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: getStrengthWidth(passwordStrength.score) }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm"
                  style={{ color: "rgb(var(--text-primary))" }}
                  placeholder="Confirm your new password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  disabled={isChangingPassword}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  ) : (
                    <Eye className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {passwords.confirm && (
                <div className="mt-1 flex items-center gap-2">
                  {passwords.new === passwords.confirm ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-red-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Change Password Button */}
            <div className="pt-2">
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm || passwordStrength.score < 3}
                className={`btn btn-sm flex items-center gap-2 ${
                  isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm || passwords.new !== passwords.confirm || passwordStrength.score < 3
                    ? "btn-ghost opacity-50 cursor-not-allowed"
                    : "btn-primary"
                }`}
              >
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Security Recommendations */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Security Recommendations</h4>
          <ul className="text-xs space-y-1" style={{ color: "rgb(var(--text-muted))" }}>
            <li>• Use a unique password that you don&apos;t use elsewhere</li>
            <li>• Include uppercase and lowercase letters, numbers, and symbols</li>
            <li>• Make it at least 12 characters long</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
