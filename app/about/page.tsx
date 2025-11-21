"use client";

import { Suspense } from "react";
import { AboutContent } from "@/app/components/about/AboutContent";

function AboutPageContent() {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            About Smart Aquaculture
          </h1>
          <p className="text-lg" style={{ color: "rgb(var(--text-muted))" }}>
            Learn about our project, technology, and the team behind the Smart Aquaculture Management System
          </p>
        </div>

        {/* About Content */}
        <AboutContent />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <AboutPageContent />
    </Suspense>
  );
}
