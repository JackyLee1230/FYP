/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fyp.sgp1.digitaloceanspaces.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  transpilePackages: ["mui-file-input"],
};

module.exports = nextConfig;

