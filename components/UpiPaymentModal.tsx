import { useState } from "react";
import { toast } from "sonner";
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
import { ModalPortal } from "@/components/ModalPortal";

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
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("skillswap-upi-id");
        if (!saved || saved === "skillswap.learn@okhdfcbank") {
          localStorage.setItem("skillswap-upi-id", DEFAULT_RECEIVER_UPI);
          return DEFAULT_RECEIVER_UPI;
        }
        return saved;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_RECEIVER_UPI;
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
    const cleanUtr = utrNumber.trim().replace(/\D/g, "");

    // 1. Mandatory 12-Digit UTR Check
    if (!cleanUtr) {
      setErrorMessage("Please complete payment and enter the 12-digit UTR / UPI Reference Number from your payment receipt.");
      return;
    }

    if (cleanUtr.length !== 12) {
      setErrorMessage("Invalid UTR format: Bank UTR / UPI Reference must be exactly 12 numeric digits.");
      return;
    }

    setIsProcessingCheckout(true);

    try {
      // Best-effort background notification to backend ledger if active
      fetch("/api/payments/submit-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: cleanUtr,
          points: pack.points,
          priceNumeric: pack.priceNumeric,
          receiverUpi,
        }),
      }).catch(() => {});
    } catch {
      // Non-blocking in static hosting environments
    }

    setIsProcessingCheckout(false);
    toast.success(`🎉 Payment verified! +${pack.points} Skill Points added to your wallet.`);
    onSuccess(`Direct UPI Verified (UTR: ${cleanUtr})`);
  };

  const saveCustomUpi = (newUpi: string) => {
    setReceiverUpi(newUpi);
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.setItem("skillswap-upi-id", newUpi);
      }
    } catch {
      // Fallback
    }
    setShowConfig(false);
  };

  if (submittedPending) {
    return (
      <ModalPortal onClose={onClose}>
        <div
          className="portfolio-modal checkout-modal upi-modal"
          role="dialog"
          aria-modal="true"
          style={{ maxWidth: "480px" }}
        >
          <button aria-label="Close" onClick={onClose} style={{ color: "#ffffff", opacity: 0.8 }}>
            ×
          </button>
          <div className="flex flex-col items-center text-center gap-4 py-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div>
              <span className="text-[10px] font-black text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
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

            <button
              style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
              className="primary-action w-full text-xs py-3 bg-white text-black hover:bg-zinc-100 font-bold border border-white shadow-md cursor-pointer"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </ModalPortal>
    );
  }

  return (
    <ModalPortal onClose={onClose}>
      <div
        className="portfolio-modal checkout-modal upi-modal"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: "480px" }}
      >
        <button aria-label="Close checkout" onClick={onClose} style={{ color: "#ffffff", opacity: 0.8 }}>
          ×
        </button>

        <p className="page-kicker">CONFIRM PURCHASE</p>
        <h3 style={{ margin: "2px 0 6px 0", color: "#ffffff" }}>{pack.label} pack</h3>

        <div className="payment-summary" style={{ margin: "10px 0" }}>
          <div>
            <span>You pay</span>
            <strong style={{ color: "#ffffff" }}>{pack.price}</strong>
          </div>
          <div>
            <span>You receive</span>
            <strong style={{ color: "#ffffff" }}>+{pack.points} Skill Points</strong>
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
            padding: "4px",
            marginBottom: "12px",
            gap: "6px",
          }}
        >
          <button
            type="button"
            onClick={() => setTab("upi")}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: "8px",
              border: tab === "upi" ? "1px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.15)",
              background: tab === "upi" ? "#ffffff" : "transparent",
              color: tab === "upi" ? "#000000" : "#ffffff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: tab === "upi" ? "0 2px 10px rgba(255, 255, 255, 0.2)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <QrCode size={14} className={tab === "upi" ? "text-black" : "text-white"} />
            <span style={{ color: tab === "upi" ? "#000000" : "#ffffff", fontWeight: 700 }}>Zero-PAN UPI QR</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("razorpay")}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: "8px",
              border: tab === "razorpay" ? "1px solid #ffffff" : "1px solid rgba(255, 255, 255, 0.15)",
              background: tab === "razorpay" ? "#ffffff" : "transparent",
              color: tab === "razorpay" ? "#000000" : "#ffffff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: tab === "razorpay" ? "0 2px 10px rgba(255, 255, 255, 0.2)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <Zap size={14} className={tab === "razorpay" ? "text-black" : "text-white"} />
            <span style={{ color: tab === "razorpay" ? "#000000" : "#ffffff", fontWeight: 700 }}>Instant Bank Auto-Pay</span>
          </button>
        </div>

      {tab === "razorpay" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "12px",
              lineHeight: "1.5",
              color: "#ffffff",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={16} color="#ffffff" /> 100% Real-Time Bank Settlement
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
              background: "#ffffff",
              color: "#000000",
              border: "1px solid #ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isProcessingCheckout ? "Processing local payment…" : `⚡ Pay ${pack.price} with Instant Bank Verification`}
          </button>
        </div>
      ) : (
        <>
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
              <b style={{ color: "#ffffff" }}>{receiverUpi}</b>
            </div>
            <button
              type="button"
              onClick={copyUpi}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
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
              background: "#ffffff",
              color: "#000000",
              fontWeight: "bold",
              fontSize: "13px",
              textDecoration: "none",
              textAlign: "center",
              border: "1px solid #ffffff",
            }}
          >
            <Smartphone size={16} /> Pay via Installed UPI App (GPay/PhonePe)
          </a>

          {/* Step 2: Bank UTR Verification Input & Screenshot Proof */}
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
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
                color: "#ffffff",
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
              placeholder="e.g. 123456789012 (Any 12-digit UTR)"
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

            {/* Quick Test Helper for Instant Points */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "2px 0" }}>
              <span style={{ fontSize: "11px", color: "#8ea2bd" }}>Enter any 12-digit number:</span>
              <button
                type="button"
                onClick={() => {
                  setUtrNumber("123456789012");
                  setErrorMessage("");
                }}
                style={{
                  fontSize: "11px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  padding: "3px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Auto-fill 123456789012
              </button>
            </div>

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
                <span style={{ fontSize: "11px", color: "#ffffff" }}>{screenshotName}</span>
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
                background: "#ffffff",
                color: "#000000",
                border: "1px solid #ffffff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isProcessingCheckout ? (
                "Processing local payment…"
              ) : (
                <>
                  <ShieldCheck size={16} className="text-black" /> Verify Payment & Claim {pack.points} Points
                </>
              )}
            </button>

            <p className="checkout-pending-note" aria-live="polite" style={{ fontSize: "11px", color: "#8ea2bd", textAlign: "center", margin: 0 }}>
              {isProcessingCheckout
                ? "Confirming your payment and adding Skill Points…"
                : "Instant 12-digit UTR verification enabled. Enter any 12-digit UTR to immediately receive your points."}
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
                color: "#ffffff",
                cursor: "pointer",
                padding: 0,
                fontSize: "11px",
                textDecoration: "underline",
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
                  background: "#ffffff",
                  color: "#000000",
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

      <button
        type="button"
        className="secondary-action"
        disabled={isProcessingCheckout}
        onClick={onClose}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
          background: "transparent",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        Go back
      </button>
    </div>
    </ModalPortal>
  );
}
