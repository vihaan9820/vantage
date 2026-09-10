import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";

// In-memory ledger of claimed UTRs and Razorpay payments to prevent replay attacks and duplicate claims
const claimedUtrs = new Set<string>();
const processedRazorpayPayments = new Set<string>();
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

// Valid point packages lookup table
export const VALID_PACKAGES: Record<number, { price: number; name: string }> = {
  15: { price: 599, name: "Starter" },
  30: { price: 1099, name: "Learner" },
  60: { price: 1999, name: "Pro Master" },
  120: { price: 3499, name: "Mastery" },
  20: { price: 49, name: "Legacy Starter" },
  50: { price: 99, name: "Legacy Learner" },
  100: { price: 179, name: "Legacy Growth" },
  250: { price: 399, name: "Legacy Pro" },
};

// Cryptographically secure Admin Security Token for financial verification endpoints
export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || crypto.randomBytes(32).toString("hex");
if (!process.env.ADMIN_API_KEY) {
  console.log(`🔒 Ephemeral ADMIN_API_KEY generated for this session: ${ADMIN_API_KEY}`);
}

export function requireAdminAuth(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"] || req.headers["x-admin-token"];
  const token = typeof authHeader === "string" ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Administrative credentials required for settlement operations.",
    });
  }

  const tokenBuffer = Buffer.from(token, "utf-8");
  const expectedBuffer = Buffer.from(ADMIN_API_KEY, "utf-8");

  // Constant-time comparison to prevent timing attacks
  if (tokenBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized: Invalid administrative credentials.",
    });
  }
  next();
}

export type PendingUpiPayment = {
  id: string;
  utr: string;
  points: number;
  priceNumeric: number;
  receiverUpi: string;
  userEmail?: string;
  userName?: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  verifiedAt?: string;
};

export const pendingPayments: PendingUpiPayment[] = [];

