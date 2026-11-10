import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node:fs", "node:path"]
};

export default nextConfig;
