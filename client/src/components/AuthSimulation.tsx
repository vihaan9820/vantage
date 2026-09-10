import { Check, ShieldCheck, X } from "lucide-react";
import { GoogleIcon } from "./SocialIcons";

export type DemoProvider = "Google" | "Apple" | "Microsoft";

export function ProviderSimulation({ provider, onChoose, onClose }: { provider: DemoProvider; onChoose: (name: string) => void; onClose: () => void }) {
  const accounts = provider === "Google" ? ["Aarav Mehta", "Dev Creator"] : provider === "Apple" ? ["Private Learner", "Dev Creator"] : ["Aarav Mehta", "Workspace Member"];
  return <div className="portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="provider-simulation-title"><button aria-label="Close account selection" onClick={onClose}>×</button><p className="page-kicker">QUICK ACCOUNT ACCESS</p><h3 id="provider-simulation-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>{provider === "Google" && <GoogleIcon size={22} />}Continue with {provider}</h3><p>Select your account to continue securely with {provider}.</p><div className="provider-choice-list">{accounts.map((name) => <button key={name} className="secondary-action" onClick={() => onChoose(name)}><span className="provider-avatar">{name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{name}</strong><small>{name.toLowerCase().replace(/\s+/g, ".")}@skillswap.io</small></span><Check size={15} /></button>)}</div></div>;
}

export function PolicyPreview({
  policy,
  onClose,
  onAccept,
}: {
  policy: "Terms" | "Privacy Policy";
  onClose: () => void;
  onAccept?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="glass-panel w-full max-w-xl rounded-3xl border border-white/25 bg-black/90 p-6 md:p-8 shadow-2xl relative max-h-[88vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-preview-title"
      >
        <button
          aria-label="Close dialog"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <ShieldCheck size={18} />
          </span>
          <p className="text-xs font-bold tracking-wider uppercase text-zinc-400">
            SKILLSWAP {policy === "Privacy Policy" ? "DATA PRIVACY" : "COMMUNITY TERMS"}
          </p>
        </div>

        <h3 id="policy-preview-title" className="text-xl md:text-2xl font-black text-white mb-3">
          SkillSwap {policy}
        </h3>

        {policy === "Privacy Policy" ? (
          <div className="space-y-4 text-xs md:text-sm text-zinc-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium flex items-center gap-2.5">
              <Check size={18} className="text-white shrink-0" />
              <span>
                <strong>100% Zero-Selling Guarantee:</strong> We never sell, lease, or monetize your personal data, chat conversations, or contact information.
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-black tracking-wider text-white">1. Information We Store</h4>
              <p>
                Only details needed to run your knowledge barter exchange: your email, name, stated skills, and your TimeBank wallet ledger records.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-black tracking-wider text-white">2. Peer-to-Peer Encryption</h4>
              <p>
                Live audio and video barter sessions connect directly between participants using WebRTC end-to-end encryption. Sessions are never monitored or stored.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-black tracking-wider text-white">3. Your Data Rights & Control</h4>
              <p>
                You can export your completed barter history or request permanent profile deletion at any time in Settings.
              </p>
            </div>

            <div className="pt-2">
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white underline underline-offset-4 hover:text-zinc-300 transition-colors"
              >
                Read full legal document in new tab →
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs md:text-sm text-zinc-300 leading-relaxed">
            <p>
              SkillSwap is built for mutual respect and honest exchange. When participating:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-zinc-300">
              <li>Describe your experience accurately without misleading claims.</li>
              <li>Honor agreed time slots and session commitments.</li>
              <li>Points are held in escrow during booking and released upon completion.</li>
            </ul>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          {onAccept ? (
            <button
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              onClick={() => {
                onAccept();
                onClose();
              }}
            >
              <Check size={16} /> Accept & Agree
            </button>
          ) : (
            <button
              type="button"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              onClick={onClose}
            >
              I Understand
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
