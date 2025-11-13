/**
 * NextAuth Callback Types
 * Type definitions for NextAuth callbacks to ensure type safety
 */

import type { User, Account, Profile } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import type { AuthUser } from "@/app/types/auth";

/**
 * SignIn callback parameters
 */
export interface SignInCallbackParams {
  user: User;
  account: Account | null;
  profile?: Profile;
  email?: {
    verificationRequest?: boolean;
  };
  credentials?: Record<string, unknown>;
}

/**
 * JWT callback parameters
 */
export interface JWTCallbackParams {
  token: JWT;
  user?: User;
  account?: Account | null;
  profile?: Profile;
  isNewUser?: boolean;
  trigger?: "signIn" | "signUp" | "update";
}

/**
 * Session callback parameters
 */
export interface SessionCallbackParams {
  session: Session;
  token: JWT;
  user?: User;
  trigger?: "update";
  newSession?: unknown;
}

/**
 * Type guard to check if user is AuthUser
 */
export function isAuthUser(user: User | undefined): user is AuthUser {
  return (
    user !== undefined &&
    "id" in user &&
    typeof user.id === "string" &&
    "email" in user &&
    typeof user.email === "string"
  );
}

/**
 * Type guard to check if account is OAuth account
 */
export function isOAuthAccount(account: Account | null | undefined): account is Account & { provider: "google" | "kakao" } {
  return (
    account !== null &&
    account !== undefined &&
    (account.provider === "google" || account.provider === "kakao")
  );
}

