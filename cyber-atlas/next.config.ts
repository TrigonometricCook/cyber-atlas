import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // ✅ Ignore TS errors and still build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Ignore ESLint errors and still build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
