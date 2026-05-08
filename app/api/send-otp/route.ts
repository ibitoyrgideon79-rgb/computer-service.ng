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
    const { phoneNumber } = await req.json() as { phoneNumber: string };
    if (!phoneNumber) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
    }

    const identifier = normalizePhone(phoneNumber);
    const otp        = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt  = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.deleteMany({ where: { identifier } });
    await prisma.otpCode.create({ data: { identifier, code: otp, expiresAt } });

    const apiKey = process.env.TERMII_API_KEY;
    if (apiKey) {
      const termiiRes = await fetch("https://api.ng.termii.com/api/sms/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to:      identifier,
          from:    process.env.TERMII_SENDER_ID || "N-Alert",
          sms:     `Your ComputerService.ng verification code is: ${otp}. Valid for 10 minutes.`,
          type:    "plain",
          api_key: apiKey,
          channel: "dnd",
        }),
      });
      if (!termiiRes.ok) {
        console.error("Termii error:", await termiiRes.json().catch(() => ({})));
      }
    } else {
      console.log(`[DEV] SMS OTP for ${identifier}: ${otp}`);
    }

    return NextResponse.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("[POST /api/send-otp]", err);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
