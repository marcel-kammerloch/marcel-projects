import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music Player",
  description: "Music Player PWA",
  robots: "noindex, nofollow",
  appleWebApp: {
    capable: true,
    title: "Music Player",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={process.env.NODE_ENV === "production"}
    >
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
      </head>
      <body className="bg-zinc-950 text-zinc-50">
        <noscript>This App need JavaScript to run. Please enable it.</noscript>

        {children}

        <ServiceWorker />
      </body>
    </html>
  );
}
