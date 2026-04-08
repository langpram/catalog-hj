import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      // 🔥 update ke ngrok URL
      urlPattern: /^https?:\/\/turgent-annis-groundedly\.ngrok-free\.dev\/api\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
    {
      // 🔥 update ke ngrok URL
      urlPattern: /^https?:\/\/turgent-annis-groundedly\.ngrok-free\.dev\/uploads\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    {
      urlPattern: /.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "others-cache",
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // 🔥 tambah ngrok
      {
        protocol: "https",
        hostname: "turgent-annis-groundedly.ngrok-free.dev",
        port: "",
        pathname: "/uploads/**",
      },
      // keep yang lama kalau masih dipake
      {
        protocol: "https",
        hostname: "strapi.fairuzulum.me",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: "https://turgent-annis-groundedly.ngrok-free.dev/api/:path*",
      },
      {
        source: "/uploads/:path*",
        destination: "https://turgent-annis-groundedly.ngrok-free.dev/uploads/:path*",
      },
    ];
  },
  turbopack: {},
};

export default withPWA(nextConfig);