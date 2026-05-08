import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });

    const data = await res.json() as {
      status: boolean;
      data?: { status: string; reference: string; amount: number };
      message?: string;
    };

    if (!data.status || data.data?.status !== "success") {
      return NextResponse.json({ error: "Payment not verified", raw: data.message }, { status: 402 });
    }

    // Find the order by paystack reference and mark it In Progress
    const order = await prisma.order.findFirst({ where: { paystackRef: reference } });
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { status: "In Progress" },
      });
      return NextResponse.json({ verified: true, orderId: order.orderId });
    }

    return NextResponse.json({ verified: true, orderId: null });
  } catch (err) {
    console.error("[POST /api/payment/verify]", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
