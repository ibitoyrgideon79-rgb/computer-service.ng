import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { fullName, companyName, email, address, services } = await req.json();

    if (!fullName || !companyName || !email || !address) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const application = await prisma.partnerApplication.create({
      data: { fullName, companyName, email, address, services: services || null },
    });

    return NextResponse.json(
      { id: application.id, message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/partners]", err);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}
