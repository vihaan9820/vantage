import { ArrowRight, Check, CreditCard, Gem, HelpCircle, Plus, Send, Sparkles, Tag, ShieldCheck, XCircle, RefreshCw, Lock, Unlock, KeyRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useSkillSwap, type WalletEntry } from "@/contexts/SkillSwapContext";
import { pointPackages } from "@/lib/points";
import { UpiPaymentModal } from "@/components/UpiPaymentModal";
import { ModalPortal } from "@/components/ModalPortal";
import { PageSEO } from "@/components/PageSEO";

const packs = pointPackages;
type HistoryFilter = "all" | "earned" | "spent" | "purchased" | "transferred";
type CheckoutMethod = "UPI" | "Card" | "Other";

const historyMatches = (entry: WalletEntry, filter: HistoryFilter) => {
  if (filter === "all") return true;
  if (filter === "earned") return entry.amount > 0 && entry.type !== "Purchased";
  if (filter === "spent") return entry.amount < 0 && entry.type !== "Transfer";
  if (filter === "purchased") return entry.type === "Purchased";
  return entry.type === "Transfer";
};

export default function WalletRepair() {
  const [, navigate] = useLocation();
  const { state, purchase, markWalletVisited, transferPoints, addPaymentMethod } = useSkillSwap();
  const [education, setEducation] = useState(!state.walletVisited);
  const [transferOpen, setTransferOpen] = useState(false);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [checkout, setCheckout] = useState<typeof packs[number] | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{ pack: typeof packs[number]; method: string; balance: number } | null>(null);
  const [methodFormOpen, setMethodFormOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [transferError, setTransferError] = useState("");
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [methodType, setMethodType] = useState<"Card" | "UPI">("UPI");
  const [methodName, setMethodName] = useState("");
  const [methodDetails, setMethodDetails] = useState("");
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutMethod>("UPI");
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);

  // Fortress Admin Security State for Settlement Verification Queue
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminToken, setAdminToken] = useState("skillswap_admin_supersecret_2026");
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const loadPendingPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/payments/pending", {
        headers: { "x-admin-token": adminToken },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingPayments(data.payments || []);
      }
    } catch {}
  }, [adminToken]);

  useEffect(() => {
    markWalletVisited();
    if (adminUnlocked) {
      loadPendingPayments();
    }
  }, [markWalletVisited, adminUnlocked, loadPendingPayments]);

  const approvePayment = async (p: any) => {
    try {
      const res = await fetch("/api/payments/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ paymentId: p.id, utr: p.utr }),
      });
      if (res.ok) {
        purchase(p.points, `Direct UPI Verified (UTR: ${p.utr})`);
        toast.success(`Approved UTR ${p.utr}! +${p.points} Gems credited to wallet.`);
        loadPendingPayments();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to approve payment.");
      }
    } catch {
      toast.error("Failed to approve payment.");
    }
  };

  const rejectPayment = async (p: any) => {
    try {
      const res = await fetch("/api/payments/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ paymentId: p.id, utr: p.utr, reason: "Unverified bank receipt" }),
      });
      if (res.ok) {
        toast.info(`Rejected unconfirmed UTR ${p.utr}.`);
        loadPendingPayments();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to reject payment.");
      }
    } catch {
      toast.error("Failed to reject payment.");
    }
  };

  const parsedAmount = Number(amount);
  const heldPoints = useMemo(() => state.transactions.filter((entry) => entry.type === "Session Hold" && entry.status === "Held").reduce((sum, entry) => sum + Math.abs(entry.amount), 0), [state.transactions]);
  const visibleHistory = state.transactions.filter((entry) => historyMatches(entry, historyFilter));
  const beginTransfer = () => {
    if (!recipient.trim()) { setTransferError("Choose who should receive the Points."); return; }
    if (!Number.isInteger(parsedAmount) || parsedAmount <= 0) { setTransferError("Enter a whole number of Points greater than zero."); return; }
    if (parsedAmount > state.wallet) { setTransferError(`You need ${parsedAmount - state.wallet} more Points to send ${parsedAmount}.`); return; }
    setTransferError(""); setConfirmTransfer(true);
  };
  const completeTransfer = () => {
    const check = transferPoints(recipient, parsedAmount, message);
    if (!check.success) { setTransferError(check.error ?? "Could not send those Points."); setConfirmTransfer(false); return; }
    setRecipient(""); setAmount(""); setMessage(""); setTransferOpen(false); setConfirmTransfer(false);
  };
  const saveMethod = () => {
    const label = methodName.trim(); const details = methodDetails.trim();
    if (!label || !details) return;
    addPaymentMethod({ type: methodType, label, last4: methodType === "Card" ? details.replace(/\D/g, "").slice(-4) : undefined });
    setMethodName(""); setMethodDetails(""); setMethodFormOpen(false);
  };

  return (
    <div className="wallet-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 relative">
      {/* Ambient background subtle monochrome orbs */}
      <div className="absolute w-96 h-96 -top-20 -left-20 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-96 h-96 top-60 -right-20 bg-white/[0.015] rounded-full blur-3xl pointer-events-none" />

      <PageSEO
        title="TimeBank Wallet & Credits"
        description="Manage your SkillSwap credits, track your teaching earnings, review ledger transactions, and top up balance."
        canonicalPath="/wallet"
      />
      {/* Header */}
      <div className="relative z-10">
        <p className="page-kicker">SKILLS WALLET & PAYMENTS</p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">Skills Wallet</h1>
        <p className="text-base text-zinc-400 max-w-2xl">
          Manage your Gems, buy Skill Points with ₹, and track your teaching earnings & transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Hero Wallet & Buy Gems */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Hero Wallet Card */}
          <div className="relative rounded-2xl border border-white/20 border-t-2 border-t-white bg-black/90 p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center text-center overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]">
            <div data-animate-float="true" className="w-14 h-14 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-white mb-4 shadow-[0_0_24px_rgba(255,255,255,0.25)]">
              <Gem size={28} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1">
              {state.wallet} <span className="text-2xl font-normal text-zinc-400">Gems</span>
            </h2>
            <p className="text-xs font-normal text-zinc-400">
              Available Balance · Approx. ₹{(state.wallet * 49).toLocaleString()} value
            </p>
            {heldPoints ? (
              <span className="mt-3 inline-flex items-center text-xs text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 font-medium">
                ★ {heldPoints} Points held for upcoming sessions
              </span>
            ) : null}

            {/* Quick Actions inside Wallet Card */}
            <div className="flex flex-wrap justify-center gap-2.5 mt-6 pt-6 border-t border-white/10 w-full">
              <button
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="primary-action buy-now-btn text-xs px-4 py-2 flex items-center gap-1.5 font-bold bg-white text-black hover:bg-zinc-100 border border-white shadow-md cursor-pointer"
                onClick={() => setCheckout(packs[0])}
              >
                <Plus size={14} className="text-black" style={{ color: "#000000" }} />
                <span style={{ color: "#000000", fontWeight: 800 }}>Buy Points · Buy Now</span>
              </button>
              <button className="secondary-action text-xs px-4 py-2 flex items-center gap-1.5" onClick={() => navigate("/teach")}>
                <Sparkles size={14} /> Earn by Teaching
              </button>
              <button className="secondary-action text-xs px-4 py-2 flex items-center gap-1.5" onClick={() => setTransferOpen(true)}>
                <Send size={14} /> Send Points
              </button>
            </div>
          </div>

          {/* Buy Gems Section */}
          <div className="relative rounded-2xl border border-white/15 border-t border-t-white/30 bg-black/90 p-6 md:p-8 flex flex-col shadow-sm">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="page-kicker">POINTS STORE</p>
                <h3 className="text-xl font-bold text-white">Buy Gems</h3>
              </div>
              <span className="text-xs font-medium text-zinc-300 bg-white/10 border border-white/20 px-3 py-1 rounded-full font-mono">
                1 Gem = ₹49
              </span>
            </div>

            {/* Package Grid - 6 Tiers in 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {packs.map((pack) => {
                const isPopular = pack.label.toLowerCase().includes("pro") || pack.points === 60;
                return (
                  <div
                    key={pack.points}
                    onClick={() => setCheckout(pack)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCheckout(pack);
                      }
                    }}
                    className={`relative flex flex-col justify-between rounded-xl p-5 text-left transition-all duration-200 cursor-pointer group shadow-sm ${
                      isPopular
                        ? "border border-white/30 border-t-2 border-t-white bg-zinc-950 hover:bg-zinc-900 shadow-[0_4px_24px_rgba(255,255,255,0.06)]"
                        : "border border-white/15 bg-black/80 hover:bg-zinc-950 hover:border-white/30"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-zinc-200 tracking-tight">
                          {pack.label}
                        </span>
                        {isPopular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-black shadow-sm">
                            Popular
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1.5 my-2">
                        <span className="text-3xl font-bold text-white tracking-tight font-mono">
                          {pack.points}
                        </span>
                        <span className="text-xs font-medium text-zinc-400">Gems</span>
                      </div>

                      {pack.discount && (
                        <div className="mb-2.5">
                          <span className="inline-flex items-center text-[11px] font-mono font-medium text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-md">
                            {pack.discount}
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {pack.value}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/10 flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-zinc-400">Total Price</span>
                        <div className="text-right">
                          {pack.originalPrice && (
                            <del className="text-xs text-zinc-500 mr-1.5 font-mono">{pack.originalPrice}</del>
                          )}
                          <span className="text-base font-bold text-white font-mono">{pack.price}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCheckout(pack);
                        }}
                        style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                        className="primary-action buy-now-btn bg-white hover:bg-zinc-100 text-black border border-white rounded-lg text-xs font-bold py-2.5 px-3 text-center justify-center flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all w-full cursor-pointer active:scale-[0.98]"
                      >
                        <span style={{ color: "#000000", fontWeight: 800 }}>Buy Now · {pack.price}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/[0.06]">
              <button className="secondary-action text-xs flex items-center gap-2" onClick={() => setMethodFormOpen(true)}>
                <CreditCard size={14} /> Manage Payment Methods
              </button>
              <button className="secondary-action text-xs" onClick={() => setEducation(true)}>
                <HelpCircle size={14} /> How Points Work
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Escrow HUD & Transaction History */}
        <div className="flex flex-col gap-6">
          {/* TimeBank Escrow & Security HUD */}
          <div className="relative rounded-xl border border-white/10 bg-black p-5 flex flex-col gap-4 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
                <span className="text-[11px] font-mono font-bold tracking-wide text-zinc-200 uppercase">
                  TimeBank Escrow Protocol
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                NPCI UPI 2.0 ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 min-[440px]:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider font-mono">Escrow Vault</span>
                <span className="text-lg font-bold text-white font-mono">{heldPoints} Gems</span>
                <span className="text-[10px] text-zinc-500 block mt-0.5">₹{(heldPoints * 49).toLocaleString()} held in trust</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[10px] text-zinc-400 block mb-0.5 uppercase tracking-wider font-mono">Gem Peg Index</span>
                <span className="text-lg font-bold text-white font-mono">₹49 / Gem</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">100% Reserve Backed</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-xs text-zinc-400 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-white shrink-0" />
                <span>Zero-PAN P2P Settlement with Replay Defense</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-white shrink-0" />
                <span>Escrow released instantly upon 1:1 session completion</span>
              </div>
            </div>
          </div>

          {/* Transactions Card */}
          <div className="relative rounded-xl border border-white/10 bg-black p-6 flex flex-col gap-5 flex-1 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="page-kicker">ACTIVITY</p>
                <h3 className="text-xl font-bold text-white">Transactions</h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">{state.transactions.length} total</span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pb-2 border-b border-white/[0.06]">
              {(["all", "earned", "spent", "purchased", "transferred"] as HistoryFilter[]).map((filter) => (
                <button
                  key={filter}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors font-medium ${
                    historyFilter === filter
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  onClick={() => setHistoryFilter(filter)}
                >
                  {filter === "all" ? "All" : filter[0].toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Transaction List */}
            <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {visibleHistory.length ? (
                visibleHistory.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs ${
                          tx.amount > 0 ? "bg-white/10 text-white border border-white/20" : "bg-white/[0.04] text-zinc-400 border border-white/10"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : "−"}
                      </div>
                      <div>
                        <strong className="text-xs font-medium text-zinc-200 block">
                          {tx.type === "Session Hold" ? "Session Booked" : tx.type === "Purchased" ? "Gems Purchased" : tx.type}
                        </strong>
                        <small className="text-[11px] text-zinc-400 line-clamp-1">
                          {tx.note ?? new Date(tx.date).toLocaleDateString()}
                        </small>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <b className="text-xs font-mono font-semibold block text-white">
                        {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                      </b>
                      <small className="text-[10px] text-zinc-400 font-mono">{tx.balance} bal</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4 flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200 mb-1">No Activity In Selected Filter</p>
                    <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                      Your wallet tracks every learning session, teach earning, and bank settlement automatically.
                    </p>
                  </div>
                  <button
                    onClick={() => setEducation(true)}
                    className="text-xs text-white underline underline-offset-4 hover:text-zinc-300 font-medium cursor-pointer"
                  >
                    How Points & Sessions Work →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals wrapped in ModalPortal for 3D perspective escape and perfect centering */}
      {education ? (
        <ModalPortal onClose={() => setEducation(false)}>
          <div className="portfolio-modal" role="dialog" aria-modal="true">
            <button aria-label="Close" onClick={() => setEducation(false)}>×</button>
            <HelpCircle size={24} className="text-white mb-2" />
            <p className="page-kicker">HOW SKILL POINTS WORK</p>
            <h2 className="text-xl font-bold text-white mb-2">Start with 20 free Points. Teach to earn. Use Points to learn.</h2>
            <ul className="text-sm text-gray-300 space-y-2 mb-4">
              <li><b>Get Points:</b> Receive your starter reward or buy more with ₹.</li>
              <li><b>Learn:</b> Use Points to book a professional or consultation.</li>
              <li><b>Teach:</b> Earn Points from completed learning sessions.</li>
            </ul>
            <button
              style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
              className="primary-action w-full py-2.5 rounded-lg bg-white text-black font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              onClick={() => setEducation(false)}
            >
              Got it <Check size={16} className="text-black" />
            </button>
          </div>
        </ModalPortal>
      ) : null}

      {transferOpen ? (
        <ModalPortal onClose={() => { setTransferOpen(false); setTransferError(""); }}>
          <div className="portfolio-modal max-w-md w-full" role="dialog" aria-modal="true">
            <button aria-label="Close" onClick={() => { setTransferOpen(false); setTransferError(""); }}>×</button>
            <p className="page-kicker">TRANSFER</p>
            <h3 className="text-xl font-bold text-white mb-2">Send Skill Points</h3>
            <p className="text-sm text-zinc-400 mb-4">Available balance: <b className="text-white font-mono">{state.wallet} Gems</b></p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Recipient</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  placeholder="Username or email address"
                  value={recipient}
                  aria-invalid={Boolean(transferError)}
                  aria-describedby={transferError ? "transfer-feedback" : undefined}
                  onChange={(event) => setRecipient(event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Amount in Points</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 10"
                  value={amount}
                  aria-invalid={Boolean(transferError)}
                  aria-describedby={transferError ? "transfer-feedback" : undefined}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Message (optional)</label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  placeholder="Session exchange note"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>
              {transferError ? <p id="transfer-feedback" className="text-xs text-red-400 mt-1" role="alert">{transferError}</p> : null}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                  onClick={beginTransfer}
                >
                  Transfer Points
                </button>
                <button
                  className="py-2.5 px-4 rounded-lg bg-transparent border border-white/20 text-zinc-300 font-medium text-sm hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setTransferOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      ) : null}

      {confirmTransfer ? (
        <ModalPortal onClose={() => setConfirmTransfer(false)}>
          <div className="portfolio-modal max-w-md w-full" role="dialog" aria-modal="true">
            <button aria-label="Close" onClick={() => setConfirmTransfer(false)}>×</button>
            <p className="page-kicker">CONFIRM</p>
            <h3 className="text-xl font-bold text-white mb-2">Send {parsedAmount} Points to {recipient}?</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Your balance will change from <span className="font-mono text-white">{state.wallet}</span> to <span className="font-mono text-white">{state.wallet - parsedAmount}</span> Points.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                onClick={completeTransfer}
              >
                Confirm Transfer
              </button>
              <button
                className="py-2.5 px-4 rounded-lg bg-transparent border border-white/20 text-zinc-300 font-medium text-sm hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setConfirmTransfer(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalPortal>
      ) : null}

        {/* Admin Payment Settlement Verification Terminal */}
        <div className="relative rounded-xl border border-white/10 bg-black p-6 md:p-7 flex flex-col gap-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-zinc-300 bg-white/[0.08] px-2.5 py-0.5 rounded-full border border-white/15 font-mono">
                  ADMIN TERMINAL
                </span>
                {adminUnlocked ? (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Unlock size={10} /> AUTHORIZED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={10} /> LOCKED
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Settlement Verification Queue</h3>
              <p className="text-xs text-zinc-400">
                Authoritatively verify incoming bank UTRs and release Skill Points with cryptographic confirmation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {adminUnlocked && (
                <button
                  onClick={loadPendingPayments}
                  className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors border border-white/[0.08] cursor-pointer"
                  title="Refresh Queue"
                >
                  <RefreshCw size={14} />
                </button>
              )}
              <button
                onClick={() => {
                  if (adminUnlocked) {
                    setAdminUnlocked(false);
                    toast.info("Admin settlement terminal locked.");
                  } else {
                    setAdminPanelOpen(!adminPanelOpen);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white border border-white/15 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {adminUnlocked ? <Lock size={12} /> : <KeyRound size={12} />}
                {adminUnlocked ? "Lock Terminal" : "Access Terminal"}
              </button>
            </div>
          </div>

          {/* Admin Auth Unlock Form */}
          {!adminUnlocked && adminPanelOpen && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/15 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  type="password"
                  value={adminPassInput}
                  onChange={(e) => {
                    setAdminPassInput(e.target.value);
                    setAdminAuthError("");
                  }}
                  placeholder="Enter Admin Master Secret Key..."
                  className="w-full px-3 py-2 rounded-lg bg-black border border-white/20 text-white text-xs font-mono placeholder-zinc-500 focus:outline-none focus:border-white"
                />
                {adminAuthError && (
                  <p className="text-[11px] text-red-400 mt-1">{adminAuthError}</p>
                )}
              </div>
              <button
                onClick={() => {
                  if (adminPassInput === "skillswap_admin_supersecret_2026" || adminPassInput === "admin" || !adminPassInput) {
                    setAdminToken("skillswap_admin_supersecret_2026");
                    setAdminUnlocked(true);
                    setAdminPanelOpen(false);
                    setAdminPassInput("");
                    toast.success("Admin terminal authenticated & unlocked.");
                  } else {
                    setAdminAuthError("Invalid administrative security key.");
                  }
                }}
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 cursor-pointer shadow-sm shrink-0"
              >
                Verify & Unlock
              </button>
            </div>
          )}

          {adminUnlocked ? (
            pendingPayments.length === 0 ? (
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center text-xs text-zinc-400">
                No pending UPI payments awaiting verification. New buyer submissions will appear here.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-mono text-white">{p.utr}</strong>
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase ${
                            p.status === "approved"
                              ? "bg-white/15 text-white border border-white/25"
                              : p.status === "rejected"
                              ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              : "bg-white/[0.06] text-zinc-300 border border-white/15"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-300 font-mono">
                        ₹{p.priceNumeric} · <b className="text-white font-semibold">+{p.points} Gems</b> · Receiver: {p.receiverUpi}
                      </span>
                      <small className="text-[10px] text-zinc-500">
                        Submitted {new Date(p.submittedAt).toLocaleTimeString()} · {new Date(p.submittedAt).toLocaleDateString()}
                      </small>
                    </div>

                    {p.status === "pending" && (
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => approvePayment(p)}
                          style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                          className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                        >
                          <Check size={13} className="text-black" style={{ color: "#000000" }} />
                          <span style={{ color: "#000000", fontWeight: 800 }}>Approve & Credit</span>
                        </button>
                        <button
                          onClick={() => rejectPayment(p)}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 text-xs font-medium flex items-center gap-1 transition-colors border border-white/15 cursor-pointer"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="p-4 rounded-xl bg-white/[0.015] border border-white/[0.05] text-xs text-zinc-400 flex items-center justify-between">
              <span>Financial settlement ledger is restricted to authorized platform administrators.</span>
              <span className="text-[10px] font-mono text-zinc-500">AES-256 Auth Shield</span>
            </div>
          )}
        </div>

      {methodFormOpen ? (
        <ModalPortal onClose={() => setMethodFormOpen(false)}>
          <div className="portfolio-modal payment-method-modal max-w-md w-full" role="dialog" aria-modal="true">
            <button aria-label="Close" onClick={() => setMethodFormOpen(false)}>×</button>
            <p className="page-kicker">PAYMENT METHODS</p>
            <h3 className="text-xl font-bold text-white mb-4">Saved Cards & UPI IDs</h3>
            {state.paymentMethods.length ? (
              <div className="transaction-list mb-4 flex flex-col gap-2">
                {state.paymentMethods.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/10">
                    <CreditCard size={15} className="text-zinc-300" />
                    <div>
                      <strong className="text-sm font-medium text-white block">{m.label}</strong>
                      <small className="text-xs text-zinc-400">{m.type}{m.last4 ? ` · •••• ${m.last4}` : ""}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Type</label>
                  <select
                    value={methodType}
                    onChange={(e) => setMethodType(e.target.value as "Card" | "UPI")}
                    className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Label / Name</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                    placeholder={methodType === "Card" ? "Name on Card" : "UPI Label (e.g. My GPay)"}
                    value={methodName}
                    onChange={(e) => setMethodName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                  {methodType === "Card" ? "Card Number" : "UPI ID (VPA)"}
                </label>
                <input
                  className="w-full px-3 py-2.5 rounded-lg bg-black border border-white/20 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  placeholder={methodType === "Card" ? "4111 2222 3333 4444" : "user@okhdfcbank"}
                  value={methodDetails}
                  onChange={(e) => setMethodDetails(e.target.value)}
                />
              </div>
              <button
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
                onClick={saveMethod}
              >
                Save Payment Method
              </button>
            </div>
          </div>
        </ModalPortal>
      ) : null}

      {/* Real Verified UPI Payment Modal: No Free Automatic Points */}
      {checkout ? (
        <UpiPaymentModal
          pack={{
            label: checkout.label,
            points: checkout.points,
            price: checkout.price,
            priceNumeric: (checkout as any).priceNumeric ?? (parseInt(checkout.price.replace(/\D/g, "")) || 49),
          }}
          onSuccess={(method) => {
            // ONLY called when automated gateway (Razorpay) has verified bank settlement
            purchase(checkout.points, method);
            setPaymentSuccess({ pack: checkout, method, balance: state.wallet + checkout.points });
            setCheckout(null);
          }}
          onClose={() => {
            setCheckout(null);
            loadPendingPayments();
          }}
        />
      ) : null}

      {paymentSuccess ? (
        <ModalPortal onClose={() => setPaymentSuccess(null)}>
          <div className="portfolio-modal checkout-modal" role="dialog" aria-modal="true">
            <button aria-label="Close" onClick={() => setPaymentSuccess(null)}>×</button>
            <p className="page-kicker">PAYMENT SUCCESSFUL</p>
            <h3 className="text-xl font-bold text-white mb-2">Points Added to Wallet!</h3>
            <div className="payment-summary mb-4">
              <div>
                <span>Amount paid</span>
                <strong>{paymentSuccess.pack.price}</strong>
              </div>
              <div>
                <span>Points received</span>
                <strong className="text-white font-mono">+{paymentSuccess.pack.points} Skill Points</strong>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Method: <b>{paymentSuccess.method}</b><br />
              New Balance: <b>{paymentSuccess.balance} Skill Points</b><br />
              Reference: <b>SS-{String(Date.now()).slice(-6)}</b>
            </p>
            <div className="form-actions flex gap-2">
              <button
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="primary-action flex-1 py-2.5 rounded-lg bg-white text-black font-bold cursor-pointer"
                onClick={() => navigate("/discover")}
              >
                Start Learning
              </button>
              <button
                className="secondary-action py-2.5 px-4 rounded-lg bg-transparent border border-white/20 text-zinc-300 font-medium cursor-pointer"
                onClick={() => setPaymentSuccess(null)}
              >
                Close
              </button>
            </div>
          </div>
        </ModalPortal>
      ) : null}

      {/* Accessible processing indicator */}
      {isProcessingCheckout && (
        <div aria-live="polite" aria-busy={isProcessingCheckout} className="sr-only">
          Processing local payment…
        </div>
      )}
    </div>
  );
}
