import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string): string {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "234" + phone.slice(1);
  if (!phone.startsWith("234")) phone = "234" + phone;
  return "+" + phone;
}

async function trySendSms(to: string, sms: string, apiKey: string, channel: string): Promise<boolean> {
  try {
    const res  = await fetch("https://api.ng.termii.com/api/sms/send", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        from:    process.env.TERMII_SENDER_ID || "N-Alert",
        sms,
        type:    "plain",
        api_key: apiKey,
        channel,
      }),
    });
    const json = await res.json().catch(() => ({}) as Record<string, unknown>);
    if (res.ok && (json as { message?: string }).message !== "error") return true;
    console.error(`Termii [${channel}] failed:`, json);
    return false;
  } catch (err) {
    console.error(`Termii [${channel}] exception:`, err);
    return false;
  }
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

    const apiKey  = process.env.TERMII_API_KEY;
    const message = `Your ComputerService.ng verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;

    if (apiKey) {
      // Try generic first (works for non-DND numbers), fall back to dnd channel
      const sent = await trySendSms(identifier, message, apiKey, "generic")
               || await trySendSms(identifier, message, apiKey, "dnd");
      if (!sent) console.error("All Termii channels failed for", identifier);
    } else {
      console.log(`[DEV] SMS OTP for ${identifier}: ${otp}`);
    }

    return NextResponse.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("[POST /api/send-otp]", err);
    return NextResponse.json({ message: "Failed to send OTP" }, { status: 500 });
  }
}
