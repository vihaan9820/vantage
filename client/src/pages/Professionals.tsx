import { ArrowRight, BadgeCheck, Check, Gem, Heart, MapPin, MessageCircle, Search, SlidersHorizontal, Star, UsersRound, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { professionals, useSkillSwap, type Professional } from "@/contexts/SkillSwapContext";
import { useAccount } from "@/contexts/AccountContext";
import { toast } from "sonner";
import { SwapProposalModal } from "@/components/SwapProposalModal";
import { PageSEO } from "@/components/PageSEO";
import { UserAvatar } from "@/components/UserAvatar";
import BorderGlow from "@/components/ui/BorderGlow";

const alert = (message: string) => toast.error(message, { duration: 3200 });

function ProfessionalCard({
  professional,
  onProposeSwap,
}: {
  professional: Professional;
  onProposeSwap: (pro: Professional) => void;
}) {
  const [, navigate] = useLocation();
  const { state, selectProfessional, toggleSave, book } = useSkillSwap();
  const { account } = useAccount();
  const saved = state.savedIds.includes(professional.id);

  const chat = () => {
    selectProfessional(professional.id);
    navigate(`/messages?pro=${professional.id}`);
  };

  const reserve = () => {
    if (!book(professional.id, professional.slots[0])) {
      alert("Your starter balance needs a top-up before booking this session.");
    } else {
      navigate("/wallet");
    }
  };

  return (
    <BorderGlow
      edgeSensitivity={20}
      glowColor="#ffffff"
      backgroundColor="rgba(8, 14, 26, 0.65)"
      borderRadius={16}
      glowRadius={50}
      glowIntensity={0.8}
      coneSpread={34}
      animated={false}
      colors={["#ffffff", "#ffffff", "#ffffff"]}
      className="h-full rounded-2xl"
    >
      <article className="relative flex flex-col justify-between h-full p-5 group bg-transparent border-0">
        <div>
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar src={professional.avatar} name={professional.name} size="md" rounded="full" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">{professional.name}</h3>
                  {professional.verified && <BadgeCheck size={14} className="text-white shrink-0" />}
                </div>
                <span className="text-xs text-zinc-400 block line-clamp-1 font-normal">{professional.title}</span>
              </div>
            </div>
            <button
              className={`p-2 rounded-lg border transition-colors ${
                saved
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]"
              }`}
              onClick={() => toggleSave(professional.id)}
              aria-label="Save professional"
            >
              <Heart size={14} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 my-3 text-xs text-zinc-400">
            <span>{professional.experience}+ yrs practice</span>
            <span className="text-zinc-600">·</span>
            <span className="flex items-center gap-1 text-zinc-300">
              <Star size={12} className="text-white fill-white" /> {professional.rating} ({professional.swapsCompleted} swaps)
            </span>
            <span className="text-zinc-600">·</span>
            <span>{professional.tier} Mentor</span>
          </div>

          {/* Teaching Skills */}
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400">Teaches</span>
            <div className="flex flex-wrap gap-1.5">
              {professional.teachingSkills.map((t) => (
                <span
                  key={t.skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] text-zinc-200 border border-white/[0.08] text-xs font-medium"
                >
                  <span>{t.skill}</span>
                  <span className="text-[10px] text-zinc-400 font-normal capitalize">· {t.level}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Seeking Skills */}
          <div className="mt-3 flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-zinc-400">Seeking</span>
            <div className="flex flex-wrap gap-1.5">
              {professional.seekingSkills.slice(0, 3).map((s) => (
                <span key={s.skill} className="px-2 py-0.5 rounded-md bg-transparent border border-white/[0.06] text-zinc-400 text-xs font-normal">
                  {s.skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 mt-4 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-400 flex items-center gap-1.5 mb-2.5">
            <MapPin size={12} className="text-zinc-400" /> {professional.location} · {professional.languages.join(", ")}
          </p>

          <div className="flex justify-between items-center pb-3 text-xs">
            <span className="text-zinc-400">
              From <strong className="text-zinc-100 font-semibold">{professional.price} pts</strong> / session
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              {professional.availability}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onProposeSwap(professional)}
              style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
              className="primary-action trade-skill-btn propose-swap-btn bg-[#E4E4E7] text-black hover:bg-zinc-300 active:bg-zinc-400 rounded-lg text-xs font-bold py-2 px-3 text-center justify-center col-span-2 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-[#E4E4E7]"
            >
              {account?.mode === "learn" ? (
                <>
                  <Gem size={13} className="text-black fill-black shrink-0" style={{ color: "#000000", fill: "#000000" }} />
                  <span style={{ color: "#000000", fontWeight: 800 }}>Book (💎 {professional.price} Gems)</span>
                </>
              ) : (
                <>
                  <Zap size={13} className="text-black fill-black shrink-0" style={{ color: "#000000", fill: "#000000" }} />
                  <span style={{ color: "#000000", fontWeight: 800 }}>Trade Skill</span>
                </>
              )}
            </button>
            <Link
              href={`/professionals/${professional.id}`}
              style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
              className="bg-[#E4E4E7] hover:bg-zinc-300 text-black border border-[#E4E4E7] rounded-lg text-xs font-bold py-2 px-3 text-center justify-center col-span-1 transition-colors flex items-center shadow-sm"
            >
              <span style={{ color: "#000000", fontWeight: 800 }}>Profile</span>
            </Link>
          </div>
        </div>
      </article>
    </BorderGlow>
  );
}

export default function Professionals() {
  const [location] = useLocation();
  const querySkill = new URLSearchParams(window.location.search).get("skill") ?? "";
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("All skills");
  const [availability, setAvailability] = useState("Any availability");
  const [sort, setSort] = useState("Recommended");
  const [verified, setVerified] = useState(false);
  const [proposalPartner, setProposalPartner] = useState<Professional | null>(null);

  useEffect(() => {
    if (querySkill) {
      setSearch(querySkill);
      setSkill("All skills");
    }
  }, [location, querySkill]);

  const results = useMemo(
    () =>
      professionals
        .filter((professional) => {
          const haystack = [
            professional.name,
            professional.title,
            professional.primarySkill,
            ...professional.specializations,
            professional.location,
          ]
            .join(" ")
            .toLowerCase();
          return (
            (!search || haystack.includes(search.toLowerCase())) &&
            (skill === "All skills" || professional.primarySkill === skill) &&
            (!verified || professional.verified) &&
            (availability === "Any availability" || professional.availability === availability)
          );
        })
        .sort((a, b) =>
          sort === "Most Experienced"
            ? b.experience - a.experience
            : sort === "Lowest Points"
            ? a.price - b.price
            : sort === "Highest Points"
            ? b.price - a.price
            : a.name.localeCompare(b.name)
        ),
    [availability, search, skill, sort, verified]
  );

  const skillOptions = Array.from(new Set(professionals.map((item) => item.primarySkill)));
  const availabilityOptions = Array.from(new Set(professionals.map((item) => item.availability)));

  return (
    <div className="professionals-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title="Verified Peer Mentors & Teachers"
        description="Discover verified mentors, propose 1-on-1 skill barter swaps, and gain hands-on guidance across creative, technical, and language disciplines."
        canonicalPath="/professionals"
      />
      {/* Hero from Stitch */}
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="max-w-2xl">
          <p className="page-kicker">
            <UsersRound size={14} /> MENTOR DIRECTORY
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-3">
            Learn from people who know it.
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            Discover verified mentors, propose 1-on-1 skill barter swaps, and gain hands-on guidance across creative and technical disciplines.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 flex flex-col items-center text-center w-full sm:w-auto sm:min-w-[190px] shrink-0">
          <strong className="text-3xl font-bold text-zinc-100">{results.length}</strong>
          <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider mt-1">
            Mentors Available
          </span>
          <p className="text-xs text-zinc-400 mt-1">Direct 1:1 barter</p>
        </div>
      </section>

      {/* Filter bar */}
      <section className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 flex items-center gap-2.5 bg-black px-3.5 py-2 rounded-xl border border-white/20 focus-within:border-white/40 shadow-inner">
          <Search size={16} className="text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search mentors, skills, qualifications..."
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
            className="search-clean-input w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-sm text-zinc-100 focus:outline-none placeholder-zinc-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <SlidersHorizontal size={15} className="text-zinc-500 hidden md:block" />
          <select
            value={skill}
            onChange={(event) => setSkill(event.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none flex-1 min-w-[130px] min-h-[44px]"
          >
            <option value="All skills" className="bg-zinc-900 text-zinc-200">All Skills</option>
            {skillOptions.map((item) => (
              <option key={item} value={item} className="bg-zinc-900 text-zinc-200">
                {item}
              </option>
            ))}
          </select>

          <select
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none flex-1 min-w-[130px] min-h-[44px]"
          >
            <option value="Any availability" className="bg-zinc-900 text-zinc-200">Any Availability</option>
            {availabilityOptions.map((item) => (
              <option key={item} value={item} className="bg-zinc-900 text-zinc-200">
                {item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none flex-1 min-w-[130px] min-h-[44px]"
          >
            <option value="Recommended" className="bg-zinc-900 text-zinc-200">Recommended</option>
            <option value="Most Experienced" className="bg-zinc-900 text-zinc-200">Most Experienced</option>
            <option value="Lowest Points" className="bg-zinc-900 text-zinc-200">Lowest Points</option>
            <option value="Highest Points">Highest Points</option>
          </select>

          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/10 min-h-[44px]">
            <input
              type="checkbox"
              checked={verified}
              onChange={(event) => setVerified(event.target.checked)}
              className="rounded"
            />
            Verified Only
          </label>
        </div>
      </section>

      {/* Grid */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="page-kicker">FEATURED MENTORS</p>
            <h2 className="text-2xl font-bold text-white">
              {querySkill ? `Mentors for ${querySkill}` : "Expert Teachers"}
            </h2>
          </div>
          <span className="text-xs text-gray-400">{results.length} results</span>
        </div>

        {proposalPartner && (
          <SwapProposalModal
            partner={proposalPartner}
            isOpen={Boolean(proposalPartner)}
            onClose={() => setProposalPartner(null)}
          />
        )}

        {results.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((professional) => (
              <ProfessionalCard
                key={professional.id}
                professional={professional}
                onProposeSwap={(pro) => setProposalPartner(pro)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <UsersRound size={32} className="text-gray-500" />
            <h3 className="text-lg font-bold text-white">No mentors match those filters</h3>
            <p className="text-xs text-gray-400">Try clearing your filters or searching a different term.</p>
          </div>
        )}
      </section>
    </div>
  );
}
