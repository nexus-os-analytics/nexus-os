import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Generate minimal server output for Docker standalone runtime
  output: 'standalone',
  // Avoid bundling heavy server-only logging deps to prevent Turbopack traversal into tests
  serverExternalPackages: ['pino', 'thread-stream', 'sonic-boom'],
};

export default nextConfig;
