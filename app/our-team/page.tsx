"use client";

import { useState, useCallback, Suspense } from "react";
import { Users, Sparkles, GraduationCap, Calendar, Laptop, Heart } from "lucide-react";
import { FaCoffee } from "react-icons/fa";
import { TeamMemberCard, TeamMemberModal } from "@/app/lib/types/our-team";
import type { TeamMember } from "@/app/lib/types/our-team";
import { teamMembers } from "@/app/our-team/data/teamData";
import { GroupPhotos } from "@/app/components/team/GroupPhotos";

function TeamPageContent() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectMember = useCallback((member: TeamMember) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Delay clearing selected member for smooth exit animation
    setTimeout(() => setSelectedMember(null), 200);
  }, []);

  return (
    <div className="bg-team-page min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        {/* Header Section */}
        <header className="text-center mb-12 animate-fade-in">
          {/* Decorative Element */}
          <div className="relative inline-block mb-6">
            <div 
              className="absolute inset-0 animate-morph opacity-30"
              style={{
                background: "linear-gradient(135deg, rgba(var(--primary), 0.4), rgba(var(--secondary), 0.4))",
                filter: "blur(40px)",
                transform: "scale(1.5)"
              }}
            />
            <div 
              className="relative w-20 h-20 mx-auto rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(var(--primary), 0.2), rgba(var(--secondary), 0.2))",
                border: "1px solid rgba(var(--primary), 0.3)"
              }}
            >
              <Users className="w-10 h-10" style={{ color: "rgb(var(--primary))" }} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gradient">
            Meet Our Team
          </h1>
          
          <p 
            className="text-lg max-w-2xl mx-auto mb-6"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            The brilliant minds behind the Smart Aquaculture Management System. 
            A diverse team united by innovation and dedication to excellence.
          </p>

          {/* University Badge */}
          <div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl"
            style={{
              background: "rgba(var(--surface-elevated), 0.5)",
              border: "1px solid var(--border)"
            }}
          >
            <GraduationCap className="w-5 h-5" style={{ color: "rgb(var(--accent))" }} />
            <span style={{ color: "rgb(var(--text-primary))" }}>
              Sejong University • Computer Science • Capstone Project 2025
            </span>
          </div>
        </header>

        {/* Team Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
          {[
            { label: "Team Members", value: "5", icon: Users },
            { label: "Months of Development", value: "6+", icon: Calendar },
            { label: "Lines of Code", value: "15K+", icon: Laptop },
            { label: "Cups of Coffee", value: "∞", icon: FaCoffee }
          ].map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div 
                key={stat.label}
                className="p-4 rounded-xl text-center transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(var(--surface-glass))",
                  border: "1px solid var(--border)"
                }}
              >
                <IconComponent className="w-8 h-8 mx-auto mb-2" style={{ color: "rgb(var(--primary))" }} />
                <div className="text-2xl font-bold" style={{ color: "rgb(var(--primary))" }}>
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Team Grid */}
        <section className="mb-16">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-5 h-5" style={{ color: "rgb(var(--secondary))" }} />
            <h2 
              className="text-xl font-semibold"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Click on a team member to learn more
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                index={index}
                onSelect={handleSelectMember}
              />
            ))}
          </div>
        </section>

        {/* Group Photos Section */}
        <GroupPhotos />

        {/* Project Summary */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div 
            className="p-8 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(var(--primary), 0.1), rgba(var(--secondary), 0.1))",
              border: "1px solid rgba(var(--primary), 0.2)"
            }}
          >
            <h3 
              className="text-xl font-semibold mb-4 text-center"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              About Our Project
            </h3>
            <p 
              className="text-center max-w-3xl mx-auto leading-relaxed"
              style={{ color: "rgb(var(--text-secondary))" }}
            >
              The Smart Aquaculture Management System is a comprehensive IoT solution designed to 
              revolutionize fish farming through real-time monitoring, AI-powered analytics, and 
              automated feeding systems. Our team has combined expertise in software development, 
              hardware engineering, and artificial intelligence to create a platform that helps 
              aquaculture professionals make data-driven decisions for healthier, more sustainable 
              fish farming operations.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p 
            className="text-sm flex items-center justify-center gap-1.5"
            style={{ color: "rgb(var(--text-muted))" }}
          >
            Built with <Heart className="w-4 h-4 inline" style={{ color: "rgb(var(--danger))" }} /> at Sejong University © 2025
          </p>
        </footer>
      </div>

      {/* Team Member Modal */}
      <TeamMemberModal
        member={selectedMember}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default function OurTeamPage() {
  return (
    <Suspense fallback={
      <div className="bg-team-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div 
            className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "rgba(var(--primary), 0.3)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "rgb(var(--text-muted))" }}>Loading team...</p>
        </div>
      </div>
    }>
      <TeamPageContent />
    </Suspense>
  );
}

