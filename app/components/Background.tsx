"use client";

import { useEffect, useRef } from "react";

export function Background() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let x = 0, y = 0, nx = 0, ny = 0;
    const onMove = (e: PointerEvent) => {
      nx = e.clientX;
      ny = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      x += (nx - x) * 0.18;
      y += (ny - y) * 0.18;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      raf = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="site-bg" ref={ref}>
      <div className="site-bg__gradient" />
      <div className="site-bg__grid" />
      <div className="site-bg__pointer" />
    </div>
  );
}


