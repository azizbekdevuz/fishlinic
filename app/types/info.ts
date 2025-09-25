export type Info = {
  project: { name: string; tagline: string; overview: string; accentHex?: string; logoPath?: string };
  features: { title: string; desc: string; image: string }[];
  hardware: { boards: string[]; sensors: string[]; sampling: string; calibration: string; photos: string[] };
  software: { stack: string[]; repos: { web: string; bridge: string; firmware: string }; license: string };
  ai: { models: { name: string; task: string; metric: string; runsOn: string }[]; streamUrl?: string };
  team: { name: string; role: string; bio: string; photo: string; links: { github?: string; linkedin?: string } }[];
  timeline: { when: string; what: string }[];
  contact: { email: string; links: { label: string; url: string }[] };
  locale: { languages: string[] };
};


