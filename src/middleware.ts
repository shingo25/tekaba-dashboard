import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "tekaba-auth";

// Protected routes that require authentication
const protectedRoutes = ["/", "/history", "/stats"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Allow access to login page and API routes
  if (pathname === "/login" || pathname.startsWith("/api/")) {
    // If already authenticated and trying to access login, redirect to home
    if (pathname === "/login") {
      const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
      if (authCookie?.value === "authenticated") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (isProtectedRoute) {
    const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

    if (authCookie?.value !== "authenticated") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
