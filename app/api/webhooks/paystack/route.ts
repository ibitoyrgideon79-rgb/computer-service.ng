import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { notifyCustomerOrderConfirmed } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Paystack signs every webhook payload with HMAC-SHA512 using your secret key.
// We MUST verify this before trusting the event — otherwise anyone can POST here.
function verifySignature(body: string, signature: string, secret: string): boolean {
  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("[webhook/paystack] PAYSTACK_SECRET_KEY not set");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (!verifySignature(body, signature, secret)) {
    console.warn("[webhook/paystack] Rejected — invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event: string;
    data: {
      reference: string;
      amount: number;        // in kobo
      status: string;
      customer?: { email?: string };
      metadata?: { orderId?: string };
    };
  };

  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only act on successful charges
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true, action: "ignored" });
  }

  const { reference, amount: paidKobo } = event.data;

  try {
    const order = await prisma.order.findFirst({ where: { paystackRef: reference } });

    if (!order) {
      console.warn("[webhook/paystack] No order found for ref:", reference);
      // Still return 200 so Paystack doesn't keep retrying
      return NextResponse.json({ received: true, action: "no_order" });
    }

    // Idempotency: only update if still Pending
    if (order.status !== "Pending") {
      return NextResponse.json({ received: true, action: "already_processed" });
    }

    // Amount sanity check (paidKobo is in kobo, order.amount is in naira)
    const expectedKobo = Math.round(Number(order.amount) * 100);
    if (paidKobo < expectedKobo) {
      console.error(
        `[webhook/paystack] Underpayment on ${reference}: ` +
        `expected ${expectedKobo} kobo, received ${paidKobo} kobo`,
      );
      // Mark as a special status so admin can investigate — don't silently pass
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "Pending Approval" },
      });
      return NextResponse.json({ received: true, action: "underpayment" });
    }

    // Confirm the order
    await prisma.order.update({
      where: { id: order.id },
      data:  { status: "In Progress" },
    });

    // Fire notifications without blocking the webhook response
    notifyCustomerOrderConfirmed({
      orderId:      order.orderId,
      customerName: order.customerName,
      phoneNumber:  order.phoneNumber,
      email:        order.email,
      service:      order.service,
      amount:       Number(order.amount),
    }).catch((err) => console.error("[webhook/paystack] Notification error:", err));

    return NextResponse.json({ received: true, action: "confirmed" });
  } catch (err) {
    console.error("[webhook/paystack] DB error:", err);
    // Return 500 so Paystack retries the webhook
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}
