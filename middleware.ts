import React from "react";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./supabase/middleware";

const MAINTENANCE_ENABLED = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
const MAINTENANCE_BYPASS_COOKIE = "maintenance_bypass";
const MAINTENANCE_PATHS = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Flip NEXT_PUBLIC_MAINTENANCE_MODE=true to route auth pages to /maintenance; set maintenance_bypass=1 cookie to skip.
  const maintenanceBypass =
    request.cookies.get(MAINTENANCE_BYPASS_COOKIE)?.value === "1";
  const maintenanceActive = MAINTENANCE_ENABLED && !maintenanceBypass;

  if (
    maintenanceActive &&
    pathname !== "/maintenance" &&
    MAINTENANCE_PATHS.some((path) => pathname.startsWith(path))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
