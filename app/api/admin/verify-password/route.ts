import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let payload;
  try {
    payload = verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await req.json() as { password: string };
    if (!password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[POST /api/admin/verify-password]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
