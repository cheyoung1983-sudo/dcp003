/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.google-analytics.com https://vercel.live https://*.vercel.live https://*.auth0.com",
              "connect-src 'self' https://*.google.com https://*.google-analytics.com https://vercel.live https://*.vercel.live https://*.auth0.com https://displaycellpros.us.auth0.com wss://*.vercel.live https://*.myshopify.com https://cdn.shopify.com",
              "img-src 'self' data: blob: https://*.google.com https://*.google-analytics.com https://*.gstatic.com https://*.auth0.com https://*.githubusercontent.com https://picsum.photos https://*.picsum.photos https://*.myshopify.com https://cdn.shopify.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "frame-src 'self' https://vercel.live https://*.vercel.live https://*.auth0.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
