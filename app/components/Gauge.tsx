"use client";

import { Status } from "@/app/lib/types";

export function Gauge({
  value,
  status,
  label = "meter (1 - 10)",
  min = 1,
  max = 10,
  decimals = 1
}: {
  value: number;
  status: Status;
  label?: string;
  min?: number;
  max?: number;
  decimals?: number;
}) {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : 10;
  const span = Math.max(1e-6, safeMax - safeMin);
  const rawRatio = (value - safeMin) / span;
  const ratio = Math.max(0, Math.min(1, rawRatio));
  const angle = -90 + ratio * 180;
  // Responsive sizing: base on container width via viewBox; fixed geometry for math
  const size = 300;
  const cx = size / 2;
  const cy = size / 2 + 12;
  const r = 110;

  function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const a = ((angleInDegrees - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function arc(start: number, end: number) {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const large = end - start <= 180 ? "0" : "1";
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
  }

  const colors = {
    ring: status === "good" ? "#e9edf3" : status === "average" ? "#FACC15" : "#EF4444",
    glow: status === "good" ? "transparent" : status === "average" ? "rgba(250, 204, 21, .35)" : "rgba(239, 68, 68, .45)"
  };

  const valueFill = status === "good" ? "#E5E7EB" : status === "average" ? "#FDE68A" : "#FCA5A5";

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        className="w-full rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(248,250,252,0.12))",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.10), 0 10px 40px rgba(2,6,23,0.35), inset 0 0 0 1px rgba(255,255,255,0.12)",
          backdropFilter: "saturate(170%) blur(8px)"
        }}
      >
        <svg className="w-full h-auto" viewBox={`0 0 ${size} ${size / 1.35}`} preserveAspectRatio="xMidYMid meet">
          <path d={arc(-90, 90)} stroke="#EEF2F7" strokeWidth={18} fill="none" strokeLinecap="round" />
          <path
            d={arc(-90, 90)}
            stroke={colors.ring}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 10px ${colors.glow})` }}
          />
          {[...Array(9)].map((_, i) => {
            const a = -90 + (i * 180) / 8;
            const inner = polarToCartesian(cx, cy, r - 18, a);
            const outer = polarToCartesian(cx, cy, r - 4, a);
            return <line key={i} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#CBD5E1" strokeWidth={2} />;
          })}
          <g
            transform={`rotate(${angle} ${cx} ${cy})`}
            style={{ transition: "transform 600ms cubic-bezier(.22,1,.36,1)" }}
          >
            <rect x={cx - 2.5} y={cy - r + 10} width={5} height={r - 18} rx={2.5} fill="#0F172A" />
            <circle cx={cx} cy={cy - r + 12} r={5} fill="#0F172A" />
          </g>
          <circle cx={cx} cy={cy} r={9} fill="#0F172A" />
          <circle cx={cx} cy={cy} r={15} fill="white" opacity={0.85} />
          <circle cx={cx} cy={cy} r={6} fill="#0F172A" />
          <text x={cx} y={cy + 50} fontSize={34} fontWeight={800} textAnchor="middle" fill={valueFill}>
            {Number.isFinite(value) ? value.toFixed(decimals) : "–"}
          </text>
          <text x={cx} y={cy + 70} fontSize={12} textAnchor="middle" fill="#64748B">
            {label} {`(${safeMin} – ${safeMax})`}
          </text>
        </svg>
      </div>
    </div>
  );
}


