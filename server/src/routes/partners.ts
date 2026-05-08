import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

function sanitize(val: unknown, max = 500): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== "string") return null;
  return val.trim().slice(0, max) || null;
}

// POST /api/partners — submit a partner application (public)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { full_name, company_name, email, address } = req.body;

    if (!full_name || !company_name || !email || !address) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    if (typeof full_name !== "string" || typeof company_name !== "string" ||
        typeof email !== "string" || typeof address !== "string") {
      res.status(400).json({ error: "Invalid field types" });
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk || email.length > 254) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const application = await prisma.partnerApplication.create({
      data: {
        fullName:    sanitize(full_name, 200)    ?? full_name,
        companyName: sanitize(company_name, 300) ?? company_name,
        email:       email.trim().toLowerCase().slice(0, 254),
        address:     sanitize(address, 500)      ?? address,
      },
    });

    res.status(201).json({ success: true, id: application.id });
  } catch (err) {
    console.error("Create partner application error:", err);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// GET /api/partners — list all applications (admin only)
router.get("/", requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const applications = await prisma.partnerApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  } catch (err) {
    console.error("List partner applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// PATCH /api/partners/:id — update status (admin only)
router.patch("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };
    const VALID = ["Pending", "Reviewed", "Approved", "Rejected"];
    if (!VALID.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const application = await prisma.partnerApplication.update({
      where: { id },
      data: { status },
    });
    res.json(application);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2025") {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    console.error("Update partner application error:", err);
    res.status(500).json({ error: "Failed to update application" });
  }
});

export default router;
