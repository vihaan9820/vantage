import { ArrowRight, CheckCircle2, Gem, ShieldCheck, Sparkles, UserPlus, LogIn } from "lucide-react";
import { Link, useLocation } from "wouter";
import { PageSEO } from "@/components/PageSEO";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";
import { useAccount } from "@/contexts/AccountContext";
import { UserAvatar } from "@/components/UserAvatar";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Home() {
  const [, navigate] = useLocation();
  const { account } = useAccount();
  useScrollReveal();

  return (
    <div className="vantage-landing-wrap min-h-screen relative flex flex-col justify-between overflow-x-hidden selection:bg-white selection:text-black">
      <PageSEO
        title="Vantage — Reciprocal Peer-to-Peer Knowledge Economy"
        description="Trade what you know, master what comes next. Vantage is the zero-fee platform where creators and engineers exchange skills 1-on-1 without cash. Claim 20 starter points upon registration."
        canonicalPath="/"
      />

      {/* Ambient background fluid & monochromatic glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="glow-orb-mono w-[700px] h-[700px] -top-48 left-1/2 -translate-x-1/2 opacity-15" />
        <div className="glow-orb-mono w-[520px] h-[520px] bottom-10 -right-24 opacity-10" />
        <FerrofluidBackground opacity={0.35} />
      </div>

      {/* Top Bar Navigation */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between gap-2">
        <Link href="/get-started" className="flex items-center gap-2.5 sm:gap-3 group shrink-0" aria-label="Vantage Get Started">
          <img
            src="/vantage-logo.png"
            alt="Vantage"
            className="w-8 h-8 sm:w-11 sm:h-11 object-contain pointer-events-none select-none transition-transform group-hover:scale-105"
          />
          <span className="font-megiko font-morenn font-bold text-3xl sm:text-4xl lg:text-5xl tracking-wide text-white group-hover:text-zinc-300 transition-colors">
            Vantage
          </span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <Link
            href="/privacy"
            className="text-xs text-zinc-400 hover:text-white transition-colors hidden md:inline"
          >
            Privacy Standards
          </Link>

          {account ? (
            <button
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
              onClick={() => navigate("/dashboard")}
            >
              <UserAvatar src={account.avatar} name={account.name} size="xs" />
              <span className="text-xs font-bold text-white">Dashboard</span>
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-semibold text-zinc-300 hover:text-white px-2 sm:px-3 py-1.5 rounded-lg transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
                className="text-xs font-bold text-black bg-[#E4E4E7] hover:bg-zinc-300 px-2.5 sm:px-3.5 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                <span className="hidden min-[420px]:inline">Sign up (+20 Pts)</span>
                <span className="inline min-[420px]:hidden">Sign up</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex flex-col items-center justify-center">
        {/* Vantage Official Brand Logo & Headline */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-12 w-full scroll-rise is-risen">
          <div className="relative mb-3 pointer-events-none select-none cursor-default" aria-hidden="true">
            <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full transform scale-75" />
            <img
              src="/vantage-logo.png"
              alt="Vantage Official Logo"
              className="relative z-10 h-20 sm:h-32 md:h-40 w-auto object-contain drop-shadow-[0_0_35px_rgba(255,255,255,0.4)] pointer-events-none select-none cursor-default"
            />
          </div>

          <div className="font-megiko font-morenn font-bold text-4xl sm:text-6xl md:text-7xl tracking-widest uppercase text-white mb-3 drop-shadow-[0_2px_24px_rgba(255,255,255,0.3)] select-none">
            Vantage
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-semibold tracking-wider uppercase text-zinc-300 mb-4">
            <Sparkles size={13} className="text-white shrink-0" /> <span>Reciprocal Knowledge Barter</span>
          </div>

          <h1 className="font-megiko font-morenn font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl leading-[1.1] mb-4 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] break-words">
            Trade what you know. <br className="hidden sm:inline" />
            <span className="text-zinc-300 italic">Master what comes next.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)] px-2">
            Welcome to Vantage. No fiat fees, no hourly tuition. Earn TimeBank credits by sharing your skills, and spend them to learn 1-on-1 from verified creators.
          </p>
        </div>

        {/* Action Choice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12 scroll-rise-stagger">
          {/* Option 1: New Member / Claim +20 Pts */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(16, 36, 74, 0.78) 0%, rgba(10, 22, 48, 0.88) 50%, rgba(6, 14, 32, 0.94) 100%)",
              borderColor: "rgba(96, 165, 250, 0.35)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              boxShadow: "0 18px 45px rgba(2, 6, 23, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.22)",
            }}
            className="scroll-rise rise-delay-1 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border relative flex flex-col justify-between hover:border-blue-400/60 transition-all duration-300 group"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#E4E4E7] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1.5">
              <Gem size={12} /> +20 Starter Bonus Included
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E4E4E7] text-black flex items-center justify-center font-black text-xl mb-5 shadow-sm">
                <UserPlus size={24} />
              </div>

              <h2 className="font-megiko font-morenn font-bold text-2xl sm:text-3xl text-white tracking-tight mb-2">Create New Account</h2>
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Join the network in 60 seconds. We fund your wallet with 20 free TimeBank points upon sign up so you can book your first session right away.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-200 shrink-0" />
                  <span><strong>+20 Skill Points</strong> credited immediately</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-200 shrink-0" />
                  <span><strong>Zero Cash Required</strong> — 100% peer barter</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-zinc-200 shrink-0" />
                  <span><strong>Held & Release Escrow</strong> protects every exchange</span>
                </li>
              </ul>
            </div>

            <Link
              href="/signup"
              style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
              className="w-full py-3.5 px-6 rounded-xl bg-[#E4E4E7] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-zinc-300 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              Get Started Free (+20 Pts) <ArrowRight size={17} />
            </Link>
          </div>

          {/* Option 2: Existing Member Login */}
          <div className="scroll-rise rise-delay-2 glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-white/15 bg-black/60 backdrop-blur-xl relative flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.65)] hover:border-white/40 transition-all duration-300">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-black text-xl mb-5">
                <LogIn size={24} />
              </div>

              <h2 className="font-megiko font-morenn font-bold text-2xl sm:text-3xl text-white tracking-tight mb-2">Sign In to Account</h2>
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Already part of Vantage? Log in to check your messages, manage ongoing barter offers, view your points ledger, or enter scheduled live rooms.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="text-white font-bold">•</span>
                  <span>Enter active 1:1 audio & video barter sessions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-white font-bold">•</span>
                  <span>Manage skill listings & incoming learning requests</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-white font-bold">•</span>
                  <span>Check TimeBank points balance & transaction proofs</span>
                </li>
              </ul>
            </div>

            <Link
              href="/login"
              className="w-full py-3.5 px-6 rounded-xl bg-white/10 border border-white/30 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/20 hover:border-white transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              Sign In to Vantage <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* 3 Steps To Barter */}
        <div className="w-full max-w-4xl border-t border-white/10 pt-10 scroll-rise">
          <div className="text-center mb-6 scroll-rise">
            <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">The Vantage Process</p>
            <h3 className="font-megiko font-morenn font-bold text-xl sm:text-2xl text-white">How pure peer barter works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 scroll-rise-stagger">
            <div className="scroll-rise rise-delay-1 glass-panel p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-zinc-400">01</span>
              <h4 className="font-megiko font-morenn font-bold text-base text-white mt-1 mb-1">Claim Starter Points</h4>
              <p className="text-xs text-zinc-300">Receive 20 points upon registration to kickstart your first learning session immediately.</p>
            </div>
            <div className="scroll-rise rise-delay-2 glass-panel p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-zinc-400">02</span>
              <h4 className="font-megiko font-morenn font-bold text-base text-white mt-1 mb-1">Teach or Discover</h4>
              <p className="text-xs text-zinc-300">Teach a skill to earn points, or browse verified experts in code, design, sound, and strategy.</p>
            </div>
            <div className="scroll-rise rise-delay-3 glass-panel p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-zinc-400">03</span>
              <h4 className="font-megiko font-morenn font-bold text-base text-white mt-1 mb-1">1:1 Encrypted Rooms</h4>
              <p className="text-xs text-zinc-300">Meet in secure WebRTC rooms. Points release automatically once both peers complete the lesson.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="scroll-rise relative z-20 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 text-center sm:text-left">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldCheck size={16} className="text-white shrink-0" />
          <span>Zero fiat currency fees · Bank-grade WebRTC encryption · Anti-tamper TimeBank ledger</span>
        </div>
        <div>
          © 2026 Vantage. Pure reciprocal knowledge barter.
        </div>
      </footer>
    </div>
  );
}
