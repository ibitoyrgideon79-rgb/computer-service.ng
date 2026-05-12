import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/admin/orders/[id]/documents — list all documents for an order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const docs = await prisma.orderDocument.findMany({
      where: { orderId: params.id },
      select: {
        id:       true,
        fileName: true,
        fileType: true,
        fileSize: true,
        dataUrl:  true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(docs);
  } catch (err) {
    console.error("[GET /api/admin/orders/[id]/documents]", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}
