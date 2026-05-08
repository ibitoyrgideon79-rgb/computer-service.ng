import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    verifyAdminToken(req.headers.get("authorization"));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [total, pending, inProgress, inTransit, completed, delivered, cancelled, revenue] =
      await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: "Pending" } }),
        prisma.order.count({ where: { status: "In Progress" } }),
        prisma.order.count({ where: { status: "In Transit" } }),
        prisma.order.count({ where: { status: "Completed" } }),
        prisma.order.count({ where: { status: "Delivered" } }),
        prisma.order.count({ where: { status: "Cancelled" } }),
        prisma.order.aggregate({
          _sum: { amount: true },
          where: { status: { in: ["Completed", "Delivered"] } },
        }),
      ]);

    return NextResponse.json({
      total,
      pending,
      inProgress,
      inTransit,
      completed,
      delivered,
      cancelled,
      revenue: Number(revenue._sum.amount ?? 0),
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
