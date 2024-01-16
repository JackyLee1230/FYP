/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
});

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

module.exports = withPWA(nextConfig);

