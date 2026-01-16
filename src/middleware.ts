import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  if (isApiRoute) return NextResponse.next();

  if (!session?.user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (session && session.session.expiresAt < new Date()) {
    await auth.api.signOut({
      headers: await headers(),
    });
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
