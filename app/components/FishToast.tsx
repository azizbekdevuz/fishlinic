"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { useToast, type ToastType } from "@/app/contexts/ToastContext";

const TOAST_CONFIG: Record<ToastType, { color: string; fishColor: string; icon: string }> = {
  error: {
    color: "rgb(239, 68, 68)", // red-500
    fishColor: "#ef4444",
    icon: "🐟",
  },
  success: {
    color: "rgb(16, 185, 129)", // emerald-500
    fishColor: "#10b981",
    icon: "🐠",
  },
  alert: {
    color: "rgb(245, 158, 11)", // amber-500
    fishColor: "#f59e0b",
    icon: "🐡",
  },
  warning: {
    color: "rgb(245, 158, 11)", // amber-500
    fishColor: "#f59e0b",
    icon: "🐡",
  },
  info: {
    color: "rgb(59, 130, 246)", // blue-500
    fishColor: "#3b82f6",
    icon: "🐋",
  },
  update: {
    color: "rgb(99, 102, 241)", // indigo-500
    fishColor: "#6366f1",
    icon: "🐬",
  },
};

export function FishToast() {
  const { toast, hideToast } = useToast();
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");
  const [fishPosition, setFishPosition] = useState({ 
    x: typeof window !== "undefined" ? -(window.innerWidth / 2) - 100 : -100, 
    y: 0 
  });
  const animationFrameRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!toast) {
      setPhase("entering");
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      setFishPosition({ x: -(viewportWidth / 2) - 100, y: 0 });
      return;
    }

    // Cleanup any existing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Phase 1: Swim in from left to center (0.8s)
    setPhase("entering");
    const startTime = Date.now();
    const duration = 800;

    const animateIn = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      // Start from left edge of screen, end at center (0)
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      const startX = -(viewportWidth / 2) - 100; // Start off-screen left
      const endX = 0; // Center position
      const x = startX + (endX - startX) * easeOutCubic;
      
      setFishPosition({ x, y: Math.sin(progress * Math.PI * 2) * 3 }); // Subtle vertical wave

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateIn);
      } else {
        setPhase("visible");
        setFishPosition({ x: 0, y: 0 }); // Center position
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateIn);

    // Phase 2: Float in place for toast duration
    timeoutRef.current = setTimeout(() => {
      setPhase("exiting");
      const exitStartTime = Date.now();
      const exitDuration = 800;

      const animateOut = () => {
        const elapsed = Date.now() - exitStartTime;
        const progress = Math.min(elapsed / exitDuration, 1);
        
        // Ease in cubic for smooth acceleration
        const easeInCubic = progress * progress * progress;
        const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
        const startX = 0; // Center position
        const endX = viewportWidth / 2 + 100; // Off-screen right
        const x = startX + (endX - startX) * easeInCubic;
        
        setFishPosition({ x, y: Math.sin((1 - progress) * Math.PI * 2) * 3 });

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateOut);
        } else {
          hideToast();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animateOut);
    }, toast.duration);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast, hideToast]);

  const handleDismiss = () => {
    if (phase === "exiting") return; // Already exiting
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setPhase("exiting");
    const exitStartTime = Date.now();
    const exitDuration = 800;

    const animateOut = () => {
      const elapsed = Date.now() - exitStartTime;
      const progress = Math.min(elapsed / exitDuration, 1);
      
      const easeInCubic = progress * progress * progress;
      const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
      const startX = 0; // Center position
      const endX = viewportWidth / 2 + 100; // Off-screen right
      const x = startX + (endX - startX) * easeInCubic;
      
      setFishPosition({ x, y: Math.sin((1 - progress) * Math.PI * 2) * 3 });

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animateOut);
      } else {
        hideToast();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateOut);
  };

  if (!toast) return null;

  const config = TOAST_CONFIG[toast.type];

  return (
    <div
      className="fixed top-6 left-1/2 z-[9999] pointer-events-none"
      style={{ 
        marginTop: "1rem",
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="relative pointer-events-auto"
        style={{
          transform: `translateX(${fishPosition.x}px) translateY(${fishPosition.y}px)`,
          transition: phase === "visible" ? "transform 0.1s ease-out" : "none",
        }}
      >
        {/* Fish SVG */}
        <div
          className="absolute -left-12 top-1/2 -translate-y-1/2"
          style={{
            filter: `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))`,
            animation: phase === "visible" ? "float 2s ease-in-out infinite" : "none",
          }}
        >
          <svg
            width="48"
            height="32"
            viewBox="0 0 48 32"
            style={{
              transform: phase === "entering" || phase === "exiting" ? "scaleX(1)" : "scaleX(1)",
            }}
          >
            {/* Fish body */}
            <ellipse
              cx="24"
              cy="16"
              rx="18"
              ry="12"
              fill={config.fishColor}
              opacity="0.9"
            />
            {/* Fish tail */}
            <path
              d="M 6 16 Q 2 12, 2 16 Q 2 20, 6 16"
              fill={config.fishColor}
              opacity="0.8"
            />
            {/* Fish eye */}
            <circle cx="28" cy="14" r="3" fill="white" />
            <circle cx="29" cy="13.5" r="1.5" fill="black" />
            {/* Fish fin top */}
            <ellipse
              cx="20"
              cy="8"
              rx="4"
              ry="6"
              fill={config.fishColor}
              opacity="0.7"
            />
            {/* Fish fin bottom */}
            <ellipse
              cx="20"
              cy="24"
              rx="4"
              ry="6"
              fill={config.fishColor}
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Speech Bubble with Glass Morphism */}
        <div
          className="relative"
          style={{
            background: "var(--surface-glass)",
            backdropFilter: "blur(8px) saturate(120%)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "0.75rem 1rem 0.75rem 3.5rem",
            minWidth: "200px",
            maxWidth: "400px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Speech bubble tail pointing to fish */}
          <div
            className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderRight: `12px solid var(--surface-glass)`,
              filter: "blur(0.5px)",
            }}
          />
          <div
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: "7px solid transparent",
              borderBottom: "7px solid transparent",
              borderRight: `11px solid var(--border)`,
            }}
          />

          {/* Message */}
          <p
            className="text-sm font-medium pr-6"
            style={{
              color: "rgb(var(--text-primary))",
              lineHeight: "1.5",
            }}
          >
            {toast.message}
          </p>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/10 transition-colors z-10"
            style={{ color: "rgb(var(--text-muted))" }}
            aria-label="Close toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-4px) rotate(2deg);
          }
          50% {
            transform: translateY(-6px) rotate(0deg);
          }
          75% {
            transform: translateY(-4px) rotate(-2deg);
          }
        }
      `}</style>
    </div>
  );
}

