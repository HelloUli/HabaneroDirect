import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth"];
const ownerOnlyPaths = ["/menu", "/store", "/reports"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (req.auth.user as Record<string, unknown>)?.role as string;
  const isOwnerOnly = ownerOnlyPaths.some((p) => pathname.startsWith(p));
  if (isOwnerOnly && role !== "owner") {
    return NextResponse.redirect(new URL("/orders", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
