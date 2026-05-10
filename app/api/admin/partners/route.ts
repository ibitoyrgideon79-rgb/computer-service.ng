import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/auth";
import { serializePartner } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    verifyAdminRequest(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.partnerApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(applications.map(serializePartner));
  } catch (err) {
    console.error("[GET /api/admin/partners]", err);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}
