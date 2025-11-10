import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { AuthSession, AuthUser } from "@/app/types/auth";
import { hasAccessToken, isAuthUser } from "@/app/types/auth";

/**
 * Get the current session on the server side
 * Returns typed AuthSession with access token
 */
export async function getSession(): Promise<AuthSession | null> {
  const session = await getServerSession(authOptions);
  return hasAccessToken(session) ? session : null;
}

/**
 * Get the current user from session
 * Returns typed AuthUser
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session) return null;
  
  const user = session.user;
  return isAuthUser(user) ? user : null;
}

/**
 * Get bearer token from session for API calls
 * Returns the access token string or null
 */
export async function getBearerToken(): Promise<string | null> {
  const session = await getSession();
  return session?.accessToken ?? null;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session;
}

