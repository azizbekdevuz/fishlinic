"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Sync from localStorage on mount to avoid SSR/client mismatch
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(saved);
    setMounted(true);
  }, []);

  // Apply theme class and persist
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "light") root.classList.add("theme-light");
    else root.classList.remove("theme-light");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-1.5 rounded-full text-sm font-medium transition bg-slate-100 text-slate-700 hover:bg-slate-200"
      aria-label="Toggle theme"
    >
      <span suppressHydrationWarning>
        {mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
      </span>
    </button>
  );
}



