"use client";

import { useState } from "react";

export function SafeImage({ src, alt, className, fallback = "/next.svg" }: { src: string; alt: string; className?: string; fallback?: string; }) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
      loading="lazy"
      decoding="async"
    />
  );
}


