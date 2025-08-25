/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'customer-*.cloudflarestream.com',
      },
      {
        protocol: 'https',
        hostname: 'videodelivery.net',
      },
    ],
  },
}

module.exports = nextConfig