"use client";

import { useEffect, useCallback, useState, memo } from "react";
import Image from "next/image";
import { X, Github, Linkedin, Mail, CheckCircle, Sparkles } from "lucide-react";
import type { TeamMember } from "@/app/lib/types/our-team";

type TeamMemberModalProps = {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
};

function TeamMemberModalComponent({ member, isOpen, onClose }: TeamMemberModalProps) {
  const [isLight, setIsLight] = useState(false);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains("theme-light"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!isOpen || !member) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 team-modal-backdrop animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="team-modal w-full max-w-3xl max-h-[90vh] overflow-hidden animate-modal-slide-up relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Image */}
        <div className="relative">
          {/* Background Gradient */}
          <div 
            className="absolute inset-0 h-48"
            style={{
              background: `linear-gradient(135deg, rgba(var(--primary), 0.3) 0%, rgba(var(--secondary), 0.2) 100%)`
            }}
          />
          
          {/* Close Button - Enhanced */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 group"
            style={{
              background: "rgba(var(--surface), 0.9)",
              backdropFilter: "blur(12px)",
              border: "2px solid rgba(var(--primary), 0.3)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5 transition-colors duration-200" style={{ color: "rgb(var(--text-primary))" }} />
          </button>

          {/* Profile Image */}
          <div className="relative pt-8 pb-4 px-8 flex flex-col sm:flex-row items-center sm:items-end gap-4">
            <div 
              className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden flex-shrink-0 animate-border-glow group/image"
              style={{ 
                border: "3px solid rgba(var(--primary), 0.5)",
                boxShadow: "0 8px 32px rgba(var(--primary), 0.3)"
              }}
            >
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="160px"
                className="object-cover object-center transition-transform duration-500 group-hover/image:scale-110"
                priority
              />
              {/* Shimmer overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div 
                  className="absolute inset-0 animate-shimmer"
                  style={{
                    background: "linear-gradient(135deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)",
                    backgroundSize: "200% 100%"
                  }}
                />
              </div>
            </div>

            {/* Name & Role */}
            <div className="text-center sm:text-left pb-2">
              <h2 
                id="modal-title"
                className="text-2xl sm:text-3xl font-bold mb-1"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {member.name}
              </h2>
              <p 
                className="text-lg font-medium"
                style={{ color: "rgb(var(--primary))" }}
              >
                {member.role}
              </p>
              <div 
                className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm"
                style={{
                  background: "rgba(var(--accent), 0.15)",
                  color: "rgb(var(--accent))",
                  border: "1px solid rgba(var(--accent), 0.3)"
                }}
              >
                <span className="font-mono">{member.studentId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-4 max-h-[calc(90vh-220px)] overflow-y-auto animate-modal-content relative z-10">
          {/* Social Links - Enhanced */}
          <div className="flex flex-wrap gap-3 mb-6">
            {member.links.github && (
              <a
                href={member.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group/social"
                style={{
                  background: "rgba(110, 84, 148, 0.15)",
                  border: "1px solid rgba(110, 84, 148, 0.3)",
                  color: isLight ? "#6e5494" : "#c9b0ff"
                }}
              >
                <Github className="w-4 h-4 transition-transform duration-300 group-hover/social:rotate-12" />
                <span className="text-sm font-medium">GitHub</span>
              </a>
            )}
            {member.links.linkedin && (
              <a
                href={member.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group/social"
                style={{
                  background: "rgba(10, 102, 194, 0.15)",
                  border: "1px solid rgba(10, 102, 194, 0.3)",
                  color: isLight ? "#0a66c2" : "#70b5f9"
                }}
              >
                <Linkedin className="w-4 h-4 transition-transform duration-300 group-hover/social:scale-110" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>
            )}
            {member.links.email && (
              <a
                href={`mailto:${member.links.email}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group/social"
                style={{
                  background: "rgba(var(--primary), 0.15)",
                  border: "1px solid rgba(var(--primary), 0.3)",
                  color: "rgb(var(--primary))"
                }}
              >
                <Mail className="w-4 h-4 transition-transform duration-300 group-hover/social:translate-y-[-2px]" />
                <span className="text-sm font-medium">Email</span>
              </a>
            )}
          </div>

          {/* Short Description */}
          <p 
            className="text-base leading-relaxed mb-6"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            {member.shortDescription}
          </p>

          {/* Key Contributions */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: "rgb(var(--primary))" }} />
              <h3 
                className="text-lg font-semibold"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                Key Contributions
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {member.contributions.map((contribution, i) => (
                <span key={i} className="contribution-badge">
                  {contribution}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Contributions */}
          <div>
            <h3 
              className="text-lg font-semibold mb-4"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Detailed Contributions
            </h3>
            <ul className="space-y-3">
              {member.detailedContributions.map((item, i) => (
                <li 
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md group/item"
                  style={{
                    background: "rgba(var(--surface-elevated), 0.3)",
                    border: "1px solid var(--border)"
                  }}
                >
                  <CheckCircle 
                    className="w-5 h-5 flex-shrink-0 mt-0.5 transition-transform duration-300 group-hover/item:scale-110" 
                    style={{ color: "rgb(var(--accent))" }} 
                  />
                  <span 
                    className="text-sm leading-relaxed transition-colors duration-200"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export const TeamMemberModal = memo(TeamMemberModalComponent);

