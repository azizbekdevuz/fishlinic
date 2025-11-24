"use client";

import { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { formatDateTime } from "@/app/lib/format";
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Edit3, 
  Save, 
  X,
  Shield,
  CheckCircle
} from "lucide-react";

export function ProfileInformation() {
  const { user, isVerified, refreshSession } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditName(user?.name || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditName(user?.name || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.show("error", "Name cannot be empty", 3000);
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      await refreshSession();
      setIsEditing(false);
      toast.show("success", "Profile updated successfully!", 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.show("error", "Failed to update profile. Please try again.", 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const formatAccountAge = () => {
    if (!user?.createdAt) return "Unknown";
    
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months === 1 ? '' : 's'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years === 1 ? '' : 's'}`;
    }
  };

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Profile Information
        </h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="btn btn-ghost btn-sm flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Display Name */}
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 mt-1" style={{ color: "rgb(var(--text-primary))" }} />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
              Display Name
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm"
                  style={{ color: "rgb(var(--text-primary))" }}
                  placeholder="Enter your name"
                  maxLength={50}
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-primary btn-sm flex items-center gap-1"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
                {user?.name || "No name set"}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 mt-1" style={{ color: "rgb(var(--text-primary))" }} />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
              Email Address
            </label>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              {user?.email}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
              Email changes can be made in Account settings
            </p>
          </div>
        </div>

        {/* Account Created */}
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 mt-1" style={{ color: "rgb(var(--text-primary))" }} />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
              Account Created
            </label>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              {user?.createdAt ? formatDateTime(user.createdAt) : "Unknown"}
            </p>
            <p className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
              Account age: {formatAccountAge()}
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 mt-1" style={{ color: "rgb(var(--text-primary))" }} />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
              Verification Status
            </label>
            <div className="flex items-center gap-2">
              {isVerified ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-400">Verified Account</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-400">Pending Verification</span>
                </>
              )}
            </div>
            {user?.verifiedAt && (
              <p className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
                Verified on: {formatDateTime(user.verifiedAt)}
              </p>
            )}
            {!isVerified && (
              <p className="text-xs mt-1" style={{ color: "rgb(var(--text-muted))" }}>
                Complete verification to access all features
              </p>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 mt-1" style={{ color: "rgb(var(--text-primary))" }} />
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
              Last Updated
            </label>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              {user?.updatedAt ? formatDateTime(user.updatedAt) : "Never"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
