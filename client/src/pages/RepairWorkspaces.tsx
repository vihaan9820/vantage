import { ArrowRight, Bookmark, BookOpen, MessageCircle, Paperclip, Search, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { allSkills } from "./ProductPages";
import { professionals, useSkillSwap } from "@/contexts/SkillSwapContext";
import { PageSEO } from "@/components/PageSEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const title = (value: string) => value.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");

export function SkillDetailRepair() {
  const [, params] = useRoute("/skills/:slug");
  const [, navigate] = useLocation();
  const { state, toggleSavedSkill } = useSkillSwap();
  const skill = allSkills.find((item) => slug(item.skill) === params?.slug);
  const name = skill?.skill ?? title(params?.slug ?? "skill");
  const category = skill?.category ?? "Skill";
  const saved = state.savedSkills.some((item) => item.id === slug(name));
  const relevant = professionals.filter((professional) =>
    `${professional.primarySkill} ${professional.specializations.join(" ")}`
      .toLowerCase()
      .includes(name.toLowerCase())
  );

  return (
    <div className="skill-detail-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      <PageSEO
        title={`${name} — Skill Path & Barter Mentors`}
        description={`Master ${name} through 1-on-1 reciprocal skill swaps and structured sessions with verified mentors on SkillSwap.`}
        canonicalPath={`/skills/${slug(name)}`}
        breadcrumbs={[
          { name: "Discover", url: "/discover" },
          { name, url: `/skills/${slug(name)}` },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Discover", href: "/discover" },
          { label: name },
        ]}
      />

      {/* Hero */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between items-start gap-6">
        <div>
          <p className="page-kicker">{category.toUpperCase()} · SKILL PATH</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3">{name}</h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl">
            Master {name} through 1-on-1 mentorship, hands-on practice, and structured skill-swap sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="primary-action text-xs px-6 py-2.5"
            onClick={() => navigate(`/professionals?skill=${encodeURIComponent(name)}`)}
          >
            Find Mentors for {name} <ArrowRight size={14} />
          </button>
          <button
            className="secondary-action text-xs px-6 py-2.5"
            onClick={() => navigate(`/teach?skill=${encodeURIComponent(name)}`)}
          >
            Teach {name} in Studio
          </button>
          <button
            className={`secondary-action text-xs px-4 py-2.5 ${saved ? "text-white border-white bg-white/10" : ""}`}
            onClick={() => toggleSavedSkill({ id: slug(name), name, category })}
          >
            <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save Skill"}
          </button>
        </div>
      </section>

      {/* Relevant Mentors */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="page-kicker">EXPERT TEACHERS</p>
            <h2 className="text-2xl font-bold text-white">Mentors who teach {name}</h2>
          </div>
          <span className="text-xs text-gray-400">{relevant.length} available</span>
        </div>

        {relevant.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relevant.map((pro) => (
              <div
                key={pro.id}
                className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-4 group hover:border-white/40 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-lg shrink-0"
                    style={{ background: pro.accent }}
                  >
                    {pro.avatar}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">
                      {pro.name}
                    </h3>
                    <span className="text-xs text-gray-400 block line-clamp-1">{pro.title}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <b className="text-xs text-white font-bold">★ {pro.price} pts / session</b>
                  <button
                    className="primary-action text-xs px-3 py-1.5"
                    onClick={() => navigate(`/professionals/${pro.id}`)}
                  >
                    Book Session <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <UsersRound size={32} className="text-gray-500" />
            <h3 className="text-lg font-bold text-white">No listed mentors for {name} yet</h3>
            <p className="text-xs text-gray-400">Be the first to list and teach this skill in your studio!</p>
            <button
              className="primary-action text-xs mt-2"
              onClick={() => navigate(`/teach?skill=${encodeURIComponent(name)}`)}
            >
              Offer to Teach {name}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export function SavedRepair() {
  const [, navigate] = useLocation();
  const { state, toggleSave, toggleSavedSkill, toggleCommunitySave } = useSkillSwap();
  const current = new URLSearchParams(window.location.search).get("tab") ?? "professionals";
  const tab = ["skills", "professionals", "sessions", "posts"].includes(current) ? current : "professionals";
  const savedProfessionals = professionals.filter((professional) => state.savedIds.includes(professional.id));
  const savedPosts = state.communityPosts.filter((post) => post.saved);

  const chooseTab = (next: string) => navigate(`/saved?tab=${next}`);

  return (
    <div className="saved-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title="Saved Skills & Mentors"
        description="Review and organize your saved mentors, learning signals, and bookmarked skills on SkillSwap."
        canonicalPath="/saved"
      />
      {/* Hero */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-between items-start gap-4">
        <p className="page-kicker">SAVED ITEMS</p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Saved Signals</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-xl">
          Quickly access saved mentors, skills, sessions, and community discussions from one place.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {["professionals", "skills", "sessions", "posts"].map((item) => (
          <button
            key={item}
            className={`text-xs font-semibold px-4 py-2 rounded-xl capitalize transition-all ${
              tab === item
                ? "bg-white text-black font-bold shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            onClick={() => chooseTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "professionals" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProfessionals.length ? (
            savedProfessionals.map((pro) => (
              <div
                key={pro.id}
                className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-lg shrink-0"
                    style={{ background: pro.accent }}
                  >
                    {pro.avatar}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">{pro.name}</h3>
                    <span className="text-xs text-gray-400 block line-clamp-1">{pro.title}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <button
                    className="primary-action text-xs px-4"
                    onClick={() => navigate(`/professionals/${pro.id}`)}
                  >
                    View Profile
                  </button>
                  <button
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5"
                    onClick={() => toggleSave(pro.id)}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 col-span-3">No saved mentors yet.</p>
          )}
        </div>
      )}

      {tab === "skills" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {state.savedSkills.length ? (
            state.savedSkills.map((skill) => (
              <div key={skill.id} className="glass-panel p-4 rounded-2xl flex justify-between items-center">
                <button
                  className="text-xs font-bold text-white hover:text-zinc-300 transition-colors"
                  onClick={() => navigate(`/skills/${skill.id}`)}
                >
                  {skill.name}
                </button>
                <button
                  className="text-gray-400 hover:text-white p-1"
                  onClick={() =>
                    toggleSavedSkill({ id: skill.id, name: skill.name, category: skill.category })
                  }
                >
                  <X size={14} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 col-span-4">No saved skills yet.</p>
          )}
        </div>
      )}

      {tab === "sessions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.sessions.length ? (
            state.sessions.map((session) => (
              <div key={session.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{session.skill}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white capitalize">{session.status}</span>
                </div>
                <p className="text-xs text-gray-400">{session.time}</p>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs text-white font-bold">{session.points} pts</span>
                  <button className="primary-action text-xs px-4" onClick={() => navigate("/sessions")}>
                    Manage Session
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 col-span-2">No active sessions yet.</p>
          )}
        </div>
      )}

      {tab === "posts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPosts.length ? (
            savedPosts.map((post) => (
              <div key={post.id} className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white text-sm">
                      {post.avatar}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{post.author}</h4>
                      <span className="text-[11px] text-gray-400 capitalize">{post.type} • {new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => toggleCommunitySave(post.id)}
                    title="Remove from saved"
                  >
                    <X size={15} />
                  </button>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">{post.text}</p>
                {post.attachments && post.attachments.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-[11px] text-zinc-400 font-medium">
                    <Paperclip size={13} className="text-zinc-400" />
                    <span>{post.attachments.length} attachment{post.attachments.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <button
                    className="primary-action text-xs px-4"
                    onClick={() => navigate("/community")}
                  >
                    View in Community
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 col-span-2">No saved posts yet. Bookmark discussions in Community to view them here.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function SearchRepair() {
  const [, navigate] = useLocation();
  const initialQuery = new URLSearchParams(window.location.search).get("q") ?? "";
  const [term, setTerm] = useState(initialQuery);
  const [tab, setTab] = useState("All");
  const { state } = useSkillSwap();
  const search = term.trim().toLowerCase();

  const skills = allSkills.filter((item) => `${item.skill} ${item.category}`.toLowerCase().includes(search));
  const people = professionals.filter((item) =>
    `${item.name} ${item.title} ${item.primarySkill} ${item.location} ${item.specializations.join(" ")}`
      .toLowerCase()
      .includes(search)
  );

  return (
    <div className="search-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title="Search Skills & Mentors"
        description="Search across verified mentors, skills, sessions, and community exchange signals on SkillSwap."
        canonicalPath="/search"
      />
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col gap-6">
        <div>
          <p className="page-kicker">GLOBAL SEARCH</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            Search Skills & Mentors
          </h1>
        </div>

        <div className="w-full max-w-2xl flex items-center gap-3 bg-black px-4 py-3 rounded-2xl border border-white/20 shadow-inner">
          <Search size={18} className="text-gray-400" />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search skills, mentors, sessions..."
            style={{
              border: "0 none transparent",
              borderWidth: 0,
              borderStyle: "none",
              borderColor: "transparent",
              outline: "none",
              outlineWidth: 0,
              boxShadow: "none",
              background: "transparent",
              backgroundColor: "transparent",
              WebkitAppearance: "none",
            }}
            className="search-clean-input w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-sm text-white focus:outline-none placeholder-gray-500"
            autoFocus
          />
        </div>
      </section>

      {search && (
        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white">Results for "{term}"</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((pro) => (
              <div
                key={pro.id}
                className="glass-panel p-6 rounded-3xl flex flex-col justify-between gap-4 cursor-pointer hover:border-white/40 transition-all group"
                onClick={() => navigate(`/professionals/${pro.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-lg shrink-0"
                    style={{ background: pro.accent }}
                  >
                    {pro.avatar}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-zinc-200 transition-colors">{pro.name}</h3>
                    <span className="text-xs text-gray-400 block">{pro.title}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <span className="text-xs text-white font-bold">★ {pro.price} pts</span>
                  <span className="text-xs text-white flex items-center gap-1 font-semibold group-hover:underline">
                    View Mentor <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
