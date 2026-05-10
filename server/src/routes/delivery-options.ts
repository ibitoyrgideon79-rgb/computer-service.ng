import { Router, Request, Response } from "express";
import { prisma } from "../db/prisma";

const router = Router();

// GET /api/delivery-options — get all active delivery options
router.get("/", async (req: Request, res: Response) => {
  try {
    const options = await prisma.deliveryOption.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });
    res.json(options);
  } catch (err) {
    console.error("Get delivery options error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/delivery-options/:id — get single delivery option
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const option = await prisma.deliveryOption.findUnique({
      where: { id },
    });
    if (!option) {
      res.status(404).json({ error: "Delivery option not found" });
      return;
    }
    res.json(option);
  } catch (err) {
    console.error("Get delivery option error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
