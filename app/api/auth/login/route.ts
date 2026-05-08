import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (email.length > 254 || password.length > 128 || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const secret  = Buffer.from(process.env.JWT_SECRET || "default_secret");
    const expires = (process.env.JWT_EXPIRES_IN || "7d") as string;
    const token   = jwt.sign(
      { id: admin.id, email: admin.email },
      secret,
      { expiresIn: expires } as SignOptions
    );

    const response = NextResponse.json({ token, admin: { id: admin.id, email: admin.email } });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge:   7 * 24 * 60 * 60,
      path:     "/",
    });
    return response;
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
