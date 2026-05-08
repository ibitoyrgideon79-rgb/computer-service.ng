import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email: string };
    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Valid email address is required" }, { status: 400 });
    }

    const identifier = email.toLowerCase().trim();
    const otp        = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt  = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.deleteMany({ where: { identifier } });
    await prisma.otpCode.create({ data: { identifier, code: otp, expiresAt } });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from:    "ComputerService.ng <noreply@computerservice.ng>",
        to:      identifier,
        subject: "Your verification code",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f9fc;border-radius:12px;">
            <h2 style="color:#5123d4;margin-bottom:8px;">Verification Code</h2>
            <p style="color:#555;margin-bottom:24px;">Use the code below to access your saved project on ComputerService.ng.</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:0.4em;color:#111;">${otp}</span>
            </div>
            <p style="color:#999;font-size:13px;">This code is valid for <strong>10 minutes</strong>.</p>
          </div>
        `,
      });
      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
      }
    } else {
      console.log(`[DEV] Email OTP for ${identifier}: ${otp}`);
    }

    return NextResponse.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("[POST /api/send-email-otp]", err);
    return NextResponse.json({ message: "Failed to send verification code" }, { status: 500 });
  }
}
