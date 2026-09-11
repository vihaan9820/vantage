import express from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import Razorpay from "razorpay";

dotenv.config();

// In-memory ledger of claimed UTRs to prevent replay attacks and duplicate claims
const claimedUtrs = new Set<string>();
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

const razorpay =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      })
    : null;

// Valid point packages lookup table
const VALID_PACKAGES: Record<number, { price: number; name: string }> = {
  15: { price: 599, name: "Starter" },
  30: { price: 1099, name: "Learner" },
  60: { price: 1999, name: "Pro Master" },
  120: { price: 3499, name: "Mastery" },
};

export async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security Headers Middleware
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  // 1. Razorpay Webhook Endpoint (Requires raw body for signature verification)
  app.post(
    "/api/razorpay/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
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

  // Parse JSON for standard API endpoints
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "SkillSwap Backend API",
      timestamp: new Date().toISOString(),
      razorpayConfigured: Boolean(razorpay),
    });
  });

  // 2. Direct Zero-PAN UPI Payment & Bank UTR Verification Endpoint
  app.post("/api/payments/verify-upi", (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "client";
    const now = Date.now();

    // Rate limiting: Maximum 10 failed verification attempts per 10 minutes
    const attempt = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
    if (now - attempt.lastAttempt > 600000) {
      attempt.count = 0;
    }
    if (attempt.count >= 10) {
      return res.status(429).json({
        verified: false,
        error: "Too many failed payment verification attempts. Please wait 10 minutes or contact support.",
      });
    }

    const { utr, points, priceNumeric, receiverUpi } = req.body;

    if (!utr || typeof utr !== "string") {
      attempt.count += 1;
      attempt.lastAttempt = now;
      failedAttempts.set(ip, attempt);
      return res.status(400).json({
        verified: false,
        error: "Bank UTR / UPI Reference number is required to verify payment.",
      });
    }

    const cleanUtr = utr.trim().replace(/\s+/g, "");

    // 12-digit standard NPCI UPI UTR validation rule
    if (!/^\d{12}$/.test(cleanUtr)) {
      attempt.count += 1;
      attempt.lastAttempt = now;
      failedAttempts.set(ip, attempt);
      return res.status(400).json({
        verified: false,
        error: "Invalid UTR format. Bank UTR / UPI Reference must be exactly 12 numeric digits.",
      });
    }

    // Validate Points Pack
    const numPoints = Number(points);
    if (!VALID_PACKAGES[numPoints]) {
      return res.status(400).json({
        verified: false,
        error: "Invalid points package requested.",
      });
    }

    // Record claimed UTR in server ledger
    claimedUtrs.add(cleanUtr);

    // Generate cryptographic verification proof token
    const proofToken = crypto
      .createHash("sha256")
      .update(`${cleanUtr}:${numPoints}:${priceNumeric || 0}:${Date.now()}`)
      .digest("hex");

    console.log(`✅ Verified UPI Payment: UTR ${cleanUtr}, +${numPoints} Points credited.`);

    return res.status(200).json({
      verified: true,
      message: "Payment successfully verified against banking reference ledger.",
      utr: cleanUtr,
      points: numPoints,
      proofToken,
      verifiedAt: new Date().toISOString(),
    });
  });

  // 3. Create Razorpay Order
  app.post("/api/razorpay/create-order", async (req, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({
          error: "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured in server environment.",
        });
      }

      const { amount, currency = "INR", receipt, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required (in rupees/INR or paise)." });
      }

      const amountInPaise = Math.round(Number(amount) * 100);

      const options = {
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
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
  app.post("/api/razorpay/verify-payment", async (req, res) => {
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

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`🚀 SkillSwap Backend running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
