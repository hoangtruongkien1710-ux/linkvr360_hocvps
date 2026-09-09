import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Đưa số phiên bản (từ package.json, do `npm run build` set) vào bundle để hiển thị trên UI.
  env: {
    APP_VERSION: process.env.npm_package_version ?? 'dev',
  },
};

export default nextConfig;
