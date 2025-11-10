import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Server-side toast helper
 * Since we can't use React context on server, we use URL params to trigger toasts
 * This is called before redirecting to show a toast message
 */
export function toastServer(type: "error" | "success" | "alert" | "info" | "update" | "warning", message: string, redirectTo?: string) {
  const params = new URLSearchParams({
    toast: type,
    message: encodeURIComponent(message),
  });

  if (redirectTo) {
    redirect(`${redirectTo}?${params.toString()}`);
  }
}

/**
 * Check if there's a toast in URL params and return it
 * Use this in client components to read and display server-initiated toasts
 */
export function getToastFromUrl(): { type: string; message: string } | null {
  if (typeof window === "undefined") return null;
  
  const params = new URLSearchParams(window.location.search);
  const toast = params.get("toast");
  const message = params.get("message");

  if (toast && message) {
    // Clean URL
    const newUrl = window.location.pathname;
    window.history.replaceState({}, "", newUrl);
    
    return {
      type: toast,
      message: decodeURIComponent(message),
    };
  }

  return null;
}

