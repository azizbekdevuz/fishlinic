import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { SiteNav } from "@/app/components/SiteNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Capstone Water Quality Dashboard",
  description: "Realtime dashboard for water quality and fish health"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SiteNav />
        <main className="min-h-screen p-6 pt-24 sm:pt-28 font-sans">{children}</main>
      </body>
    </html>
  );
}

