import {
  ArrowLeft,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Compass,
  Gem,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  PanelsTopLeft,
  Search,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { useSkillSwap } from "@/contexts/SkillSwapContext";
import { UserAvatar } from "@/components/UserAvatar";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";

const moreItems = [
  { label: "Skills Wallet", href: "/wallet", icon: Gem, color: "text-amber-400" },
  { label: "Messages", href: "/messages", icon: MessageCircle, color: "text-indigo-400" },
  { label: "Saved Skills & Mentors", href: "/saved", icon: BookOpen, color: "text-teal-400" },
  { label: "About SkillSwap", href: "/about", icon: Sparkles, color: "text-purple-400" },
  { label: "Help Center", href: "/help", icon: Compass, color: "text-sky-400" },
  { label: "Settings", href: "/settings", icon: Settings, color: "text-gray-400" },
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
    "/about": "About SkillSwap",
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
  const { account, signOut, settings, updateSettings } = useAccount();

  const resolvedTheme = "dark";

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

  const [searchMode, setSearchMode] = useState<"learn" | "teach">("learn");
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headerSearchQuery.trim()) {
      go(searchMode === "learn" ? "/discover" : "/teach");
      return;
    }
    go(`/search?q=${encodeURIComponent(headerSearchQuery.trim())}&mode=${searchMode}`);
  };

  return (
    <div
      className={`app-chrome min-h-screen bg-transparent text-[#F8FAFC] product-theme-${resolvedTheme} ${
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
        <div className="glow-orb-indigo w-[640px] h-[640px] -top-36 left-1/4 opacity-60" />
        <div className="glow-orb-emerald w-[520px] h-[520px] top-1/3 -right-28 opacity-45" />
        <div className="glow-orb-violet w-[560px] h-[560px] bottom-10 -left-28 opacity-45" />
        <div className="glow-orb-amber w-[440px] h-[440px] top-2/3 right-1/4 opacity-35" />
        <FerrofluidBackground />
      </div>

      {/* Sleek Minimalist Top Navigation Bar */}
      <header className="app-topbar product-topbar sticky top-0 z-40 w-full border-b border-white/[0.12] bg-white/[0.08] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-white lg:hidden rounded-lg hover:bg-white/[0.04] transition-colors"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="main-mobile-navigation"
            >
              <Menu size={18} />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs group-hover:border-white/40 group-hover:bg-white/15 transition-all">
                <span>⇄</span>
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                Skill<span className="text-zinc-400">Swap</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main Top Navigation">
              {navLinks.map((item) => {
                const active = item.href === "/dashboard" ? location === "/dashboard" : location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      active
                        ? "bg-white/[0.08] text-white font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                    moreOpen
                      ? "text-white bg-white/[0.08]"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
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
                    className="animate-popover absolute left-0 top-full mt-2 w-52 rounded-xl bg-[#141824] border border-white/[0.08] shadow-2xl p-1 z-50 flex flex-col gap-0.5"
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

          {/* Right Header Controls: Search + Credits + Notifications + Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Minimalist Search Input */}
            <form
              onSubmit={handleHeaderSearch}
              className="hidden md:flex items-center bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] focus-within:border-white/30 rounded-lg px-2.5 py-1 w-40 lg:w-48 transition-colors"
            >
              <Search size={12} className="text-zinc-400 shrink-0 mr-2" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <span className="hidden xl:inline-block text-[10px] text-zinc-500 font-mono px-1 py-0.2 rounded bg-white/[0.04] border border-white/10 shrink-0">
                ⌘K
              </span>
            </form>

            {/* TimeBank Swap Credits Badge */}
            <Link
              href="/wallet"
              className="wallet-pill flex items-center gap-1.5 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/[0.06] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
              aria-label={`${state.wallet} Swap Credits available`}
            >
              <Zap size={12} className="text-zinc-300" />
              <span className="font-mono text-xs font-bold text-white">{state.wallet}</span>
              <span className="hidden sm:inline text-[11px] text-zinc-400">Credits</span>
            </Link>

            {/* Notification Hub Trigger */}
            <button
              className="notification-button p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors relative"
              onClick={() => setNotificationOpen((value) => !value)}
              aria-label="View notifications"
              aria-expanded={notificationOpen}
              aria-controls="notification-center"
            >
              <Bell size={15} />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
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
                  <ChevronDown size={11} className="text-zinc-400" />
                </button>

                {profileOpen ? (
                  <div
                    id="profile-navigation-menu"
                    className="product-menu profile-menu animate-popover absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#141824] border border-white/[0.08] shadow-2xl p-1.5 z-50 flex flex-col gap-0.5"
                  >
                    <div className="px-2.5 py-2 border-b border-white/[0.06] flex items-center gap-2 overflow-hidden">
                      <UserAvatar src={account.avatar} name={account.name} size="sm" />
                      <div className="overflow-hidden flex-1 min-w-0">
                        <strong className="text-xs text-white block truncate">{account.name}</strong>
                        <small className="text-[10px] text-zinc-400 block truncate capitalize">
                          {account.mode === "both" ? "Learner & Mentor" : account.mode}
                        </small>
                      </div>
                    </div>
                    {profileItems.map(([label, href]) => (
                      <button
                        key={label}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                        onClick={() => go(href)}
                      >
                        {label}
                      </button>
                    ))}

                    <div className="border-t border-white/[0.06] mt-1 pt-1">
                      <button
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
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
                <Link href="/login" className="text-xs text-zinc-400 hover:text-white px-2.5 py-1">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="chrome-signup text-xs bg-white hover:bg-zinc-200 text-zinc-950 font-semibold px-3 py-1 rounded-lg transition-colors"
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
            className="notification-drawer animate-popover fixed right-4 top-16 w-80 max-w-[calc(100vw-32px)] max-h-[500px] rounded-xl bg-[#141824] border border-white/[0.08] shadow-2xl p-4 z-50 flex flex-col gap-3"
            aria-label="Notification center"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <p className="page-kicker">NOTIFICATIONS</p>
                <h3 className="text-sm font-bold text-white">Activity & Alerts</h3>
              </div>
              <button
                onClick={() => setNotificationOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
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
                      ? "bg-[#6366F1] text-white font-bold"
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
                    className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-left flex flex-col gap-1 transition-colors"
                    onClick={() => {
                      setNotificationOpen(false);
                      go(destinationFor(note.text));
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#6366F1] uppercase">{note.category}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    </div>
                    <p className="text-xs text-gray-300 leading-snug">{note.text}</p>
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-[82vw] max-w-xs bg-[#090D18] border-r border-white/10 flex flex-col p-5 gap-3 lg:hidden shadow-2xl transition-transform duration-200 ease-out overflow-y-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-label="Main navigation"
      >
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={closeMenus}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#10B981] flex items-center justify-center text-white font-black text-xs shadow-md">
              ⇄
            </div>
            <span className="text-sm font-extrabold text-white tracking-tight">
              Skill<span className="text-[#10B981]">Swap</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Status / Wallet in Mobile Drawer */}
        {account ? (
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <UserAvatar src={account.avatar} name={account.name} size="sm" />
              <div className="overflow-hidden flex-1 min-w-0">
                <strong className="text-xs text-white block truncate">{account.name}</strong>
                <small className="text-[10px] text-gray-400 block truncate capitalize">
                  {account.mode === "both" ? "Learner & Mentor" : account.mode}
                </small>
              </div>
            </div>
            <Link
              href="/wallet"
              onClick={closeMenus}
              className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-bold"
            >
              <span className="flex items-center gap-1.5">
                ⚡ <span>{state.wallet} Swap Credits</span>
              </span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/10">
            <Link
              href="/login"
              onClick={closeMenus}
              className="text-center py-2 text-xs font-bold rounded-xl border border-white/15 text-gray-200 hover:text-white"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={closeMenus}
              className="text-center py-2 text-xs font-bold rounded-xl bg-[#6366F1] text-white shadow"
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
                    ? "bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-bold shadow-md shadow-[#6366F1]/30 border border-white/15"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
                onClick={closeMenus}
              >
                <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-3 border-t border-white/10 flex flex-col gap-2">

          {account && (
            <button
              className="w-full text-xs text-red-400 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-400/10 transition-colors"
              onClick={logout}
            >
              <LogOut size={15} /> Sign out
            </button>
          )}
        </div>
      </nav>

      {/* Breadcrumb Context (Centered with Main Content) */}
      {routeContext ? (
        <div className="route-context relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center gap-2 text-xs text-gray-400">
          <button
            onClick={() => go(routeContext.back)}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <span>/</span>
          <span className="text-gray-300 font-medium">{routeContext.label}</span>
        </div>
      ) : null}

      {/* Page Main Content Area */}
      <main className="app-content product-content relative z-10 min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-24 lg:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B11]/92 backdrop-blur-2xl border-t border-white/10 px-2 py-1 flex justify-around items-center h-16 shadow-2xl"
        aria-label="Mobile navigation"
      >
        {[
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/discover", label: "Discover", icon: Compass },
          { href: "/teach", label: "Studio", icon: GraduationCap },
          { href: "/sessions", label: "Sessions", icon: PanelsTopLeft },
          { href: "/profile", label: "Profile", icon: UserRound },
        ].map((item) => {
          const Icon = item.icon;
          const active = item.href === "/dashboard" ? location === "/dashboard" : location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-w-[54px] min-h-[44px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all ${
                active ? "text-[#6366F1] font-bold" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon size={18} className={active ? "text-[#6366F1]" : "text-gray-400"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
