import { NextRequest, NextResponse } from "next/server";
import otpStore from "@/lib/otpStore";

function normalizePhone(raw: string): string {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "234" + phone.slice(1);
  if (!phone.startsWith("234") && !phone.startsWith("+")) phone = "234" + phone;
  if (!phone.startsWith("+")) phone = "+" + phone;
  return phone;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const otp = body.otp as string;
    const rawPhone = body.phoneNumber as string | undefined;
    const rawEmail = body.email as string | undefined;

    if (!otp) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 });
    }

    if (!rawPhone && !rawEmail) {
      return NextResponse.json({ message: "Phone number or email is required" }, { status: 400 });
    }

    const identifier = rawEmail
      ? rawEmail.toLowerCase().trim()
      : normalizePhone(rawPhone!);

    const stored = otpStore.get(identifier);

    if (!stored) {
      return NextResponse.json(
        { message: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(identifier);
      return NextResponse.json({ message: "Code has expired. Please request a new one." }, { status: 400 });
    }

    if (stored.code !== otp) {
      return NextResponse.json({ message: "Invalid code. Please try again." }, { status: 400 });
    }

    otpStore.delete(identifier);

    return NextResponse.json(
      {
        message: "Verified successfully",
        identifier,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Failed to verify code" }, { status: 500 });
  }
}
