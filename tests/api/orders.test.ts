import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));

import { prisma } from "../__mocks__/prisma";
import { POST } from "@/app/api/orders/route";
import { GET } from "@/app/api/orders/[id]/route";

function makePost(body: unknown) {
  return new NextRequest("http://localhost/api/orders", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
}

const SAMPLE_ORDER = {
  customer_name:   "Adebayo Bello",
  phone_number:    "08011223344",
  email:           "test@example.com",
  service:         "Printing",
  delivery_method: "Pick Up",
  pages:           5,
  copies:          2,
  amount:          2500,
};

describe("POST /api/orders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an order and returns orderId + id", async () => {
    (prisma.order.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id:      "uuid-1",
      orderId: "CSN-20260508-1234",
      status:  "Pending",
    });

    const res = await POST(makePost(SAMPLE_ORDER));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.orderId).toBe("CSN-20260508-1234");
    expect(body.id).toBe("uuid-1");
  });

  it("generates a CSN-prefixed orderId", async () => {
    (prisma.order.create as ReturnType<typeof vi.fn>).mockImplementation(
      async ({ data }: { data: { orderId: string } }) => ({
        id: "uuid-x", orderId: data.orderId, status: "Pending",
      })
    );

    await POST(makePost(SAMPLE_ORDER));
    const callArg = (prisma.order.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.data.orderId).toMatch(/^CSN-\d{8}-\d{4}$/);
  });

  it("defaults status to Pending when not supplied", async () => {
    (prisma.order.create as ReturnType<typeof vi.fn>).mockImplementation(
      async ({ data }: { data: { status: string } }) => ({
        id: "uuid-y", orderId: "CSN-x", status: data.status,
      })
    );

    await POST(makePost(SAMPLE_ORDER));
    const callArg = (prisma.order.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.data.status).toBe("Pending");
  });

  it("returns 500 when Prisma throws", async () => {
    (prisma.order.create as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB down"));
    const res = await POST(makePost(SAMPLE_ORDER));
    expect(res.status).toBe(500);
  });
});

describe("GET /api/orders/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns order when found by orderId", async () => {
    const mockOrder = { id: "uuid-1", orderId: "CSN-20260508-1234", status: "Pending" };
    (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(mockOrder);

    const req = new NextRequest("http://localhost/api/orders/CSN-20260508-1234");
    const res = await GET(req, { params: Promise.resolve({ id: "CSN-20260508-1234" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orderId).toBe("CSN-20260508-1234");
  });

  it("returns 404 when not found", async () => {
    (prisma.order.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new NextRequest("http://localhost/api/orders/UNKNOWN");
    const res = await GET(req, { params: Promise.resolve({ id: "UNKNOWN" }) });
    expect(res.status).toBe(404);
  });
});
