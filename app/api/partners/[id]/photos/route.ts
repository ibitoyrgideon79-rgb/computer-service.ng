import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as { label: string; dataUrl: string };
    const { label, dataUrl } = body;

    if (!label || !dataUrl) {
      return NextResponse.json({ error: "label and dataUrl are required" }, { status: 400 });
    }

    const photo = await prisma.partnerPhoto.create({
      data: { applicationId: id, label, dataUrl },
    });

    return NextResponse.json({ id: photo.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/partners/[id]/photos]", err);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
