"use client";

import { ProjectOverview } from "./ProjectOverview";
import { TechnologyStack } from "./TechnologyStack";
import { TeamCredits } from "./TeamCredits";
import { SystemStatus } from "./SystemStatus";
import { VersionInfo } from "./VersionInfo";
import { LicenseInfo } from "./LicenseInfo";

export function AboutContent() {
  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <ProjectOverview />
      
      {/* System Status & Version */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SystemStatus />
        <VersionInfo />
      </div>
      
      {/* Technology Stack */}
      <TechnologyStack />
      
      {/* Team & Credits */}
      <TeamCredits />
      
      {/* License Information */}
      <LicenseInfo />
    </div>
  );
}
