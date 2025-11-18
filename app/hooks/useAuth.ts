"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useCallback, useMemo } from "react";
import type { AuthSession, AuthUser } from "@/app/types/auth";
import { hasAccessToken, isAuthUser } from "@/app/types/auth";

export function useAuth() {
  const { data: session, status, update } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  
  const authSession = useMemo<AuthSession | null>(() => {
    return hasAccessToken(session) ? session : null;
  }, [session]);

  const user = useMemo<AuthUser | null>(() => {
    if (!authSession) return null;
    return isAuthUser(authSession.user) ? authSession.user : null;
  }, [authSession]);

  const accessToken = useMemo<string | null>(() => {
    return authSession?.accessToken ?? null;
  }, [authSession]);

  const isVerified = useMemo<boolean>(() => {
    return authSession?.verifiedAt !== null && authSession?.verifiedAt !== undefined;
  }, [authSession]);

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ 
      redirect: false,
      callbackUrl: "/" 
    });
    window.location.href = "/";
  }, []);

  const refreshSession = useCallback(async () => {
    await update();
  }, [update]);

  return {
    user,
    session: authSession,
    isLoading,
    isAuthenticated,
    accessToken,
    isVerified,
    signOut,
    refreshSession,
  };
}

