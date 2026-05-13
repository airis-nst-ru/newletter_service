import { NextRequest, NextResponse } from "next/server";
import { isAccessTokenActive } from "@/lib/auth/access-token";
import { AUTH_COOKIES, AUTH_ROUTES } from "@/lib/auth/constants";

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const isAuthenticated = isAccessTokenActive(accessToken);

  if (
    (pathname.startsWith(AUTH_ROUTES.dashboard) ||
      pathname.startsWith(AUTH_ROUTES.editor)) &&
    !isAuthenticated
  ) {
    const response = redirectTo(request, AUTH_ROUTES.login);
    response.cookies.delete(AUTH_COOKIES.accessToken);
    return response;
  }

  if (
    (pathname === AUTH_ROUTES.home || pathname === AUTH_ROUTES.login) &&
    isAuthenticated
  ) {
    return redirectTo(request, AUTH_ROUTES.dashboard);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/editor/:path*"],
};
