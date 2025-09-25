import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Fix workspace root inference when multiple lockfiles exist (monorepo-like setup)
  outputFileTracingRoot: path.resolve(__dirname, ".."),
};

export default nextConfig;
