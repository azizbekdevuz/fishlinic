"use client";

import { Search, X } from "lucide-react";

type SearchBarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  return (
    <div className="card-glass p-6">
      <div className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
            style={{ color: "rgb(var(--text-muted))" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search for help topics, features, or troubleshooting guides..."
            className="w-full pl-12 pr-12 py-4 rounded-xl bg-white/5 border border-white/10 text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            style={{ color: "rgb(var(--text-primary))" }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" style={{ color: "rgb(var(--text-muted))" }} />
            </button>
          )}
        </div>
        
        {searchQuery && (
          <div className="mt-3 text-sm" style={{ color: "rgb(var(--text-muted))" }}>
            Searching for: <span className="text-blue-400 font-medium">"{searchQuery}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
