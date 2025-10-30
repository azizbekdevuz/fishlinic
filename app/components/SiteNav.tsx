"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className="mt-4 mb-2 rounded-2xl px-4 py-3 flex items-center justify-between border bg-[color:var(--card)]"
        >
          <Link href="/dashboard" className="text-sm font-semibold tracking-tight hx hx-accent">
            Smart Aquaculture
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    "btn " + (active ? "btn-primary" : "")
                  }
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile button */}
          <button
            className="sm:hidden btn"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            Menu
          </button>
        </div>

        {/* Mobile panel */}
        {open && (
          <div
            className="sm:hidden mb-4 rounded-2xl px-4 py-3 border bg-[color:var(--card)]"
          >
            <div className="flex flex-col gap-2">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={"btn " + (active ? "btn-primary" : "")}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <div className="flex justify-center mt-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


