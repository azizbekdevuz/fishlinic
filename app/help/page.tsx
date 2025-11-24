"use client";

import { Suspense } from "react";
import { HelpContent } from "@/app/components/help/HelpContent";

function HelpPageContent() {
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Help & Support
          </h1>
          <p className="text-lg" style={{ color: "rgb(var(--text-muted))" }}>
            Get help with Smart Aquaculture Dashboard and find answers to common questions
          </p>
        </div>

        {/* Help Content */}
        <HelpContent />
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }>
      <HelpPageContent />
    </Suspense>
  );
}
