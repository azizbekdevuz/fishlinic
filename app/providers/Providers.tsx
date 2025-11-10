"use client";

import { ReactNode } from "react";
import { SessionProvider } from "./SessionProvider";
import { SiteNav } from "@/app/components/SiteNav";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SiteNav />
      <main className="min-h-screen p-6 pt-24 sm:pt-28 font-sans">{children}</main>
    </SessionProvider>
  );
}

