import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

vi.mock("@/lib/prisma", () => import("../__mocks__/prisma"));

import { prisma } from "../__mocks__/prisma";
import { GET }                    from "@/app/api/admin/orders/route";
import { PATCH, DELETE }          from "@/app/api/admin/orders/[id]/route";
import { GET as getStats }        from "@/app/api/admin/stats/route";

const SECRET = "test-secret-key";
const TOKEN  = jwt.sign({ id: "admin-1", email: "admin@test.com" }, Buffer.from(SECRET));
const AUTH   = `Bearer ${TOKEN}`;

function makeReq(url: string, opts: Omit<RequestInit, "signal"> & { signal?: AbortSignal } = {}) {
  return new NextRequest(url, opts);
}

const MOCK_ORDERS = [
  { id: "o1", orderId: "CSN-1", customerName: "Ade", status: "Pending", amount: "500" },
  { id: "o2", orderId: "CSN-2", customerName: "Bola", status: "In Progress", amount: "1200" },
];

describe("GET /api/admin/orders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await GET(makeReq("http://localhost/api/admin/orders"));
    expect(res.status).toBe(401);
  });

  it("returns orders list when authenticated", async () => {
    (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ORDERS);
    const res = await GET(makeReq("http://localhost/api/admin/orders", {
      headers: { authorization: AUTH },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
  });

  it("filters by status query param", async () => {
    (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([MOCK_ORDERS[0]]);
    await GET(makeReq("http://localhost/api/admin/orders?status=Pending", {
      headers: { authorization: AUTH },
    }));
    const where = (prisma.order.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].where;
    expect(where.status).toBe("Pending");
  });

  it("does not filter when status=All", async () => {
    (prisma.order.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(MOCK_ORDERS);
    await GET(makeReq("http://localhost/api/admin/orders?status=All", {
      headers: { authorization: AUTH },
    }));
    const where = (prisma.order.findMany as ReturnType<typeof vi.fn>).mock.calls[0][0].where;
    expect(where.status).toBeUndefined();
  });
});

describe("PATCH /api/admin/orders/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await PATCH(
      makeReq("http://localhost/api/admin/orders/o1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Completed" }),
      }),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("updates status and returns updated order", async () => {
    (prisma.order.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...MOCK_ORDERS[0], status: "Completed",
    });
    const res = await PATCH(
      makeReq("http://localhost/api/admin/orders/o1", {
        method:  "PATCH",
        headers: { authorization: AUTH, "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "Completed" }),
      }),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("Completed");
  });

  it("returns 400 for invalid status", async () => {
    const res = await PATCH(
      makeReq("http://localhost/api/admin/orders/o1", {
        method:  "PATCH",
        headers: { authorization: AUTH, "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "InvalidStatus" }),
      }),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/admin/orders/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await DELETE(
      makeReq("http://localhost/api/admin/orders/o1", { method: "DELETE" }),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("deletes and returns 200", async () => {
    (prisma.order.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});
    const res = await DELETE(
      makeReq("http://localhost/api/admin/orders/o1", {
        method:  "DELETE",
        headers: { authorization: AUTH },
      }),
      { params: Promise.resolve({ id: "o1" }) }
    );
    expect(res.status).toBe(200);
  });
});

describe("GET /api/admin/stats", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 without auth", async () => {
    const res = await getStats(makeReq("http://localhost/api/admin/stats"));
    expect(res.status).toBe(401);
  });

  it("returns all stat fields", async () => {
    (prisma.order.count as ReturnType<typeof vi.fn>).mockResolvedValue(10);
    (prisma.order.aggregate as ReturnType<typeof vi.fn>).mockResolvedValue({
      _sum: { amount: 99000 },
    });

    const res = await getStats(makeReq("http://localhost/api/admin/stats", {
      headers: { authorization: AUTH },
    }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      total: 10, pending: 10, inProgress: 10,
      completed: 10, delivered: 10, cancelled: 10,
      revenue: 99000,
    });
  });
});
