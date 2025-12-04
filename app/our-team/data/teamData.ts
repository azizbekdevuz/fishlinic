import type { TeamMember } from "@/app/lib/types/our-team";

export const teamMembers: TeamMember[] = [
  {
    id: "hung",
    studentId: "22013112",
    name: "Tran Dai Viet Hung",
    role: "Full-Stack Developer",
    image: "/our-team/hung.jpg",
    shortDescription: "Passionate about building scalable web applications and exploring cutting-edge technologies. Dedicated to creating seamless user experiences through clean code and innovative solutions.",
    contributions: [
      "Backend Development",
      "Database Design",
      "API Integration",
      "System Architecture"
    ],
    detailedContributions: [
      "Designed and implemented the RESTful API architecture for real-time data communication",
      "Developed the database schema and optimized queries for efficient telemetry data storage",
      "Integrated third-party services and ensured smooth data flow between components",
      "Collaborated on system architecture decisions and scalability planning",
      "Implemented error handling and logging mechanisms for system reliability"
    ],
    links: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      email: "22013112@student.sejong.ac.kr"
    }
  },
  {
    id: "nomungerel",
    studentId: "22013153",
    name: "Nomungerel Mijiddorj",
    role: "Frontend Developer",
    image: "/our-team/nomungerel.jpg",
    shortDescription: "Creative frontend developer with a keen eye for design and user experience. Focused on building intuitive interfaces that bridge the gap between functionality and aesthetics.",
    contributions: [
      "UI/UX Design",
      "Frontend Development",
      "Responsive Design",
      "Component Library"
    ],
    detailedContributions: [
      "Crafted responsive UI components following modern design principles",
      "Implemented the dashboard visualization components for data representation",
      "Designed and developed the theming system supporting dark and light modes",
      "Created reusable component patterns ensuring consistency across the application",
      "Conducted user experience testing and iterative improvements"
    ],
    links: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      email: "22013153@student.sejong.ac.kr"
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
      "Hardware Setup",
      "Serial Communication"
    ],
    detailedContributions: [
      "Developed Arduino firmware for pH, dissolved oxygen, and temperature sensors",
      "Implemented serial communication protocol between hardware and software",
      "Designed the dual-Arduino architecture for efficient data collection",
      "Calibrated and tested sensors for accurate water quality measurements",
      "Created the servo-based fish feeding mechanism and control system"
    ],
    links: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      email: "22013133@student.sejong.ac.kr"
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
      "Integrated Ollama LLM for the AI-powered virtual assistant (Veronica)",
      "Developed the AI service for water quality analysis and predictions",
      "Implemented fish health scoring algorithms based on environmental parameters",
      "Created data normalization and preprocessing pipelines",
      "Designed the prompt engineering for contextual AI responses"
    ],
    links: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      email: "21013414@student.sejong.ac.kr"
    }
  },
  {
    id: "azizbek",
    studentId: "22013143",
    name: "Azizbek Arzikulov",
    role: "Project Lead & Full-Stack Developer",
    image: "/our-team/azizbek.jpg",
    shortDescription: "Team leader driving the project vision and technical direction. Combines full-stack expertise with project management skills to deliver comprehensive solutions.",
    contributions: [
      "Project Management",
      "Full-Stack Development",
      "System Integration",
      "Code Review"
    ],
    detailedContributions: [
      "Led the overall project architecture and technical decision-making",
      "Developed core features including authentication, real-time data, and dashboard",
      "Implemented the mock-server bridge for hardware-software communication",
      "Coordinated team efforts and maintained code quality standards",
      "Managed deployment pipeline and production environment setup",
      "Integrated all system components into a cohesive application"
    ],
    links: {
      github: "https://github.com/",
      linkedin: "https://linkedin.com/in/",
      email: "22013143@student.sejong.ac.kr"
    }
  }
];