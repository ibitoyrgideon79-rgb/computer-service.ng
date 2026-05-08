import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../db/prisma";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    // Basic presence + length guard (prevents huge payloads slipping through)
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    if (email.length > 254 || password.length > 128) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }
    // Basic email shape check — no regex bypass, just sanity
    if (!email.includes("@")) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const jwtSecret = Buffer.from(process.env.JWT_SECRET || "default_secret");
    const expiresIn: string | number = process.env.JWT_EXPIRES_IN || "7d";
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      jwtSecret,
      { expiresIn } as SignOptions
    );

    res.json({ token, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/setup  (one-time admin creation — disable after use)
router.post("/setup", async (req: Request, res: Response) => {
  try {
    const count = await prisma.admin.count();
    if (count > 0) {
      res.status(403).json({ error: "Admin already exists" });
      return;
    }

    const email    = process.env.ADMIN_EMAIL    || req.body.email;
    const password = process.env.ADMIN_PASSWORD || req.body.password;

    if (!email || !password) {
      res.status(400).json({ error: "ADMIN_EMAIL and ADMIN_PASSWORD must be set" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const admin  = await prisma.admin.create({
      data: { email: email.toLowerCase().trim(), password: hashed },
      select: { id: true, email: true },
    });

    res.status(201).json({ message: "Admin created", admin });
  } catch (err) {
    console.error("Setup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
