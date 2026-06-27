import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.179", "10.0.0.179:3000"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["maplibre-gl"],
  },
  rewrites: async () => [
    {
      source: "/carto/basemaps/:path*",
      destination: "https://basemaps.cartocdn.com/:path*",
    },
    {
      source: "/carto/tiles/:path*",
      destination: "https://tiles.basemaps.cartocdn.com/:path*",
    },
  ],
  headers: async () => [
    {
      source: "/fonts/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
    {
      source: "/images/:path*",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
