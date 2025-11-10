import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthJWT, AuthSession, UserData, AuthUser } from "@/app/types/auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

// In-memory user storage (replace with database)
const users: Map<string, UserData> = new Map();

// Helper to hash password (simple implementation - use bcrypt in production)
function hashPassword(password: string): string {
  // Simple hash for demo - REPLACE with bcrypt in production
  return Buffer.from(password).toString("base64");
}

// Helper to verify password
function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed;
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
          return null;
        }

        const user = Array.from(users.values()).find(
          (u) => u.email === credentials.email
        );

        // Sign in: verify password
        if (user && verifyPassword(credentials.password, user.password)) {
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
          };
          return authUser;
        }

        // Sign up: create new user if email doesn't exist
        if (!user) {
          const newUser: UserData = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: credentials.email,
            password: hashPassword(credentials.password),
            name: credentials.email.split("@")[0],
            createdAt: new Date(),
          };
          users.set(newUser.id, newUser);
          const authUser: AuthUser = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
          return authUser;
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      // Initial sign in
      if (user && "id" in user && typeof user.id === "string") {
        const authToken: AuthJWT = {
          ...token,
          id: user.id,
          email: user.email ?? "",
          name: user.name ?? null,
          // Generate bearer token for API use
          accessToken: `bearer_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`,
        };
        return authToken as JWT;
      }
      return token as JWT;
    },
    async session({ session, token }): Promise<Session> {
      if (token && "id" in token && typeof token.id === "string") {
        const authSession: AuthSession = {
          ...session,
          user: {
            id: token.id,
            email: token.email ?? "",
            name: token.name ?? null,
          },
          accessToken: typeof token.accessToken === "string" ? token.accessToken : undefined,
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
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

