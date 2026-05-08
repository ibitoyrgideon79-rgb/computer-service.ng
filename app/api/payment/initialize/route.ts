import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { orderId, email, amount } = await req.json() as {
      orderId: string;
      email:   string;
      amount:  number;
    };

    if (!orderId || !amount) {
      return NextResponse.json({ error: "orderId and amount are required" }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: "Payment not configured" }, { status: 500 });
    }

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        email:        email || "customer@computerservice.ng",
        amount:       Math.round(amount * 100),
        currency:     "NGN",
        reference:    `CSN-${Date.now()}`,
        metadata:     { orderId },
        callback_url: `${req.headers.get("origin") || "https://computerservice.ng"}/order/tracking`,
      }),
    });

    const data = await res.json() as {
      status: boolean;
      data?: { access_code: string; authorization_url: string; reference: string };
      message?: string;
    };

    if (!data.status || !data.data) {
      console.error("Paystack error:", data);
      return NextResponse.json({ error: data.message || "Payment initialization failed" }, { status: 502 });
    }

    // Store the reference on the order so we can look it up after payment
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
