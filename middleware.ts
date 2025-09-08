import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow the request to continue
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Define public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/api/webhooks",
          "/api/uploadthing",
          "/api/search",
          "/api/chat",
          "/api/thumbnail",
          "/api/thumbnails",
          "/api/viewer-count",
          "/api/stream",
          "/api/auth", // NextAuth routes
          "/auth", // Auth pages
          "/search",
          "/u", // Public profile pages
        ];

        // Check if the current path starts with any public route
        const isPublicRoute = publicRoutes.some(route => {
          if (route === "/u" && pathname.startsWith("/u/")) {
            // Allow public access to user profile pages like /u/username
            return !pathname.includes("/launch") && !pathname.includes("/settings");
          }
          return pathname.startsWith(route);
        });

        // For public routes, allow access regardless of auth status
        if (isPublicRoute) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
