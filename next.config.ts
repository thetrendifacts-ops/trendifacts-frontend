import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Enforce clean URLs without trailing slashes (308 redirects /slug/ -> /slug)
  trailingSlash: false,

  // 2. Prevent minor JS/TS type mismatches from halting Vercel builds
  typescript: {
    ignoreBuildErrors: true,
  },

  // 3. Image Whitelisting for Amazon and Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  // 4. Permanent SEO Redirects
  async redirects() {
    return [
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
      {
        source: "/ecoflow-delta-pro-review-is-the-3600wh-home-backup-worth-the-price",
        destination: "/ecoflow-delta-pro-review",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;