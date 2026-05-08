import { NextRequest, NextResponse } from "next/server";

function isWellFormedJwt(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    // base64url → base64 with padding
    const toBase64 = (s: string) => {
      const b = s.replace(/-/g, "+").replace(/_/g, "/");
      const mod = b.length % 4;
      return mod === 2 ? b + "==" : mod === 3 ? b + "=" : b;
    };
    parts.forEach((p) => atob(toBase64(p)));
    const payload = JSON.parse(atob(toBase64(parts[1])));
    if (typeof payload.exp !== "number") return false;
    if (payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login")   return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;

  // Reject missing or structurally invalid / expired tokens immediately
  if (!token || !isWellFormedJwt(token)) {
    const loginUrl = new URL("/admin/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    // Clear the bad cookie so the browser doesn't keep sending it
    res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
