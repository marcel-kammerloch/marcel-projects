import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Player from "@/components/player/Player";
import BottomNav from "@/components/BottomNav";
import { ClientProviders } from "@/components/ClientProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Player",
  description: "A simple and modern music player",
  applicationName: "Music",
  icons: {
    shortcut: {
      url: "/favicon.ico",
      type: "image/x-icon",
    },
    icon: [
      {
        url: "/icons/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/icons/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: {
      url: "/icons/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Music",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} font-geist antialiased h-full`}
      suppressHydrationWarning={process.env.NODE_ENV === "production"}
    >
      <body className="min-h-full flex flex-col pb-36 transition-colors duration-300">
        {/* <ClientProviders> */}
          {children}
            <Player />
            <BottomNav />
          <Toaster  />
        {/* </ClientProviders> */}
      </body>
    </html>
  );
}
