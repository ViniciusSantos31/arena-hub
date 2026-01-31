import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

const PUBLIC_ROUTES = ["/"];
const AUTH_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => request.nextUrl.pathname === route,
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  const sessionIsValid =
    session &&
    session &&
    session.user &&
    session.session.expiresAt > new Date();

  if (isApiRoute) return NextResponse.next();

  if (!sessionIsValid && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(
      new URL(
        "/auth/sign-in?redirectTo=" +
          encodeURIComponent(request.nextUrl.pathname),
        request.url,
      ),
    );
  }

  if (sessionIsValid && isAuthRoute) {
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
