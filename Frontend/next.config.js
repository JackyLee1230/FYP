/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_GAMES_STORAGE_HOSTNAME,
        port: '',
        pathname: process.env.NEXT_PUBLIC_GAMES_STORAGE_PATHNAME,
      },
    ],
  },
}

module.exports = nextConfig
