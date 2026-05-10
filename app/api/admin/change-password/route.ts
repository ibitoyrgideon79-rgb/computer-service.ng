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
    const { currentPassword, newPassword } = await req.json() as {
      currentPassword: string;
      newPassword:     string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, admin.password);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({ where: { id: admin.id }, data: { password: hashed } });

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("[POST /api/admin/change-password]", err);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
