"use client";

import { Suspense } from "react";
import { ProtectedPage } from "@/app/components/ProtectedPage";
import { ProfileContent } from "@/app/components/profile/ProfileContent";

function ProfilePageContent() {
  return (
    <ProtectedPage>
      <div className="min-h-screen pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Profile
            </h1>
            <p className="text-lg" style={{ color: "rgb(var(--text-muted))" }}>
              Manage your profile information and view your activity
            </p>
          </div>

          {/* Profile Content */}
          <ProfileContent />
        </div>
      </div>
    </ProtectedPage>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
