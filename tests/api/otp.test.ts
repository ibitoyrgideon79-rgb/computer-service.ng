import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));

import { prisma } from "../__mocks__/prisma";
import { POST as sendPhone } from "@/app/api/send-otp/route";
import { POST as verify }    from "@/app/api/verify-otp/route";

function post(url: string, body: unknown) {
  return new NextRequest(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

describe("POST /api/send-otp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.otpCode.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 0 });
    (prisma.otpCode.create    as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "otp-1" });
    // Silence external HTTP call
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
  });

  it("returns 400 when phoneNumber is missing", async () => {
    const res = await sendPhone(post("http://localhost/api/send-otp", {}));
    expect(res.status).toBe(400);
  });

  it("creates an OTP record for the normalised number", async () => {
    await sendPhone(post("http://localhost/api/send-otp", { phoneNumber: "08011223344" }));
    const createArg = (prisma.otpCode.create as ReturnType<typeof vi.fn>).mock.calls[0][0].data;
    expect(createArg.identifier).toBe("+2348011223344");
    expect(createArg.code).toMatch(/^\d{6}$/);
  });

  it("returns 200 on success", async () => {
    const res = await sendPhone(post("http://localhost/api/send-otp", { phoneNumber: "08099887766" }));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/verify-otp", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when otp is missing", async () => {
    const res = await verify(post("http://localhost/api/verify-otp", { phoneNumber: "08011223344" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when neither phone nor email supplied", async () => {
    const res = await verify(post("http://localhost/api/verify-otp", { otp: "123456" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when no stored OTP found", async () => {
    (prisma.otpCode.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const res = await verify(post("http://localhost/api/verify-otp", {
      otp: "123456", phoneNumber: "08011223344",
    }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when OTP is expired", async () => {
    (prisma.otpCode.findFirst  as ReturnType<typeof vi.fn>).mockResolvedValue({
      code: "123456", expiresAt: new Date(Date.now() - 1000),
    });
    (prisma.otpCode.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });
    const res = await verify(post("http://localhost/api/verify-otp", {
      otp: "123456", phoneNumber: "08011223344",
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/expired/i);
  });

  it("returns 400 when OTP code is wrong", async () => {
    (prisma.otpCode.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      code: "999999", expiresAt: new Date(Date.now() + 60000),
    });
    const res = await verify(post("http://localhost/api/verify-otp", {
      otp: "123456", phoneNumber: "08011223344",
    }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/invalid/i);
  });

  it("returns orders list on correct OTP", async () => {
    (prisma.otpCode.findFirst  as ReturnType<typeof vi.fn>).mockResolvedValue({
      code: "123456", expiresAt: new Date(Date.now() + 60000),
    });
    (prisma.otpCode.deleteMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });
    (prisma.order.findMany     as ReturnType<typeof vi.fn>).mockResolvedValue([
      { id: "o1", orderId: "CSN-1", status: "Pending" },
    ]);

    const res = await verify(post("http://localhost/api/verify-otp", {
      otp: "123456", phoneNumber: "08011223344",
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(1);
    expect(body.message).toMatch(/verified/i);
  });
});
