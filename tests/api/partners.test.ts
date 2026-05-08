import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));

import { prisma } from "../__mocks__/prisma";
import { POST } from "@/app/api/partners/route";

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/partners", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

const VALID_BODY = {
  fullName:    "Chukwuemeka Eze",
  companyName: "EzePrint Ltd",
  email:       "emeka@ezeprint.com",
  address:     "No. 5 Market Road, Enugu",
  services:    "Printing, Scanning, Binding",
};

describe("POST /api/partners", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates application and returns 201", async () => {
    (prisma.partnerApplication.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "app-uuid-1",
    });

    const res  = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("app-uuid-1");
    expect(body.message).toMatch(/success/i);
  });

  it("saves services field", async () => {
    (prisma.partnerApplication.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "x" });
    await POST(makeReq(VALID_BODY));
    const call = (prisma.partnerApplication.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.data.services).toBe("Printing, Scanning, Binding");
  });

  it("returns 400 when fullName is missing", async () => {
    const { fullName: _, ...withoutName } = VALID_BODY;
    const res = await POST(makeReq(withoutName));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const { email: _, ...withoutEmail } = VALID_BODY;
    const res = await POST(makeReq(withoutEmail));
    expect(res.status).toBe(400);
  });

  it("allows services to be empty/omitted", async () => {
    (prisma.partnerApplication.create as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "y" });
    const { services: _, ...withoutServices } = VALID_BODY;
    const res = await POST(makeReq(withoutServices));
    expect(res.status).toBe(201);
    const call = (prisma.partnerApplication.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.data.services).toBeNull();
  });

  it("returns 500 on Prisma error", async () => {
    (prisma.partnerApplication.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB"));
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(500);
  });
});
