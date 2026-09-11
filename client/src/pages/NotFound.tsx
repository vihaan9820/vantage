import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Home,
  Layers,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  Zap,
} from "lucide-react";
import { PageSEO } from "@/components/PageSEO";
import BorderGlow from "@/components/ui/BorderGlow";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularRoutes = [
    { label: "Next.js", query: "Next.js" },
    { label: "Python & AI", query: "Python" },
    { label: "UI/UX Design", query: "UI/UX" },
    { label: "3D Blender", query: "Blender" },
    { label: "Marketing", query: "Marketing" },
  ];

  const destinationCards = [
    {
      title: "2-Way Matchmaker",
      desc: "Find instant barter partners who teach what you want and need what you offer.",
      href: "/matches",
      icon: Zap,
      badge: "Instant Match",
    },
    {
      title: "Mentor Directory",
      desc: "Explore verified peer creators, software engineers, and domain specialists.",
      href: "/discover",
      icon: Compass,
      badge: "Verified Peers",
    },
    {
      title: "TimeBank Wallet",
      desc: "Review your barter credit ledger, escrow deposit history, and session balances.",
      href: "/wallet",
      icon: Layers,
      badge: "Zero Cash",
    },
    {
      title: "Community Exchange",
      desc: "Connect with active learners, post trade requests, and endorse peers.",
      href: "/community",
      icon: MessageSquare,
      badge: "Active Forum",
    },
  ];

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center px-4 sm:px-6 py-12 md:py-20 relative z-10">
      <PageSEO
        title="404 — Knowledge Route Not Found · SkillSwap"
        description="The requested skill barter route or 1:1 session cannot be found. Search verified mentors or return to your SkillSwap dashboard."
        canonicalPath="/404"
      />

      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Main 404 Specular Card with Bright BorderGlow */}
        <BorderGlow
          borderRadius={24}
          glowColor="#ffffff"
          backgroundColor="rgba(8, 14, 26, 0.65)"
          glowRadius={60}
          glowIntensity={0.8}
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          className="w-full rounded-3xl"
        >
          <div className="p-6 sm:p-10 md:p-14 flex flex-col items-center text-center relative overflow-hidden">
            {/* Ambient specular highlight orb */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Diagnostic Protocol Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border-2 border-white/40 text-white text-xs font-mono font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_#ffffff]" />
              </span>
              <span>ERROR 404 · SKILL ROUTE DESYNCHRONIZED</span>
            </div>

            {/* Radiant Specular 404 Numeric Hero */}
            <div className="relative mb-4">
              <h1 className="text-8xl sm:text-9xl md:text-[11rem] font-black tracking-tighter text-white font-mono leading-none select-none drop-shadow-[0_0_35px_rgba(255,255,255,0.85)]">
                404
              </h1>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* Headline & Explainer */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3 max-w-2xl">
              Lost in the Barter Matrix
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed mb-8 font-normal">
              The skill exchange pathway, mentor profile, or 1:1 video room you are looking for doesn’t exist or has been re-indexed into a different learning route.
            </p>

            {/* Live System Telemetry HUD */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-3.5 bg-white/[0.04] border-2 border-white/30 rounded-2xl">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-white">
                <ShieldCheck size={14} className="text-white" />
                <span className="font-bold">ESCROW: PROTECTED</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-white border-y sm:border-y-0 sm:border-x border-white/20 py-2 sm:py-0">
                <Video size={14} className="text-white" />
                <span className="font-bold">VIDEO ROOMS: ACTIVE</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-white">
                <Sparkles size={14} className="text-white" />
                <span className="font-bold">TIMEBANK: INTACT</span>
              </div>
            </div>

            {/* High-Contrast Skill Search Recovery */}
            <form onSubmit={handleSearch} className="w-full max-w-lg mb-4 relative">
              <div className="relative flex items-center">
                <Search size={18} className="absolute left-4 text-white pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any skill (e.g. Next.js, Python, UI/UX)..."
                  style={{ outline: "none", boxShadow: "none" }}
                  className="w-full bg-black border border-white/20 focus:border-white/40 rounded-2xl py-3.5 pl-10 sm:pl-12 pr-24 sm:pr-32 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all shadow-inner font-semibold"
                />
                <button
                  type="submit"
                  style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
                  className="absolute right-1.5 sm:right-2 px-3 sm:px-4 py-2 rounded-xl bg-[#E4E4E7] text-black font-black text-xs transition-all hover:bg-zinc-300 shadow-sm cursor-pointer"
                >
                  <span style={{ color: "#000000", fontWeight: 900 }}>Find Skill</span>
                </button>
              </div>
            </form>

            {/* Popular Skill Quick Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-center mb-8 text-xs">
              <span className="text-zinc-400 font-bold text-[11px] uppercase tracking-wider">Try:</span>
              {popularRoutes.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setLocation(`/search?q=${encodeURIComponent(chip.query)}`)}
                  style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
                  className="px-3 py-1 rounded-lg bg-[#E4E4E7] text-black font-bold text-xs hover:bg-zinc-300 transition-all shadow-sm cursor-pointer"
                >
                  <span style={{ color: "#000000", fontWeight: 800 }}>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Primary Action Buttons: Matte White with Black Text */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3.5 w-full justify-center mb-10">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-5 py-3 rounded-xl bg-black border border-white/30 text-white font-bold text-xs sm:text-sm hover:bg-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                onClick={() => setLocation("/dashboard")}
                style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
                className="px-6 py-3 rounded-xl bg-[#E4E4E7] text-black font-black text-xs sm:text-sm hover:bg-zinc-300 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Home size={16} className="text-black" style={{ color: "#000000" }} />
                <span style={{ color: "#000000", fontWeight: 900 }}>Return to Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => setLocation("/matches")}
                style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
                className="px-6 py-3 rounded-xl bg-[#E4E4E7] text-black font-black text-xs sm:text-sm hover:bg-zinc-300 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Zap size={16} className="text-black fill-black" style={{ color: "#000000", fill: "#000000" }} />
                <span style={{ color: "#000000", fontWeight: 900 }}>Find Instant Matches</span>
              </button>
            </div>

            {/* Quick-Launch Destination Bento Grid */}
            <div className="w-full pt-8 border-t-2 border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Compass size={14} className="text-white" />
                  <span>Explore Recommended Learning Pathways</span>
                </span>
                <span className="text-xs text-zinc-400 font-mono">Status: 4 Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left w-full">
                {destinationCards.map((dest) => {
                  const Icon = dest.icon;
                  return (
                    <Link
                      key={dest.href}
                      href={dest.href}
                      className="group p-5 rounded-2xl bg-black border-2 border-white/30 hover:border-white transition-all duration-200 flex flex-col justify-between gap-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/30 text-white group-hover:bg-white group-hover:text-black transition-colors">
                          <Icon size={18} />
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded-md font-mono"
                          style={{ backgroundColor: "#FFFFFF", color: "#000000", WebkitTextFillColor: "#000000" }}
                        >
                          {dest.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-white flex items-center justify-between">
                          <span>{dest.title}</span>
                          <ArrowRight size={14} className="text-white group-hover:translate-x-1 transition-transform" />
                        </h3>
                        <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                          {dest.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}
