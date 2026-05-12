import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    return NextResponse.json({ phoneNumber: settings?.phoneNumber ?? "+2348166027757" });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phoneNumber } = await req.json() as { phoneNumber: string };
    if (!phoneNumber || typeof phoneNumber !== "string") {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    const settings = await prisma.settings.upsert({
      where: { id: "singleton" },
      update: { phoneNumber: phoneNumber.trim() },
      create: { id: "singleton", phoneNumber: phoneNumber.trim() },
    });
    return NextResponse.json({ phoneNumber: settings.phoneNumber });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
