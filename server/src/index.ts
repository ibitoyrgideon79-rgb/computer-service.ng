import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRouter     from "./routes/auth";
import ordersRouter   from "./routes/orders";
import otpRouter      from "./routes/otp";
import partnersRouter from "./routes/partners";

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
  contentSecurityPolicy: false, // handled by Next.js on the frontend
}));

// ── CORS — only allow configured frontend origin ──────────────────────────────
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin === allowedOrigin) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ── Body parsing — cap at 10 MB ───────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Global rate limit: 200 req / 15 min per IP ───────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
}));

// ── Strict rate limit on auth routes: 10 req / 15 min per IP ─────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please wait and try again." },
});
app.use("/api/auth", authLimiter);

app.get("/health", (_req, res) => { res.json({ status: "ok" }); });

app.use("/api/auth",     authRouter);
app.use("/api/orders",   ordersRouter);
app.use("/api/otp",      otpRouter);
app.use("/api/partners", partnersRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => { res.status(404).json({ error: "Not found" }); });

// ── Global error handler — never leak stack traces ────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
