"use client";

import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { QuickHelp } from "./QuickHelp";
import { FAQSection } from "./FAQSection";
import { TroubleshootingGuide } from "./TroubleshootingGuide";
import { ContactSupport } from "./ContactSupport";
import { DocumentationLinks } from "./DocumentationLinks";

export function HelpContent() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      {/* Quick Help Cards */}
      <QuickHelp searchQuery={searchQuery} />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - FAQ & Troubleshooting */}
        <div className="lg:col-span-2 space-y-8">
          <FAQSection searchQuery={searchQuery} />
          <TroubleshootingGuide searchQuery={searchQuery} />
        </div>
        
        {/* Right Column - Contact & Documentation */}
        <div className="lg:col-span-1 space-y-8">
          <ContactSupport />
          <DocumentationLinks />
        </div>
      </div>
    </div>
  );
}
