import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id }   = await params;
  const { status } = await req.json();

  const VALID = ["Pending", "Reviewed", "Approved", "Rejected"];
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const application = await prisma.partnerApplication.update({
      where: { id },
      data:  { status },
    });
    return NextResponse.json(application);
  } catch (err) {
    console.error("[PATCH /api/admin/partners/[id]]", err);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
