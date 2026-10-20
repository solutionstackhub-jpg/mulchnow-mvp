/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  outputFileTracingIncludes: {
    "/api/**": ["./prisma/dev.db"],
  },
};

export default nextConfig;
