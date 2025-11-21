import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ConditionalNav from "@/components/conditional-nav";
import Script from "next/script";
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
  title: "Aether Mat Ops - Wrestling Analytics Platform",
  description: "Advanced wrestling analytics, live scoring, video analysis, and team management powered by AI. Extract stats from USABracketing and sync automatically.",
  other: {
    "matops-app": "true",
    "matops-version": "1.0.0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Meta tag for extension detection */}
        <meta name="matops-app" content="true" />
        <meta name="matops-version" content="1.0.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white min-h-screen`}
        data-matops-app="true"
        data-matops-version="1.0.0"
      >
        {/* Extension detection script */}
        <Script id="matops-extension-bridge" strategy="beforeInteractive">
          {`
            // Mat Ops Extension Bridge
            window.matOpsWebApp = {
              version: '1.0.0',
              ready: true,
              sendMessage: function(type, payload) {
                window.dispatchEvent(new CustomEvent('matops-web-message', {
                  detail: { type, payload }
                }));
              },
              onExtensionMessage: function(callback) {
                window.addEventListener('matops-extension-message', function(e) {
                  callback(e.detail);
                });
              }
            };
            // Announce web app is ready
            window.dispatchEvent(new CustomEvent('matops-web-ready', {
              detail: { version: '1.0.0', page: window.location.pathname }
            }));
          `}
        </Script>
        <ConditionalNav />
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
