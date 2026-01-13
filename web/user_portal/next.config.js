/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Ensure Next.js correctly traces files in a monorepo setup
  // outputFileTracingRoot: require('path').resolve(__dirname, '../../'),

  // Enable compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react'],
  },

  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,

  // Turbopack configuration (Next.js 16+)
  // turbopack: {
    // Enable optimizations
  // },
};

module.exports = nextConfig;
