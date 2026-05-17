import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyCustomerOrderConfirmed } from "@/lib/notify";

export const dynamic = "force-dynamic";

// Statuses that mean payment has already been handled — skip re-processing
const PAID_STATUSES = new Set(["In Progress", "Ready for Delivery", "In Transit", "Completed", "Delivered"]);

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json() as { reference: string };
    if (!reference) {
      return NextResponse.json({ error: "reference is required" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // Verify the transaction with Paystack directly (server-to-server)
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } },
    );

    const data = await res.json() as {
      status: boolean;
      data?: {
        status: string;
        reference: string;
        amount: number;  // in kobo
      };
      message?: string;
    };

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment not verified", detail: data.message },
        { status: 402 },
      );
    }

    const order = await prisma.order.findFirst({ where: { paystackRef: reference } });

    if (!order) {
      // Paystack confirms success but no matching order — log for investigation
      console.error("[verify] Verified ref has no matching order:", reference);
      return NextResponse.json({ verified: true, orderId: null });
    }

    // Idempotency: already confirmed by webhook or a prior verify call
    if (PAID_STATUSES.has(order.status)) {
      return NextResponse.json({ verified: true, orderId: order.orderId });
    }

    // Amount validation — ensure paid amount >= expected (both in kobo)
    const paidKobo     = data.data!.amount;
    const expectedKobo = Math.round(Number(order.amount) * 100);

    if (paidKobo < expectedKobo) {
      console.error(
        `[verify] Underpayment on ${reference}: ` +
        `expected ₦${Number(order.amount)}, got ₦${paidKobo / 100}`,
      );
      await prisma.order.update({
        where: { id: order.id },
        data:  { status: "Pending Approval" },
      });
      return NextResponse.json(
        { error: "Underpayment detected — an admin will review your order", orderId: order.orderId },
        { status: 402 },
      );
    }

    // Confirm the order
    await prisma.order.update({
      where: { id: order.id },
      data:  { status: "In Progress" },
    });

    notifyCustomerOrderConfirmed({
      orderId:      order.orderId,
      customerName: order.customerName,
      phoneNumber:  order.phoneNumber,
      email:        order.email,
      service:      order.service,
      amount:       Number(order.amount),
    }).catch((err) => console.error("[verify] Notification error:", err));

    return NextResponse.json({ verified: true, orderId: order.orderId });
  } catch (err) {
    console.error("[POST /api/payment/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
