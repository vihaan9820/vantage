import { ArrowRight, Award, BadgeCheck, Bookmark, BriefcaseBusiness, Check, Library, Plus, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAccount } from "@/contexts/AccountContext";
import { professionals, useSkillSwap, type ReviewFeedback } from "@/contexts/SkillSwapContext";
import { PageSEO } from "@/components/PageSEO";
import { UserAvatar } from "@/components/UserAvatar";

const tabs = ["overview", "skills", "qualifications", "portfolio", "accomplishments", "reviews", "sessions", "learning", "teaching"] as const;
type ProfileTab = (typeof tabs)[number];

const labelFor = (tab: ProfileTab) => tab === "overview" ? "Overview" : tab[0].toUpperCase() + tab.slice(1);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function ReviewsTab({ feedback }: { feedback: ReviewFeedback[] }) {
  const [, navigate] = useLocation();
  return <section className="content-panel profile-records"><p className="page-kicker">MY REVIEWS</p><h2>Private feedback from your own sessions.</h2>{feedback.length ? <div className="record-grid">{feedback.map((item) => { const professional = professionals.find((professional) => professional.id === item.professionalId); return <article key={item.id} className="record-card"><Bookmark size={20} /><p className="page-kicker">PRIVATE SESSION FEEDBACK</p><h3>{professional?.name ?? "SkillSwap professional"}</h3><p>{item.text}</p><small>Saved {new Date(item.createdAt).toLocaleDateString()}</small></article>; })}</div> : <div className="empty-state compact"><Bookmark size={24} /><h3>No feedback saved yet</h3><p>After a booked session, you can add private, constructive feedback from the Sessions area. No ratings or reviews are shown until you create them.</p><button className="primary-action" onClick={() => navigate("/sessions")}>Open sessions</button></div>}</section>;
}

