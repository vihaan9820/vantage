import { useState, useEffect, useId } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { GithubIcon, GoogleIcon } from "@/components/SocialIcons";
import { ArrowLeft, Check, Sparkles } from "lucide-react";

/* The complete sign-in-or-up flow, combining the conditional password
 * field and the card-stack verification step into one animated surface.
 * Powered by Framer Motion and integrated with SkillSwap accounts. */

const SIGN_IN_VARIANTS = {
  default: { opacity: 1, scale: 1, y: 0, x: "-50%" },
  verifying: { opacity: 0.6, scale: 0.95, y: -10, x: "-50%" },
};

const VERIFY_VARIANTS = {
  default: { opacity: 0, y: 80, x: "-50%" },
  verifying: { opacity: 1, y: 0, x: "-50%" },
};

const TEXT_VARIANTS = {
  initial: { opacity: 0, filter: "blur(8px)", y: -8 },
  animate: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(8px)", y: 8 },
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <div className="spinner" style={{ width: size, height: size }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="spinner__bar"
            style={{
              transform: `rotate(${i * 30}deg) translate(146%)`,
              animationDelay: `-${1.2 - i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ConditionalField({
  open,
  label,
  error,
  ...props
}: React.ComponentProps<"input"> & { open: boolean; label: string; error?: string | null }) {
  const internalId = useId();
  const id = props.id || internalId;

  return (
    <motion.div
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
      style={{ overflow: "hidden", willChange: "height, opacity" }}
    >
      <div className="auth__field" style={{ marginTop: "0.75rem" }}>
        <label htmlFor={id}>{label}</label>
        <input autoFocus={open} {...props} id={id} />
        {error && <p className="auth__field-error">{error}</p>}
      </div>
    </motion.div>
  );
}

function OTPInput({ length = 6, autoFocus, onComplete }: { length?: number; autoFocus?: boolean; onComplete?: (code: string) => void }) {
  const [code, setCode] = useState("");
  const activeIndex = Math.min(code.length, length - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, length);
    setCode(val);
    if (val.length === length && onComplete) {
      onComplete(val);
    }
  };

  return (
    <div className="otp">
      <input
        className="otp__input"
        value={code}
        onChange={handleChange}
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Verification code"
        autoFocus={autoFocus}
      />
      <div className="otp__slots" aria-hidden="true">
        {Array.from({ length }).map((_, i) => (
          <div key={i} className="otp__slot" data-active={i === activeIndex}>
            {code[i] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResendButton(props: React.ComponentProps<"button">) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const id = setInterval(() => setCountdown((prev) => (prev <= 0 ? prev : prev - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <button {...props} type="button" className="resend" disabled={countdown > 0}>
      Didn&apos;t receive a code? Resend {countdown > 0 ? `(${countdown}s)` : ""}
    </button>
  );
}

function SignIn({
  onVerify,
  defaultEmail = "",
}: {
  onVerify: (data: { email: string; password?: string }) => void;
  defaultEmail?: string;
}) {
  const { signInWithGoogle, signInWithGithub } = useAccount();
  const [emailAddress, setEmailAddress] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showPassword) return;
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setPassword("");
        setShowPassword(false);
      }
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [showPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    await wait(550);
    setLoading(false);

    if (!showPassword) {
      setShowPassword(true);
    } else {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      onVerify({ email: emailAddress, password });
    }
  };

  const handleSocialGoogle = async () => {
    try {
      toast.info("Connecting to Google authentication...");
      await signInWithGoogle();
    } catch (err: any) {
      toast.error(err?.message || "Google sign-in failed");
    }
  };

  const handleSocialGithub = async () => {
    try {
      toast.info("Connecting to GitHub authentication...");
      await signInWithGithub();
    } catch (err: any) {
      toast.error(err?.message || "GitHub sign-in failed");
    }
  };

  return (
    <motion.div variants={SIGN_IN_VARIANTS} className="auth__card" initial="default">
      <div className="flex justify-center mb-3">
        <span className="text-[11px] font-extrabold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} /> SkillSwap Secure Access
        </span>
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {!showPassword ? (
          <motion.h2
            key="sign-in-title"
            className="auth__card-title"
            variants={TEXT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            Welcome to SkillSwap
          </motion.h2>
        ) : (
          <motion.h2
            key="sign-up-title"
            className="auth__card-title"
            variants={TEXT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            Enter Password or Create
          </motion.h2>
        )}
      </AnimatePresence>

      <p className="auth__card-description">
        {!showPassword
          ? "Enter your email to sign in or initialize your barter profile"
          : "Enter your password to sign in, or set a new one to join"}
      </p>

      {/* Social OAuth Buttons */}
      {!showPassword && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            type="button"
            onClick={handleSocialGoogle}
            className="btn btn--social"
          >
            <GoogleIcon /> Google
          </button>
          <button
            type="button"
            onClick={handleSocialGithub}
            className="btn btn--social"
          >
            <GithubIcon /> GitHub
          </button>
        </div>
      )}

      {!showPassword && (
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-white/10" />
          <span className="absolute bg-[#121214] px-2 text-[10px] uppercase font-bold text-zinc-400">
            or continue with email
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={showPassword ? "mt-4" : "mt-2"}>
        <div className="auth__field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@domain.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
        </div>

        <ConditionalField
          label="Password"
          name="password"
          id="password"
          type="password"
          placeholder="Enter at least 6 characters"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          open={showPassword}
        />

        <button
          className="btn btn--primary"
          style={{ marginTop: "1.25rem" }}
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner size={14} /> : <span>{!showPassword ? "Continue" : "Sign In / Stack Verify"}</span>}
        </button>

        {showPassword && (
          <button
            type="button"
            className="btn btn--text"
            onClick={() => setShowPassword(false)}
            style={{ marginTop: "0.5rem" }}
          >
            Back to email
          </button>
        )}
      </form>
    </motion.div>
  );
}

function Verify({
  email,
  onCancel,
  onComplete,
}: {
  email: string;
  password?: string;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const { logIn, createAccount } = useAccount();

  const handleVerifySubmission = async () => {
    setLoading(true);
    await wait(650);
    setLoading(false);

    try {
      const account = logIn(email);
      toast.success(`Verification complete! Welcome back, ${account.name}.`);
      onComplete();
      navigate(account.onboardingComplete ? "/dashboard" : "/onboarding");
    } catch {
      createAccount({
        name: email.split("@")[0] || "Learner",
        email,
        mode: "both",
        location: "",
        languages: [],
      });
      toast.success(`Account verified! Welcome to SkillSwap.`);
      onComplete();
      navigate("/onboarding");
    }
  };

  return (
    <motion.div
      className="auth__card auth__card--overlay"
      variants={VERIFY_VARIANTS}
      initial="default"
      animate="verifying"
      exit="default"
    >
      <div className="flex justify-center mb-2">
        <span className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white font-bold">
          <Check size={20} />
        </span>
      </div>

      <h2 className="auth__card-title">Verify your account</h2>
      <p className="auth__card-description">
        Enter the 6-digit code sent to <b className="text-white">{email}</b>
      </p>

      <form onSubmit={(e) => { e.preventDefault(); handleVerifySubmission(); }}>
        <div className="auth__field" style={{ width: "min-content", marginInline: "auto" }}>
          <OTPInput autoFocus length={6} onComplete={() => handleVerifySubmission()} />
        </div>
        <ResendButton style={{ marginInline: "auto", marginTop: "0.75rem" }} />
        <button
          className="btn btn--primary"
          style={{ marginTop: "1.25rem" }}
          type="submit"
          disabled={loading}
        >
          {loading ? <Spinner size={14} /> : <span>Verify & Launch</span>}
        </button>
      </form>
      <button className="btn btn--text" onClick={onCancel} type="button" style={{ marginTop: "0.5rem" }}>
        Start over
      </button>
    </motion.div>
  );
}

export function MotionAuthStack() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [authData, setAuthData] = useState<{ email: string; password?: string }>({ email: "" });
  const [resetKey, setResetKey] = useState(0);

  const reset = () => {
    setIsVerifying(false);
    setResetKey((k) => k + 1);
  };

  const handleStartVerify = (data: { email: string; password?: string }) => {
    setAuthData(data);
    setIsVerifying(true);
  };

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.28, visualDuration: 0.4 }}>
      <motion.div animate={isVerifying ? "verifying" : "default"} className="clerk-stage relative w-full flex flex-col items-center">
        {/* Ambient background glow orbs */}
        <div className="glow-orb-mono w-80 h-80 top-10 left-1/4 opacity-12 pointer-events-none" />
        <div className="glow-orb-mono w-80 h-80 bottom-10 right-1/4 opacity-8 pointer-events-none" />

        <div className="auth__root w-full">
          <div className="auth__card-container">
            <SignIn
              key={resetKey}
              defaultEmail={authData.email}
              onVerify={handleStartVerify}
            />
            <AnimatePresence mode="popLayout">
              {isVerifying && (
                <Verify
                  email={authData.email}
                  password={authData.password}
                  onCancel={reset}
                  onComplete={reset}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <style>{`
          .clerk-stage {
            --surface: rgba(20, 24, 36, 0.94);
            position: relative;
            align-self: stretch;
            flex: 1 1 auto;
            width: 100%;
            min-height: 520px;
            color: #F8FAFC;
          }
          .clerk-stage * { box-sizing: border-box; }

          .auth__root {
            display: grid;
            justify-content: center;
            align-items: flex-start;
            min-height: 480px;
            padding: 1.5rem 1rem 2.5rem;
          }
          .auth__card-container {
            position: relative;
            grid-column: 1;
            grid-row: 1;
            width: 25rem;
            max-width: calc(100vw - 2rem);
            height: 460px;
          }
          .auth__card {
            position: absolute;
            left: 50%;
            width: 25rem;
            max-width: calc(100vw - 2rem);
            transform: translateX(-50%);
            padding: 2rem 1.75rem;
            background-color: var(--surface);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border-radius: 1.75rem;
            transform-origin: top center;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-top: 1px solid rgba(255, 255, 255, 0.22);
            box-shadow:
              0 14px 40px -10px rgba(0, 0, 0, 0.6),
              0 0 0 1px rgba(99, 102, 241, 0.08);
          }
          .auth__card--overlay {
            z-index: 10;
            border-color: rgba(16, 185, 129, 0.35);
            box-shadow:
              0 20px 50px -10px rgba(0, 0, 0, 0.75),
              0 0 20px rgba(16, 185, 129, 0.18);
          }
          .auth__card button { width: 100%; }

          .auth__card-title {
            text-align: center;
            font-size: 1.25rem;
            line-height: 1.5rem;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: #FFFFFF;
          }
          .auth__card-description {
            text-align: center;
            font-size: 0.8125rem;
            line-height: 1.35rem;
            color: #94A3B8;
            margin-top: 0.25rem;
          }

          .auth__field {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
          }
          .auth__field-error {
            color: #F43F5E;
            font-size: 0.75rem;
            line-height: 1rem;
          }
          .auth__field label {
            font-size: 0.75rem;
            line-height: 1rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #CBD5E1;
          }
          .auth__field input {
            width: 100%;
            border-radius: 0.75rem;
            background-color: rgba(255, 255, 255, 0.06);
            padding: 0.55rem 0.85rem;
            font-size: 0.875rem;
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.12);
            outline: none;
            transition: all 0.2s ease;
          }
          .auth__field input::placeholder { color: #64748B; }
          .auth__field input:focus {
            border-color: #FFFFFF;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
            background-color: rgba(255, 255, 255, 0.09);
          }

          .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            position: relative;
            height: 2.5rem;
            border: 0;
            padding: 0 1rem;
            border-radius: 0.75rem;
            font-size: 0.8125rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
          }
          .btn:active { transform: scale(0.97); }
          .btn--social {
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #F8FAFC;
            gap: 0.5rem;
          }
          .btn--social:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
          }
          .btn--primary {
            background: #FFFFFF;
            color: #000000;
            font-weight: 700;
            box-shadow: 0 4px 14px rgba(255, 255, 255, 0.15);
          }
          .btn--primary:hover {
            background: #E4E4E7;
            box-shadow: 0 6px 18px rgba(255, 255, 255, 0.25);
          }
          .btn--text {
            background: transparent;
            color: #94A3B8;
            height: 2rem;
            font-size: 0.75rem;
          }
          .btn--text:hover { color: #FFFFFF; }

          .otp { position: relative; width: min-content; }
          .otp__input {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: text;
            border: none;
            background: transparent;
          }
          .otp__slots { display: flex; gap: 6px; }
          .otp__slot {
            position: relative;
            display: flex;
            width: 2.5rem;
            height: 2.75rem;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 0.65rem;
            font-size: 1rem;
            font-weight: 700;
            color: #FFFFFF;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
          }
          .otp__slot[data-active="true"] {
            border-color: #FFFFFF;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.25);
            background-color: rgba(255, 255, 255, 0.08);
            z-index: 10;
          }

          .resend {
            border: 0;
            background-color: transparent;
            display: block;
            color: #94A3B8;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.2s;
          }
          .resend:hover { color: #FFFFFF; }
          .resend[disabled] { opacity: 0.4; cursor: not-allowed; }

          .spinner { position: relative; top: 50%; left: 50%; }
          .spinner__bar {
            position: absolute;
            background-color: currentColor;
            height: 8%;
            width: 24%;
            left: -10%;
            top: -3.9%;
            border-radius: 6px;
            animation: clerk-spinner-fade 1.2s linear infinite;
          }
          @keyframes clerk-spinner-fade {
            0% { opacity: 1; }
            100% { opacity: 0.15; }
          }
        `}</style>
      </motion.div>
    </MotionConfig>
  );
}

export default MotionAuthStack;
