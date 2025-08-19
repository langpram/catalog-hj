import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export", // Tambah ini buat static export
  trailingSlash: true, // Biar URL berakhir dengan /
  images: {
    unoptimized: true, // Wajib buat static export
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
