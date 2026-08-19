import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Path alias configuration ensuring '@' explicitly resolves to the 'src' directory
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },

  // External packages for server/API routes
  serverExternalPackages: [
    'pg',
    'pg-pool',
    'stripe',
    '@elevenlabs/elevenlabs-js',
    '@google/genai',
    '@aws-sdk/rds-signer',
    '@auth0/nextjs-auth0',
  ],

  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      's3.amazonaws.com',
      'api.netlify.com',
      'lh3.googleusercontent.com',
      's.gravatar.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
