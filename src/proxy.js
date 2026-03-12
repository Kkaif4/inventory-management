import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isLandingPage = request.nextUrl.pathname === "/";
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");
  const isStaticAsset = request.nextUrl.pathname.match(
    /\.(svg|png|jpg|jpeg|gif|webp)$/,
  );

  // Allow NextAuth API routes and static assets
  if (isApiAuthRoute || isStaticAsset) {
    return NextResponse.next();
  }

  if (isAuthPage || isLandingPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    let from = request.nextUrl.pathname;
    if (request.nextUrl.search) {
      from += request.nextUrl.search;
    }

    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
