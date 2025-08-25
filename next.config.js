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
  // Increase body size limit for API routes (for video uploads)
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
}

module.exports = nextConfig