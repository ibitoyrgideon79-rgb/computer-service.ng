import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
    const phoneNumber = settings?.phoneNumber ?? "+2348166027757";
    return NextResponse.json({ phoneNumber });
  } catch {
    return NextResponse.json({ phoneNumber: "+2348166027757" });
  }
}
