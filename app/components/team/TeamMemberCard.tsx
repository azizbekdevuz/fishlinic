"use client";

import { memo } from "react";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";
import type { TeamMember } from "@/app/lib/types/our-team";

type TeamMemberCardProps = {
  member: TeamMember;
  index: number;
  onSelect: (member: TeamMember) => void;
};

function TeamMemberCardComponent({ member, index, onSelect }: TeamMemberCardProps) {
  const staggerClass = `stagger-${(index % 5) + 1}`;

  return (
    <article
      className={`team-card animate-scale-in cursor-pointer group ${staggerClass}`}
      onClick={() => onSelect(member)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(member);
        }
      }}
      aria-label={`View details for ${member.name}`}
    >
      {/* Image Container */}
      <div className="team-image-container mb-4">
        <Image
          src={member.image}
          alt={`${member.name} - ${member.role}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
          priority={index < 3}
        />
        
        {/* Hover Overlay with Quick Actions */}
        <div className="absolute inset-0 flex items-end justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            {member.links.github && (
              <a
                href={member.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-link-github"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${member.name}'s GitHub`}
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {member.links.linkedin && (
              <a
                href={member.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-link-linkedin"
                onClick={(e) => e.stopPropagation()}
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {member.links.email && (
              <a
                href={`mailto:${member.links.email}`}
                className="social-link social-link-email"
                onClick={(e) => e.stopPropagation()}
                aria-label={`Email ${member.name}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="text-center">
        <h3 
          className="text-lg font-semibold mb-1 transition-colors duration-200 group-hover:text-gradient"
          style={{ color: "rgb(var(--text-primary))" }}
        >
          {member.name}
        </h3>
        
        <p 
          className="text-sm font-medium mb-2"
          style={{ color: "rgb(var(--primary))" }}
        >
          {member.role}
        </p>
        
        <p 
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: "rgb(var(--text-muted))" }}
        >
          {member.shortDescription}
        </p>

        {/* Student ID Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
          style={{ 
            background: "rgba(var(--accent), 0.1)",
            color: "rgb(var(--accent))",
            border: "1px solid rgba(var(--accent), 0.2)"
          }}
        >
          <span className="font-mono">{member.studentId}</span>
        </div>
      </div>

      {/* Click Indicator */}
      <div 
        className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110"
        style={{ 
          background: "rgba(var(--primary), 0.2)",
          border: "1px solid rgba(var(--primary), 0.3)"
        }}
      >
        <svg 
          className="w-4 h-4" 
          style={{ color: "rgb(var(--primary))" }}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  );
}

export const TeamMemberCard = memo(TeamMemberCardComponent);

