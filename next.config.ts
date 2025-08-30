import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: "export" to support dynamic routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "strapi.fairuzulum.me",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
