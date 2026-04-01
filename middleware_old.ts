import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./src/lib/auth";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(new URL("/auth", request.url));
    try {
      const payload = await decrypt(session);
      if (payload.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
    } catch (e) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith("/valuation")) {
    if (!session) return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/valuation/:path*"],
};
