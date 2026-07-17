import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: () => [
    {
      source: "/(.*)",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    },
  ],
  poweredByHeader: false,
  experimental: {
    useTypeScriptCli: true,
  },
};

export default nextConfig;
