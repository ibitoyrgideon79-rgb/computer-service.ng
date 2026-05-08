import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

function generateOrderId(): string {
  const date = new Date();
  const d = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CSN-${d}-${rand}`;
}

// Sanitize a string field — strip leading/trailing whitespace, cap length
function sanitize(val: unknown, max = 500): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== "string") return null;
  return val.trim().slice(0, max) || null;
}

// POST /api/orders  — create a new order (public)
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      customer_name, phone_number, email, service, category,
      delivery_method, delivery_details,
      pickup_state, pickup_city, pickup_location,
      print_color, paper_type, pages, copies, express_service,
      print_layout, finishing_option, specific_instruction,
      amount, paystack_ref, document_text,
      hardcopy_pickup_date, hardcopy_pickup_time,
      hardcopy_contact_name, hardcopy_contact_phone,
      hardcopy_doc_count, hardcopy_instructions,
    } = req.body;

    // Required field presence
    if (!customer_name || !phone_number || !service || !delivery_method) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    // Type guards on the required fields
    if (
      typeof customer_name !== "string" ||
      typeof phone_number  !== "string" ||
      typeof service       !== "string" ||
      typeof delivery_method !== "string"
    ) {
      res.status(400).json({ error: "Invalid field types" });
      return;
    }
    // Numeric guards
    const parsedPages  = pages  !== undefined ? parseInt(pages,  10) : null;
    const parsedCopies = copies !== undefined ? parseInt(copies, 10) : 1;
    if ((parsedPages  !== null && (isNaN(parsedPages)  || parsedPages  < 1 || parsedPages  > 10000)) ||
        (isNaN(parsedCopies) || parsedCopies < 1 || parsedCopies > 1000)) {
      res.status(400).json({ error: "Invalid pages or copies value" });
      return;
    }
    // Amount guard
    const parsedAmount = parseFloat(amount);
    if (amount !== undefined && (isNaN(parsedAmount) || parsedAmount < 0)) {
      res.status(400).json({ error: "Invalid amount" });
      return;
    }

    const location = [pickup_location, pickup_city, pickup_state]
      .filter(Boolean).map(String).join(", ") || delivery_details || "";

    const order = await prisma.order.create({
      data: {
        orderId:             generateOrderId(),
        customerName:        sanitize(customer_name, 100) ?? customer_name,
        phoneNumber:         sanitize(phone_number, 20)   ?? phone_number,
        email:               sanitize(email, 254),
        service:             sanitize(service, 100) ?? service,
        category:            sanitize(category, 100),
        location:            sanitize(location, 300) ?? "",
        deliveryMethod:      sanitize(delivery_method, 50) ?? delivery_method,
        deliveryDetails:     sanitize(delivery_details, 300),
        pickupState:         sanitize(pickup_state, 100),
        pickupCity:          sanitize(pickup_city, 100),
        pickupLocation:      sanitize(pickup_location, 300),
        printColor:          sanitize(print_color, 50),
        paperType:           sanitize(paper_type, 50),
        pages:               parsedPages,
        copies:              parsedCopies,
        expressService:      Boolean(express_service),
        printLayout:         sanitize(print_layout, 50),
        finishingOption:     sanitize(finishing_option, 100),
        specificInstruction:  sanitize(specific_instruction, 500),
        amount:               isNaN(parsedAmount) ? 0 : parsedAmount,
        paystackRef:          sanitize(paystack_ref, 100),
        documentText:         sanitize(document_text, 50000),
        hardcopyPickupDate:   sanitize(hardcopy_pickup_date, 30),
        hardcopyPickupTime:   sanitize(hardcopy_pickup_time, 20),
        hardcopyContactName:  sanitize(hardcopy_contact_name, 200),
        hardcopyContactPhone: sanitize(hardcopy_contact_phone, 30),
        hardcopyDocCount:     hardcopy_doc_count !== undefined ? parseInt(hardcopy_doc_count, 10) || null : null,
        hardcopyInstructions: sanitize(hardcopy_instructions, 500),
      },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /api/orders  — list all orders (admin only), supports ?status= and ?search=
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };

    const where: Record<string, unknown> = {};

    if (status && status !== "All") {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { orderId:       { contains: q, mode: "insensitive" } },
        { customerName:  { contains: q, mode: "insensitive" } },
        { phoneNumber:   { contains: q, mode: "insensitive" } },
        { email:         { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error("List orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /api/orders/stats  — dashboard stats (admin only)
router.get("/stats", requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const [total, pending, inProgress, inTransit, completed, delivered, cancelled, revenue] =
      await prisma.$transaction([
        prisma.order.count(),
        prisma.order.count({ where: { status: "Pending" } }),
        prisma.order.count({ where: { status: "In Progress" } }),
        prisma.order.count({ where: { status: "In Transit" } }),
        prisma.order.count({ where: { status: "Completed" } }),
        prisma.order.count({ where: { status: "Delivered" } }),
        prisma.order.count({ where: { status: "Cancelled" } }),
        prisma.order.aggregate({
          _sum: { amount: true },
          where: { status: "Delivered" },
        }),
      ]);

    res.json({
      total, pending, in_progress: inProgress, in_transit: inTransit,
      completed, delivered, cancelled,
      revenue: revenue._sum.amount ?? 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/orders/:id  — get single order by order_id or uuid (public — for tracking)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderId: id }] },
    });
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

const VALID_STATUSES = ["Pending", "Pending Approval", "Approved for Payment", "In Progress", "Ready for Delivery", "In Transit", "Completed", "Delivered", "Cancelled"];

// PATCH /api/orders/:id  — update status (admin only)
router.patch("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    res.json(order);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    console.error("Update order error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// DELETE /api/orders/:id  — delete order (admin only)
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.order.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    console.error("Delete order error:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