export default function ProfileWorkspace() {
  const [location, navigate] = useLocation();
  const { account, updateProfile } = useAccount();
  const { state, addQualification, addPortfolioProject, addAccomplishment } = useSkillSwap();
  const params = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const isLearnerOnly = account?.mode === "learn";
  const activeTabs = useMemo(() => isLearnerOnly ? tabs.filter((t) => t !== "teaching") : tabs, [isLearnerOnly]);
  const requested = params.get("tab")?.toLowerCase();
  const requestedTab: ProfileTab = (activeTabs as readonly string[]).includes(requested || "") ? (requested as ProfileTab) : "overview";
  const [activeTab, setActiveTab] = useState<ProfileTab>(requestedTab);
  useEffect(() => { setActiveTab(requestedTab); }, [requestedTab]);
  const tab = activeTab;
  const editing = params.get("edit") === "1";
  const [profileDraft, setProfileDraft] = useState(() => ({
    name: account?.name ?? "",
    location: account?.location ?? "",
    languages: account?.languages.join(", ") ?? "English",
    mode: account?.mode ?? "both",
    sessionPrice: account?.sessionPrice ?? 14,
  }));
  const [showQualificationForm, setShowQualificationForm] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [showAccomplishmentForm, setShowAccomplishmentForm] = useState(false);
  const [qualificationDraft, setQualificationDraft] = useState({ name: "", institution: "", year: "", skill: "", evidence: "" });
  const [portfolioDraft, setPortfolioDraft] = useState({ title: "", description: "", skill: "", type: "Project", link: "", imageName: "" });
  const [accomplishmentDraft, setAccomplishmentDraft] = useState({ title: "", description: "", date: "", category: "Achievement", evidence: "" });

  const goTab = (next: ProfileTab) => { setActiveTab(next); navigate(`/profile?tab=${next}`); };
  const endEdit = () => navigate(tab === "overview" ? "/profile" : `/profile?tab=${tab}`);
  const saveProfile = () => {
    const validatedPrice = Math.max(12, Math.round(Number(profileDraft.sessionPrice) || 12));
    updateProfile({
      name: profileDraft.name.trim() || "SkillSwap member",
      location: profileDraft.location.trim() || undefined,
      languages: profileDraft.languages.split(",").map((l) => l.trim()).filter(Boolean),
      mode: profileDraft.mode as "learn" | "teach" | "both",
      sessionPrice: validatedPrice,
    });
    toast.success("Profile updated successfully.");
    endEdit();
  };
  const addQualificationRecord = () => { if (!qualificationDraft.name.trim() || !qualificationDraft.institution.trim() || !qualificationDraft.year.trim() || !qualificationDraft.skill.trim()) return; addQualification({ ...qualificationDraft, name: qualificationDraft.name.trim(), institution: qualificationDraft.institution.trim(), year: qualificationDraft.year.trim(), skill: qualificationDraft.skill.trim(), evidence: qualificationDraft.evidence.trim(), status: "claimed" }); setQualificationDraft({ name: "", institution: "", year: "", skill: "", evidence: "" }); setShowQualificationForm(false); };
  const addPortfolioRecord = () => { if (!portfolioDraft.title.trim() || !portfolioDraft.description.trim() || !portfolioDraft.skill.trim()) return; addPortfolioProject({ ...portfolioDraft, title: portfolioDraft.title.trim(), description: portfolioDraft.description.trim(), skill: portfolioDraft.skill.trim(), link: portfolioDraft.link.trim(), imageName: portfolioDraft.imageName || undefined }); setPortfolioDraft({ title: "", description: "", skill: "", type: "Project", link: "", imageName: "" }); setShowPortfolioForm(false); };
  const addAccomplishmentRecord = () => { if (!accomplishmentDraft.title.trim() || !accomplishmentDraft.description.trim() || !accomplishmentDraft.date.trim()) return; addAccomplishment({ ...accomplishmentDraft, title: accomplishmentDraft.title.trim(), description: accomplishmentDraft.description.trim(), date: accomplishmentDraft.date.trim(), evidence: accomplishmentDraft.evidence.trim() }); setAccomplishmentDraft({ title: "", description: "", date: "", category: "Achievement", evidence: "" }); setShowAccomplishmentForm(false); };
  const savedSkills = state.savedSkills;
  const sessions = state.sessions;

  return (
    <div className="profile-workspace max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title="My Profile & Skill Matrix"
        description="View and edit your personal skill barter matrix, verified credentials, and learning portfolio on SkillSwap."
        canonicalPath="/profile"
      />
      {/* Hero */}
      <section className="glass-panel card-3d rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 overflow-hidden flex-1 min-w-0 w-full">
          <UserAvatar src={account?.avatar} name={account?.name} size="xl" rounded="3xl" />
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="page-kicker">MY PROFESSIONAL PROFILE</p>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2 truncate">
              {account?.name ?? "SkillSwap member"}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 truncate">
              {account?.location || "Add location"} · {account?.languages.join(" / ") || "English"}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold">
                {account?.mode === "both"
                  ? "Learner & Mentor"
                  : account?.mode === "learn"
                  ? "Learner"
                  : "Mentor"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold">
                ★ {account?.sessionPrice ?? 14} pts / session
              </span>
            </div>
          </div>
        </div>

        <button
          className="secondary-action text-xs w-full sm:w-auto justify-center"
          onClick={() => navigate(editing ? "/profile" : "/profile?edit=1")}
        >
          {editing ? "Cancel Editing" : "Edit Profile"}
        </button>
      </section>

      {/* Tabs */}
      <nav className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10 hide-scrollbar" aria-label="Profile sections">
        {activeTabs.map((item) => (
          <button
            key={item}
            className={`text-xs font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              tab === item
                ? "bg-white text-black font-bold shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            onClick={() => goTab(item)}
          >
            {labelFor(item)}
          </button>
        ))}
      </nav>

      {/* Edit Mode Modal / Panel */}
      {editing && (
        <section className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">Edit Profile Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Full Name</label>
              <input
                value={profileDraft.name}
                onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Location</label>
              <input
                value={profileDraft.location}
                onChange={(event) =>
                  setProfileDraft((current) => ({ ...current, location: event.target.value }))
                }
                placeholder="City, Country"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold block mb-1">Languages</label>
              <input
                value={profileDraft.languages}
                onChange={(event) =>
                  setProfileDraft((current) => ({ ...current, languages: event.target.value }))
                }
                placeholder="English, Hindi, Spanish"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>
            {!isLearnerOnly && (
              <div>
                <label className="text-xs text-gray-400 font-semibold block mb-1">Session Rate (Gems)</label>
                <input
                  type="number"
                  min="12"
                  step="1"
                  value={profileDraft.sessionPrice}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      sessionPrice: Math.max(12, parseInt(event.target.value) || 12),
                    }))
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            )}
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold block mb-1.5">Account Mode Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "both", label: "Barter (Both)", desc: "1:1 mutual swaps & Gems" },
                  { id: "learn", label: "Learner Only", desc: "Book mentors with Gems" },
                  { id: "teach", label: "Mentor Only", desc: "Teach & earn Gems" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfileDraft((curr) => ({ ...curr, mode: item.id as any }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      profileDraft.mode === item.id
                        ? "bg-white text-black border-white shadow-md font-bold"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs block font-bold">{item.label}</span>
                    <span className="text-[10px] block opacity-70 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="primary-action text-xs px-6" onClick={saveProfile}>
              Save Profile <Check size={14} />
            </button>
            <button className="secondary-action text-xs" onClick={endEdit}>
              Cancel
            </button>
          </div>
        </section>
      )}

      {/* Tab: Overview */}
      {tab === "overview" && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills Bento */}
          <article className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
            <div>
              <p className="page-kicker">SKILLS BENTO</p>
              <h2 className="text-2xl font-bold text-white">
                {isLearnerOnly ? "Learning Goals" : "Skills Exchange"}
              </h2>
            </div>
            <div className={`grid gap-4 ${isLearnerOnly ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
                  Wants to Learn
                </span>
                <div className="flex flex-wrap gap-2">
                  {account?.learnSkills.length ? (
                    account.learnSkills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => navigate(`/skills/${slug(skill)}`)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-200 hover:border-white hover:text-white transition-colors"
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No learning skills listed.</p>
                  )}
                </div>
              </div>

              {!isLearnerOnly && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
                    Teaches & Mentors
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {account?.teachSkills.length ? (
                      account.teachSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => navigate(`/skills/${slug(skill)}`)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                        >
                          {skill}
                        </button>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">No teaching skills listed.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Quick Shortcuts */}
          <article className="glass-panel rounded-3xl p-8 flex flex-col justify-between gap-6">
            <div>
              <p className="page-kicker">VERIFIED CREDENTIALS</p>
              <h2 className="text-2xl font-bold text-white mb-2">Qualifications & Works</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Showcase work samples, academic degrees, and achievements to build credibility with students.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => goTab("qualifications")}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-white hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BadgeCheck size={16} className="text-white" />
                  <span>My Qualifications ({state.qualifications.length})</span>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </button>

              <button
                onClick={() => goTab("portfolio")}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-white hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Library size={16} className="text-white" />
                  <span>Portfolio Projects ({state.portfolioProjects.length})</span>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </button>

              <button
                onClick={() => goTab("accomplishments")}
                className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-white hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-white" />
                  <span>Accomplishments ({state.accomplishments.length})</span>
                </div>
                <ArrowRight size={14} className="text-gray-400" />
              </button>
            </div>
          </article>
        </section>
      )}

      {/* Tab: Qualifications */}
      {tab === "qualifications" && (
        <section className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="page-kicker">QUALIFICATIONS</p>
              <h2 className="text-2xl font-bold text-white">Keep claims and evidence clear.</h2>
            </div>
            <button className="primary-action text-xs" onClick={() => setShowQualificationForm(true)}>
              <Plus size={14} /> Add qualification
            </button>
          </div>

          {showQualificationForm && (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
              <input
                placeholder="Qualification name"
                value={qualificationDraft.name}
                onChange={(e) => setQualificationDraft((c) => ({ ...c, name: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
              <input
                placeholder="Institution"
                value={qualificationDraft.institution}
                onChange={(e) => setQualificationDraft((c) => ({ ...c, institution: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
              <div className="flex gap-3">
                <input
                  placeholder="Year"
                  value={qualificationDraft.year}
                  onChange={(e) => setQualificationDraft((c) => ({ ...c, year: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white flex-1"
                />
                <input
                  placeholder="Relevant skill"
                  value={qualificationDraft.skill}
                  onChange={(e) => setQualificationDraft((c) => ({ ...c, skill: e.target.value }))}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white flex-1"
                />
              </div>
              <input
                placeholder="Evidence link or note (optional)"
                value={qualificationDraft.evidence}
                onChange={(e) => setQualificationDraft((c) => ({ ...c, evidence: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
              <div className="flex gap-2">
                <button className="primary-action text-xs" onClick={addQualificationRecord}>
                  Save qualification
                </button>
                <button className="secondary-action text-xs" onClick={() => setShowQualificationForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {state.qualifications.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.qualifications.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">
                    {item.status === "verified" ? "Verified" : "Self-Reported"}
                  </span>
                  <h3 className="text-base font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-400">
                    {item.institution} · {item.year} · {item.skill}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No qualifications added yet.</p>
          )}
        </section>
      )}

      {/* Tab: Skills / Visual Skill Matrix */}
      {tab === "skills" && (
        <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-8 border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="page-kicker">INTERACTIVE SKILL MATRIX</p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Visual Skill Matrix & Endorsements</h2>
              <p className="text-xs text-gray-400 mt-1">
                Proficiency levels verified through peer barter sessions and peer endorsements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ShieldCheck size={14} /> 12 Verified Endorsements
              </span>
            </div>
          </div>

          {/* Teaching Skills Matrix Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" /> Teaching Capabilities & Endorsements
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "React & Next.js", level: "Expert (95%)", progress: 95, endorsements: 8, category: "Technology", color: "#FFFFFF" },
                { name: "UI/UX & Design Systems", level: "Advanced (88%)", progress: 88, endorsements: 6, category: "Design", color: "#E4E4E7" },
                { name: "TypeScript & Architecture", level: "Advanced (82%)", progress: 82, endorsements: 5, category: "Technology", color: "#D4D4D8" },
                { name: "Tailwind CSS & Animations", level: "Expert (92%)", progress: 92, endorsements: 7, category: "Design", color: "#FFFFFF" },
              ].map((matrixItem) => (
                <div key={matrixItem.name} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{matrixItem.category}</span>
                      <h4 className="text-base font-bold text-white">{matrixItem.name}</h4>
                    </div>
                    <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">
                      {matrixItem.level}
                    </span>
                  </div>

                  {/* Visual Progress Bar Graph */}
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-white"
                      style={{ width: `${matrixItem.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1 text-white font-semibold">
                      <Check size={13} /> {matrixItem.endorsements} peer endorsements
                    </span>
                    <button
                      onClick={() => navigate(`/teach?skill=${encodeURIComponent(matrixItem.name)}`)}
                      className="text-white hover:underline font-semibold text-[11px]"
                    >
                      Offer in Barter →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Wishlist Matrix */}
          <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white" /> Active Learning Targets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "3D Blender Modeling", target: "Intermediate", current: "Beginner (25%)", progress: 25, mentor: "Maya Lin", color: "#FFFFFF" },
                { name: "Conversational Japanese", target: "Fluent", current: "Intermediate (45%)", progress: 45, mentor: "Kenji Sato", color: "#D4D4D8" },
              ].map((learnItem) => (
                <div key={learnItem.name} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white">Target: {learnItem.target}</span>
                      <h4 className="text-base font-bold text-white">{learnItem.name}</h4>
                    </div>
                    <span className="text-xs font-mono text-gray-300">{learnItem.current}</span>
                  </div>

                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-white"
                      style={{ width: `${learnItem.progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Active Barter Partner: <b className="text-white">{learnItem.mentor}</b></span>
                    <button
                      onClick={() => navigate("/discover")}
                      className="text-white hover:underline font-semibold text-[11px]"
                    >
                      Find Teachers →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tab: Portfolio */}
      {tab === "portfolio" && (
        <section className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="page-kicker">SHOWCASE</p>
              <h2 className="text-2xl font-bold text-white">My Portfolio & Case Studies</h2>
            </div>
            <button className="primary-action text-xs" onClick={() => setShowPortfolioForm(true)}>
              <Plus size={14} /> Add project
            </button>
          </div>

          {showPortfolioForm && (
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3">
              <input
                placeholder="Project title"
                value={portfolioDraft.title}
                onChange={(e) => setPortfolioDraft((c) => ({ ...c, title: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
              <textarea
                placeholder="Description"
                value={portfolioDraft.description}
                onChange={(e) => setPortfolioDraft((c) => ({ ...c, description: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
              <input
                placeholder="Skill"
                value={portfolioDraft.skill}
                onChange={(e) => setPortfolioDraft((c) => ({ ...c, skill: e.target.value }))}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
              <div className="flex gap-2">
                <button className="primary-action text-xs" onClick={addPortfolioRecord}>
                  Add to portfolio
                </button>
                <button className="secondary-action text-xs" onClick={() => setShowPortfolioForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {state.portfolioProjects.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.portfolioProjects.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">
                    {item.type} · {item.skill}
                  </span>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">You have not added any portfolio projects yet.</p>
          )}
        </section>
      )}

      {/* Tab: Accomplishments */}
      {tab === "accomplishments" && (
        <section className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="page-kicker">ACCOMPLISHMENTS</p>
              <h2 className="text-2xl font-bold text-white">Record milestones with context.</h2>
            </div>
            <button className="primary-action text-xs" onClick={() => setShowAccomplishmentForm(true)}>
              <Plus size={14} /> Add accomplishment
            </button>
          </div>

          {state.accomplishments.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.accomplishments.map((item) => (
                <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Showcase achievements that help learners understand your expertise.</p>
          )}
        </section>
      )}

      {/* Tab: Reviews */}
      {tab === "reviews" && <ReviewsTab feedback={state.reviewFeedback} />}

      {/* Tab: Sessions */}
      {tab === "sessions" && (
        <section className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
          <p className="page-kicker">MY SESSIONS</p>
          <h2 className="text-2xl font-bold text-white">Keep bookings visible.</h2>
          {sessions.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-base font-bold text-white">{session.skill}</h3>
                  <p className="text-xs text-gray-400">{session.time} · {session.points} points</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">You have not booked a learning session yet.</p>
          )}
        </section>
      )}

      {/* Tab: Learning & Teaching */}
      {(tab === "learning" || tab === "teaching") && (
        <section className="glass-panel rounded-3xl p-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="page-kicker">{tab === "learning" ? "MY LEARNING" : "MY TEACHING"}</p>
              <h2 className="text-2xl font-bold text-white">
                {tab === "learning" ? "Interests you are building." : "Skills you are ready to share."}
              </h2>
            </div>
            {tab === "teaching" && (
              <button className="primary-action text-xs" onClick={() => navigate("/teach")}>
                <Plus size={14} /> Offer a Skill
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {((tab === "learning" ? account?.learnSkills : account?.teachSkills) ?? []).map((skill) => (
              <button
                key={skill}
                onClick={() => navigate(`/skills/${slug(skill)}`)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white"
              >
                {skill}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
