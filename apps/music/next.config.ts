import { STORAGE_URL } from "@/lib/constants";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self' ${STORAGE_URL};
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js;
              worker-src 'self' blob:;
              style-src 'self' 'unsafe-inline';
              img-src 'self';
              connect-src 'self' ${STORAGE_URL} https://auth.marcel-projects.vercel.app https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm https://vercel.com/api/blob/;
              media-src 'self' blob: ${STORAGE_URL};`
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/.well-known/assetlinks.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
  experimental: {
    useTypeScriptCli: true,
  },
  cacheLife: {
    default: {
      stale: 86400, // 24 hours
      revalidate: 604800, // 7 days
      expire: 2592000, // 30 days
    },
  },
  partialPrefetching: true,
  cacheComponents: true,
  poweredByHeader: false,
};

export default nextConfig;
