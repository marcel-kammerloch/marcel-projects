import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/auth"],
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Xss-Protection", value: "1" },
        ],
      },
    ];
  },
  poweredByHeader: false,
};

export default nextConfig;
