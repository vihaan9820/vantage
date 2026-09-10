import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertCircle,
  Lock,
  Upload,
  CreditCard,
} from "lucide-react";
import { openRazorpayCheckout } from "@/lib/razorpay";

export type UpiPack = {
  label: string;
  points: number;
  price: string;
  priceNumeric: number;
  value?: string;
};

export const DEFAULT_RECEIVER_UPI = "vihaanpatange@fam";

export function UpiPaymentModal({
  pack,
  onSuccess,
  onClose,
}: {
  pack: UpiPack;
  onSuccess: (method: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"upi" | "razorpay">("upi");
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotName, setScreenshotName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [submittedPending, setSubmittedPending] = useState<{ utr: string; points: number } | null>(null);
  const [receiverUpi, setReceiverUpi] = useState(() => {
    const saved = localStorage.getItem("skillswap-upi-id");
    if (!saved || saved === "skillswap.learn@okhdfcbank") {
      localStorage.setItem("skillswap-upi-id", DEFAULT_RECEIVER_UPI);
      return DEFAULT_RECEIVER_UPI;
    }
    return saved;
  });
  const [showConfig, setShowConfig] = useState(false);

  // NPCI standard UPI payment intent string
  const upiIntentString = `upi://pay?pa=${encodeURIComponent(
    receiverUpi
  )}&pn=SkillSwap%20Learning&am=${pack.priceNumeric}&cu=INR&tn=${encodeURIComponent(
    `SkillSwap ${pack.points} Points Pack`
  )}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(receiverUpi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRazorpayInstantPay = async () => {
    setErrorMessage("");
    setIsProcessingCheckout(true);
    try {
      await openRazorpayCheckout({
        amountInRupees: pack.priceNumeric,
        name: "SkillSwap Learning",
        description: `${pack.label} - ${pack.points} Skill Points`,
        onSuccess: (resp) => {
          setIsProcessingCheckout(false);
          // Razorpay verifies the bank transaction in real-time
          onSuccess(`Razorpay Bank Verified (Payment ID: ${resp.razorpay_payment_id})`);
        },
        onError: (err) => {
          setIsProcessingCheckout(false);
          setErrorMessage(err.message || "Payment cancelled or failed by bank. No points were added.");
        },
        onDismiss: () => {
          setIsProcessingCheckout(false);
        },
      });
    } catch (err: any) {
      setIsProcessingCheckout(false);
      setErrorMessage(err.message || "Unable to start Razorpay payment. Please use Direct UPI option.");
    }
  };

  const handleVerifyAndConfirm = async () => {
    setErrorMessage("");
    const cleanUtr = utrNumber.trim().replace(/\s+/g, "");

    // 1. Mandatory 12-Digit UTR Check
    if (!cleanUtr) {
      setErrorMessage("Please complete payment and enter the 12-digit UTR / UPI Reference Number from your payment receipt.");
      return;
    }

    if (!/^\d{12}$/.test(cleanUtr)) {
      setErrorMessage("Invalid UTR format: Bank UTR / UPI Reference must be exactly 12 numeric digits (found on your GPay/PhonePe receipt).");
      return;
    }

    // 2. Reject obvious fake / dummy sequences
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
      setErrorMessage("Invalid test sequence: Please enter the authentic 12-digit banking UTR from your completed payment.");
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const res = await fetch("/api/payments/submit-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: cleanUtr,
          points: pack.points,
          priceNumeric: pack.priceNumeric,
          receiverUpi,
        }),
      });

      const data = await res.json().catch(() => ({}));
      setIsProcessingCheckout(false);

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to submit UTR for payment verification.");
        return;
      }

      // DO NOT automatically credit points! Set submitted pending status
      setSubmittedPending({ utr: cleanUtr, points: pack.points });
    } catch {
      setIsProcessingCheckout(false);
      setErrorMessage("Network error: Could not reach verification server. Please try again.");
    }
  };

  const saveCustomUpi = (newUpi: string) => {
    setReceiverUpi(newUpi);
    localStorage.setItem("skillswap-upi-id", newUpi);
    setShowConfig(false);
  };

  if (submittedPending) {
    return (
      <div
        className="portfolio-modal checkout-modal upi-modal"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: "480px" }}
      >
        <button aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="flex flex-col items-center text-center gap-4 py-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-0.5 rounded-full border border-[#F59E0B]/25">
              VERIFICATION PENDING
            </span>
            <h3 className="text-xl font-bold text-white mt-2 mb-1">Payment Submitted</h3>
            <p className="text-xs text-gray-300 max-w-sm leading-relaxed">
              We received your payment reference for <b>{pack.price}</b> (+{submittedPending.points} Gems).
            </p>
          </div>

          <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-left flex flex-col gap-2">
            <div className="flex justify-between items-center text-gray-300">
              <span>Submitted UTR:</span>
              <strong className="text-white font-mono">{submittedPending.utr}</strong>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span>Receiver UPI:</span>
              <span className="text-gray-300 font-mono text-[11px]">{receiverUpi}</span>
            </div>
            <div className="border-t border-white/10 pt-2 text-[11px] text-gray-400">
              🛡️ <b>Anti-Fraud Policy:</b> Points are never credited automatically until verified against the receiver bank account statement. You will be credited once verified.
            </div>
          </div>

          <button className="primary-action w-full text-xs py-3" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="portfolio-modal checkout-modal upi-modal"
      role="dialog"
      aria-modal="true"
      style={{ maxWidth: "480px" }}
    >
      <button aria-label="Close checkout" onClick={onClose}>
        ×
      </button>

      <p className="page-kicker">CONFIRM PURCHASE</p>
      <h3 style={{ margin: "2px 0 6px 0" }}>{pack.label} pack</h3>

      <div className="payment-summary" style={{ margin: "10px 0" }}>
        <div>
          <span>You pay</span>
          <strong style={{ color: "#c8ff40" }}>{pack.price}</strong>
        </div>
        <div>
          <span>You receive</span>
          <strong>+{pack.points} Skill Points</strong>
        </div>
      </div>

      <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#a9bad1" }}>
        {pack.value || "Instant credit to your balance. No PAN, KYC, or merchant fee required."}
      </p>

      {/* Payment Mode Selector */}
      <div
        style={{
          display: "flex",
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 0.05)",
          padding: "3px",
          marginBottom: "12px",
          gap: "4px",
        }}
      >
        <button
          type="button"
          onClick={() => setTab("upi")}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: tab === "upi" ? "#00f0ff" : "transparent",
            color: tab === "upi" ? "#000000" : "#ffffff",
            fontWeight: "bold",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <QrCode size={14} /> Zero-PAN UPI QR
        </button>
        <button
          type="button"
          onClick={() => setTab("razorpay")}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: tab === "razorpay" ? "#00f0ff" : "transparent",
            color: tab === "razorpay" ? "#000000" : "#ffffff",
            fontWeight: "bold",
            fontSize: "12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
          }}
        >
          <Zap size={14} /> Instant Bank Auto-Pay
        </button>
      </div>

      {tab === "razorpay" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "rgba(0, 240, 255, 0.05)",
              border: "1px solid rgba(0, 240, 255, 0.2)",
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#dffeff",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={16} color="#00f0ff" /> 100% Real-Time Bank Settlement
            </div>
            Directly confirms payment with your bank using Razorpay UPI, GPay, PhonePe, or Cards. Points are only released if the payment is authenticated.
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                fontSize: "11px",
                color: "#ff6b81",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <AlertCircle size={13} /> {errorMessage}
            </div>
          )}

          <button
            className="primary-action"
            aria-busy={isProcessingCheckout}
            disabled={isProcessingCheckout}
            onClick={handleRazorpayInstantPay}
            style={{
              width: "100%",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            {isProcessingCheckout ? "Processing local payment…" : `⚡ Pay ${pack.price} with Instant Bank Verification`}
          </button>
        </div>
      ) : (
        <>
          {/* QR Code Container */}
          {/* Official Receiving QR Code Container */}
          <div
            style={{
              background: "#ffffff",
              padding: "14px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {receiverUpi === "vihaanpatange@fam" || !receiverUpi ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "210px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}
              >
                <img
                  src="/upi-qr-code.jpg"
                  alt="Receiving UPI QR Code — vihaanpatange@fam"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <QRCodeSVG
                value={upiIntentString}
                size={170}
                level="H"
                includeMargin={false}
              />
            )}
            <div
              style={{
                textAlign: "center",
                color: "#0f172a",
                fontSize: "11px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <CheckCircle2 size={13} style={{ color: "#10b981" }} />
              Official Receiving QR · vihaanpatange@fam
            </div>
            <div
              style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: "10px",
                fontWeight: "500",
              }}
            >
              Scan with Google Pay, PhonePe, Paytm, CRED, or FamPay
            </div>
          </div>

          {/* Direct UPI ID row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              fontSize: "12px",
            }}
          >
            <div>
              <span style={{ color: "#8ea2bf", fontSize: "10px", display: "block" }}>
                Receiving UPI ID / VPA:
              </span>
              <b style={{ color: "#dffeff" }}>{receiverUpi}</b>
            </div>
            <button
              type="button"
              onClick={copyUpi}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                background: "rgba(0, 240, 255, 0.08)",
                color: "#7dfaff",
                fontSize: "11px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Copy size={12} /> {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          {/* Mobile 1-Tap UPI Intent Button */}
          <a
            href={upiIntentString}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              minHeight: "42px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00f0ff, #7000ff)",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "13px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            <Smartphone size={16} /> Pay via Installed UPI App (GPay/PhonePe)
          </a>

          {/* Step 2: Bank UTR Verification Input & Screenshot Proof */}
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(0, 240, 255, 0.04)",
              border: "1px solid rgba(0, 240, 255, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <label
              htmlFor="upi-utr-input"
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                color: "#7dfaff",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Lock size={12} /> Step 2: Enter 12-Digit Bank UTR / UPI Ref No.
            </label>
            <input
              id="upi-utr-input"
              type="text"
              maxLength={12}
              value={utrNumber}
              placeholder="e.g. 423891028374 (From your UPI receipt)"
              onChange={(e) => {
                setUtrNumber(e.target.value.replace(/\D/g, "").slice(0, 12));
                setErrorMessage("");
              }}
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                background: "#080c14",
                border: errorMessage ? "1px solid #ff4757" : "1px solid rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontSize: "13px",
                letterSpacing: "1px",
                fontWeight: "600",
              }}
            />

            {/* Optional Screenshot Upload Proof */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "11px",
                  color: "#8ea2bd",
                  cursor: "pointer",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px dashed rgba(255, 255, 255, 0.2)",
                }}
              >
                <Upload size={12} /> {screenshotName ? "Receipt Attached ✓" : "Attach Payment Screenshot (Optional)"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshotName(e.target.files?.[0]?.name || "")}
                  style={{ display: "none" }}
                />
              </label>
              {screenshotName && (
                <span style={{ fontSize: "11px", color: "#c8ff40" }}>{screenshotName}</span>
              )}
            </div>

            {errorMessage && (
              <div
                role="alert"
                style={{
                  fontSize: "11px",
                  color: "#ff6b81",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  marginTop: "2px",
                }}
              >
                <AlertCircle size={13} /> {errorMessage}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              className="primary-action"
              aria-busy={isProcessingCheckout}
              disabled={isProcessingCheckout}
              onClick={handleVerifyAndConfirm}
              style={{
                width: "100%",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {isProcessingCheckout ? (
                "Processing local payment…"
              ) : (
                <>
                  <ShieldCheck size={16} /> Verify Payment & Claim {pack.points} Points
                </>
              )}
            </button>

            <p className="checkout-pending-note" aria-live="polite" style={{ fontSize: "11px", color: "#8ea2bd", textAlign: "center", margin: 0 }}>
              {isProcessingCheckout
                ? "Confirming your local payment and adding Skill Points…"
                : "Protected with 12-digit UTR banking verification and anti-fraud replay ledger."}
            </p>
          </div>

          {/* Change UPI ID setting link */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "#8ea2bd",
            }}
          >
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              style={{
                background: "none",
                border: "none",
                color: "#7dfaff",
                cursor: "pointer",
                padding: 0,
                fontSize: "11px",
              }}
            >
              {showConfig ? "Hide UPI config" : "⚙ Change receiving UPI ID"}
            </button>
            <span>12-Digit Banking Ledger Active</span>
          </div>

          {showConfig && (
            <div
              style={{
                padding: "10px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.05)",
                display: "flex",
                gap: "6px",
              }}
            >
              <input
                defaultValue={receiverUpi}
                id="custom-upi-input"
                placeholder="e.g. yourname@oksbi"
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: "6px",
                  background: "#000",
                  border: "1px solid #444",
                  color: "#fff",
                  fontSize: "11px",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const val = (
                    document.getElementById("custom-upi-input") as HTMLInputElement
                  )?.value;
                  if (val) saveCustomUpi(val.trim());
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: "#00f0ff",
                  color: "#000",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Save
              </button>
            </div>
          )}
        </>
      )}

      <button className="secondary-action" disabled={isProcessingCheckout} onClick={onClose} style={{ width: "100%" }}>
        Go back
      </button>
    </div>
  );
}
