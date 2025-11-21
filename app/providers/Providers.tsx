"use client";

import { ReactNode } from "react";
import { SessionProvider } from "./SessionProvider";
import { ToastProvider } from "@/app/contexts/ToastContext";
import { SiteNav } from "@/app/components/SiteNav";
import { FishToast } from "@/app/components/FishToast";
import { ThemeProvider } from "next-themes";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ToastProvider>
          <SiteNav />
          <main className="min-h-screen p-6 pt-24 sm:pt-28 font-sans">{children}</main>
          <FishToast />
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

