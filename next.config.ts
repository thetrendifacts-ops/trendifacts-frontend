import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 1. Redirect www to non-www
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
      // 2. EcoFlow Delta Pro slug redirect
      {
        source: "/ecoflow-delta-pro-review-is-the-3600wh-home-backup-worth-the-price",
        destination: "/ecoflow-delta-pro-review",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;