import { ArrowRight, Check, Eye, EyeOff, ImagePlus, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { type AccountMode, useAccount } from "@/contexts/AccountContext";
import { PolicyPreview } from "@/components/AuthSimulation";
import { GithubIcon, GoogleIcon } from "@/components/SocialIcons";
import { PageSEO } from "@/components/PageSEO";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";

const modes: { id: AccountMode; title: string; detail: string }[] = [
  { id: "learn", title: "I want to learn", detail: "Find a guide and grow deliberately." },
  { id: "teach", title: "I want to teach", detail: "Share experience and earn points." },
  { id: "both", title: "Both", detail: "Learn now, teach when you’re ready." },
];

export default function Signup() {
  const [, navigate] = useLocation();
  const { account, createAccount, signInWithGoogle, signInWithGithub } = useAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [location, setLocation] = useState("");
  const [languages, setLanguages] = useState("English");
  const [mode, setMode] = useState<AccountMode>("both");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState("");
  const [policy, setPolicy] = useState<"Terms" | "Privacy Policy" | null>(null);
  const [registeredReward, setRegisteredReward] = useState(false);

  useEffect(() => {
    if (account) {
      navigate(account.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [account, navigate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.includes("@") || password.length < 6 || password !== confirm || !terms) {
      toast.error("Complete every required field, accept the terms, and confirm a 6+ character password.");
      return;
    }
    createAccount({
      name,
      email,
      location,
      languages: languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      mode,
    });
    setRegisteredReward(true);
  };

  const handleGithubClick = async () => {
    try {
      toast.info("Connecting to GitHub via Supabase...");
      await signInWithGithub();
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate GitHub sign in");
    }
  };

  const handleGoogleClick = async () => {
    try {
      toast.info("Connecting to Google authentication via Supabase...");
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate Google sign in");
    }
  };

  return (
    <div className="account-page signup-page relative">
      <PageSEO
        title="Create Account — Vantage"
        description="Join Vantage to trade knowledge 1-on-1 without money. Teach what you know, learn what you love, and earn TimeBank credits."
        canonicalPath="/signup"
      />
      <FerrofluidBackground opacity={0.30} />
      <section className="account-stage">
        <Link href="/get-started" className="auth-brand flex items-center gap-3">
          <img src="/vantage-logo.png" alt="Vantage" className="w-9 h-9 sm:w-10 sm:h-10 object-contain pointer-events-none select-none" />
          <span className="font-megiko font-morenn font-bold text-3xl sm:text-4xl tracking-wide text-white">Vantage</span>
        </Link>
        <p className="page-kicker">START WITH EXCHANGE</p>
        <h1 className="font-megiko font-morenn font-bold text-3xl sm:text-4xl">Teach what you know. Learn what you want.</h1>
        <p>Your role can evolve anytime. Vantage is built for learners who become teachers—and teachers who keep learning.</p>
      </section>
      <section className="account-panel">
        <Link href="/" className="auth-back">
          ← Back to Vantage
        </Link>
        <form className="auth-form signup-form" onSubmit={submit}>
          <p className="page-kicker">START YOUR SKILL JOURNEY</p>
          <h2>Build your starting point.</h2>
          <div className="form-grid">
            <label>
              Full name
              <div className="field-with-icon">
                <UserRound size={16} />
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            </label>
            <label>
              Email
              <div className="field-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>
          </div>
          <div className="form-grid">
            <label>
              Password
              <div className="field-with-icon">
                <LockKeyhole size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="6+ characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label>
              Confirm password
              <input
                type={showPassword ? "text" : "password"}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </label>
          </div>
          <div className="form-grid optional">
            <label>
              Location
              <div className="field-with-icon">
                <MapPin size={16} />
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City (optional)"
                />
              </div>
            </label>
            <label>
              Languages
              <input
                value={languages}
                onChange={(event) => setLanguages(event.target.value)}
                placeholder="English, Hindi"
              />
            </label>
          </div>
          <label className="file-control">
            <ImagePlus size={16} /> Profile photo (optional)
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setPhoto(event.target.files?.[0]?.name ?? "")}
            />
            <span>{photo || "Choose a local image"}</span>
          </label>
          <div className="mode-picker">
            <p>I’m here to</p>
            {modes.map((item) => (
              <button
                type="button"
                key={item.id}
                className={mode === item.id ? "selected" : ""}
                onClick={() => setMode(item.id)}
              >
                <Check size={15} />
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </span>
              </button>
            ))}
          </div>
          <label className="checkbox-label terms">
            <input
              type="checkbox"
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
            />{" "}
            I agree to Vantage’s{" "}
            <button type="button" className="text-button" onClick={() => setPolicy("Terms")}>
              Terms
            </button>{" "}
            and{" "}
            <button type="button" className="text-button" onClick={() => setPolicy("Privacy Policy")}>
              Privacy Policy
            </button>
            .
          </label>
          <button type="submit" className="primary-action">
            Create account <ArrowRight size={16} />
          </button>
          <div className="auth-divider">
            <span>OR SIGN UP WITH</span>
          </div>
          <div className="social-grid">
            <button type="button" onClick={handleGithubClick}>
              <GithubIcon size={18} /> GitHub
            </button>
            <button type="button" onClick={handleGoogleClick}>
              <GoogleIcon size={18} /> Google
            </button>
          </div>
          <p className="auth-footer">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </form>
      </section>

      {/* Professional 20 Points Welcome Grant Modal */}
      {registeredReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/30 bg-black/95 p-8 text-center shadow-2xl relative">
            <div
              className="w-16 h-16 rounded-2xl bg-white text-black mx-auto mb-5 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
            >
              <span className="text-3xl font-black" style={{ color: "#000000", WebkitTextFillColor: "#000000" }}>★</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider mb-3">
              ★ Starter Welcome Reward
            </span>
            <h3 className="text-2xl font-black text-white tracking-tight mb-2">
              +20 Skill Points Credited!
            </h3>
            <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
              Welcome to Vantage, <strong>{name || "Member"}</strong>. Your TimeBank wallet has been initialized with <strong>20 Skill Points</strong>. You can use these immediately to schedule 1-on-1 sessions with verified mentors.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex justify-between items-center text-left">
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Wallet Balance</span>
                <strong className="text-xl font-bold text-white font-mono">20 Points</strong>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Status</span>
                <span className="text-xs font-bold text-white">Active & Ready</span>
              </div>
            </div>
            <button
              type="button"
              style={{ backgroundColor: "#FFFFFF", color: "#000000", WebkitTextFillColor: "#000000", border: "1px solid #FFFFFF" }}
              className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-black text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              onClick={() => {
                toast.success("Account initialized with 20 Skill Points!");
                navigate("/onboarding");
              }}
            >
              <span style={{ color: "#000000", WebkitTextFillColor: "#000000", fontWeight: 900 }}>Get Started & Set Up Profile</span> <ArrowRight size={18} style={{ color: "#000000" }} />
            </button>
          </div>
        </div>
      )}

      {policy ? (
        <PolicyPreview
          policy={policy}
          onClose={() => setPolicy(null)}
          onAccept={() => setTerms(true)}
        />
      ) : null}
    </div>
  );
}
