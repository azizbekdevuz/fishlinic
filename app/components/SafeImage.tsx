"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string; // applied to wrapper; can include width/height utilities
  fallback?: string;
  priority?: boolean;
};

export function SafeImage({ src, alt, className, fallback = "/next.svg", priority }: Props) {
  const [current, setCurrent] = useState(src);
  return (
    <div className={(className ? className + " " : "") + "relative overflow-hidden"}>
      <Image
        src={current}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 33vw"
        onError={() => {
          if (current !== fallback) setCurrent(fallback);
        }}
        priority={priority}
      />
    </div>
  );
}