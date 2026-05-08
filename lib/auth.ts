import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

export interface AdminPayload {
  id: string;
  email: string;
}

export function verifyAdminToken(authHeader: string | null): AdminPayload {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.slice(7);
  return jwt.verify(token, Buffer.from(SECRET)) as AdminPayload;
}
