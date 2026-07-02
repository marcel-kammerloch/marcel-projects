import "./globals.css";
import { Geist } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sign In – Marcel Projects",
  description: "Sign in to access all Marcel Projects applications.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
