import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const photos = await prisma.partnerPhoto.findMany({
      where: { applicationId: id },
      select: { id: true, label: true, dataUrl: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(photos);
  } catch (err) {
    console.error("[GET /api/admin/partners/[id]/photos]", err);
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
  }
}
