import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/auth"],
  headers: () => [
    {
      source: "/(.*)",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    },
  ],
  poweredByHeader: false,
};

export default nextConfig;
