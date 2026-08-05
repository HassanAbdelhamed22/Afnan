import {
  getSessionCookie,
} from "better-auth/cookies";
import type {
  NextRequest,
} from "next/server";
import {
  NextResponse,
} from "next/server";

export function proxy(
  request: NextRequest,
) {
  const sessionCookie =
    getSessionCookie(request, {
      cookiePrefix: "afnan",
    });

  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname.startsWith("/reset-password");

  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!sessionCookie && !isAuthRoute) {
    const loginUrl =
      new URL(
        "/login",
        request.url,
      );

    loginUrl.searchParams.set(
      "returnTo",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/cart",
    "/checkout",
    "/custom-request",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
