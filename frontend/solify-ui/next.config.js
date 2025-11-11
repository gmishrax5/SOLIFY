/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add static export options for Netlify
  output: 'export',
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  // Disable React strict mode to avoid double rendering in development
  reactStrictMode: false,
  // Suppress hydration errors in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Performance optimizations and SWC compiler
  swcMinify: true,
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { dev, isServer }) => {
    // This allows importing JSON files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    // Add optimization for faster builds
    if (dev && !isServer) {
      // Only enable fast refresh in development client-side
      config.optimization.splitChunks = {
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for third-party modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
        },
      };
    }
    
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
