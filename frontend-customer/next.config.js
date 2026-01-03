/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
    domains: ['example.com', 'localhost'],
  },
  // Enable experimental features if needed
  experimental: {
    // appDir: true, // Already enabled by default in Next.js 14
  },
};

module.exports = nextConfig;

