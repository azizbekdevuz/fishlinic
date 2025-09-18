"use client";

import { Status } from "@/app/lib/types";

export function Gauge({
  value,
  status,
  label = "meter (1 - 10)"
}: {
  value: number;
  status: Status;
  label?: string;
}) {
  const min = 1, max = 10;
  const ratio = (value - min) / (max - min);
  const angle = -90 + ratio * 180;
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

  const valueFill = status === "good" ? "#0F172A" : status === "average" ? "#CA8A04" : "#B91C1C";

  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        className="w-full rounded-3xl p-5"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(248,250,252,0.85))",
          boxShadow:
            "0 1px 0 rgba(15,23,42,0.04), 0 8px 30px rgba(2,6,23,0.06), inset 0 0 0 1px rgba(148,163,184,0.15)"
        }}
      >
        <svg width={size} height={size / 1.35} viewBox={`0 0 ${size} ${size / 1.35}`}>
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
            {value.toFixed(1)}
          </text>
          <text x={cx} y={cy + 70} fontSize={12} textAnchor="middle" fill="#64748B">
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}


