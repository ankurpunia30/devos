import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['node:sqlite'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.ts': ['.ts', '.tsx'],
    };
    return config;
  },
};

export default nextConfig;
