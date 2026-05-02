import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import otpStore from "@/lib/otpStore";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Valid email address is required" }, { status: 400 });
    }

    const normalizedEmail = (email as string).toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    if (process.env.RESEND_API_KEY) {
      const { error } = await resend.emails.send({
        from: "ComputerService.ng <noreply@computerservice.ng>",
        to: normalizedEmail,
        subject: "Your verification code",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f9fc;border-radius:12px;">
            <h2 style="color:#5123d4;margin-bottom:8px;">Verification Code</h2>
            <p style="color:#555;margin-bottom:24px;">Use the code below to access your saved project on ComputerService.ng.</p>
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:36px;font-weight:bold;letter-spacing:0.4em;color:#111;">${otp}</span>
            </div>
            <p style="color:#999;font-size:13px;">This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ message: "Failed to send email. Please try again." }, { status: 500 });
      }
    } else {
      console.log(`[DEV] Email OTP for ${normalizedEmail}: ${otp}`);
    }

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        ...(process.env.NODE_ENV === "development" && { debug: otp }),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send email OTP error:", error);
    return NextResponse.json({ message: "Failed to send verification code" }, { status: 500 });
  }
}
