import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; updateId: string }> }
) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { updateId } = await params;
  try {
    await prisma.partnerUpdate.delete({ where: { id: updateId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE partner update]", err);
    return NextResponse.json({ error: "Failed to delete update" }, { status: 500 });
  }
}
