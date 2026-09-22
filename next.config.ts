import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  output: "standalone",
  async redirects() {
    return [{ source: "/talk", destination: "/", permanent: true }];
  },
};

export default nextConfig;
