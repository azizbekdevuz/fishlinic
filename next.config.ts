import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: [
          "**/mock-server/data/**",
          "**/virtual-assistant/**/*.pt",
          "**/virtual-assistant/audio/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
