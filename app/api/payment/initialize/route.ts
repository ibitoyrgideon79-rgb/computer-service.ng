import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { orderId, email } = await req.json() as {
      orderId: string;
      email?:  string;
      // amount intentionally not trusted from client — we use the DB value
    };

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    // Load order from DB — use its stored amount, not the client-supplied one
    const order = await prisma.order.findFirst({
      where: { OR: [{ id: orderId }, { orderId }] },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency: if order already has a reference and is paid, don't create a new charge
    if (order.paystackRef && order.status !== "Pending") {
      return NextResponse.json(
        { error: "This order has already been paid" },
        { status: 409 },
      );
    }

    const amountNaira = Number(order.amount);
    if (!amountNaira || amountNaira <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // Use a stable reference tied to the order so retries reuse the same ref
    const reference = order.paystackRef ?? `CSN-${order.orderId}-${Date.now()}`;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email:        email || order.email || "customer@computerservice.ng",
        amount:       Math.round(amountNaira * 100), // kobo
        currency:     "NGN",
        reference,
        metadata:     { orderId: order.id, orderRef: order.orderId },
        callback_url: `${req.headers.get("origin") || "https://computerservice.ng"}/order/tracking`,
      }),
    });

    const data = await res.json() as {
      status: boolean;
      data?: { access_code: string; authorization_url: string; reference: string };
      message?: string;
    };

    if (!data.status || !data.data) {
      console.error("[initialize] Paystack error:", data);
      return NextResponse.json(
        { error: data.message || "Payment initialization failed" },
        { status: 502 },
      );
    }

    // Persist the reference so the webhook / verify can find this order
    await prisma.order.updateMany({
      where: { OR: [{ id: orderId }, { orderId }] },
      data:  { paystackRef: data.data.reference },
    });

    return NextResponse.json({
      access_code:       data.data.access_code,
      authorization_url: data.data.authorization_url,
      reference:         data.data.reference,
    });
  } catch (err) {
    console.error("[POST /api/payment/initialize]", err);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
