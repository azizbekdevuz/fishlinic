import "next-auth";
import "next-auth/jwt";
import type { AuthSession, AuthUser, AuthJWT } from "@/app/types/auth";

declare module "next-auth" {
  interface Session extends AuthSession {}

  interface User extends AuthUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends AuthJWT {}
}

