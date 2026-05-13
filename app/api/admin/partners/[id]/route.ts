import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function normalizePhone(raw: string): string {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "234" + phone.slice(1);
  if (!phone.startsWith("234")) phone = "234" + phone;
  return "+" + phone;
}

async function trySendSms(to: string, sms: string, apiKey: string, channel: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id }     = await params;
  const { status } = await req.json();

  const VALID = ["Pending", "Reviewed", "Approved", "Rejected"];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const application = await prisma.partnerApplication.update({
      where: { id },
      data:  { status },
    });

    if (status === "Approved") {
      const firstName   = application.fullName?.split(" ")[0] || application.fullName || "Partner";
      const companyName = application.companyName || "your business";

      // Welcome email via Resend
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey && application.email) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from:    "ComputerService.ng <noreply@computerservice.ng>",
          to:      application.email,
          subject: "Welcome to the ComputerService.ng Partner Network! 🎉",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:0;background:#f8f9fc;">
              <!-- Header -->
              <div style="background:#5123d4;border-radius:12px 12px 0 0;padding:32px;text-align:center;">
                <h1 style="color:#fff;font-size:26px;margin:0;font-weight:bold;">Welcome to ComputerService.ng!</h1>
                <p style="color:#D1AFFF;font-size:14px;margin:8px 0 0;">Partner Network Approval</p>
              </div>

              <!-- Body -->
              <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
                <p style="color:#222;font-size:15px;margin-top:0;">Dear ${firstName},</p>

                <p style="color:#555;font-size:14px;line-height:1.8;">
                  Congratulations! 🎊 Your application to join the <strong style="color:#5123d4;">ComputerService.ng Partner Network</strong>
                  has been <strong>approved</strong>. We are thrilled to welcome <strong>${companyName}</strong> to our growing community of trusted partners.
                </p>

                <p style="color:#555;font-size:14px;line-height:1.8;">
                  As a certified partner, here's what you can now look forward to:
                </p>

                <ul style="color:#555;font-size:14px;line-height:2.2;padding-left:20px;margin:0 0 20px;">
                  <li>📦 A steady stream of verified customer orders routed to your location</li>
                  <li>📋 Priority listing on our partner directory for maximum visibility</li>
                  <li>💬 Dedicated support from the ComputerService.ng operations team</li>
                  <li>💰 Timely payouts and full transparency on every order</li>
                  <li>🚀 Access to exclusive partner promotions and growth initiatives</li>
                </ul>

                <p style="color:#555;font-size:14px;line-height:1.8;">
                  Our onboarding team will reach out to you shortly with your access details and next steps.
                  In the meantime, if you have any questions, don't hesitate to contact us at
                  <a href="mailto:support@computerservice.ng" style="color:#5123d4;font-weight:bold;">support@computerservice.ng</a>.
                </p>

                <p style="color:#555;font-size:14px;line-height:1.8;">
                  We are excited to build something great together. Thank you for trusting ComputerService.ng!
                </p>

                <div style="background:#f0ebff;border-radius:8px;padding:16px;margin-top:24px;text-align:center;">
                  <p style="margin:0;color:#5123d4;font-weight:bold;font-size:14px;">Welcome to the team, ${firstName}! 🙌</p>
                </div>
              </div>

              <!-- Footer -->
              <div style="padding:20px 32px;text-align:center;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;background:#f8f9fc;">
                <p style="color:#888;font-size:13px;margin:0 0 4px;">Warm regards,</p>
                <p style="color:#5123d4;font-weight:bold;font-size:14px;margin:0;">The ComputerService.ng Team</p>
                <p style="color:#bbb;font-size:11px;margin:12px 0 0;">©2026 computerservice.ng · RC: 9511799</p>
              </div>
            </div>
          `,
        }).catch((err: unknown) => console.error("Resend error (partner welcome):", err));
      }

      // Welcome SMS via Termii
      const termiiKey = process.env.TERMII_API_KEY;
      if (termiiKey && application.phoneNumber) {
        const phone = normalizePhone(application.phoneNumber);
        const sms   = `Congratulations ${firstName}! Your ComputerService.ng partner application has been approved. You will now start receiving customer orders directly. Welcome to the ComputerService.ng Partner Network! - ComputerService.ng Team`;
        const sent  = await trySendSms(phone, sms, termiiKey, "generic")
                   || await trySendSms(phone, sms, termiiKey, "dnd");
        if (!sent) console.error("All Termii channels failed for partner welcome SMS:", phone);
      }
    }

    return NextResponse.json(application);
  } catch (err) {
    console.error("[PATCH /api/admin/partners/[id]]", err);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
