import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalNav from "@/components/conditional-nav";
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
  title: "Mat Ops - Wrestling Analytics Platform",
  description: "Advanced wrestling analytics, live scoring, video analysis, and team management powered by AI. Extract stats from USABracketing and sync automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
      >
        <ConditionalNav />
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
