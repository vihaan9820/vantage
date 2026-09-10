# SkillSwap Backend API

Production-ready Node.js & Express backend for SkillSwap payment processing, banking UTR verification, anti-fraud replay protection, and Razorpay gateway integration.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `PORT`: Port to run the server (default `3000`)
- `RAZORPAY_KEY_ID`: Your Razorpay Key ID (optional for direct UPI mode)
- `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret

### 3. Run the Development Server
```bash
npm run dev
```

### 4. Build and Start for Production
```bash
npm run build
npm start
```

---

## 📡 API Endpoints

### 1. Zero-PAN UPI Payment & Bank UTR Verification
- **Endpoint:** `POST /api/payments/verify-upi`
- **Description:** Verifies 12-digit banking UTR / UPI Reference Number from GPay, PhonePe, Paytm, or BHIM receipts. Includes anti-replay database, rate-limiting, and cryptographic proof token.
- **Request Body:**
```json
{
  "utr": "423891028374",
  "points": 15,
  "priceNumeric": 599,
  "receiverUpi": "skillswap.learn@okhdfcbank"
}
```
- **Response (200 OK):**
```json
{
  "verified": true,
  "message": "Payment successfully verified against banking reference ledger.",
  "utr": "423891028374",
  "points": 15,
  "proofToken": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "verifiedAt": "2026-09-01T04:00:00.000Z"
}
```

---

### 2. Create Razorpay Order
- **Endpoint:** `POST /api/razorpay/create-order`
- **Request Body:**
```json
{
  "amount": 599,
  "currency": "INR",
  "receipt": "rcpt_123456"
}
```

---

### 3. Verify Razorpay Payment Signature
- **Endpoint:** `POST /api/razorpay/verify-payment`
- **Request Body:**
```json
{
  "razorpay_order_id": "order_xyz",
  "razorpay_payment_id": "pay_abc",
  "razorpay_signature": "hmac_sha256_signature"
}
```

---

### 4. Razorpay Webhook Listener
- **Endpoint:** `POST /api/razorpay/webhook`
- **Description:** Receives raw webhook payloads and validates HMAC signatures.
