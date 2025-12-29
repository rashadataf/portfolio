import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rashadataf.com',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'www.rashadataf.com',
        pathname: '/api/files/**',
      },
    ],
  },
};

export default nextConfig;
