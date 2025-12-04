import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { AuthJWT } from "@/app/types/auth";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as AuthJWT | null;
    const pathname = req.nextUrl.pathname;

    // If user is authenticated and trying to access sign-in, redirect appropriately
    if (token && pathname.startsWith("/auth/signin")) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      const isVerified = token.verifiedAt !== null && token.verifiedAt !== undefined;
      
      // If not verified, redirect to verify page
      if (!isVerified) {
        return NextResponse.redirect(new URL("/verify", req.url));
      }
      
      // If verified, redirect to dashboard or callbackUrl
      const redirectUrl = callbackUrl && callbackUrl.startsWith("/") 
        ? callbackUrl 
        : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // Check verification for protected routes
    const protectedPaths = ["/dashboard", "/vassistant"];
    const isProtectedPath = protectedPaths.some((path) =>
      pathname.startsWith(path)
    );

    if (isProtectedPath && token) {
      // Check if user is verified
      const isVerified = token.verifiedAt !== null && token.verifiedAt !== undefined;
      
      if (!isVerified) {
        // Redirect to verify page with toast message
        const verifyUrl = new URL("/verify", req.url);
        verifyUrl.searchParams.set("toast", "error");
        verifyUrl.searchParams.set("message", encodeURIComponent("Account verification required to access this page"));
        return NextResponse.redirect(verifyUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Protect dashboard and vassistant routes
        const protectedPaths = ["/dashboard", "/vassistant"];
        const isProtectedPath = protectedPaths.some((path) =>
          pathname.startsWith(path)
        );

        // If accessing protected path, require authentication
        if (isProtectedPath) {
          return !!token;
        }

        // Allow access to public paths (including auth pages and verify page)
        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

