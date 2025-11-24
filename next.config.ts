import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  webpack: (config, { isServer, dev }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: [
          "**/mock-server/data/**",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
