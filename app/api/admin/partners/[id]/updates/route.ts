import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";
import { notifyPartnerUpdate } from "@/lib/notify";

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

  const { id } = await params;
  try {
    const updates = await prisma.partnerUpdate.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(updates.map(u => ({
      id: u.id,
      message: u.message,
      imageDataUrl: u.imageDataUrl,
      createdAt: u.createdAt,
    })));
  } catch (err) {
    console.error("[GET partner updates]", err);
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const message: string = (body.message || "").toString().trim();
  const imageDataUrl: string | null = body.imageDataUrl ? String(body.imageDataUrl) : null;

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  try {
    const application = await prisma.partnerApplication.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    const update = await prisma.partnerUpdate.create({
      data: { applicationId: id, message, imageDataUrl },
    });

    // Fire-and-forget email
    if (application.email) {
      notifyPartnerUpdate({
        to: application.email,
        partnerName: application.fullName,
        message,
        hasImage: Boolean(imageDataUrl),
      }).catch(err => console.error("notifyPartnerUpdate failed:", err));
    }

    return NextResponse.json({
      id: update.id,
      message: update.message,
      imageDataUrl: update.imageDataUrl,
      createdAt: update.createdAt,
    });
  } catch (err) {
    console.error("[POST partner update]", err);
    return NextResponse.json({ error: "Failed to post update" }, { status: 500 });
  }
}
