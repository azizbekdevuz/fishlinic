import type { TeamMember } from "@/app/lib/types/our-team";

export const teamMembers: TeamMember[] = [
  {
    id: "hung",
    studentId: "22013112",
    name: "Tran Dai Viet Hung",
    role: "Team Leader & AI SW Developer",
    image: "/our-team/hung.jpg",
    shortDescription: "Team leader driving the project vision and technical direction. Combines AI and software development expertise with project management skills to deliver comprehensive solutions.",
    contributions: [
      "Project Management",
      "AI SW Development",
      "Leadership",
      "System Architecture"
    ],
    detailedContributions: [
      "Led the overall project architecture and technical decision-making",
      "Trained the AI model for the virtual assistant",
      "Customzed and trained LLM models to fit the project requirements",
    ],
    links: {
      github: "https://github.com/trandaiviethung2001",
      linkedin: "https://www.linkedin.com/in/hung-tran-dai-viet-8b6090233/",
      email: "trandaiviethung2001@gmail.com"
    }
  },
  {
    id: "nomungerel",
    studentId: "22013153",
    name: "AI SW Developer",
    role: "AI Developer | LLM Trainer",
    image: "/our-team/nomungerel.jpg",
    shortDescription: "AI enthusiast focused on machine learning applications in environmental monitoring. Dedicated to developing intelligent systems that provide actionable insights from sensor data.",
    contributions: [
      "Training and customizing LLM models",
      "Roboflow integration for object detection",
      "Data processing, analysis, and training"
    ],
    detailedContributions: [
      "Trained and customized LLM models for the virtual assistant",
      "Integrated Roboflow for fish detection and image processing",
      "Processed and analyzed sensor data for water quality analysis"
    ],
    links: {
      github: "https://github.com/nomungerelm",
      linkedin: "https://linkedin.com/in/nomungerel-mijiddorj-25369a301/",
      email: "nomun0225@gmail.com"
    }
  },
  {
    id: "azizjon",
    studentId: "22013133",
    name: "Kamoliddinov Azizjon",
    role: "Hardware Engineer",
    image: "/our-team/azizjon.jpg",
    shortDescription: "Hardware enthusiast specializing in IoT systems and embedded programming. Passionate about connecting physical sensors with digital interfaces for real-world applications.",
    contributions: [
      "Arduino Development",
      "Sensor Integration",
      "Hardware Setup"
    ],
    detailedContributions: [
      "Developed Arduino firmware for pH, dissolved oxygen, and temperature sensors",
      "Implemented serial communication protocol between hardware and software",
      "Designed the dual-Arduino architecture for efficient data collection"
    ],
    links: {
      github: "https://github.com/theeduazizjon-cell",
      linkedin: "https://www.linkedin.com/in/azizjon-kamoliddinov-374219350/",
      email: "theeduazizjon@gmail.com"
    }
  },
  {
    id: "phyo",
    studentId: "21013414",
    name: "Phyo Thiri Khaing",
    role: "AI/ML Engineer",
    image: "/our-team/phyo.jpg",
    shortDescription: "AI enthusiast focused on machine learning applications in environmental monitoring. Dedicated to developing intelligent systems that provide actionable insights from sensor data.",
    contributions: [
      "AI Integration",
      "Data Analysis",
      "ML Models",
      "Predictive Analytics"
    ],
    detailedContributions: [
      "Developed the AI service for water quality analysis and predictions",
      "Implemented fish health scoring algorithms based on environmental parameters",
      "Created data normalization and preprocessing pipelines"
    ],
    links: {
      github: "https://github.com/PTRK11",
      linkedin: "https://www.linkedin.com/in/phyo-thiri-khaing-27a145222/",
      email: "phyothirikhainguit11@gmail.com"
    }
  },
  {
    id: "azizbek",
    studentId: "22013143",
    name: "Azizbek Arzikulov",
    role: "Full-Stack Developer",
    image: "/our-team/azizbek.jpg",
    shortDescription: "Full-stack developer with a passion for building scalable and efficient web applications. Dedicated to creating seamless user experiences through clean code and innovative solutions.",
    contributions: [
      "Full-Stack Development",
      "System Integration",
      "Schema Design", 
      "Web Application Development",
    ],
    detailedContributions: [
      "Designed and implemented the PostgreSQL database schema for telemetry data",
      "Developed the Next.js web application with authentication, dashboard, and real-time data visualization",
      "Integrated Socket.IO for real-time communication between client and server"
    ],
    links: {
      github: "https://github.com/azizbekdevuz",
      linkedin: "https://www.linkedin.com/in/azizbek-arzikulov",
      email: "azizbek.dev.ac@gmail.com"
    }
  }
];