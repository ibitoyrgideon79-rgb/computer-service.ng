import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST /api/orders/[id]/documents — upload files for an order (base64)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json() as { files: { name: string; type: string; size: number; dataUrl: string }[] };

    if (!body.files?.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Verify order exists
    const order = await prisma.order.findUnique({ where: { id }, select: { id: true } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const docs = await prisma.$transaction(
      body.files.map((f) =>
        prisma.orderDocument.create({
          data: {
            orderId:  id,
            fileName: f.name,
            fileType: f.type,
            fileSize: f.size,
            dataUrl:  f.dataUrl,
          },
        })
      )
    );

    return NextResponse.json({ uploaded: docs.length }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders/[id]/documents]", err);
    return NextResponse.json({ error: "Failed to save documents" }, { status: 500 });
  }
}
