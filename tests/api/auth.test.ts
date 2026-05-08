import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Prisma before importing the route
vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));

import { prisma } from "../__mocks__/prisma";
import { POST } from "@/app/api/auth/login/route";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const HASHED_PASS = bcrypt.hashSync("password123", 10);

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeReq({ password: "abc" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/required/i);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(makeReq({ email: "admin@test.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when admin not found", async () => {
    (prisma.admin.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await POST(makeReq({ email: "noone@test.com", password: "pass" }));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/invalid/i);
  });

  it("returns 401 when password is wrong", async () => {
    (prisma.admin.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "1", email: "admin@test.com", password: HASHED_PASS,
    });
    const res = await POST(makeReq({ email: "admin@test.com", password: "wrongpassword" }));
    expect(res.status).toBe(401);
  });

  it("returns token + admin on correct credentials", async () => {
    (prisma.admin.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "abc123", email: "admin@test.com", password: HASHED_PASS,
    });
    const res = await POST(makeReq({ email: "admin@test.com", password: "password123" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.admin.email).toBe("admin@test.com");
    // token should be a valid JWT
    const decoded = jwt.verify(body.token, Buffer.from("test-secret-key")) as { email: string };
    expect(decoded.email).toBe("admin@test.com");
  });

  it("normalises email to lowercase before lookup", async () => {
    (prisma.admin.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    await POST(makeReq({ email: "ADMIN@TEST.COM", password: "x" }));
    expect(prisma.admin.findUnique).toHaveBeenCalledWith({
      where: { email: "admin@test.com" },
    });
  });
});
