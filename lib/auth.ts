import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

export interface AdminPayload {
  id: string;
  email: string;
}

// Accepts a raw "Bearer <token>" header string (or null) — used in unit tests
// and older API call sites.
export function verifyAdminToken(authHeader: string | null): AdminPayload {
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Unauthorized");
  const token = authHeader.slice(7);
  return jwt.verify(token, Buffer.from(SECRET)) as AdminPayload;
}

// Accepts a full NextRequest — reads Bearer header or httpOnly cookie.
export function verifyAdminRequest(req: NextRequest): AdminPayload {
  const authHeader  = req.headers.get("authorization");
  const cookieToken = req.cookies.get("admin_token")?.value;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) throw new Error("Unauthorized");
  return jwt.verify(token, Buffer.from(SECRET)) as AdminPayload;
}
