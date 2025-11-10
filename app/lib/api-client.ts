"use client";

import { useAuth } from "@/app/hooks/useAuth";
import type { AuthHeaders } from "@/app/types/auth";

/**
 * Get headers with bearer token for authenticated API calls
 * Use this in client components to make authenticated requests
 * @returns Typed AuthHeaders with optional Authorization header
 */
export function useApiHeaders(): AuthHeaders {
  const { accessToken } = useAuth();

  const headers: AuthHeaders = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Server-side function to get bearer token
 * Use this in server components or API routes
 * @returns Typed AuthHeaders with optional Authorization header
 */
export async function getApiHeaders(): Promise<AuthHeaders> {
  const { getBearerToken } = await import("./auth");
  const token = await getBearerToken();

  const headers: AuthHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Example: Make authenticated API call to Python backend
 * 
 * @example
 * ```typescript
 * const headers = useApiHeaders();
 * const response = await fetch('http://your-python-api/api/data', {
 *   headers,
 * });
 * ```
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getApiHeaders();
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}

