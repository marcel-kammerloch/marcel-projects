import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js;
              style-src 'self' 'unsafe-inline';
              img-src 'self';
              connect-src 'self' https://auth.marcel-projects.vercel.app https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm https://vercel.com/api/blob/;
              media-src 'self' blob:;`
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
    ];
  },
  async rewrites() {
    return [
      {
        source: "/storage/:path*",
        destination:
          "https://ad0nzrqxbs7k6ri0.public.blob.vercel-storage.com/:path*",
      },
    ];
  },
  experimental: {
    useTypeScriptCli: true,
  },
  cacheComponents: true
};

export default nextConfig;
