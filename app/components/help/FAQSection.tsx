"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

type FAQSectionProps = {
  searchQuery: string;
};

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
};

export function FAQSection({ searchQuery }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const faqItems: FAQItem[] = [
    {
      id: "1",
      question: "How do I get started with the Smart Aquaculture Dashboard?",
      answer: "To get started: 1) Create an account or sign in with Google/Kakao, 2) Complete account verification by scanning the QR code with the Python Virtual Assistant, 3) Access your dashboard to view real-time water quality data, 4) Customize your settings and alert thresholds in the Settings page.",
      category: "Getting Started",
      keywords: ["start", "begin", "setup", "account", "first time", "new user"]
    },
    {
      id: "2",
      question: "What is account verification and why do I need it?",
      answer: "Account verification is a security feature that ensures you have access to the Python Virtual Assistant. After creating your account, you'll need to scan a QR code with the VA to verify your identity. This unlocks full access to the dashboard, AI assistant, and data export features.",
      category: "Account & Security",
      keywords: ["verify", "verification", "qr", "code", "security", "unlock", "access"]
    },
    {
      id: "3",
      question: "How do I use the AI Assistant (Veronica)?",
      answer: "Veronica is your AI-powered aquaculture assistant. Click 'Initiate Assistant' on the AI Assistant page, then ask questions about water quality, fish health, or aquarium maintenance. You can also use quick actions for common tasks like generating water quality reports or getting maintenance tips.",
      category: "AI Assistant",
      keywords: ["ai", "assistant", "veronica", "chat", "questions", "help", "reports"]
    },
    {
      id: "4",
      question: "What water quality parameters are monitored?",
      answer: "The system monitors key parameters including pH levels, water temperature (°C), dissolved oxygen (DO) in mg/L, and fish health indicators. AI algorithms also provide quality scores (1-10) and status classifications (good/average/alert) based on these measurements.",
      category: "Monitoring",
      keywords: ["water", "quality", "parameters", "ph", "temperature", "oxygen", "monitoring", "sensors"]
    },
    {
      id: "5",
      question: "How do I set up alerts and notifications?",
      answer: "Go to Settings > Alert Settings to configure thresholds for pH, temperature, dissolved oxygen, and AI quality scores. You can enable/disable alerts for each parameter, choose notification types (toast, sound), and set alert frequency (immediate or batched).",
      category: "Alerts & Notifications",
      keywords: ["alerts", "notifications", "thresholds", "settings", "configure", "warnings"]
    },
    {
      id: "6",
      question: "Can I export my data?",
      answer: "Yes! You can export data in multiple ways: 1) Use the manual export button in Settings > Data & Export, 2) Set up automatic exports (daily/weekly/monthly), 3) Export your complete account data from Account > Account Actions. Data is available in CSV, JSON, and Excel formats.",
      category: "Data Management",
      keywords: ["export", "data", "download", "csv", "json", "excel", "backup"]
    },
    {
      id: "7",
      question: "How do I change my password?",
      answer: "Go to Account > Security Settings. Enter your current password, then create a new password (minimum 8 characters with good strength). Note: Password changes are only available for accounts created with email/password, not OAuth accounts (Google/Kakao).",
      category: "Account & Security",
      keywords: ["password", "change", "security", "update", "credentials"]
    },
    {
      id: "8",
      question: "What should I do if my readings seem incorrect?",
      answer: "If readings appear incorrect: 1) Check sensor connections and calibration, 2) Verify the mock server is running properly, 3) Refresh your dashboard data, 4) Check the troubleshooting guide below, 5) Contact support if issues persist. The system includes data validation to flag unusual readings.",
      category: "Troubleshooting",
      keywords: ["incorrect", "wrong", "readings", "sensors", "calibration", "troubleshoot", "fix"]
    },
    {
      id: "9",
      question: "How do I connect social accounts (Google/Kakao)?",
      answer: "Go to Account > Connected Accounts and click 'Connect' next to Google or Kakao. You can link multiple authentication methods for easier sign-in. Note: Ensure you have at least one authentication method (password or connected account) to avoid being locked out.",
      category: "Account & Security",
      keywords: ["google", "kakao", "oauth", "social", "connect", "link", "authentication"]
    },
    {
      id: "10",
      question: "Is my data secure and private?",
      answer: "Yes, we take security seriously. Your data is encrypted, stored securely, and only accessible to you. We comply with GDPR and privacy regulations. You can export or delete your data at any time from the Account page. OAuth connections are secure and we never store your social media passwords.",
      category: "Privacy & Security",
      keywords: ["security", "privacy", "gdpr", "data", "encryption", "safe", "protection"]
    }
  ];

  // Filter FAQ items based on search query
  const filteredItems = searchQuery 
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : faqItems;

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  // Group items by category
  const categories = [...new Set(filteredItems.map(item => item.category))];

  return (
    <div className="card-glass p-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="w-6 h-6" style={{ color: "rgb(var(--text-primary))" }} />
        <h2 className="text-2xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
          Frequently Asked Questions
        </h2>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg font-medium mb-2" style={{ color: "rgb(var(--text-primary))" }}>
            No FAQ items found
          </p>
          <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
            Try searching for different terms or contact support for help
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = filteredItems.filter(item => item.category === category);
            
            return (
              <div key={category}>
                <h3 className="text-lg font-medium mb-4 text-blue-400">
                  {category}
                </h3>
                
                <div className="space-y-3">
                  {categoryItems.map((item) => {
                    const isOpen = openItems.has(item.id);
                    
                    return (
                      <div key={item.id} className="border border-white/10 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full p-4 text-left hover:bg-white/5 transition-colors flex items-center justify-between"
                        >
                          <span className="font-medium pr-4" style={{ color: "rgb(var(--text-primary))" }}>
                            {item.question}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: "rgb(var(--text-muted))" }} />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "rgb(var(--text-muted))" }} />
                          )}
                        </button>
                        
                        {isOpen && (
                          <div className="px-4 pb-4 border-t border-white/10 bg-white/5">
                            <div className="pt-4 text-sm leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
                              {item.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
