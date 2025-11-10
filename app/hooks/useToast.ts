"use client";

import { useToast as useToastContext } from "@/app/contexts/ToastContext";
import type { ToastType } from "@/app/contexts/ToastContext";

/**
 * Easy-to-use toast hook
 * 
 * @example
 * const toast = useToast();
 * toast.error("Something went wrong!");
 * toast.success("Data saved successfully!");
 * toast.info("New update available", 5000);
 */
export function useToast() {
  const { showToast } = useToastContext();

  return {
    error: (message: string, duration?: number) => showToast("error", message, duration),
    success: (message: string, duration?: number) => showToast("success", message, duration),
    alert: (message: string, duration?: number) => showToast("alert", message, duration),
    warning: (message: string, duration?: number) => showToast("warning", message, duration),
    info: (message: string, duration?: number) => showToast("info", message, duration),
    update: (message: string, duration?: number) => showToast("update", message, duration),
    // Generic method
    show: (type: ToastType, message: string, duration?: number) => showToast(type, message, duration),
  };
}

