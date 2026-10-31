import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. NEW: Image Whitelisting for Amazon and Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
  },

  // 2. EXISTING: Your SEO Redirects
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.trendifacts.com",
          },
        ],
        destination: "https://trendifacts.com/:path*",
        permanent: true,
      },
      // EcoFlow Delta Pro slug redirect
      {
        source: "/ecoflow-delta-pro-review-is-the-3600wh-home-backup-worth-the-price",
        destination: "/ecoflow-delta-pro-review",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;