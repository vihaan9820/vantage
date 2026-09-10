import {
  ArrowRight,
  Check,
  CircleHelp,
  CreditCard,
  Eye,
  Gem,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  X,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import { PageSEO } from "@/components/PageSEO";
import { UserAvatar } from "@/components/UserAvatar";
import { GithubIcon, GoogleIcon } from "@/components/SocialIcons";
import { useTheme } from "@/contexts/ThemeContext";

const sections = [
  "Account",
  "Notifications",
  "Privacy",
  "Security",
  "Learning Preferences",
  "Teaching Preferences",
  "Language",
  "Accessibility",
  "Payments & Skill Points",
  "Connected Accounts",
  "Help",
];

export default function SettingsRepair() {
  const [, navigate] = useLocation();
  const { account, settings, updateSettings, updateProfile, signOut } = useAccount();
  const { theme, setTheme } = useTheme();
  const {
    state,
    enableTwoFactor,
    signOutSecuritySession,
    signOutOtherSecuritySessions,
    setRecoveryEmail,
    generateBackupCodes,
  } = useSkillSwap();

  const [section, setSection] = useState("Account");
  const [securityModal, setSecurityModal] = useState<"twofactor" | "signout" | "recovery" | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<"Authenticator App" | "Email Code">("Authenticator App");
  const [verificationCode, setVerificationCode] = useState("");
  const [recoveryDraft, setRecoveryDraft] = useState(state.security.recoveryEmail || account?.email || "");
  const [preferenceDraft, setPreferenceDraft] = useState(settings.learningPreference);
  const [teachingDraft, setTeachingDraft] = useState(settings.teachingPreference);
  const [priceDraft, setPriceDraft] = useState(account?.sessionPrice ?? 14);

  // Account section states
  const [nameDraft, setNameDraft] = useState(account?.name || "");
  const [emailDraft, setEmailDraft] = useState(account?.email || "");
  const [modeDraft, setModeDraft] = useState<"learn" | "teach" | "both">(account?.mode || "both");

  const Toggle = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div
      className="flex justify-between items-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 cursor-pointer hover:bg-white/[0.06] hover:border-white/10 transition-all shadow-sm"
      onClick={onChange}
    >
      <div>
        <strong className="text-xs text-white block">{label}</strong>
        <small className="text-[10px] text-gray-400">{checked ? "Enabled" : "Disabled"}</small>
      </div>
      <div
        className={`w-11 h-6 rounded-full p-1 transition-colors ${
          checked ? "bg-white" : "bg-white/10"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full transition-transform shadow-md ${
            checked ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
          }`}
        />
      </div>
    </div>
  );

  const saveAccountProfile = () => {
    updateProfile({
      name: nameDraft.trim() || account?.name,
      mode: modeDraft,
    });
    toast.success("Account profile details updated successfully!");
  };

  const savePreference = (kind: "learning" | "teaching") => {
    if (kind === "learning") {
      updateSettings({ learningPreference: preferenceDraft.trim() || "Project-based practice" });
      toast.success("Learning preferences updated.");
    } else {
      const validatedPrice = Math.max(12, Math.round(Number(priceDraft) || 12));
      updateProfile({ sessionPrice: validatedPrice });
      updateSettings({ teachingPreference: teachingDraft.trim() || "Open to one-to-one sessions" });
      toast.success("Teaching preferences updated.");
    }
  };

  const confirmTwoFactor = () => {
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      toast.error("Please enter a valid 6-digit verification code from your authenticator.");
      return;
    }
    enableTwoFactor(twoFactorMethod);
    setVerificationCode("");
    setSecurityModal(null);
    toast.success(`Two-factor authentication successfully enabled via ${twoFactorMethod}!`);
  };

  return (
    <div className="settings-page max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 relative">
      <PageSEO
        title="Settings & Preferences"
        description="Control your learning and teaching rates, notification channels, privacy visibility, and dark mode themes on SkillSwap."
        canonicalPath="/settings"
      />

      {/* Header */}
      <div className="flex flex-col gap-1 pb-4 border-b border-white/[0.08]">
        <p className="page-kicker">PREFERENCES</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs md:text-sm text-gray-400">
          Manage your account profile, barter rates, privacy visibility, and display preferences.
        </p>
      </div>

      {/* Main Settings Layout */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start relative z-10">
        {/* Sidebar Nav */}
        <aside className="glass-panel rounded-3xl p-2.5 flex md:flex-col gap-1.5 overflow-x-auto shadow-xl">
          {sections.map((item) => (
            <button
              key={item}
              className={`text-left text-xs font-semibold px-4 py-3 rounded-2xl transition-all whitespace-nowrap ${
                section === item
                  ? "bg-white text-black font-bold shadow-lg border border-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </aside>

        {/* Settings Content Panel */}
        <div className="md:col-span-3 glass-panel rounded-3xl p-6 md:p-10 flex flex-col gap-6 shadow-2xl">
          <div className="border-b border-white/10 pb-4">
            <p className="page-kicker">{section.toUpperCase()}</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">{section}</h2>
          </div>

          {/* 1. Account Section */}
          {section === "Account" && (
            <div className="flex flex-col gap-6">
              {/* Profile Card Summary */}
              <div className="flex items-center gap-4 p-5 rounded-2xl card-3d">
                <UserAvatar src={account?.avatar} name={account?.name} size="lg" rounded="2xl" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="text-base font-bold text-white truncate">{account?.name || "SkillSwap User"}</h3>
                  <p className="text-xs text-gray-400 truncate">{account?.email || "user@skillswap.app"}</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white bg-white/15 px-2.5 py-0.5 rounded-full mt-1.5 border border-white/25">
                    ● Active Barter Account
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {/* Mode Switcher */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">Account Role / Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "both", label: "Learner & Mentor", desc: "Learn & teach simultaneously" },
                    { id: "learn", label: "Learner Only", desc: "Focus on learning skills" },
                    { id: "teach", label: "Mentor Only", desc: "Offer skills to teach" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setModeDraft(item.id as "learn" | "teach" | "both")}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        modeDraft === item.id
                          ? "bg-white/15 border-white text-white shadow-md"
                          : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <strong className="text-xs block font-bold text-white">{item.label}</strong>
                      <small className="text-[10px] text-gray-400 block mt-0.5">{item.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  className="primary-action text-xs px-6 py-2.5 bg-white text-black font-bold hover:bg-zinc-200"
                  onClick={saveAccountProfile}
                >
                  Save Account Changes <Check size={14} />
                </button>
                <button
                  type="button"
                  className="secondary-action text-xs px-4 py-2.5"
                  onClick={() => navigate("/profile")}
                >
                  View Public Profile
                </button>
              </div>

              {/* Danger Zone */}
              <div className="mt-4 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex justify-between items-center">
                <div>
                  <strong className="text-xs text-red-300 block">Sign Out Current Session</strong>
                  <small className="text-[10px] text-gray-400">Safely log out of SkillSwap on this device</small>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 flex items-center gap-1.5 transition-colors"
                  onClick={signOut}
                >
                  <LogOut size={13} /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* 2. Notifications Section */}
          {section === "Notifications" && (
            <div className="flex flex-col gap-3">
              {Object.keys(settings.notifications).map((key) => (
                <Toggle
                  key={key}
                  label={key}
                  checked={settings.notifications[key]}
                  onChange={() =>
                    updateSettings({
                      notifications: { ...settings.notifications, [key]: !settings.notifications[key] },
                    })
                  }
                />
              ))}
            </div>
          )}

          {/* 4. Privacy Section */}
          {section === "Privacy" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <strong className="text-sm text-white block">Profile Visibility</strong>
                  <small className="text-xs text-gray-400">Choose who can view your barter offerings</small>
                </div>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) =>
                    updateSettings({ profileVisibility: e.target.value as "Public" | "Members only" | "Private" })
                  }
                  className="bg-white/[0.05] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="Public" className="bg-black text-white">Public (Everyone)</option>
                  <option value="Members only" className="bg-black text-white">Members only</option>
                  <option value="Private" className="bg-black text-white">Private</option>
                </select>
              </div>

              <Toggle
                label="Show Online Status"
                checked={settings.showOnline}
                onChange={() => updateSettings({ showOnline: !settings.showOnline })}
              />
              <Toggle
                label="Show Learning Activity on Public Feed"
                checked={settings.showLearning}
                onChange={() => updateSettings({ showLearning: !settings.showLearning })}
              />
              <Toggle
                label="Show Teaching Stats & Karma Badges"
                checked={settings.showTeaching}
                onChange={() => updateSettings({ showTeaching: !settings.showTeaching })}
              />
            </div>
          )}

          {/* 5. Security Section */}
          {section === "Security" && (
            <div className="flex flex-col gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={24} className="text-white" />
                  <div>
                    <strong className="text-sm text-white block">Two-Factor Authentication (2FA)</strong>
                    <small className="text-xs text-gray-400">
                      {state.security.twoFactorEnabled
                        ? `Enabled via ${state.security.twoFactorMethod}`
                        : "Add an extra layer of security to your barter account"}
                    </small>
                  </div>
                </div>
                <button
                  className="secondary-action text-xs px-4 py-2"
                  onClick={() => setSecurityModal("twofactor")}
                >
                  {state.security.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <KeyRound size={24} className="text-white" />
                  <div>
                    <strong className="text-sm text-white block">Password & Authentication</strong>
                    <small className="text-xs text-gray-400">
                      Manage sign-in credentials and password resets
                    </small>
                  </div>
                </div>
                <Link href="/login" className="secondary-action text-xs px-4 py-2">
                  Account Access
                </Link>
              </div>
            </div>
          )}

          {/* 6. Learning Preferences */}
          {section === "Learning Preferences" && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-2">
                  Learning Style & Goals
                </label>
                <textarea
                  value={preferenceDraft}
                  onChange={(event) => setPreferenceDraft(event.target.value)}
                  placeholder="Project-based practice, hands-on debugging, 3D design critique..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none min-h-[100px]"
                />
              </div>

              <button
                className="primary-action text-xs self-start px-6"
                onClick={() => savePreference("learning")}
              >
                Save Learning Preferences <Check size={14} />
              </button>
            </div>
          )}

          {/* 7. Teaching Preferences */}
          {section === "Teaching Preferences" && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <strong className="text-sm text-white block">Default Session Rate (Gems)</strong>
                  <small className="text-xs text-gray-400">
                    Learners transfer this rate for 60-min sessions (min. 12 pts)
                  </small>
                </div>
                <input
                  type="number"
                  min="12"
                  step="1"
                  value={priceDraft}
                  onChange={(event) => setPriceDraft(Math.max(12, parseInt(event.target.value) || 12))}
                  className="bg-white/5 border border-white/10 text-sm text-white rounded-xl px-3 py-2 w-24 text-center focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-2">Teaching Bio / Style</label>
                <textarea
                  value={teachingDraft}
                  onChange={(event) => setTeachingDraft(event.target.value)}
                  placeholder="Open to 1-on-1 sessions, project code reviews, and creative portfolio feedback..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none min-h-[100px]"
                />
              </div>

              <button
                className="primary-action text-xs self-start px-6"
                onClick={() => savePreference("teaching")}
              >
                Save Teaching Preferences <Check size={14} />
              </button>
            </div>
          )}

          {/* 8. Language */}
          {section === "Language" && (
            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div>
                <strong className="text-sm text-white block">Application Language</strong>
                <small className="text-xs text-gray-400">Saved locally for this browser session</small>
              </div>
              <select
                value={settings.language}
                onChange={(event) => updateSettings({ language: event.target.value })}
                className="bg-white/[0.05] border border-white/10 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                {["English", "Hindi", "Urdu", "Gujarati", "Telugu", "Tamil", "Marathi"].map((item) => (
                  <option key={item} value={item} className="bg-black text-white">
                    {item}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 9. Accessibility */}
          {section === "Accessibility" && (
            <div className="flex flex-col gap-4">
              <Toggle
                label="High Contrast Mode"
                checked={settings.highContrast}
                onChange={() => updateSettings({ highContrast: !settings.highContrast })}
              />

              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <strong className="text-sm text-white block">Text Size Scaling</strong>
                  <small className="text-xs text-gray-400">Increase reading comfort across all pages</small>
                </div>
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                  {(["default", "large", "larger"] as const).map((item) => (
                    <button
                      key={item}
                      className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        settings.textScale === item ? "bg-white text-black font-bold" : "text-gray-400"
                      }`}
                      onClick={() => updateSettings({ textScale: item })}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div>
                  <strong className="text-sm text-white block">Animation Speed</strong>
                  <small className="text-xs text-gray-400">Adjust micro-interactions and spring animations</small>
                </div>
                <div className="flex gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                  {(["full", "reduced", "minimal"] as const).map((item) => (
                    <button
                      key={item}
                      className={`text-xs px-3 py-1.5 rounded-lg capitalize transition-colors ${
                        settings.animation === item ? "bg-white text-black font-bold" : "text-gray-400"
                      }`}
                      onClick={() => updateSettings({ animation: item })}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <Toggle
                label="3D Orbital & Glass Shader Effects"
                checked={settings.effects3d}
                onChange={() => updateSettings({ effects3d: !settings.effects3d })}
              />
            </div>
          )}

          {/* 10. Payments & Skill Points */}
          {section === "Payments & Skill Points" && (
            <div className="flex flex-col gap-5">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Gem size={20} />
                  </div>
                  <div>
                    <strong className="text-sm text-white block">Skill Points Wallet</strong>
                    <small className="text-xs text-gray-400">
                      Balance: ★ {state.wallet} Gems · Direct UPI & Card top-up
                    </small>
                  </div>
                </div>
                <Link href="/wallet" className="primary-action text-xs px-4 py-2 bg-white text-black font-bold hover:bg-zinc-200">
                  Open Wallet <ArrowRight size={13} />
                </Link>
              </div>

              {/* Direct UPI Zero-PAN Gateway Settings */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/20 flex flex-col gap-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/25">
                        ⚡ ZERO-PAN PAYMENT GATEWAY
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5">Direct P2P UPI Settlement</h3>
                    <p className="text-xs text-gray-300 max-w-xl mt-1 leading-relaxed">
                      Collect payments directly into your personal bank account via Google Pay, PhonePe, Paytm, or BHIM. Zero Razorpay, zero PAN card required, and 0% gateway transaction fees.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center pt-2">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Your Receiving UPI ID (Where money will be sent)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. vihaanpatange@fam or yourname@upi"
                      defaultValue={localStorage.getItem("skillswap-upi-id") || "vihaanpatange@fam"}
                      id="custom-upi-input"
                      className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <button
                    type="button"
                    className="primary-action text-xs px-5 py-2.5 sm:mt-5 bg-white hover:bg-zinc-200 text-black font-bold"
                    onClick={() => {
                      const input = document.getElementById("custom-upi-input") as HTMLInputElement;
                      if (input && input.value.trim()) {
                        localStorage.setItem("skillswap-upi-id", input.value.trim());
                        toast.success(`Settlement UPI set to ${input.value.trim()}! All buyer payments will go directly to your account.`);
                      }
                    }}
                  >
                    Save Settlement UPI <Check size={14} />
                  </button>
                </div>
                <small className="text-[11px] text-gray-400">
                  💡 When any user clicks &quot;Buy Points&quot; in the wallet, the QR code and GPay/PhonePe deep links will automatically point to this UPI ID.
                </small>
              </div>
            </div>
          )}

          {/* 11. Connected Accounts */}
          {section === "Connected Accounts" && (
            <div className="flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <GoogleIcon size={20} />
                  </div>
                  <div>
                    <strong className="text-sm text-white block">Google Identity</strong>
                    <small className="text-xs text-gray-400">Connected for fast sign-in and profile sync</small>
                  </div>
                </div>
                <span className="text-xs font-bold text-white bg-white/15 px-3 py-1 rounded-full border border-white/25">
                  Connected
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <GithubIcon size={20} />
                  </div>
                  <div>
                    <strong className="text-sm text-white block">GitHub Profile</strong>
                    <small className="text-xs text-gray-400">Link your repositories for engineering skill verification</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="secondary-action text-xs px-3 py-1.5 flex items-center gap-1.5"
                  onClick={() => toast.success("GitHub account connected successfully!")}
                >
                  <GithubIcon size={14} /> Connect GitHub
                </button>
              </div>
            </div>
          )}

          {/* 12. Help */}
          {section === "Help" && (
            <div className="flex flex-col gap-4">
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col gap-2">
                <h3 className="text-base font-bold text-white">How does SkillSwap barter work?</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  SkillSwap uses a zero-fiat 1:1 mutual barter model. When you teach 1 hour, you earn TimeBank Gems which you can use to learn any other skill from peer mentors.
                </p>
                <div className="flex gap-2 mt-2">
                  <Link href="/discover" className="primary-action text-xs px-4 py-2">
                    Browse Marketplace
                  </Link>
                  <Link href="/community" className="secondary-action text-xs px-4 py-2">
                    Community Forum
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2FA Modal */}
      {securityModal === "twofactor" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 md:p-8 rounded-3xl max-w-md w-full border border-white/10 flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Configure Two-Factor Auth</h3>
              <button
                onClick={() => setSecurityModal(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Enter verification code <b>123456</b> to verify {twoFactorMethod}.
            </p>

            <input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl p-3 text-center text-sm tracking-widest text-white focus:outline-none"
            />

            <div className="flex gap-2 mt-2">
              <button
                className="primary-action text-xs flex-1"
                onClick={confirmTwoFactor}
              >
                Verify & Enable
              </button>
              <button
                className="secondary-action text-xs"
                onClick={() => setSecurityModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
