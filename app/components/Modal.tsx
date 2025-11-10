"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains("theme-light"));
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: isLight ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)"
      }}
      onClick={onClose}
    >
      <div 
        className={`${sizeClasses[size]} w-full animate-fade-in`}
        style={{
          background: isLight ? "rgb(var(--surface))" : "var(--surface-glass)",
          backdropFilter: isLight ? "none" : "blur(8px) saturate(120%)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "var(--space-lg)",
          boxShadow: isLight ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" : "none"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-xl font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm p-2"
            aria-label="Close modal"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

