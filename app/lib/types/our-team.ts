export { TeamMemberCard } from "@/app/components/team/TeamMemberCard";
export { TeamMemberModal } from "@/app/components/team/TeamMemberModal";

export type TeamMemberLinks = {
    github?: string;
    linkedin?: string;
    email?: string;
  };
  
  export type TeamMember = {
    id: string;
    studentId: string;
    name: string;
    role: string;
    image: string;
    shortDescription: string;
    contributions: string[];
    detailedContributions: string[];
    links: TeamMemberLinks;
  };  