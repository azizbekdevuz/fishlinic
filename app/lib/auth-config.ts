import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { AuthJWT, AuthSession, AuthUser } from "@/app/types/auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import type { KakaoProfile, OAuthUserProfile } from "@/app/lib/types/oauth";
import { getOAuthConfig, getAppEnvironment } from "@/app/lib/types/environment";
import { isOAuthAccount } from "@/app/lib/types/nextauth-callbacks";

// Helper to hash password (simple implementation - use bcrypt in production)
function hashPassword(password: string): string {
  // Simple hash for demo - REPLACE with bcrypt in production
  return Buffer.from(password).toString("base64");
}

// Helper to verify password
function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed;
}

// Custom Kakao OAuth Provider
// NextAuth v4 compatible custom provider with proper types
function createKakaoProvider(clientId: string, clientSecret: string) {
  // Strip quotes if present (some .env files have quotes)
  const cleanClientId = clientId?.replace(/^["']|["']$/g, "") || "";
  const cleanClientSecret = clientSecret?.replace(/^["']|["']$/g, "") || "";

  // Validate that credentials are provided
  if (!cleanClientId || !cleanClientSecret) {
    console.error("Kakao OAuth credentials are missing. Please set KAKAO_CLIENT_ID and KAKAO_CLIENT_SECRET in your environment variables.");
    console.error(`ClientId: ${cleanClientId ? "present" : "missing"}, ClientSecret: ${cleanClientSecret ? "present" : "missing"}`);
    return null;
  }


  return {
    id: "kakao",
    name: "Kakao",
    type: "oauth" as const,
    clientId: cleanClientId,
    clientSecret: cleanClientSecret,
    wellKnown: undefined, // Not using OpenID Connect
    authorization: {
      url: "https://kauth.kakao.com/oauth/authorize",
      params: {
        scope: "profile_nickname account_email",
        response_type: "code",
      },
    },
    token: {
      url: "https://kauth.kakao.com/oauth/token",
      async request({
        provider,
        params,
      }: {
        provider: { clientId?: string; clientSecret?: string; token?: { url?: string }; id?: string };
        params: { code?: string; redirect_uri?: string };
        checks?: unknown;
        client?: { callbackUrl?: string };
      }) {
        // Construct the redirect URI - must match exactly what's registered in Kakao console
        // Use the redirect_uri from params (provided by NextAuth) or construct it
        const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        // Ensure no trailing slash and exact match with Kakao console settings
        const baseUrl = appUrl.replace(/\/$/, "");
        const redirectUri = params.redirect_uri || `${baseUrl}/api/auth/callback/kakao`;
        
        // Custom token request to ensure clientId and clientSecret are included
        const response = await fetch(provider.token?.url as string, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            client_id: provider.clientId as string,
            client_secret: provider.clientSecret as string,
            code: params.code as string,
            redirect_uri: redirectUri,
          }),
        });
        const tokens = await response.json();
        if (!response.ok) {
          throw new Error(`Kakao token request failed: ${JSON.stringify(tokens)}`);
        }
        // Ensure tokens object has the expected structure
        if (!tokens || typeof tokens !== "object") {
          throw new Error("Invalid token response from Kakao");
        }
        return { tokens };
      },
    },
    userinfo: {
      url: "https://kapi.kakao.com/v2/user/me",
      async request({ tokens, provider }: { tokens: { access_token?: string }; provider: { userinfo?: { url?: string } } }) {
        // Validate access token
        if (!tokens?.access_token) {
          throw new Error("Missing access token for Kakao userinfo request");
        }
        
        // Kakao requires Bearer token in Authorization header
        const response = await fetch(provider.userinfo?.url as string, {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
          },
        });
        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(`Kakao userinfo request failed: ${errorText}`);
        }
        return await response.json();
      },
    },
    profile(profile: unknown): OAuthUserProfile {
      const kakaoProfile = profile as KakaoProfile;
      return {
        id: kakaoProfile.id.toString(),
        email: kakaoProfile.kakao_account?.email || null,
        name: kakaoProfile.kakao_account?.profile?.nickname || 
              kakaoProfile.kakao_account?.email?.split("@")[0] || 
              "Kakao User",
        image: kakaoProfile.kakao_account?.profile?.profile_image_url || null,
      };
    },
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user in database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email.toLowerCase(),
          },
        });

        // If user exists, verify password (sign in)
        if (user) {
          // OAuth users don't have passwords
          if (!user.password) {
            throw new Error("InvalidPassword");
          }
          if (verifyPassword(credentials.password, user.password)) {
            // Password correct - sign in successful
            const authUser: AuthUser = {
              id: user.id,
              email: user.email,
              name: user.name || user.email.split("@")[0],
            };
            return authUser;
          } else {
            // User exists but wrong password
            throw new Error("InvalidPassword");
          }
        }

        // User doesn't exist - throw error instead of auto sign-up
        throw new Error("UserNotFound");
      },
    }),
    GoogleProvider({
      clientId: getOAuthConfig().google.clientId,
      clientSecret: getOAuthConfig().google.clientSecret,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
    ...(() => {
      const kakaoProvider = createKakaoProvider(
        getOAuthConfig().kakao.clientId,
        getOAuthConfig().kakao.clientSecret
      );
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
      return kakaoProvider ? [kakaoProvider as any] : [];
    })(), // Only add provider if credentials are configured
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle OAuth sign-in (Google/Kakao)
      if (isOAuthAccount(account)) {
        if (!user.email) {
          return false; // Reject if no email
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });

        if (existingUser) {
          // User exists - link OAuth account (update user info if needed)
          if (!existingUser.name && user.name) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { name: user.name },
            });
          }
          // Update user ID in token to match existing user
          user.id = existingUser.id;
        } else {
          // Create new user for OAuth
          // Note: After running `prisma generate`, password can be omitted
          // For now, using empty string as workaround until Prisma client is regenerated
          const newUser = await prisma.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name || user.email.split("@")[0],
              password: "", // OAuth users don't need password (will be nullable after migration)
            },
          });
          user.id = newUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user }): Promise<JWT> {
      // Initial sign in
      if (user && "id" in user && typeof user.id === "string") {
        // Fetch user from DB to get verification status and other fields
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            verifiedAt: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
          }
        });
        
        const authToken: AuthJWT = {
          ...token,
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? null,
          // Generate bearer token for API use
          accessToken: `bearer_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
          verifiedAt: dbUser?.verifiedAt?.toISOString() ?? null,
        };
        return authToken as JWT;
      }
      
      // Refresh user data on token refresh (every request)
      if (token && "id" in token && typeof token.id === "string") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { 
            verifiedAt: true,
            avatarUrl: true,
            name: true,
            updatedAt: true
          }
        });
        return {
          ...token,
          name: dbUser?.name ?? token.name,
          verifiedAt: dbUser?.verifiedAt?.toISOString() ?? null,
        } as JWT;
      }
      
      return token as JWT;
    },
    async session({ session, token }): Promise<Session> {
      if (token && "id" in token && typeof token.id === "string") {
        // Fetch latest user data for session
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { 
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            verifiedAt: true,
            name: true
          }
        });

        const authSession: AuthSession = {
          ...session,
          user: {
            id: token.id,
            email: token.email ?? "",
            name: dbUser?.name ?? token.name ?? null,
            image: dbUser?.avatarUrl ?? null,
            avatarUrl: dbUser?.avatarUrl ?? null,
            verifiedAt: dbUser?.verifiedAt?.toISOString() ?? null,
            createdAt: dbUser?.createdAt?.toISOString() ?? null,
            updatedAt: dbUser?.updatedAt?.toISOString() ?? null,
          },
          accessToken: typeof token.accessToken === "string" ? token.accessToken : undefined,
          verifiedAt: dbUser?.verifiedAt?.toISOString() ?? null,
        };
        return authSession as Session;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: getAppEnvironment().nextAuthSecret,
};

