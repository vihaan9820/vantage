import { ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { GithubIcon, GoogleIcon } from "@/components/SocialIcons";
import { PageSEO } from "@/components/PageSEO";
import { MotionAuthStack } from "@/components/MotionAuthStack";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";

export default function Login() {
  const [, navigate] = useLocation();
  const { account, logIn, updateCredential, signInWithGoogle, signInWithGithub } = useAccount();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [recoveryStep, setRecoveryStep] = useState<"login" | "request" | "sent" | "reset">("login");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  useEffect(() => {
    if (account) {
      navigate(account.onboardingComplete ? "/dashboard" : "/onboarding");
    }
  }, [account, navigate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 6) {
      toast.error("Enter a valid email and a password with at least 6 characters.");
      return;
    }
    const account = logIn(email);
    toast.success(`Welcome back, ${account.name}.`);
    navigate(account.onboardingComplete ? "/dashboard" : "/onboarding");
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

  const sendRecovery = () => {
    if (!email.includes("@")) {
      setRecoveryError("Enter a valid email address.");
      toast.error("Please enter a valid email address.");
      return;
    }
    setRecoveryError("");
    setRecoveryStep("sent");
    toast.success(`Password reset instructions sent to ${email}`);
  };

  const resetPassword = () => {
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      setRecoveryError("Passwords must match and have at least 6 characters.");
      toast.error("Passwords must match and have at least 6 characters.");
      return;
    }
    updateCredential();
    setRecoveryError("");
    setRecoveryStep("login");
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password reset successfully. Please log in with your new password.");
  };

  return (
    <div className="account-page relative">
      <PageSEO
        title="Sign in to your Vantage account"
        description="Access your Vantage dashboard, scheduled learning exchanges, TimeBank credit ledger, and verified mentor profile."
        canonicalPath="/login"
      />
      <FerrofluidBackground opacity={0.30} />
      <section className="account-panel">
        <Link href="/get-started" className="auth-brand flex items-center gap-3">
          <img src="/vantage-logo.png" alt="Vantage" className="w-9 h-9 sm:w-10 sm:h-10 object-contain pointer-events-none select-none" />
          <span className="font-megiko font-morenn font-bold text-3xl sm:text-4xl tracking-wide text-white">Vantage</span>
        </Link>
        {recoveryStep === "login" ? (
          <form className="auth-form" onSubmit={submit}>
            <p className="page-kicker">WELCOME BACK</p>
            <h2 className="font-megiko font-morenn font-bold text-2xl sm:text-3xl">Sign in to continue.</h2>
            <div className="social-grid">
              <button
                type="button"
                onClick={handleGoogleClick}
              >
                <GoogleIcon size={18} /> Continue with Google
              </button>
              <button
                type="button"
                onClick={handleGithubClick}
              >
                <GithubIcon size={18} /> Continue with GitHub
              </button>
            </div>
            <div className="auth-divider">
              <span>or email</span>
            </div>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="riya@example.com"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            <div className="auth-sub-actions">
              <button
                type="button"
                className="text-button"
                onClick={() => setRecoveryStep("request")}
              >
                Forgot password?
              </button>
            </div>
            <button className="primary-action" type="submit">
              Sign in <ArrowRight size={16} />
            </button>
            <p className="auth-switch">
              Need an account? <Link href="/signup">Create one</Link>
            </p>
          </form>
        ) : recoveryStep === "request" ? (
          <div className="auth-form">
            <p className="page-kicker">ACCOUNT RECOVERY</p>
            <h2>Reset your password.</h2>
            <p>
              Enter the email address tied to your account to receive a secure password reset link.
            </p>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="riya@example.com"
              />
            </label>
            {recoveryError ? <p className="form-error">{recoveryError}</p> : null}
            <button className="primary-action" onClick={sendRecovery}>
              <Mail size={16} /> Send reset link
            </button>
            <button className="text-button" onClick={() => setRecoveryStep("login")}>
              Return to login
            </button>
          </div>
        ) : recoveryStep === "sent" ? (
          <div className="auth-form">
            <p className="page-kicker">CHECK YOUR EMAIL</p>
            <h2>Password reset link sent.</h2>
            <p>We’ve prepared a secure password reset link for {email}. Check your inbox to complete the update.</p>
            <button className="primary-action" onClick={() => setRecoveryStep("reset")}>
              Set new password
            </button>
            <button className="text-button" onClick={() => setRecoveryStep("login")}>
              Return to login
            </button>
          </div>
        ) : recoveryStep === "reset" ? (
          <div className="auth-form">
            <p className="page-kicker">RESET PASSWORD</p>
            <h2>Set a new secure password.</h2>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            {recoveryError ? <p className="form-error">{recoveryError}</p> : null}
            <button className="primary-action" onClick={resetPassword}>
              Reset password <KeyRound size={16} />
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <MotionAuthStack />
            <div className="text-center mt-2 mb-4">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-white underline transition-colors"
                onClick={() => setRecoveryStep("request")}
              >
                Forgot password or need account recovery?
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
