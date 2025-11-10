/**
 * Global authentication types
 * Reusable across the application following DRY principles
 */

import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

/**
 * Extended User type with required fields
 * Can be extended when database is added
 * Note: This matches the User interface declared in next-auth.d.ts
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * Extended Session type with access token
 * Used for API authentication with Python backend
 * Note: This matches the Session interface declared in next-auth.d.ts
 */
export interface AuthSession {
  user: AuthUser;
  expires: string;
  accessToken?: string;
  verifiedAt?: string | null; // ISO date string when user was verified
}

/**
 * Extended JWT type with user info and access token
 * Note: This matches the JWT interface declared in next-auth.d.ts
 */
export interface AuthJWT {
  id: string;
  email: string;
  name?: string | null;
  accessToken?: string;
  verifiedAt?: string | null; // ISO date string when user was verified
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * User data stored in database/memory
 * This interface can be extended when database schema is defined
 */
export interface UserData {
  id: string;
  email: string;
  password: string; // Hashed password
  name?: string;
  createdAt: Date;
  // Add more fields when database is integrated:
  // updatedAt?: Date;
  // role?: string;
  // emailVerified?: boolean;
}

/**
 * Credentials for authentication
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * API request headers with authentication
 */
export interface AuthHeaders {
  "Content-Type": string;
  Authorization?: string;
}

/**
 * Type guard to check if session has access token
 */
export function hasAccessToken(
  session: Session | null | undefined
): session is AuthSession {
  return (
    session !== null &&
    session !== undefined &&
    "accessToken" in session &&
    typeof (session as AuthSession).accessToken === "string"
  );
}

/**
 * Type guard to check if user is AuthUser
 */
export function isAuthUser(user: User | null | undefined): user is AuthUser {
  return (
    user !== null &&
    user !== undefined &&
    "id" in user &&
    typeof user.id === "string" &&
    typeof user.email === "string"
  );
}

