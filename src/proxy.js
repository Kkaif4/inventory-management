import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// In-memory rate limiter for login endpoint (per IP, max 10 attempts / 15 min)
const loginAttempts = new Map();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isLoginRateLimited(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isStaticAsset = pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/);
  const isAuthPage = pathname.startsWith("/login");
  const isLandingPage = pathname === "/";

  // Allow static assets through immediately
  if (isStaticAsset) {
    return NextResponse.next();
  }

  // Rate-limit login endpoint
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const ip = getClientIp(request);
    if (isLoginRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many login attempts. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Allow NextAuth API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;

  if (isAuthPage || isLandingPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    let from = pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url),
    );
  }

  // Admin-only routes require ADMIN role
  if (pathname.startsWith("/dashboard/admin")) {
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/dashboard?error=forbidden", request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
