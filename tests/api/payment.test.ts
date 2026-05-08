import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));

import { prisma } from "../__mocks__/prisma";
import { POST } from "@/app/api/payment/initialize/route";

function makeReq(body: unknown) {
  return new NextRequest("http://localhost/api/payment/initialize", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

const VALID_BODY = {
  orderId: "uuid-order-1",
  email:   "customer@test.com",
  amount:  2500,
};

describe("POST /api/payment/initialize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: updateMany succeeds silently
    (prisma.order.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 1 });
  });

  it("returns 400 when orderId is missing", async () => {
    const res = await POST(makeReq({ email: "x@x.com", amount: 100 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when amount is missing", async () => {
    const res = await POST(makeReq({ orderId: "x", email: "x@x.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 500 when PAYSTACK_SECRET_KEY is missing", async () => {
    const original = process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(500);
    process.env.PAYSTACK_SECRET_KEY = original;
  });

  it("calls Paystack API with correct Authorization header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok:   true,
      json: async () => ({
        status: true,
        data: { access_code: "acc_abc123", reference: "ref_xyz" },
      }),
    } as Response);

    await POST(makeReq(VALID_BODY));

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.paystack.co/transaction/initialize");
    expect((opts.headers as Record<string, string>)["Authorization"]).toBe(
      `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    );
    fetchSpy.mockRestore();
  });

  it("returns access_code and reference on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok:   true,
      json: async () => ({
        status: true,
        data: { access_code: "acc_abc123", reference: "ref_xyz" },
      }),
    } as Response);

    const res  = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.access_code).toBe("acc_abc123");
    expect(body.reference).toBe("ref_xyz");
  });

  it("returns 502 when Paystack returns status=false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok:   true,
      json: async () => ({ status: false, message: "Invalid key" }),
    } as Response);

    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toMatch(/invalid key/i);
  });

  it("stores the paystack reference on the order", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok:   true,
      json: async () => ({
        status: true,
        data: { access_code: "acc", reference: "REF-123" },
      }),
    } as Response);

    await POST(makeReq(VALID_BODY));
    expect(prisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { paystackRef: "REF-123" } })
    );
  });
});
