import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string): string {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "234" + phone.slice(1);
  if (!phone.startsWith("234")) phone = "234" + phone;
  return "+" + phone;
}

export async function POST(req: NextRequest) {
  try {
    const { otp, phoneNumber, email } = await req.json() as {
      otp: string; phoneNumber?: string; email?: string;
    };

    if (!otp) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 });
    }
    if (!phoneNumber && !email) {
      return NextResponse.json({ message: "Phone number or email is required" }, { status: 400 });
    }

    const identifier = email
      ? email.toLowerCase().trim()
      : normalizePhone(phoneNumber!);

    const stored = await prisma.otpCode.findFirst({
      where:   { identifier },
      orderBy: { createdAt: "desc" },
    });

    if (!stored) {
      return NextResponse.json({ message: "No verification code found. Please request a new one." }, { status: 400 });
    }
    if (new Date() > stored.expiresAt) {
      await prisma.otpCode.deleteMany({ where: { identifier } });
      return NextResponse.json({ message: "Code has expired. Please request a new one." }, { status: 400 });
    }
    if (stored.code !== otp) {
      return NextResponse.json({ message: "Invalid code. Please try again." }, { status: 400 });
    }

    await prisma.otpCode.deleteMany({ where: { identifier } });

    const orders = await prisma.order.findMany({
      where:   { OR: [{ phoneNumber: identifier }, { email: identifier }] },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ message: "Verified successfully", orders });
  } catch (err) {
    console.error("[POST /api/verify-otp]", err);
    return NextResponse.json({ message: "Failed to verify code" }, { status: 500 });
  }
}
