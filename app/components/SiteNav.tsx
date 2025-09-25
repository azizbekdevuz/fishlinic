"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/our-team", label: "Our Team" },
  { href: "/contact", label: "Contact" },
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
          className="mt-4 mb-2 rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(248,250,252,0.10))",
            boxShadow: "0 1px 0 rgba(15,23,42,0.20), 0 10px 40px rgba(2,6,23,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
            backdropFilter: "saturate(170%) blur(10px)",
          }}
        >
          <Link href="/" className="text-sm font-semibold tracking-tight text-slate-100">
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
                    "px-3 py-1.5 rounded-full text-sm font-medium transition " +
                    (active ? "bg-sky-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200")
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
            className="sm:hidden px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700"
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
            className="sm:hidden mb-4 rounded-2xl px-4 py-3"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(248,250,252,0.10))",
              boxShadow: "0 1px 0 rgba(15,23,42,0.20), 0 10px 40px rgba(2,6,23,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
              backdropFilter: "saturate(170%) blur(10px)",
            }}
          >
            <div className="flex flex-col gap-2">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={
                      "px-3 py-2 rounded-xl text-sm font-medium text-center " +
                      (active ? "bg-sky-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200")
                    }
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


