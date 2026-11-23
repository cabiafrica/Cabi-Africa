const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(), geolocation=(self)'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.google.com https://www.gstatic.com https://maps.googleapis.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://images.unsplash.com https://www.gstatic.com https://maps.gstatic.com https://maps.googleapis.com https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://i.pravatar.cc https://cdnjs.cloudflare.com https://placehold.co; font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com; frame-src 'self' https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com; connect-src 'self' http://localhost:* ws://localhost:* https://www.google.com https://www.gstatic.com https://maps.googleapis.com https://fonts.gstatic.com https://fonts.googleapis.com https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://i.pravatar.cc https://*.cabi.africa https://*.run.app wss://*.run.app;"
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/driver',
        destination: '/drivers',
        permanent: true,
      },
      {
        source: '/passenger',
        destination: '/passengers',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/downloads/:file*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/vnd.android.package-archive',
          },
          {
            key: 'Content-Disposition',
            value: 'attachment',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  // Standalone output for Cloud Run Docker deployment (Vercel manages output mode automatically)
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),



  // Ignore TS errors on build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

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

  // Ensure server SSR and client bundle resolve the exact same lucide-react version
  transpilePackages: ['lucide-react'],

  // Experimental features for better performance
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
    optimizeCss: false,
    optimizePackageImports: ['@heroicons/react'],
  },


  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    const path = require('path');
    const fs = require('fs');
    const localLucide = path.resolve(__dirname, 'node_modules/lucide-react');
    const rootLucide = path.resolve(__dirname, '../../node_modules/lucide-react');
    const resolvedLucide = fs.existsSync(localLucide) ? localLucide : (fs.existsSync(rootLucide) ? rootLucide : null);
    if (resolvedLucide) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'lucide-react': resolvedLucide,
        [rootLucide]: resolvedLucide,
      };
    }
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunks
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules/.test(module.identifier());
              },
              name(module) {
                const hash = require('crypto').createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;