export function createApp() {
  const app = express();

  // Enable reverse proxy trust for accurate client IP identification
  app.set("trust proxy", 1);

  // Maximum Security Fortress Headers Middleware
  app.use((_req: any, res: any, next: any) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; frame-src https://api.razorpay.com; connect-src 'self' https://api.razorpay.com https://*.supabase.co wss://*.supabase.co;"
    );
    next();
  });

  // Strict CORS Security Middleware
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      process.env.APP_URL,
    ].filter(Boolean) as string[];

    const isAllowed =
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vantage.io") ||
      origin.endsWith(".skillswap.io") ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com") ||
      origin.endsWith(".railway.app") ||
      origin.endsWith(".fly.dev");

    if (origin && isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Token, X-Razorpay-Signature");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });

  // Health check endpoints for cloud orchestrators (Vercel, Render, Railway, Fly, AWS)
  const healthHandler = (_req: any, res: any) => {
    res.status(200).json({
      status: "healthy",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      service: "skillswap-api",
      version: "1.0.0",
    });
  };

  app.get("/healthz", healthHandler);
  app.get("/api/health", healthHandler);

  // Router for API endpoints - supports both direct /api/ routes and stripped router paths
  const apiRouter = express.Router();

  // 1. Razorpay Webhook Endpoint (Requires raw body for signature verification)
  apiRouter.post(
    "/razorpay/webhook",
    express.raw({ type: "application/json" }),
    async (req: any, res: any) => {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const signature = req.headers["x-razorpay-signature"] as string;

      if (webhookSecret && signature) {
        try {
          const shasum = crypto.createHmac("sha256", webhookSecret);
          shasum.update(req.body);
          const digest = shasum.digest("hex");

          if (digest !== signature) {
            console.warn("⚠️ Invalid Razorpay webhook signature");
            return res.status(400).json({ error: "Invalid signature" });
          }
        } catch (err: any) {
          console.error("⚠️ Error verifying webhook signature:", err.message);
          return res.status(400).json({ error: "Verification failed" });
        }
      }

      let payload: any;
      try {
        payload = JSON.parse(req.body.toString());
      } catch {
        payload = {};
      }

      const event = payload.event;
      if (event === "payment.captured" || event === "order.paid") {
        const payment = payload.payload?.payment?.entity;
        console.log(`✅ Razorpay Payment Captured: ${payment?.id}, Amount: ₹${(payment?.amount || 0) / 100}`);
      }

      res.json({ status: "ok" });
    }
  );

  // Parse JSON for standard API endpoints with strict body size defense against payload bombs
  apiRouter.use(express.json({ limit: "50kb" }));

  // Strict Content-Type enforcement on mutating endpoints
  apiRouter.use((req: any, res: any, next: any) => {
    if (req.method === "POST" && !req.path.endsWith("/razorpay/webhook")) {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("application/json")) {
        return res.status(415).json({
          error: "Unsupported Media Type: Request Content-Type must be application/json",
        });
      }
    }
    next();
  });

  // Sliding Window API Rate Limiter
  const apiRateLimiter = new Map<string, { count: number; windowStart: number }>();
  apiRouter.use((req: any, res: any, next: any) => {
    if (req.path.endsWith("/razorpay/webhook")) return next();

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.ip || req.socket.remoteAddress || "client";
    const now = Date.now();
    const windowMs = 60 * 1000;
    const maxRequests = 120;

    const stats = apiRateLimiter.get(ip) || { count: 0, windowStart: now };
    if (now - stats.windowStart > windowMs) {
      stats.count = 0;
      stats.windowStart = now;
    }
    stats.count += 1;
    apiRateLimiter.set(ip, stats);

    if (stats.count > maxRequests) {
      return res.status(429).json({
        error: "Rate limit exceeded. Too many requests. Please retry in a moment.",
      });
    }
    next();
  });

  // 2a. Submit Direct UPI Payment for Bank Settlement Verification
  apiRouter.post("/payments/submit-upi", (req: any, res: any) => {
    const ip = req.ip || req.socket.remoteAddress || "client";
    const now = Date.now();

    const attempt = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
    if (now - attempt.lastAttempt > 600000) {
      attempt.count = 0;
    }
    if (attempt.count >= 6) {
      return res.status(429).json({
        success: false,
        error: "Too many payment submission attempts. Rate limit exceeded. Please wait 10 minutes.",
      });
    }

    const { utr, points, priceNumeric, receiverUpi, userEmail, userName } = req.body;

    if (!utr || typeof utr !== "string") {
      attempt.count += 1;
      attempt.lastAttempt = now;
      failedAttempts.set(ip, attempt);
      return res.status(400).json({
        success: false,
        error: "Bank UTR / UPI Reference number is required.",
      });
    }

    const cleanUtr = utr.trim().replace(/\s+/g, "");

    // 12-digit standard NPCI UPI UTR validation rule
    if (!/^\d{12}$/.test(cleanUtr)) {
      attempt.count += 1;
      attempt.lastAttempt = now;
      failedAttempts.set(ip, attempt);
      return res.status(400).json({
        success: false,
        error: "Invalid UTR format. Bank UTR / UPI Reference must be exactly 12 numeric digits.",
      });
    }

    // Blacklist obvious fake / dummy test sequences
    const dummyPatterns = [
      "000000000000",
      "111111111111",
      "222222222222",
      "333333333333",
      "444444444444",
      "555555555555",
      "666666666666",
      "777777777777",
      "888888888888",
      "999999999999",
      "123456789012",
      "012345678901",
    ];
    if (dummyPatterns.includes(cleanUtr)) {
      attempt.count += 1;
      attempt.lastAttempt = now;
      failedAttempts.set(ip, attempt);
      return res.status(400).json({
        success: false,
        error: "Invalid dummy test sequence. Please enter the genuine 12-digit UTR from your bank receipt.",
      });
    }

    // Server-side authoritative Point Package lookup & anti-tampering validation
    const numPoints = Number(points);
    const matchedPackage = VALID_PACKAGES[numPoints];
    if (!matchedPackage) {
      return res.status(400).json({
        success: false,
        error: `Invalid point package: ${points}. Valid packages are: ${Object.keys(VALID_PACKAGES).join(", ")}.`,
      });
    }

    const authoritativePrice = matchedPackage.price;
    const submittedPrice = Number(priceNumeric);
    if (submittedPrice && submittedPrice !== authoritativePrice) {
      return res.status(400).json({
        success: false,
        error: `Price tampering detected: Package ${numPoints} points costs ₹${authoritativePrice}, submitted ₹${submittedPrice}.`,
      });
    }

    // Check if UTR already processed or duplicate
    if (claimedUtrs.has(cleanUtr)) {
      return res.status(409).json({
        success: false,
        error: `UTR ${cleanUtr} has already been claimed and credited. Duplicate submissions are not allowed.`,
      });
    }

    const existingPending = pendingPayments.find((p) => p.utr === cleanUtr);
    if (existingPending) {
      return res.status(200).json({
        success: true,
        status: existingPending.status,
        message: `Payment with UTR ${cleanUtr} is already registered (${existingPending.status}).`,
        payment: existingPending,
      });
    }

    // Sanitize user-provided fields to prevent stored XSS or injection
    const sanitizedEmail = String(userEmail || "anonymous").replace(/[<>"'/]/g, "").slice(0, 100);
    const sanitizedName = String(userName || "Learner").replace(/[<>"'/]/g, "").slice(0, 80);
    const sanitizedReceiver = String(receiverUpi || "vihaanpatange@fam").replace(/[<>"'/]/g, "").slice(0, 80);

    const paymentRecord: PendingUpiPayment = {
      id: `upi-${Date.now()}-${cleanUtr.slice(-4)}`,
      utr: cleanUtr,
      points: numPoints,
      priceNumeric: authoritativePrice,
      receiverUpi: sanitizedReceiver,
      userEmail: sanitizedEmail,
      userName: sanitizedName,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    // Memory leak / DoS protection: cap in-memory queue to maximum 1000 records
    if (pendingPayments.length >= 1000) {
      const oldestResolvedIdx = pendingPayments.findLastIndex((p) => p.status !== "pending");
      if (oldestResolvedIdx !== -1) {
        pendingPayments.splice(oldestResolvedIdx, 1);
      } else {
        pendingPayments.pop();
      }
    }

    pendingPayments.unshift(paymentRecord);
    console.log(`📩 New Direct UPI Payment Submitted: UTR ${cleanUtr}, Amount: ₹${authoritativePrice}, Points: +${numPoints} (Status: PENDING)`);

    return res.status(201).json({
      success: true,
      status: "pending",
      message: "Payment submitted for bank settlement verification. Points will be credited once verified.",
      payment: paymentRecord,
    });
  });

  // 2b. Admin-Only: Get all pending payments for settlement verification
  apiRouter.get("/payments/pending", requireAdminAuth, (_req: any, res: any) => {
    res.json({ payments: pendingPayments });
  });

  // 2c. Admin-Only: Verify & Credit Points
  apiRouter.post("/payments/approve", requireAdminAuth, (req: any, res: any) => {
    const { paymentId, utr } = req.body;
    const payment = pendingPayments.find(
      (p) => (paymentId && p.id === paymentId) || (utr && p.utr === utr)
    );

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found." });
    }

    if (payment.status === "approved") {
      return res.status(200).json({
        success: true,
        verified: true,
        message: "Payment was already approved.",
        payment,
      });
    }

    payment.status = "approved";
    payment.verifiedAt = new Date().toISOString();
    claimedUtrs.add(payment.utr);

    console.log(`💰 Verified & Approved UPI Payment: UTR ${payment.utr}, +${payment.points} Points credited.`);

    res.json({
      success: true,
      verified: true,
      message: "Payment verified successfully. Points credited.",
      payment,
    });
  });

  // 2d. Admin-Only: Reject Fraudulent / Unconfirmed UTR
  apiRouter.post("/payments/reject", requireAdminAuth, (req: any, res: any) => {
    const { paymentId, utr, reason } = req.body;
    const payment = pendingPayments.find(
      (p) => (paymentId && p.id === paymentId) || (utr && p.utr === utr)
    );

    if (!payment) {
      return res.status(404).json({ success: false, error: "Payment record not found." });
    }

    payment.status = "rejected";
    const cleanReason = String(reason || "Unverified in bank account").replace(/[<>"'/]/g, "").slice(0, 150);
    console.warn(`❌ Rejected UPI Payment: UTR ${payment.utr}, Reason: ${cleanReason}`);

    res.json({
      success: true,
      status: "rejected",
      message: "Payment rejected.",
      payment,
    });
  });

  // 2e. Public Status Check of a specific UTR
  apiRouter.post("/payments/verify-upi", (req: any, res: any) => {
    const { utr } = req.body;
    if (!utr || typeof utr !== "string") {
      return res.status(400).json({ verified: false, error: "UTR is required." });
    }

    const cleanUtr = String(utr).trim().replace(/\s+/g, "").slice(0, 12);
    const payment = pendingPayments.find((p) => p.utr === cleanUtr);

    if (!payment) {
      return res.status(404).json({
        verified: false,
        error: "UTR has not been submitted yet.",
      });
    }

    if (payment.status === "approved") {
      return res.status(200).json({
        verified: true,
        status: "approved",
        points: payment.points,
        utr: payment.utr,
        verifiedAt: payment.verifiedAt,
      });
    }

    // PII Redaction: Do not leak sensitive userEmail or receiver details to unauthenticated callers
    return res.status(200).json({
      verified: false,
      status: payment.status,
      points: payment.points,
      message: "Payment is pending bank statement confirmation by administrator.",
    });
  });

  // 3. Create Razorpay Order with Strict Boundary Validation
  apiRouter.post("/razorpay/create-order", async (req: any, res: any) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          error: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in server environment.",
        });
      }

      const { amount, currency = "INR", receipt, notes } = req.body;

      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0 || numAmount > 100000) {
        return res.status(400).json({ error: "Valid amount is required (between ₹1 and ₹100,000)." });
      }

      if (currency !== "INR") {
        return res.status(400).json({ error: "Only INR currency is supported." });
      }

      const amountInPaise = Math.round(numAmount * 100);

      const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt ? String(receipt).slice(0, 40) : `rcpt_${Date.now()}`,
        notes: notes && typeof notes === "object" ? notes : {},
      };

      const order = await razorpay.orders.create(options);

      res.status(200).json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: razorpayKeyId,
      });
    } catch (error: any) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: error.message || "Failed to create Razorpay order" });
    }
  });

  // 4. Verify Razorpay Payment Signature
  apiRouter.post("/razorpay/verify-payment", async (req: any, res: any) => {
    try {
      if (!razorpayKeySecret) {
        return res.status(500).json({ error: "RAZORPAY_KEY_SECRET is not configured." });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({
          error: "Missing required parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)",
        });
      }

      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      const isAuthentic = generatedSignature === razorpay_signature;

      if (isAuthentic) {
        if (processedRazorpayPayments.has(razorpay_payment_id)) {
          return res.status(409).json({
            verified: false,
            error: "Payment has already been processed and credited. Replay attack prevented.",
          });
        }
        processedRazorpayPayments.add(razorpay_payment_id);
        console.log(`✅ Payment signature verified successfully for Order ${razorpay_order_id}`);
        return res.status(200).json({
          verified: true,
          message: "Payment verified successfully",
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
        });
      } else {
        console.warn(`❌ Payment signature verification failed for Order ${razorpay_order_id}`);
        return res.status(400).json({
          verified: false,
          error: "Invalid signature, payment verification failed",
        });
      }
    } catch (error: any) {
      console.error("Error verifying Razorpay payment:", error);
      res.status(500).json({ error: error.message || "Payment verification failed" });
    }
  });

  // Mount API router at both /api and root (to handle Vercel rewrites seamlessly)
  app.use("/api", apiRouter);
  app.use(apiRouter);

  return app;
}

const defaultApp = createApp();
export default defaultApp;
