import { ArrowLeft, Award, BadgeCheck, BookOpen, BriefcaseBusiness, CalendarDays, Check, ChevronRight, Gem, Heart, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { professionals, useSkillSwap } from "@/contexts/SkillSwapContext";
import { PageSEO } from "@/components/PageSEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const tabs = ["About", "Experience", "Qualifications", "Portfolio", "Availability"];

export default function ProfessionalProfile() {
  const [, params] = useRoute("/professionals/:id");
  const [, navigate] = useLocation();
  const { state, selectProfessional, toggleSave, book } = useSkillSwap();
  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  const [tab, setTab] = useState(() => tabs.find((item) => item.toLowerCase() === requestedTab?.toLowerCase()) ?? "About");
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [credentialOpen, setCredentialOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingSlot, setBookingSlot] = useState("");
  const professional = professionals.find((item) => item.id === params?.id) ?? professionals[0];
  useEffect(() => { const next = tabs.find((item) => item.toLowerCase() === requestedTab?.toLowerCase()); if (next) setTab(next); }, [requestedTab]);
  const saved = state.savedIds.includes(professional.id);
  const chat = () => { selectProfessional(professional.id); navigate(`/messages?pro=${professional.id}`); };
  const openBooking = (slot = professional.slots[0]) => { setBookingSlot(slot); setBookingOpen(true); };
  const reserve = () => {
    const slot = bookingSlot || professional.slots[0];
    const points = professional.price;
    if (!book(professional.id, slot, points)) { toast.error("Your wallet needs more points for this session."); return; }
    toast.success("Session reserved. Your points are held in the wallet.");
    setBookingOpen(false);
    navigate("/wallet");
  };
  const save = () => { toggleSave(professional.id); toast.success(saved ? "Professional removed from saved list." : "Professional saved to your learning path."); };
  return (
    <div className="profile-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      <PageSEO
        title={`${professional.name} — ${professional.primarySkill} Mentor`}
        description={`${professional.name} is a ${professional.title} on SkillSwap. Specializations: ${professional.specializations.join(", ")}. Trade skills 1-on-1.`}
        canonicalPath={`/professionals/${professional.id}`}
        type="profile"
        breadcrumbs={[
          { name: "Mentors", url: "/professionals" },
          { name: professional.name, url: `/professionals/${professional.id}` },
        ]}
      />

      <div className="flex items-center justify-between">
        <Breadcrumbs
          items={[
            { label: "Mentors", href: "/professionals" },
            { label: professional.name },
          ]}
        />
        <Link
          href="/professionals"
          className="back-link inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>
      </div>

      {/* Hero Section */}
      <section className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-3xl shrink-0 flex items-center justify-center text-4xl font-extrabold shadow-2xl border-2 border-white/10 text-white relative group"
            style={{ background: professional.accent || "#18181b" }}
          >
            {professional.avatar}
            {professional.verified ? (
              <span className="absolute -bottom-2 -right-2 bg-white text-black p-1.5 rounded-full shadow-md" title="Verified Mentor">
                <BadgeCheck size={18} />
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/10 text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-wider">
                {professional.primarySkill}
              </span>
              <span className="text-xs text-gray-400">
                {professional.tier} · {professional.location}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {professional.name}
            </h1>
            <h2 className="text-lg text-gray-300 font-medium">{professional.title}</h2>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed mt-1">{professional.bio}</p>

            <div className="flex flex-wrap gap-2 mt-3">
              {professional.specializations.map((spec) => (
                <span key={spec} className="text-xs px-3 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/10">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Column */}
        <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
          <button className="primary-action w-full justify-center text-sm py-3 px-6 bg-white text-black font-bold hover:bg-zinc-200" onClick={() => openBooking()}>
            <CalendarDays size={16} /> Book 60-min · ★ {professional.price} pts
          </button>
          <button className="secondary-action w-full justify-center text-sm py-3 px-6" onClick={chat}>
            <MessageCircle size={16} /> Chat / Consult Free
          </button>
          <button className="secondary-action w-full justify-center text-sm py-2.5 px-6" onClick={save}>
            <Heart size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save to Path"}
          </button>
        </div>
      </section>

      {/* Stats Grid from Stitch */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl md:text-4xl font-black text-white">{professional.experience}+</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Years Practice</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl md:text-4xl font-black text-white">85+</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sessions Hosted</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl md:text-4xl font-black text-white">{professional.response || "100%"}</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Response Rate</span>
        </div>
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-1 text-center md:text-left">
          <span className="text-3xl md:text-4xl font-black text-white">★ {professional.price}</span>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Points / hr</span>
        </div>
      </section>

      {/* Skills Bento Grid from Stitch */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <Award size={20} className="text-white" />
            <h3 className="text-xl font-bold">Teaches & Mentors</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {professional.specializations.map((spec) => (
              <span key={spec} className="px-3.5 py-1.5 rounded-xl bg-white/5 text-gray-200 text-sm border border-white/10">
                {spec}
              </span>
            ))}
            {professional.styles.map((style) => (
              <span key={style} className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-sm border border-white/20">
                {style}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <BookOpen size={20} className="text-white" />
            <h3 className="text-xl font-bold">Open to Skill-Swap In</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {["UI/UX Design", "Figma Prototyping", "Prompt Engineering", "Full-Stack Dev"].map((skill) => (
              <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white text-sm border border-white/20">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-auto pt-2">
            Open to reciprocal skill exchanges or booking via Skill Points.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="profile-tabs flex gap-4 border-b border-white/10 pb-2">
        {tabs.map((item) => (
          <button
            key={item}
            className={`pb-2 px-2 border-b-2 font-semibold text-xs uppercase tracking-wider transition-all ${
              tab === item ? "border-white text-white font-bold" : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "About" ? (
        <section className="profile-detail-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="glass-panel p-6 rounded-2xl">
            <p className="page-kicker">HOW I TEACH</p>
            <h3 className="text-xl font-bold text-white mb-3">Clear outcomes, practical sessions.</h3>
            <div className="style-list flex flex-wrap gap-2 mb-4">
              {professional.styles.map((style) => (
                <span key={style} className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300">
                  {style}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Each session is tailored to your real projects, portfolio goals, and current skill stage.
            </p>
          </article>
          <article className="glass-panel p-6 rounded-2xl">
            <p className="page-kicker">TRUST & CREDENTIALS</p>
            <ul className="trust-list space-y-3 text-sm text-gray-300 mt-2">
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-white" /> Identity status transparently documented</li>
              <li className="flex items-center gap-2"><Award size={16} className="text-white" /> {professional.experience}+ years of verified domain practice</li>
              <li className="flex items-center gap-2"><Check size={16} className="text-white" /> {professional.qualification === "verified" ? "Platform verified qualification" : "Domain practitioner claimed"}</li>
            </ul>
          </article>
        </section>
      ) : null}

      {tab === "Experience" ? (
        <section className="experience-timeline glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-6">
          <article className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white shrink-0">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Senior {professional.title}</h3>
              <p className="text-sm text-gray-400">2021–Present · Independent Mentor & Practitioner</p>
              <span className="text-xs text-gray-500">{professional.experience}+ years in {professional.primarySkill}</span>
            </div>
          </article>
        </section>
      ) : null}

      {tab === "Qualifications" ? (
        <section className="glass-panel p-6 md:p-8 rounded-2xl flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <BadgeCheck size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{professional.primarySkill} Practice Credential</h3>
              <p className="text-sm text-gray-400">Recognized domain qualification · 2025</p>
            </div>
          </div>
          <button className="secondary-action text-xs" onClick={() => setCredentialOpen(true)}>
            View Verification Details
          </button>
        </section>
      ) : null}

      {tab === "Portfolio" ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {["Production Case Study", "Methodology Breakdown", "Before & After Transformation"].map((item, index) => (
            <button
              key={item}
              onClick={() => setPortfolioOpen(true)}
              className="glass-panel p-6 rounded-2xl text-left flex flex-col gap-3 group hover:border-white/40 transition-colors"
            >
              <div className="w-full h-36 rounded-xl bg-white/5 flex items-center justify-center text-2xl font-bold text-white" style={{ background: professional.accent }}>
                {index + 1}
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">{item}</h3>
              <p className="text-xs text-gray-400">{professional.primarySkill} · Click to preview</p>
            </button>
          ))}
        </section>
      ) : null}

      {tab === "Availability" ? (
        <section className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col gap-6">
          <div>
            <p className="page-kicker">AVAILABLE SLOTS</p>
            <h3 className="text-2xl font-bold text-white">Choose a time that works</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professional.slots.map((slot) => (
              <button
                key={slot}
                onClick={() => openBooking(slot)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white flex justify-between items-center text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-white" />
                  <span className="text-sm font-semibold text-white">{slot}</span>
                </div>
                <b className="text-xs text-white font-bold">★ {professional.price} pts</b>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Pricing Strip */}
      <section className="pricing-strip glass-panel p-6 rounded-2xl flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-white" />
            <span className="text-sm text-gray-300">15-min Consultation <b className="text-white font-bold">Free (0 pts)</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-white" />
            <span className="text-sm text-gray-300">30-min Practice <b className="text-white font-bold">{Math.max(12, professional.price - 2)} pts</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Gem size={18} className="text-white" />
            <span className="text-sm text-gray-300">60-min Master Session <b className="text-white font-bold">{professional.price} pts</b></span>
          </div>
        </div>
        <button className="secondary-action text-xs" onClick={chat}>
          Consult before booking <MessageCircle size={14} />
        </button>
      </section>

      {/* Booking Modal */}
      {bookingOpen ? (
        <div className="portfolio-modal checkout-modal" role="dialog" aria-modal="true">
          <button aria-label="Close" onClick={() => setBookingOpen(false)}>×</button>
          <p className="page-kicker">CONFIRM RESERVATION</p>
          <h3 className="text-xl font-bold text-white mb-2">{professional.primarySkill} with {professional.name}</h3>
          <p className="text-sm text-gray-400 mb-4">{bookingSlot || professional.slots[0]} · 60 minutes</p>
          <div className="payment-summary mb-4">
            <div>
              <span>Session cost</span>
              <strong>★ {professional.price} Skill Points</strong>
            </div>
            <div>
              <span>Your balance</span>
              <strong>★ {state.wallet} Skill Points</strong>
            </div>
          </div>
          {state.wallet >= professional.price ? (
            <p className="text-sm text-gray-300 mb-4">
              Points will be held and transferred upon session completion. Remaining: <b>{state.wallet - professional.price} Points</b>
            </p>
          ) : (
            <p className="text-xs text-red-400 mb-4">
              You need {professional.price - state.wallet} more Points to book.
            </p>
          )}
          <div className="form-actions">
            {state.wallet >= professional.price ? (
              <button className="primary-action" onClick={reserve}>
                Confirm Booking — {professional.price} Points
              </button>
            ) : (
              <button className="primary-action" onClick={() => navigate("/wallet")}>
                Buy Points in Wallet
              </button>
            )}
            <button className="secondary-action" onClick={() => setBookingOpen(false)}>Cancel</button>
          </div>
        </div>
      ) : null}

      {portfolioOpen ? (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close" onClick={() => setPortfolioOpen(false)}>×</button>
          <div className="portfolio-preview rounded-2xl h-48 flex items-center justify-center text-4xl font-bold text-white mb-4" style={{ background: professional.accent }}>
            {professional.avatar}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{professional.name} · Portfolio Preview</h3>
          <p className="text-sm text-gray-400">Sample verified work and case study from {professional.primarySkill} mentorship.</p>
        </div>
      ) : null}

      {credentialOpen ? (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close" onClick={() => setCredentialOpen(false)}>×</button>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-2">
            <BadgeCheck size={28} />
          </div>
          <p className="page-kicker">CREDENTIAL DETAILS</p>
          <h3 className="text-xl font-bold text-white mb-2">{professional.primarySkill} Credential</h3>
          <p className="text-sm text-gray-400 mb-4">Status: <b>{professional.qualification === "verified" ? "Verified by Platform" : "Claimed by Mentor"}</b></p>
          <button className="primary-action w-full bg-white text-black font-bold hover:bg-zinc-200" onClick={() => { setCredentialOpen(false); chat(); }}>
            <MessageCircle size={15} /> Ask Mentor About Credential
          </button>
        </div>
      ) : null}
    </div>
  );
}
