import { Check, ShieldCheck, X } from "lucide-react";
import { GoogleIcon } from "./SocialIcons";

export type DemoProvider = "Google" | "Apple" | "Microsoft";

export function ProviderSimulation({ provider, onChoose, onClose }: { provider: DemoProvider; onChoose: (name: string) => void; onClose: () => void }) {
  const accounts = provider === "Google" ? ["Aarav Mehta", "Dev Creator"] : provider === "Apple" ? ["Private Learner", "Dev Creator"] : ["Aarav Mehta", "Workspace Member"];
  return <div className="portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="provider-simulation-title"><button aria-label="Close account selection" onClick={onClose}>×</button><p className="page-kicker">QUICK ACCOUNT ACCESS</p><h3 id="provider-simulation-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>{provider === "Google" && <GoogleIcon size={22} />}Continue with {provider}</h3><p>Select your account to continue securely with {provider}.</p><div className="provider-choice-list">{accounts.map((name) => <button key={name} className="secondary-action" onClick={() => onChoose(name)}><span className="provider-avatar">{name.split(" ").map((part) => part[0]).join("")}</span><span><strong>{name}</strong><small>{name.toLowerCase().replace(/\s+/g, ".")}@skillswap.io</small></span><Check size={15} /></button>)}</div></div>;
}

export function PolicyPreview({ policy, onClose }: { policy: "Terms" | "Privacy Policy"; onClose: () => void }) {
  return <div className="portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="policy-preview-title"><button aria-label="Close policy preview" onClick={onClose}>×</button><p className="page-kicker">{policy.toUpperCase()}</p><h3 id="policy-preview-title">SkillSwap {policy}</h3><div className="policy-preview-copy"><p><ShieldCheck size={16} /> Official SkillSwap Community & Data Protection Standards.</p>{policy === "Terms" ? <><p>Use SkillSwap respectfully, describe your own experience accurately, and confirm session details before transferring points.</p><p>Do not represent unverified qualifications, outcomes, reviews, or availability as fact.</p></> : <><p>Your account data, credit ledger, and privacy settings are protected and encrypted.</p><p>We never sell your personal information or exchange data with unauthorized third parties.</p></>}</div><button className="primary-action" onClick={onClose}>I understand</button></div>;
}
