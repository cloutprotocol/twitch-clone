/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    return config;
  },
  // Enable compression and optimize builds
  compress: true,
  poweredByHeader: false,
  // Optimize bundle analyzer
  swcMinify: true,
};

export default nextConfig;
