// @ts-check
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Enable standalone output for better Docker support
  output: 'standalone',
  
  // PWA and WebApp support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/media/**' },
      { protocol: 'http', hostname: 'localhost', port: '8000', pathname: '/media/**' },
      { protocol: 'https', hostname: 'pmcs.site', port: '', pathname: '/media/**' },
      // Add Django backend hostname for Docker networking
      { protocol: 'http', hostname: 'django-backend', port: '8000', pathname: '/media/**' },
    ],
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint during builds for better code quality
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking during builds
  },

  // Trailing slash for better routing
  trailingSlash: true,

  // Compression
  compress: true,

  // Powered by header
  poweredByHeader: false,

  // React strict mode for better development
  reactStrictMode: true,

  // SWC minification
  swcMinify: true,
};

export default nextConfig;