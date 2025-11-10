"use client";

import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { AuthSession, AuthUser } from "@/app/types/auth";
import { hasAccessToken, isAuthUser } from "@/app/types/auth";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  
  // Type-safe session and user extraction
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

  const signOut = useCallback(async () => {
    await nextAuthSignOut({ 
      redirect: false,
      callbackUrl: "/" 
    });
    router.push("/");
    router.refresh();
  }, [router]);

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    accessToken,
    signOut,
  };
}

