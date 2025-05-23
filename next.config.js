/** @type {import('next').NextConfig} */
const nextConfig = {
  // For production deployment, use the default server-side rendering
  // Removing 'output: export' for server components support
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;