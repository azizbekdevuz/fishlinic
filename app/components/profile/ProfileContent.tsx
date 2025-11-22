"use client";

import { ProfileInformation } from "./ProfileInformation";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileStatistics } from "./ProfileStatistics";
import { ProfileActivity } from "./ProfileActivity";

export function ProfileContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Avatar & Basic Info */}
      <div className="lg:col-span-1 space-y-6">
        <ProfileAvatar />
        <ProfileStatistics />
      </div>

      {/* Right Column - Detailed Info & Activity */}
      <div className="lg:col-span-2 space-y-6">
        <ProfileInformation />
        <ProfileActivity />
      </div>
    </div>
  );
}
