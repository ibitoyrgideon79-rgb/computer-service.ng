import { Router, Request, Response } from "express";
import { Resend } from "resend";
import { prisma } from "../db/prisma";

const router = Router();

function normalizePhone(raw: string): string {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "234" + phone.slice(1);
  if (!phone.startsWith("234")) phone = "234" + phone;
  return "+" + phone;
}

// POST /api/otp/send-phone  — send SMS OTP via Termii
router.post("/send-phone", async (req: Request, res: Response) => {
  try {
    const { phoneNumber } = req.body as { phoneNumber: string };
    if (!phoneNumber) {
      res.status(400).json({ message: "Phone number is required" });
      return;
    }

    const identifier = normalizePhone(phoneNumber);
    const otp        = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt  = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.deleteMany({ where: { identifier } });
    await prisma.otpCode.create({ data: { identifier, code: otp, expiresAt } });

    if (process.env.TERMII_API_KEY) {
      const termiiRes = await fetch("https://api.ng.termii.com/api/sms/send", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to:      identifier,
          from:    process.env.TERMII_SENDER_ID || "N-Alert",
          sms:     `Your ComputerService.ng verification code is: ${otp}. Valid for 10 minutes.`,
          type:    "plain",
          api_key: process.env.TERMII_API_KEY,
          channel: "dnd",
        }),
      });
      if (!termiiRes.ok) {
        const errBody = await termiiRes.json().catch(() => ({}));
        console.error("Termii API error:", errBody);
      }
    } else {
      console.log(`[DEV] SMS OTP for ${identifier}: ${otp}`);
    }

    res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error("Send phone OTP error:", err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});

// POST /api/otp/send-email  — send email OTP via Resend
router.post("/send-email", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    if (!email || !email.includes("@")) {
      res.status(400).json({ message: "Valid email address is required" });
      return;
    }

    const identifier = email.toLowerCase().trim();
    const otp        = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt  = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otpCode.deleteMany({ where: { identifier } });
    await prisma.otpCode.create({ data: { identifier, code: otp, expiresAt } });

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
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
        res.status(500).json({ message: "Failed to send email" });
        return;
      }
    } else {
      console.log(`[DEV] Email OTP for ${identifier}: ${otp}`);
    }

    res.json({ message: "Verification code sent to your email" });
  } catch (err) {
    console.error("Send email OTP error:", err);
    res.status(500).json({ message: "Failed to send verification code" });
  }
});

// POST /api/otp/verify  — verify OTP (phone or email)
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { otp, phoneNumber, email } = req.body as {
      otp: string; phoneNumber?: string; email?: string;
    };

    if (!otp) {
      res.status(400).json({ message: "Verification code is required" });
      return;
    }
    if (!phoneNumber && !email) {
      res.status(400).json({ message: "Phone number or email is required" });
      return;
    }

    const identifier = email
      ? email.toLowerCase().trim()
      : normalizePhone(phoneNumber!);

    const stored = await prisma.otpCode.findFirst({
      where: { identifier },
      orderBy: { createdAt: "desc" },
    });

    if (!stored) {
      res.status(400).json({ message: "No verification code found. Please request a new one." });
      return;
    }

    if (new Date() > stored.expiresAt) {
      await prisma.otpCode.deleteMany({ where: { identifier } });
      res.status(400).json({ message: "Code has expired. Please request a new one." });
      return;
    }

    if (stored.code !== otp) {
      res.status(400).json({ message: "Invalid code. Please try again." });
      return;
    }

    await prisma.otpCode.deleteMany({ where: { identifier } });

    const orders = await prisma.order.findMany({
      where: {
        OR: [{ phoneNumber: identifier }, { email: identifier }],
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ message: "Verified successfully", orders });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Failed to verify code" });
  }
});

export default router;
