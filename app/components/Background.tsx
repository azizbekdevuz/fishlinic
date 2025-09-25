"use client";

import { useEffect, useRef } from "react";

export function Background() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let x = 0, y = 0, nx = 0, ny = 0;
    let t = 0;
    let animHandle = 0;
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
    // Low-cost autonomous background motion (independent of pointer)
    const loop = () => {
      t += 0.006; // slow tempo
      // Two simple sin waves for subtle drift
      const driftX = Math.sin(t) * 40;
      const driftY = Math.cos(t * 0.8) * 30;
      el.style.setProperty("--dx", `${driftX}px`);
      el.style.setProperty("--dy", `${driftY}px`);
      animHandle = requestAnimationFrame(loop);
    };
    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) animHandle = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      if (animHandle) cancelAnimationFrame(animHandle);
    };
  }, []);

  return (
    <div aria-hidden className="site-bg" ref={ref}>
      <div className="site-bg__gradient" />
      <div className="site-bg__grid" />
      <div className="site-bg__pointer" />
      <div className="site-bg__particles" />
    </div>
  );
}


