/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "target.scene7.com",
      },
      {
        protocol: "https",
        hostname: "dw.carters.com",
      },
    ],
  },
};

export default nextConfig;
