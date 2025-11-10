import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If user is authenticated and trying to access sign-in, redirect to dashboard
    if (token && pathname.startsWith("/auth/signin")) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      const redirectUrl = callbackUrl && callbackUrl.startsWith("/") 
        ? callbackUrl 
        : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
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

        // Allow access to public paths (including auth pages)
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

