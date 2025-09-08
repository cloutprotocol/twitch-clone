import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/webhooks(.*)",
    "/api/uploadthing",
    "/api/search",
    "/api/chat(.*)",
    "/api/thumbnail(.*)",
    "/api/thumbnails(.*)",
    "/api/viewer-count(.*)",
    "/api/stream(.*)",
    "/:username",
    "/u/(.*)",
    "/search",
    "/sign-in(.*)",
    "/sign-up(.*)",
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
