import {
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Check,
  Compass,
  Gem,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  PanelsTopLeft,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import { useTheme } from "@/contexts/ThemeContext";
import { UserAvatar } from "@/components/UserAvatar";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";
import { QuickTeachModal } from "@/components/QuickTeachModal";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const moreItems = [
  { label: "Skills Wallet", href: "/wallet", icon: Gem, color: "text-white" },
  { label: "Messages", href: "/messages", icon: MessageCircle, color: "text-white" },
  { label: "Saved Skills & Mentors", href: "/saved", icon: BookOpen, color: "text-white" },
  { label: "About Vantage", href: "/about", icon: Sparkles, color: "text-white" },
  { label: "Help Center", href: "/help", icon: Compass, color: "text-white" },
  { label: "Settings", href: "/settings", icon: Settings, color: "text-white" },
] as const;

const profileItems = [
  ["My Profile", "/profile"],
  ["Edit Profile", "/profile?edit=1"],
  ["My Skills", "/profile?tab=skills"],
  ["My Qualifications", "/profile?tab=qualifications"],
  ["My Portfolio", "/profile?tab=portfolio"],
  ["My Accomplishments", "/profile?tab=accomplishments"],
  ["My Sessions", "/sessions"],
  ["Wallet", "/wallet"],
  ["Settings", "/settings"],
] as const;

function destinationFor(note: string) {
  const text = note.toLowerCase();
  if (text.includes("point") || text.includes("reward")) return "/wallet";
  if (text.includes("session")) return "/sessions";
  if (text.includes("message") || text.includes("reply")) return "/messages";
  return "/dashboard";
}

function deepRouteContext(location: string) {
  if (location.startsWith("/professionals/")) return { back: "/professionals", label: "Professionals / Profile" };
  if (location.startsWith("/skills/")) return { back: "/discover", label: "Discover / Skill path" };
  if (location.startsWith("/messages?") || location.includes("/messages?pro="))
    return { back: "/messages", label: "Messages / Conversation" };
  const labels: Record<string, string> = {
    "/sessions": "Sessions",
    "/saved": "Saved",
    "/matches": "Skill matches",
    "/community": "Community",
    "/profile": "Profile",
    "/settings": "Settings",
    "/wallet": "Skill wallet",
    "/help": "Help",
    "/about": "About Vantage",
    "/search": "Search results",
  };
  const key = Object.keys(labels).find((path) => location.startsWith(path));
  return key ? { back: "/dashboard", label: labels[key] } : null;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState("All");

  const { state } = useSkillSwap();
  const { account, signOut, settings, updateSettings, updateProfile } = useAccount();
  const { theme } = useTheme();
  const resolvedTheme = theme;
  const [quickTeachOpen, setQuickTeachOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Studio signature entrance & scroll reveal animation across all pages
  useScrollReveal(location);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "t" || e.key === "T")) {
        e.preventDefault();
        setQuickTeachOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const notifications = useMemo(
    () =>
      state.notifications.map((text, index) => ({
        id: `${text}-${index}`,
        text,
        category:
          text.toLowerCase().includes("point") || text.toLowerCase().includes("reward")
            ? "Points"
            : text.toLowerCase().includes("session")
            ? "Sessions"
            : text.toLowerCase().includes("reply")
            ? "Messages"
            : "System",
      })),
    [state.notifications]
  );

  const visibleNotes =
    notificationTab === "All" ? notifications : notifications.filter((item) => item.category === notificationTab);
  const routeContext = deepRouteContext(location);

  const closeMenus = () => {
    setMobileOpen(false);
    setMoreOpen(false);
    setProfileOpen(false);
    setModeMenuOpen(false);
  };

  const go = (href: string) => {
    navigate(href);
    closeMenus();
  };

  const logout = () => {
    signOut();
    toast.success("You have been signed out of the local prototype.");
    go("/");
  };

  const navLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/professionals", label: "Mentors", icon: UsersRound },
    { href: "/matches", label: "Matches", icon: Zap },
    { href: "/teach", label: "Studio", icon: GraduationCap },
    { href: "/sessions", label: "Sessions", icon: PanelsTopLeft },
    { href: "/community", label: "Community", icon: Sparkles },
  ];

  const fullDrawerLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/discover", label: "Discover", icon: Compass },
    { href: "/matches", label: "Instant Matches", icon: Zap },
    { href: "/sessions", label: "My Sessions", icon: PanelsTopLeft },
    { href: "/teach", label: "Teaching Studio", icon: GraduationCap },
    { href: "/wallet", label: "Skills Wallet", icon: Gem },
    { href: "/professionals", label: "Mentors", icon: UsersRound },
    { href: "/messages", label: "Messages", icon: MessageCircle },
    { href: "/community", label: "Community", icon: Sparkles },
    { href: "/profile", label: "Profile", icon: UserRound },
    { href: "/settings", label: "Settings", icon: Settings },
  ];


  return (
    <div
      className={`app-chrome min-h-screen ${resolvedTheme === "light" ? "bg-white text-black" : "bg-black text-[#F8FAFC]"} product-theme-${resolvedTheme} ${
        settings.effects3d ? "effects-on" : "effects-off"
      } motion-${settings.animation} ${settings.highContrast ? "contrast-on" : ""} text-${settings.textScale} relative overflow-x-hidden`}
    >
      {/* Ambient background glow orbs and Ferrofluid simulation extending across the whole page */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        {resolvedTheme === "dark" && (
          <>
            <div className="glow-orb-mono w-[720px] h-[720px] -top-40 left-1/2 -translate-x-1/2 opacity-15" />
            <div className="glow-orb-mono w-[600px] h-[600px] top-1/4 -right-20 opacity-25 bg-[radial-gradient(circle,rgba(28,86,163,0.35)_0%,rgba(13,42,94,0.18)_45%,transparent_70%)]" />
            <div className="glow-orb-mono w-[580px] h-[580px] bottom-12 -left-24 opacity-15 bg-[radial-gradient(circle,rgba(28,86,163,0.25)_0%,rgba(7,27,62,0.1)_50%,transparent_70%)]" />
            <div className="glow-orb-mono w-[540px] h-[540px] bottom-24 -right-20 opacity-25 bg-[radial-gradient(circle,rgba(42,114,208,0.28)_0%,rgba(13,42,94,0.15)_45%,transparent_70%)]" />
          </>
        )}
        <FerrofluidBackground opacity={0.25} />
      </div>

      {/* Sleek Minimalist Top Navigation Bar */}
      <header className={`app-topbar product-topbar sticky top-0 z-40 w-full border-b backdrop-blur-[24px] transition-colors ${
        resolvedTheme === "light"
          ? "bg-white/90 border-black/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          : "bg-black/75 border-white/15 shadow-[0_4px_24px_rgba(0,0,0,0.6),inset_0_-1px_0_rgba(255,255,255,0.08)]"
      }`} style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-3">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className={`p-1.5 rounded-lg md:hidden cursor-pointer transition-colors ${
                resolvedTheme === "light" ? "text-black hover:bg-black/5" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 group shrink-0" aria-label="Vantage Dashboard">
              <img
                src="/vantage-logo.png"
                alt="Vantage"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain pointer-events-none select-none transition-transform group-hover:scale-105"
              />
              <span className={`font-megiko font-morenn font-bold text-xl sm:text-3xl tracking-wide ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>
                Vantage
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <nav className="flex items-center gap-0.5">
              {navLinks.map((item) => {
                const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      active
                        ? resolvedTheme === "light"
                          ? "bg-black text-white shadow-sm"
                          : "bg-white/20 text-white font-bold border border-white/30 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
                        : resolvedTheme === "light"
                        ? "text-zinc-600 hover:text-black hover:bg-black/5"
                        : "text-zinc-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-white stroke-[2]" : "text-zinc-300 stroke-[1.75]"} />
                    <span className={active ? "text-white font-bold" : "text-zinc-300 font-medium"}>{item.label}</span>
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                    moreOpen
                      ? "text-black bg-white font-extrabold shadow-[0_0_15px_rgba(255,255,255,0.5)] border border-white"
                      : "text-zinc-200 hover:text-white hover:bg-white/10 border border-transparent"
                  }`}
                  aria-expanded={moreOpen}
                >
                  <span>More</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-150 ${moreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {moreOpen && (
                  <div
                    className="animate-popover absolute left-0 top-full mt-2 w-52 rounded-xl bg-black border border-white/20 shadow-2xl p-1 z-50 flex flex-col gap-0.5"
                    onClick={() => setMoreOpen(false)}
                  >
                    {moreItems.map((item) => {
                      const Icon = item.icon;
                      const active = location === item.href || location.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] flex items-center gap-2 transition-colors ${
                            active ? "bg-white/[0.06] text-white font-medium" : ""
                          }`}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon size={13} className={item.color} />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Header Controls: Credits + Notifications + Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mode Switcher Pill */}
            {account && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setModeMenuOpen((v) => !v)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    account.mode === "learn"
                      ? "bg-sky-500/15 text-sky-300 border-sky-400/30 hover:bg-sky-500/25"
                      : account.mode === "teach"
                      ? "bg-amber-500/15 text-amber-300 border-amber-400/30 hover:bg-amber-500/25"
                      : resolvedTheme === "light"
                      ? "bg-black/5 hover:bg-black/10 text-black border-black/20"
                      : "bg-white/10 hover:bg-white/20 text-white border-white/25"
                  }`}
                  title="Change Account Mode (Learner Only, Mentor Only, Barter)"
                  aria-label="Change account mode"
                >
                  {account.mode === "learn" ? (
                    <>
                      <Gem size={12} className="text-sky-400 fill-sky-400 shrink-0" />
                      <span className="hidden sm:inline font-bold">Learner</span>
                      <span className="text-[10px] text-sky-400/80 font-mono hidden md:inline">(Gems)</span>
                    </>
                  ) : account.mode === "teach" ? (
                    <>
                      <GraduationCap size={13} className="text-amber-400 shrink-0" />
                      <span className="hidden sm:inline font-bold">Mentor</span>
                      <span className="text-[10px] text-amber-400/80 font-mono hidden md:inline">(Earn)</span>
                    </>
                  ) : (
                    <>
                      <Zap size={12} className="shrink-0" />
                      <span className="hidden sm:inline font-bold">Barter</span>
                      <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">(Both)</span>
                    </>
                  )}
                  <ChevronDown size={11} className="opacity-70 ml-0.5" />
                </button>

                {modeMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-black border border-white/20 shadow-2xl p-2 z-50 flex flex-col gap-1 animate-popover"
                    onClick={() => setModeMenuOpen(false)}
                  >
                    <div className="px-2.5 py-1.5 border-b border-white/10 mb-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                        Account Mode Preference
                      </span>
                      <p className="text-[11px] text-zinc-300 mt-0.5">
                        Choose how you interact with mentors and swap sessions.
                      </p>
                    </div>

                    {[
                      {
                        id: "learn" as const,
                        label: "Learners Only",
                        sub: "Pay with Gems · No skill trade required",
                        icon: Gem,
                        activeColor: "text-sky-400",
                      },
                      {
                        id: "teach" as const,
                        label: "Mentors Only",
                        sub: "Offer your skills · Earn Gems teaching",
                        icon: GraduationCap,
                        activeColor: "text-amber-400",
                      },
                      {
                        id: "both" as const,
                        label: "Barter Mode",
                        sub: "1:1 mutual skill trade & Gems both active",
                        icon: Zap,
                        activeColor: "text-white",
                      },
                    ].map((item) => {
                      const isSelected = account.mode === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            updateProfile({ mode: item.id });
                            if (item.id === "learn") {
                              toast.success("🎓 Switched to Learners Only Mode! You can now book any mentor directly using Gems.");
                            } else if (item.id === "teach") {
                              toast.success("💡 Switched to Mentors Only Mode! Focus on listing offerings and earning Gems.");
                            } else {
                              toast.success("⇄ Switched to Barter Mode! 1:1 mutual skill trades and Gems are both active.");
                            }
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 ${
                            isSelected
                              ? "bg-white/15 text-white border border-white/20 font-bold"
                              : "hover:bg-white/5 text-zinc-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <Icon size={14} className={`shrink-0 mt-0.5 ${isSelected ? item.activeColor : "text-zinc-400"}`} />
                            <div>
                              <strong className="text-xs block leading-tight">{item.label}</strong>
                              <small className="text-[10px] text-zinc-400 block mt-0.5 font-normal">{item.sub}</small>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-white shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TimeBank Swap Credits Badge */}
            <Link
              href="/wallet"
              className={`wallet-pill flex items-center gap-1 sm:gap-1.5 border-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all ${
                resolvedTheme === "light"
                  ? "bg-black/5 hover:bg-black/10 text-black border-black/20 shadow-sm"
                  : "bg-white/10 hover:bg-white/20 text-white border-white/35 shadow-[0_0_12px_rgba(255,255,255,0.08)]"
              }`}
              aria-label={`${state.wallet} Swap Credits available`}
            >
              <Zap size={13} className={resolvedTheme === "light" ? "text-black fill-black" : "text-white fill-white"} />
              <span className={`font-mono text-xs font-black ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>{state.wallet}</span>
              <span className={`hidden sm:inline text-[11px] font-semibold ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>Credits</span>
            </Link>

            {/* Quick Teach Skill Action */}
            <button
              type="button"
              onClick={() => setQuickTeachOpen(true)}
              title="Teach a Skill (Alt+T)"
              className="quick-teach-btn flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-white/40 bg-white text-black hover:bg-zinc-200 shadow-[0_0_14px_rgba(255,255,255,0.25)]"
              aria-label="Teach a skill"
            >
              <GraduationCap size={14} className="shrink-0" />
              <span className="hidden min-[420px]:inline font-extrabold">+ Teach</span>
              <span className="hidden xl:inline text-[9px] font-mono opacity-60 ml-0.5 uppercase tracking-wider px-1 py-0.5 rounded bg-black/10 text-black">
                Alt+T
              </span>
            </button>

            {/* Notification Hub Trigger */}
            <button
              className={`notification-button p-1.5 sm:p-2 rounded-xl border transition-colors relative ${
                resolvedTheme === "light"
                  ? "text-black hover:bg-black/5 border-black/20"
                  : "text-white hover:bg-white/15 border-white/25"
              }`}
              onClick={() => setNotificationOpen((value) => !value)}
              aria-label="View notifications"
              aria-expanded={notificationOpen}
              aria-controls="notification-center"
            >
              <Bell size={15} className={resolvedTheme === "light" ? "text-black" : "text-white"} />
              {notifications.length > 0 && (
                <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${resolvedTheme === "light" ? "bg-black" : "bg-white shadow-[0_0_6px_#ffffff]"}`} />
              )}
            </button>

            {/* Profile Menu Trigger */}
            {account ? (
              <div className="profile-menu-wrap relative">
                <button
                  className="profile-trigger flex items-center gap-1 p-0.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                  onClick={() => setProfileOpen((value) => !value)}
                  aria-expanded={profileOpen}
                  aria-controls="profile-navigation-menu"
                >
                  <UserAvatar src={account.avatar} name={account.name} size="xs" />
                  <ChevronDown size={11} className={resolvedTheme === "light" ? "text-zinc-600" : "text-zinc-400"} />
                </button>

                {profileOpen ? (
                  <div
                    id="profile-navigation-menu"
                    className={`product-menu profile-menu animate-popover absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5 border ${
                      resolvedTheme === "light"
                        ? "bg-white border-black/15 text-black"
                        : "bg-black border-white/20 text-white"
                    }`}
                  >
                    <div className={`px-2.5 py-2 border-b flex items-center gap-2 overflow-hidden ${resolvedTheme === "light" ? "border-black/10" : "border-white/[0.06]"}`}>
                      <UserAvatar src={account.avatar} name={account.name} size="sm" />
                      <div className="overflow-hidden flex-1 min-w-0">
                        <strong className={`text-xs block truncate ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>{account.name}</strong>
                        <small className={`text-[10px] block truncate capitalize ${resolvedTheme === "light" ? "text-zinc-500" : "text-zinc-400"}`}>
                          {account.mode === "both" ? "Learner & Mentor" : account.mode}
                        </small>
                      </div>
                    </div>
                    {profileItems.map(([label, href]) => (
                      <button
                        key={label}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          resolvedTheme === "light"
                            ? "text-zinc-700 hover:text-black hover:bg-black/5"
                            : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                        }`}
                        onClick={() => go(href)}
                      >
                        {label}
                      </button>
                    ))}

                    <div className={`border-t mt-1 pt-1 ${resolvedTheme === "light" ? "border-black/10" : "border-white/[0.06]"}`}>
                      <button
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        onClick={logout}
                      >
                        <LogOut size={12} /> Sign out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className={`text-xs px-2.5 py-1 ${resolvedTheme === "light" ? "text-zinc-600 hover:text-black" : "text-zinc-400 hover:text-white"}`}>
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={`chrome-signup text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                    resolvedTheme === "light"
                      ? "bg-black hover:bg-zinc-800 text-white"
                      : "bg-white hover:bg-zinc-200 text-black"
                  }`}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Notification Center Drawer */}
        {notificationOpen ? (
          <aside
            id="notification-center"
            className={`notification-drawer animate-popover fixed right-4 top-16 w-80 max-w-[calc(100vw-32px)] max-h-[500px] rounded-xl border shadow-2xl p-4 z-50 flex flex-col gap-3 ${
              resolvedTheme === "light" ? "bg-white border-black/15 text-black" : "bg-black border-white/20 text-white"
            }`}
            aria-label="Notification center"
          >
            <div className={`flex justify-between items-center border-b pb-3 ${resolvedTheme === "light" ? "border-black/10" : "border-white/10"}`}>
              <div>
                <p className={`page-kicker ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>NOTIFICATIONS</p>
                <h3 className={`text-sm font-bold ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>Activity & Alerts</h3>
              </div>
              <button
                onClick={() => setNotificationOpen(false)}
                className={`p-1 rounded-lg ${resolvedTheme === "light" ? "text-zinc-500 hover:text-black hover:bg-black/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                aria-label="Close notifications"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
              {["All", "Messages", "Sessions", "Points", "System"].map((tab) => (
                <button
                  key={tab}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    notificationTab === tab
                      ? resolvedTheme === "light"
                        ? "bg-black text-white font-bold"
                        : "bg-white text-black font-bold"
                      : resolvedTheme === "light"
                      ? "text-zinc-600 hover:text-black hover:bg-black/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  aria-pressed={notificationTab === tab}
                  onClick={() => setNotificationTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-1">
              {visibleNotes.length ? (
                visibleNotes.map((note) => (
                  <button
                    key={note.id}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-colors ${
                      resolvedTheme === "light"
                        ? "bg-black/[0.03] hover:bg-black/[0.06] border-black/10"
                        : "bg-white/[0.03] hover:bg-white/[0.06] border-white/5"
                    }`}
                    onClick={() => {
                      setNotificationOpen(false);
                      go(destinationFor(note.text));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>{note.category}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${resolvedTheme === "light" ? "bg-black" : "bg-white"}`} />
                    </div>
                    <p className={`text-xs leading-snug ${resolvedTheme === "light" ? "text-zinc-600" : "text-gray-300"}`}>{note.text}</p>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 text-xs">You're all caught up.</div>
              )}
            </div>
          </aside>
        ) : null}
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-Over Navigation Drawer */}
      <nav
        id="main-mobile-navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-[82vw] max-w-xs border-r flex flex-col p-4 sm:p-5 gap-3 lg:hidden shadow-2xl transition-transform duration-200 ease-out overflow-y-auto ${
          resolvedTheme === "light"
            ? "bg-white border-black/15 text-black"
            : "bg-black border-white/10 text-white"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 1.25rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
        }}
        aria-label="Main navigation"
      >
        <div className={`flex justify-between items-center pb-3 border-b ${resolvedTheme === "light" ? "border-black/10" : "border-white/10"}`}>
          <Link href="/get-started" className="flex items-center gap-3" onClick={closeMenus}>
            <img src="/vantage-logo.png" alt="Vantage" className="w-8 h-8 sm:w-9 sm:h-9 object-contain pointer-events-none select-none" />
            <span className={`font-megiko font-morenn font-bold text-2xl sm:text-3xl tracking-wide ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>
              Vantage
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className={`p-2 rounded-xl ${resolvedTheme === "light" ? "text-zinc-600 hover:text-black hover:bg-black/5" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Status / Wallet in Mobile Drawer */}
        {account ? (
          <div className={`p-3 rounded-2xl border flex flex-col gap-2.5 ${
            resolvedTheme === "light" ? "bg-black/[0.04] border-black/10 text-black" : "bg-white/[0.04] border-white/10 text-white"
          }`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar src={account.avatar} name={account.name} size="sm" />
              <div className="overflow-hidden flex-1 min-w-0">
                <strong className={`text-xs block truncate ${resolvedTheme === "light" ? "text-black" : "text-white"}`}>{account.name}</strong>
                <small className={`text-[10px] block truncate capitalize ${resolvedTheme === "light" ? "text-zinc-500" : "text-gray-400"}`}>
                  {account.mode === "both" ? "Learner & Mentor" : account.mode}
                </small>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/10">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Mode:
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "learn" as const, label: "Learner", icon: Gem },
                  { id: "teach" as const, label: "Mentor", icon: GraduationCap },
                  { id: "both" as const, label: "Barter", icon: Zap },
                ].map((item) => {
                  const isSelected = account.mode === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        updateProfile({ mode: item.id });
                        if (item.id === "learn") {
                          toast.success("🎓 Switched to Learners Only Mode!");
                        } else if (item.id === "teach") {
                          toast.success("💡 Switched to Mentors Only Mode!");
                        } else {
                          toast.success("⇄ Switched to Barter Mode!");
                        }
                      }}
                      className={`p-1.5 rounded-lg text-center flex flex-col items-center gap-0.5 transition-all text-[11px] font-bold border ${
                        isSelected
                          ? "bg-white text-black border-white shadow-sm font-black"
                          : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
                      }`}
                    >
                      <Icon size={12} className={isSelected ? "text-black fill-black" : "text-zinc-400"} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Link
              href="/wallet"
              onClick={closeMenus}
              className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs font-bold ${
                resolvedTheme === "light" ? "bg-black/10 text-black border-black/20" : "bg-white/10 text-white border-white/20"
              }`}
            >
              <span className="flex items-center gap-1.5">
                ⚡ <span>{state.wallet} Swap Credits</span>
              </span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className={`grid grid-cols-2 gap-2 pb-2 border-b ${resolvedTheme === "light" ? "border-black/10" : "border-white/10"}`}>
            <Link
              href="/login"
              onClick={closeMenus}
              className={`text-center py-2 text-xs font-bold rounded-xl border ${
                resolvedTheme === "light" ? "border-black/15 text-zinc-700 hover:text-black" : "border-white/15 text-gray-200 hover:text-white"
              }`}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={closeMenus}
              className={`text-center py-2 text-xs font-bold rounded-xl shadow ${
                resolvedTheme === "light" ? "bg-black text-white hover:bg-zinc-800" : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Navigation Links */}
        <div className="flex flex-col gap-1 overflow-y-auto pr-1">
          {fullDrawerLinks.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/dashboard" ? location === "/dashboard" : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all min-h-[44px] ${
                  active
                    ? resolvedTheme === "light"
                      ? "bg-black text-white font-bold shadow-sm border border-black"
                      : "bg-white text-black font-bold shadow-md border border-white"
                    : resolvedTheme === "light"
                    ? "text-zinc-700 hover:text-black hover:bg-black/5"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
                onClick={closeMenus}
              >
                <Icon size={18} className={active ? (resolvedTheme === "light" ? "text-white" : "text-black") : (resolvedTheme === "light" ? "text-zinc-600" : "text-gray-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className={`mt-auto pt-3 border-t flex flex-col gap-2.5 ${resolvedTheme === "light" ? "border-black/10" : "border-white/10"}`}>
          {/* Quick Teach in mobile drawer */}
          <button
            type="button"
            onClick={() => {
              closeMenus();
              setQuickTeachOpen(true);
            }}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow ${
              resolvedTheme === "light"
                ? "bg-black text-white hover:bg-zinc-800"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            <GraduationCap size={16} />
            <span>+ Teach a Skill</span>
          </button>

          {account && (
            <button
              className="w-full text-xs text-red-500 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors"
              onClick={logout}
            >
              <LogOut size={15} /> Sign out
            </button>
          )}
        </div>
      </nav>

      {/* Breadcrumb Context (Centered with Main Content) */}
      {routeContext ? (
        <div className={`route-context relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center gap-2 text-xs ${
          resolvedTheme === "light" ? "text-zinc-600" : "text-gray-400"
        }`}>
          <button
            onClick={() => go(routeContext.back)}
            className={`flex items-center gap-1 transition-colors ${resolvedTheme === "light" ? "hover:text-black" : "hover:text-white"}`}
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span>/</span>
          <span className={`font-medium ${resolvedTheme === "light" ? "text-black" : "text-gray-300"}`}>{routeContext.label}</span>
        </div>
      ) : null}

      {/* Page Main Content Area */}
      <main ref={mainRef} className="app-content product-content relative z-10 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-24 lg:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={`mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-2xl border-t px-2 py-1 flex justify-around items-center shadow-2xl transition-colors ${
          resolvedTheme === "light"
            ? "bg-white/95 text-black border-black/15 shadow-lg"
            : "bg-black/95 text-white border-white/10"
        }`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          height: "calc(3.75rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Mobile navigation"
      >
        {[
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/discover", label: "Discover", icon: Compass },
          {
            href: "/matches",
            label: "Matches",
            icon: Zap,
            badge: (state.barterProposals || []).filter((p) => p.status === "Proposed").length,
          },
          { href: "/messages", label: "Messages", icon: MessageCircle },
          { href: "/profile", label: "Profile", icon: UserRound },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.href === "/dashboard" ? location === "/dashboard" : location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
                active
                  ? resolvedTheme === "light" ? "text-black font-extrabold" : "text-white font-bold"
                  : resolvedTheme === "light" ? "text-zinc-600 hover:text-black" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon size={18} className={active ? (resolvedTheme === "light" ? "text-black" : "text-white") : (resolvedTheme === "light" ? "text-zinc-500" : "text-gray-400")} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[14px] h-[14px] flex items-center justify-center bg-white text-black font-extrabold text-[9px] rounded-full shadow-md font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Teach Accessible Modal */}
      <QuickTeachModal isOpen={quickTeachOpen} onClose={() => setQuickTeachOpen(false)} />
    </div>
  );
}
