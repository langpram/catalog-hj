import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Simpan service worker di folder public
  register: true,
  disable: process.env.NODE_ENV === "development", // Nonaktifkan PWA saat development
});

const nextConfig: NextConfig = {


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'strapi.fairuzulum.me',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
