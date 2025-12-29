import "./globals.css";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { LoginForm } from "../components/login-form";
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Login to access all marcel-projects",
  description:
    "Login to get access to all marcel-projects.vercel.app subdomains",
};

export default function RootLayout() {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <Suspense fallback={<div>Please enable Javascript.</div>}>
          <LoginForm />
        </Suspense>
      </body>
    </html>
  );
}
