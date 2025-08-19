import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true, // Tambah ini
  },
  typescript: {
    ignoreBuildErrors: true, // Tambah ini
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

export default withPWA(nextConfig);
