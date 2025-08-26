import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Webpack configuration for Cloudflare compatibility
  webpack: (config, { webpack }) => {
    // Ignore Cloudflare-specific modules that cause build errors
    config.plugins.push(new webpack.IgnorePlugin({
      resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
    }))
    return config
  },
  // Security headers for Cloudflare Stream
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.cloudflarestream.com *.vercel.live",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://videodelivery.net https://customer-*.cloudflarestream.com https://cloudflarestream.com",
              "media-src 'self' blob: https://videodelivery.net https://customer-*.cloudflarestream.com https://cloudflarestream.com",
              "connect-src 'self' https://videodelivery.net https://customer-*.cloudflarestream.com https://cloudflarestream.com *.supabase.co *.supabase.in https://api.cloudflare.com https://upload.cloudflarestream.com",
              "frame-src 'self' https://iframe.videodelivery.net https://customer-*.cloudflarestream.com",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  }
};

export default nextConfig;
