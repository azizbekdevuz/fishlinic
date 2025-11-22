"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useToast } from "@/app/hooks/useToast";
import { 
  Camera, 
  Upload, 
  Trash2, 
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export function ProfileAvatar() {
  const { user, isVerified, refreshSession } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.image || null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.show("error", "Please select a valid image file", 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.show("error", "Image size must be less than 5MB", 3000);
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setAvatarUrl(result.avatarUrl);
      await refreshSession();
      toast.show("success", "Profile picture updated successfully!", 3000);
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.show("error", "Failed to upload image. Please try again.", 3000);
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;

    setIsUploading(true);
    
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Remove failed');
      }

      setAvatarUrl(null);
      await refreshSession();
      toast.show("success", "Profile picture removed successfully!", 3000);
    } catch (error) {
      console.error('Avatar remove error:', error);
      toast.show("error", "Failed to remove image. Please try again.", 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="card-glass p-6">
      <div className="text-center">
        {/* Avatar Display */}
        <div className="relative inline-block mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(null)}
              />
            ) : (
              <span>{getInitials()}</span>
            )}
          </div>
          
          {/* Verification Badge */}
          <div className="absolute -bottom-2 -right-2">
            {isVerified ? (
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <h2 className="text-xl font-bold mb-1" style={{ color: "rgb(var(--text-primary))" }}>
          {user?.name || "User"}
        </h2>
        <p className="text-sm mb-1" style={{ color: "rgb(var(--text-muted))" }}>
          {user?.email}
        </p>
        <div className="flex items-center justify-center gap-2 mb-6">
          {isVerified ? (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
              Verified Account
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
              Unverified Account
            </span>
          )}
        </div>

        {/* Avatar Actions */}
        <div className="space-y-2">
          <button
            onClick={handleFileSelect}
            disabled={isUploading}
            className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                {avatarUrl ? <Camera className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                {avatarUrl ? "Change Picture" : "Upload Picture"}
              </>
            )}
          </button>
          
          {avatarUrl && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="w-full btn btn-ghost btn-sm flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
              Remove Picture
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Upload Guidelines */}
        <div className="mt-4 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          <p>JPG, PNG, GIF up to 5MB</p>
          <p>Recommended: 400x400px</p>
        </div>
      </div>
    </div>
  );
}
