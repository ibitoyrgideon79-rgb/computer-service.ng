import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, companyName, email, address, services, phoneNumber, position, businessDetails, photoCount } = body;

    if (!fullName || !companyName || !email || !address) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const application = await prisma.partnerApplication.create({
      data: {
        fullName,
        companyName,
        email,
        address,
        phoneNumber:     phoneNumber     || null,
        position:        position        || null,
        businessDetails: businessDetails || null,
        services:        Array.isArray(services) ? services.join(", ") : (services || null),
        photoCount:      typeof photoCount === "number" ? photoCount : 0,
      },
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
