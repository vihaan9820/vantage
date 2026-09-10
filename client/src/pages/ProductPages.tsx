import { ArrowRight, BadgeCheck, Bell, Bookmark, BookOpen, Calendar, Check, ChevronRight, CircleHelp, Clock, Compass, ExternalLink, Eye, Gem, GraduationCap, Heart, Inbox, Library, LockKeyhole, MapPin, MessageCircle, Mic, MicOff, Phone, Plus, RefreshCw, ScreenShare, ScreenShareOff, Search, Send, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Star, SwitchCamera, UsersRound, Video, VideoOff, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { type ExperienceLevel, useAccount } from "@/contexts/AccountContext";
import { calculateMatchScore, professionals, useSkillSwap, type BarterProposal, type Professional, type Session } from "@/contexts/SkillSwapContext";
import { animateStaggerEntrance, animateFloating, animateButtonTap } from "@/lib/animations";
import { initPageScrollReveal } from "@/lib/scrollReveal";
import { SwapProposalModal } from "@/components/SwapProposalModal";
import { PageSEO } from "@/components/PageSEO";
import { UserAvatar } from "@/components/UserAvatar";
import BorderGlow from "@/components/ui/BorderGlow";
import SpecularButton from "@/components/ui/SpecularButton";
import { useNativeMediaStream } from "@/hooks/useNativeMediaStream";
import { NativeCameraFeed } from "@/components/video/NativeCameraFeed";
import { QuickTeachModal } from "@/components/QuickTeachModal";
import { useTheme } from "@/contexts/ThemeContext";

export const skillTaxonomy = [
  { name: "Technology", skills: ["Web Development", "App Development", "Python", "Java", "JavaScript", "React", "AI", "Machine Learning", "Data Science", "Cybersecurity", "Cloud Computing", "Robotics", "Game Development", "UI Development", "Automation", "Prompt Engineering"] },
  { name: "Design", skills: ["UI/UX", "Graphic Design", "Logo Design", "Branding", "3D Design", "Motion Graphics", "Figma", "Photoshop", "Illustrator", "Product Design", "Architecture"] },
  { name: "Business", skills: ["Entrepreneurship", "Marketing", "Digital Marketing", "Sales", "Finance", "Investing Education", "Business Strategy", "Public Relations", "Negotiation", "Leadership"] },
  { name: "Creative", skills: ["Photography", "Videography", "Video Editing", "Filmmaking", "Animation", "Writing", "Storytelling", "Copywriting", "Poetry", "Illustration"] },
  { name: "Music", skills: ["Guitar", "Piano", "Keyboard", "Drums", "Singing", "Music Production", "DJing", "Songwriting", "Music Theory"] },
  { name: "Languages", skills: ["Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Punjabi", "Spanish", "French", "Japanese", "German"] },
  { name: "Academics", skills: ["Mathematics", "Physics", "Chemistry", "Biology", "Economics", "History", "Geography", "Programming", "Exam Preparation"] },
  { name: "Lifestyle", skills: ["Cooking", "Baking", "Fitness", "Yoga", "Meditation", "Gardening", "Public Speaking", "Communication", "Time Management"] },
  { name: "Sports", skills: ["Cricket", "Football", "Basketball", "Tennis", "Badminton", "Swimming", "Chess", "Athletics"] },
  { name: "Professional", skills: ["Interview Preparation", "Resume Building", "Career Planning", "Presentation Skills", "Leadership", "Communication", "Team Management"] },
];
export const allSkills = skillTaxonomy.flatMap((category) => category.skills.map((skill) => ({ skill, category: category.name })));
function slug(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function title(value: string) { return value.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" "); }
function useNavigation() { const [, navigate] = useLocation(); return navigate; }

function ProfessionalStrip({ limit = 3 }: { limit?: number }) {
  const navigate = useNavigation();
  return (
    <div className="mini-professional-grid">
      {professionals.slice(0, limit).map((professional) => (
        <article key={professional.id} className="mini-professional">
          <span style={{ background: professional.accent }}>{professional.avatar}</span>
          <div>
            <p>{professional.tier} · {professional.verified ? "Identity verified" : "Identity pending"}</p>
            <h3>{professional.name}</h3>
            <small>{professional.title}</small>
            <b>From {professional.price} pts</b>
          </div>
          <button onClick={() => navigate(`/professionals/${professional.id}`)} aria-label={`View ${professional.name}`}>
            <ArrowRight size={16} />
          </button>
        </article>
      ))}
    </div>
  );
}

export interface LiveSessionTarget {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  partnerAccent?: string;
  requestSkill: string;
  offerSkill?: string;
  format?: string;
  slot?: string;
  notes?: string;
  isBarter?: boolean;
}

/**
 * Interactive Live 1:1 Video Room with Screen Sharing
 */
function LiveVideoRoomModal({
  isOpen,
  onClose,
  proposal,
  sessionTarget,
}: {
  isOpen: boolean;
  onClose: () => void;
  proposal?: BarterProposal | null;
  sessionTarget?: LiveSessionTarget | null;
}) {
  const { completeBarterSwap, recordCall } = useSkillSwap();
  const target: LiveSessionTarget | null = proposal
    ? {
        id: proposal.id,
        partnerId: proposal.partnerId,
        partnerName: proposal.partnerName,
        partnerAvatar: proposal.partnerAvatar,
        partnerAccent: proposal.partnerAccent,
        requestSkill: proposal.requestSkill,
        offerSkill: proposal.offerSkill,
        format: proposal.format,
        slot: proposal.slot,
        notes: proposal.notes,
        isBarter: true,
      }
    : sessionTarget ?? null;

  const [notes, setNotes] = useState(target?.notes || "Whiteboard: 1. Core Architecture\n2. Live Feedback\n3. Next Steps");
  const [callStartTime] = useState(() => Date.now());

  // Native camera & microphone stream hook
  const media = useNativeMediaStream({
    autoStart: isOpen,
    video: true,
    audio: true,
  });

  if (!isOpen || !target) return null;

  const handleClose = () => {
    media.stop();
    const durationSeconds = Math.max(1, Math.floor((Date.now() - callStartTime) / 1000));
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    if (target.partnerId && recordCall) {
      recordCall(target.partnerId, "video", durationSeconds);
    }
    toast.info(`Call session ended · Duration: ${durStr} recorded.`);
    onClose();
  };

  const handleFinish = () => {
    media.stop();
    if (target.isBarter && completeBarterSwap) {
      completeBarterSwap(target.id);
    }
    const durationSeconds = Math.max(1, Math.floor((Date.now() - callStartTime) / 1000));
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const durStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    if (target.partnerId && recordCall) {
      recordCall(target.partnerId, "video", durationSeconds);
    }
    toast.success(`🎉 Swap session with ${target.partnerName} completed & endorsed! Duration: ${durStr} recorded.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-4xl glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl border border-white/20 overflow-hidden flex flex-col gap-4 sm:gap-6 max-h-[96vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Live 1:1 Room: {target.partnerName}
              </h2>
              <p className="text-xs text-gray-400">
                {target.offerSkill ? (
                  <>Trading <span className="text-white font-semibold">{target.requestSkill}</span> ⇄ <span className="text-white font-semibold">{target.offerSkill}</span></>
                ) : (
                  <>Topic: <span className="text-white font-semibold">{target.requestSkill}</span></>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Room
            </span>
            <button onClick={handleClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer" aria-label="Close barter call">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Screen Share Stage (when active) */}
        {media.isScreenSharing && media.screenStream && (
          <div className="relative rounded-2xl bg-black border border-blue-500/40 overflow-hidden shadow-2xl p-2 flex flex-col items-center">
            <div className="w-full flex justify-between items-center px-2 py-1 mb-1 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <ScreenShare size={14} /> Screen Share Active · High Definition
              </span>
              <button
                onClick={media.stopScreenShare}
                className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/40 cursor-pointer"
              >
                Stop Sharing
              </button>
            </div>
            <NativeCameraFeed
              stream={media.screenStream}
              status="active"
              videoEnabled={true}
              audioEnabled={false}
              isScreenShare={true}
              allowFullscreen={true}
              onStopScreenShare={media.stopScreenShare}
              userName="Your Screen"
              className="w-full aspect-video max-h-[360px]"
            />
          </div>
        )}

        {media.screenShareError && (
          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
            ⚠️ {media.screenShareError}
          </div>
        )}

        {/* Video Stage: Partner Feed + Native Camera Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Partner Feed */}
          <div className="relative aspect-video rounded-2xl bg-[#141416] border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-inner">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl mb-2"
              style={{ background: target.partnerAccent || "#27272a" }}
            >
              {target.partnerAvatar || "SS"}
            </div>
            <span className="text-sm font-bold text-white">{target.partnerName} (Speaking)</span>
            <span className="text-[11px] text-gray-400 mt-0.5">{target.requestSkill}</span>
            <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] text-white backdrop-blur flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              {target.partnerName} · 1080p HD
            </div>
          </div>

          {/* Native Self Camera Feed */}
          <NativeCameraFeed
            stream={media.stream}
            status={media.status}
            errorMessage={media.errorMessage}
            videoEnabled={media.videoEnabled}
            audioEnabled={media.audioEnabled}
            audioLevel={media.audioLevel}
            hasMultipleCameras={media.hasMultipleCameras}
            userName="You"
            onToggleVideo={media.toggleVideo}
            onToggleAudio={media.toggleAudio}
            onSwitchCamera={media.switchCamera}
            onRetry={media.retry}
          />
        </div>

        {/* Collaborative Whiteboard & Notes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-white" /> Shared Barter Session Notes & Code Snippets:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-none focus:border-white/40"
          />
        </div>

        {/* Video Room Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <button
              onClick={media.toggleAudio}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                media.audioEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-red-500/20 border-red-500 text-red-400"
              }`}
              title={media.audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
            >
              {media.audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              onClick={media.toggleVideo}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                media.videoEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-red-500/20 border-red-500 text-red-400"
              }`}
              title={media.videoEnabled ? "Turn Camera Off" : "Turn Camera On"}
            >
              {media.videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
            {/* Screen Share Button */}
            <button
              onClick={media.toggleScreenShare}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                media.isScreenSharing
                  ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
              title={media.isScreenSharing ? "Stop Screen Sharing" : "Share Your Screen"}
            >
              {media.isScreenSharing ? <ScreenShareOff size={16} /> : <ScreenShare size={16} />}
              <span className="text-xs font-semibold hidden sm:inline">
                {media.isScreenSharing ? "Stop Share" : "Share Screen"}
              </span>
            </button>
            {media.hasMultipleCameras && (
              <button
                onClick={media.switchCamera}
                className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                title="Switch Camera (Flip)"
              >
                <SwitchCamera size={16} />
              </button>
            )}
            <button
              onClick={media.retry}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
              title="Refresh / Reconnect Camera"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              className="secondary-action text-xs px-4 py-2.5 cursor-pointer flex-1 sm:flex-initial"
            >
              Leave Room
            </button>
            <button
              onClick={handleFinish}
              className="primary-action text-xs px-5 sm:px-6 py-2.5 font-bold shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer flex-1 sm:flex-initial"
            >
              <Check size={15} className="shrink-0" />
              <span>Complete & Endorse</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Proof Portfolio Modal
 */
function ProofPortfolioModal({
  partner,
  isOpen,
  onClose,
  onProposeSwap,
}: {
  partner: Professional | null;
  isOpen: boolean;
  onClose: () => void;
  onProposeSwap: () => void;
}) {
  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-white/15 overflow-hidden flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg"
              style={{ background: partner.accent }}
            >
              {partner.avatar}
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">{partner.name}</h2>
              <p className="text-xs text-gray-400">{partner.title} · {partner.timezone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Verified Proof & Work Samples
          </h3>
          {(partner.portfolioProof || [
            { title: `${partner.primarySkill} Case Study & Architecture`, link: "https://portfolio.lens", metric: "300+ Verified Hours" }
          ]).map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 flex justify-between items-center group transition-all"
            >
              <div>
                <strong className="text-xs font-bold text-white block group-hover:text-zinc-300 transition-colors">
                  {item.title}
                </strong>
                <span className="text-[11px] text-white font-semibold">{item.metric}</span>
              </div>
              <ExternalLink size={15} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>
          ))}
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex justify-between items-center text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase">Community Karma</span>
            <strong className="text-white font-bold">{partner.karmaLevel} (⭐ {partner.rating})</strong>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase">Swaps Completed</span>
            <strong className="text-white font-bold">{partner.swapsCompleted} Successful Trades</strong>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-white/10">
          <button onClick={onClose} className="secondary-action text-xs px-4 py-2.5">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onProposeSwap();
            }}
            className="primary-action trade-skill-btn propose-swap-btn text-xs px-5 py-2.5 font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap size={14} className="shrink-0" />
            <span>Trade Skill with {partner.name.split(" ")[0]}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [, navigate] = useLocation();
  const { account } = useAccount();
  const { state, toggleSave } = useSkillSwap();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const name = account?.name?.split(" ")[0] ?? "there";

  const dashboardRef = useRef<HTMLDivElement>(null);

  // 2-Way Matchmaker Widget State — initialize matches eagerly so the grid is never empty
  const [learnGoal, setLearnGoal] = useState("UI/UX Design");
  const [offerSkill, setOfferSkill] = useState("Next.js");
  const [matchHasRun, setMatchHasRun] = useState(false);

  // Derive matched partners in render from current goal state (always live, no stale empty state)
  const scoredPartners = useMemo(() => {
    const scored = professionals.map((p) => ({
      partner: p,
      score: calculateMatchScore(learnGoal, offerSkill, p),
    }));
    return scored.sort((a, b) => b.score - a.score);
  }, [learnGoal, offerSkill]);
  const matchedPartners = scoredPartners.map((s) => s.partner);
  const topMatch = scoredPartners[0];
  const topPartner = topMatch?.partner || professionals[0];
  const topScore = topMatch?.score ?? 91;

  // Modals state
  const [selectedProposalPartner, setSelectedProposalPartner] = useState<Professional | null>(null);
  const [proofPartner, setProofPartner] = useState<Professional | null>(null);
  const [activeVideoProposal, setActiveVideoProposal] = useState<BarterProposal | null>(null);
  const [quickTeachOpen, setQuickTeachOpen] = useState(false);

  useEffect(() => {
    if (dashboardRef.current) {
      return initPageScrollReveal({ root: dashboardRef.current });
    }
  }, []);

  const handleRunMatchmaker = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMatchHasRun(true);
    const bestScore = scoredPartners[0]?.score ?? 72;
    const topMatch = scoredPartners[0]?.partner.name ?? "a partner";
    toast.success(
      `Found ${scoredPartners.length} compatible barter partners! Top match: ${topMatch} (${bestScore}% compatibility)`,
      { duration: 4000 }
    );
  };

  const handleSwapSkills = () => {
    const temp = learnGoal;
    setLearnGoal(offerSkill);
    setOfferSkill(temp);
    toast.success(`Swapped barter roles: Learning "${offerSkill}" ⇄ Offering "${learnGoal}"`);
  };

  const activeProposals = state.barterProposals || [];
  const scheduledSessions = activeProposals.filter((p) => p.status === "Session Scheduled");
  const acceptedProposals = activeProposals.filter((p) => p.status === "Accepted");
  const proposedProposals = activeProposals.filter((p) => p.status === "Proposed");
  const completedProposals = activeProposals.filter((p) => p.status === "Completed");

  return (
    <div ref={dashboardRef} className="dashboard-page max-w-[1280px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-8 relative">
      <PageSEO
        title="Peer-to-Peer Knowledge Barter Platform"
        description="Trade skills 1-on-1 with verified creators and engineers without money. Interactive compatibility matching, TimeBank escrow, and live video rooms."
        canonicalPath="/dashboard"
      />
      {/* Modals */}
      {selectedProposalPartner && (
        <SwapProposalModal
          partner={selectedProposalPartner}
          isOpen={Boolean(selectedProposalPartner)}
          onClose={() => setSelectedProposalPartner(null)}
          initialRequestSkill={learnGoal}
          initialOfferSkill={offerSkill}
        />
      )}

      {proofPartner && (
        <ProofPortfolioModal
          partner={proofPartner}
          isOpen={Boolean(proofPartner)}
          onClose={() => setProofPartner(null)}
          onProposeSwap={() => setSelectedProposalPartner(proofPartner)}
        />
      )}

      {activeVideoProposal && (
        <LiveVideoRoomModal
          proposal={activeVideoProposal}
          isOpen={Boolean(activeVideoProposal)}
          onClose={() => setActiveVideoProposal(null)}
        />
      )}

      <QuickTeachModal isOpen={quickTeachOpen} onClose={() => setQuickTeachOpen(false)} />

      {/* 1. Minimalist Hero & Interactive 2-Way Matchmaker Widget with Top Barter Match Spotlight */}
      <section className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-visible grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch border-2 border-white/40 border-t-4 border-t-white bg-black/85 shadow-[0_0_50px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.4)]">
        {/* Left Column: Matchmaker & Headline */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white bg-white/20 px-3.5 py-1.5 rounded-full border border-white/50 inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                <Zap size={13} className="text-white fill-white" /> Peer-to-Peer Knowledge Trade
              </span>
              <button
                type="button"
                onClick={() => setQuickTeachOpen(true)}
                className="text-xs font-extrabold px-3 py-1.5 rounded-xl border border-white bg-white text-black hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer"
                title="List a skill you can teach to earn barter credits"
              >
                <GraduationCap size={14} />
                <span>+ Offer to Teach a Skill</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Trade your skills, master anything.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-normal">
              Zero money involved. Connect 1-on-1 with verified creators and engineers. Teach Next.js for 3D Blender modeling, or trade conversational Italian for Python backend.
            </p>
          </div>

          {/* 2-Way Interactive Matchmaker Widget */}
          <form onSubmit={handleRunMatchmaker} className="bg-white/[0.06] border-2 border-white/40 rounded-2xl p-5 flex flex-col gap-3.5 shadow-[0_0_30px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.3)]">
            {/* Live Compatibility Meter Header */}
            <div className="flex items-center justify-between px-0.5 text-xs border-b border-white/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                <span className="text-white font-bold text-xs uppercase tracking-wider">
                  Live Mutual Compatibility:
                </span>
                <span className="text-black font-mono text-xs font-black px-2.5 py-1 rounded-md bg-white border border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                  {topScore}% Match
                </span>
              </div>
              <span className="text-zinc-300 text-xs hidden sm:inline font-medium">
                Top match: <strong className="text-white font-bold">{topPartner.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
              {/* Left Input: Learn */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} className="text-white" /> I want to learn...
                </label>
                <input
                  type="text"
                  value={learnGoal}
                  onChange={(e) => setLearnGoal(e.target.value.slice(0, 80))}
                  maxLength={80}
                  placeholder="e.g. UI/UX Design, Italian, Python"
                  className="w-full bg-white/10 border-2 border-white/45 focus:border-white focus:bg-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all font-semibold"
                />
              </div>

              {/* Center Swap Button */}
              <button
                type="button"
                onClick={handleSwapSkills}
                title="Swap Learn & Offer roles"
                className="self-center sm:self-end my-1 sm:my-0 mb-0.5 p-3 rounded-xl bg-white/10 hover:bg-white hover:text-black border-2 border-white/45 text-white transition-all flex items-center justify-center font-black text-base shadow-sm cursor-pointer"
              >
                <span>⇄</span>
              </button>

              {/* Right Input: Offer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-white" /> I can offer...
                </label>
                <input
                  type="text"
                  value={offerSkill}
                  onChange={(e) => setOfferSkill(e.target.value.slice(0, 80))}
                  maxLength={80}
                  placeholder="e.g. Next.js, Copywriting, Guitar"
                  className="w-full bg-white/10 border-2 border-white/45 focus:border-white focus:bg-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/60 focus:outline-none focus:shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all font-semibold"
                />
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-zinc-300 font-bold">Popular:</span>
              {[
                { label: "UI/UX ⇄ Next.js", learn: "UI/UX Design", offer: "Next.js" },
                { label: "Python ⇄ Japanese", learn: "Python & AI", offer: "Japanese" },
                { label: "3D Blender ⇄ React", learn: "3D Blender", offer: "React" },
                { label: "Guitar ⇄ Marketing", learn: "Guitar & Mixing", offer: "Digital Marketing" },
              ].map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => {
                    setLearnGoal(preset.learn);
                    setOfferSkill(preset.offer);
                  }}
                  className="popular-chip px-3 py-1.5 rounded-lg border font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="primary-action find-matches-btn w-full mt-1 justify-center font-black text-sm py-3.5 rounded-xl cursor-pointer border flex items-center gap-2 transition-all shadow-md"
            >
              <Zap size={18} className="shrink-0" />
              <span>
                Find Instant Matches — {scoredPartners.length} Partners Found
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: Top Mutual Barter Match Spotlight (Fills the space seamlessly with zero clutter) */}
        <div className="lg:col-span-5 flex flex-col w-full relative z-10 h-full">
          <BorderGlow
            borderRadius={20}
            glowColor={isLight ? "#000000" : "#ffffff"}
            backgroundColor={isLight ? "#ffffff" : "rgba(8, 14, 26, 0.65)"}
            glowRadius={60}
            glowIntensity={0.8}
            colors={isLight ? ["#000000", "#000000", "#000000"] : ["#ffffff", "#ffffff", "#ffffff"]}
            className="w-full h-full rounded-2xl flex flex-col justify-between"
          >
            <div className="p-5 md:p-6 flex flex-col justify-between h-full gap-4 rounded-[18px]">
              {/* Header: Live Badge + Compatibility Score */}
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  Top Mutual Match
                </span>
                <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-md border ${isLight ? "bg-black text-white border-black shadow-[0_2px_8px_rgba(0,0,0,0.25)]" : "text-black bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"}`}>
                  {topScore}% Compatible
                </span>
              </div>

              {/* Partner Identity Row */}
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-lg border border-white/30"
                  style={{ background: topPartner.accent }}
                >
                  {topPartner.avatar}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-white truncate">{topPartner.name}</h3>
                    <BadgeCheck size={16} className="text-white shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-300 truncate mt-0.5">{topPartner.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1">
                    <span className="flex items-center gap-0.5 text-white font-semibold">
                      <Star size={11} className="text-white fill-white" /> {topPartner.rating}
                    </span>
                    <span>·</span>
                    <span>{topPartner.swapsCompleted} swaps</span>
                    <span>·</span>
                    <span className="truncate">{topPartner.location}</span>
                  </div>
                </div>
              </div>

              {/* 2-Way Knowledge Exchange Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/20">
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-black/60 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <Compass size={11} className="text-white" /> They Teach You
                  </span>
                  <strong className="text-xs font-bold text-white truncate">
                    {learnGoal || topPartner.primarySkill}
                  </strong>
                </div>

                <div className="flex flex-col gap-1 p-2 rounded-lg bg-black/60 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <GraduationCap size={11} className="text-white" /> You Teach Them
                  </span>
                  <strong className="text-xs font-bold text-white truncate">
                    {offerSkill || "Next.js & Frontend"}
                  </strong>
                </div>
              </div>

              {/* Barter Meta Details */}
              <div className="flex justify-between items-center text-xs text-zinc-300 pt-1 px-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-white" />
                  <span>{topPartner.slots?.[0] || "Tomorrow · 6:00 PM"}</span>
                </span>
                <span className="text-[11px] font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  1:1 Video Room
                </span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/15">
                <button
                  onClick={() => setSelectedProposalPartner(topPartner)}
                  className="primary-action trade-skill-btn propose-swap-btn rounded-xl text-xs font-black py-2.5 px-3 text-center justify-center col-span-2 flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
                >
                  <Zap size={14} className="shrink-0" />
                  <span>Trade Skill</span>
                </button>
                <button
                  onClick={() => setProofPartner(topPartner)}
                  className="proof-btn secondary-action rounded-xl text-xs font-bold py-2.5 px-3 text-center justify-center col-span-1 shadow-sm transition-all cursor-pointer"
                  title="View Proof Portfolio"
                >
                  <span>Proof</span>
                </button>
              </div>

              {/* Trust Metric Footer */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>Zero-fee barter escrow</span>
                <span>·</span>
                <span>Identity verified</span>
              </div>
            </div>
          </BorderGlow>
        </div>
      </section>

      {/* 2. Active Swap Hub Pipeline & Upcoming Live Session */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="page-kicker">EXCHANGE PIPELINE</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Active Swap Hub</h2>
          </div>
          <div className="flex gap-2">
            <span className="text-xs text-zinc-400 font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              {activeProposals.length} Total Trades in Pipeline
            </span>
          </div>
        </div>

        {/* 4-Stage Status Pipeline Visualization */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "1. Proposed", count: proposedProposals.length, desc: "Terms under review" },
            { label: "2. Accepted", count: acceptedProposals.length, desc: "Ready to schedule" },
            { label: "3. Scheduled", count: scheduledSessions.length, desc: "Live room ready" },
            { label: "4. Completed", count: completedProposals.length, desc: "Credits released" },
          ].map((stage) => (
            <div key={stage.label} className="glass-panel p-4.5 rounded-xl flex flex-col gap-1.5 border border-white/20 border-t-2 border-t-white/80 bg-black/55 backdrop-blur-xl bg-gradient-to-b from-white/[0.08] to-transparent hover:border-white/40 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)]">
              <span className="text-xs font-black text-white uppercase tracking-wider">{stage.label}</span>
              <strong className="text-2xl font-black text-white font-mono">{stage.count}</strong>
              <small className="text-[11px] text-zinc-300 font-medium">{stage.desc}</small>
            </div>
          ))}
        </div>

        {/* Live Upcoming Session Countdown Card */}
        {scheduledSessions.length > 0 ? (
          <div className="glass-panel p-6 rounded-2xl border border-white/25 border-t-2 border-t-white/80 bg-black/55 backdrop-blur-xl bg-gradient-to-b from-white/[0.08] to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 rounded-xl bg-white text-black border border-white flex items-center justify-center font-bold shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                <Video size={22} className="text-black" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Upcoming 1:1 Live Session
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-bold text-white mt-0.5">
                  {scheduledSessions[0].partnerName} · {scheduledSessions[0].format}
                </h3>
                <p className="text-xs text-zinc-300 mt-1">
                  Trading <b className="text-white font-bold">{scheduledSessions[0].requestSkill}</b> in exchange for <b className="text-white font-bold">{scheduledSessions[0].offerSkill}</b>.
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-300 mt-2">
                  <Calendar size={13} className="text-white" />
                  <span>{scheduledSessions[0].scheduledTime || "Today · 7:00 PM EST"}</span>
                  <span>·</span>
                  <span className="text-white font-bold">Starts in: 02h 45m</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => setActiveVideoProposal(scheduledSessions[0])}
                className="primary-action text-xs py-3 px-6 font-black flex items-center justify-center gap-2 rounded-xl transition-all w-full md:w-auto shadow-md cursor-pointer border"
              >
                <Video size={16} className="shrink-0" />
                <span>Join Video Room</span>
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 3. Matched Peer Partners (Bento Grid) */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="page-kicker">INSTANT MATCHES</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Compatible Barter Partners ({scoredPartners.length})
            </h2>
          </div>
          <button
            className="secondary-action text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer shadow-sm transition-all"
            onClick={() => navigate("/discover")}
          >
            <span>View All in Marketplace</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scoredPartners.slice(0, 3).map(({ partner: pro, score }) => {
            const saved = state.savedIds.includes(pro.id);

            return (
              <BorderGlow
                key={pro.id}
                edgeSensitivity={20}
                glowColor="#ffffff"
                backgroundColor="rgba(8, 14, 26, 0.65)"
                borderRadius={18}
                glowRadius={50}
                glowIntensity={0.8}
                coneSpread={34}
                animated={false}
                colors={["#ffffff", "#ffffff", "#ffffff"]}
                className="h-full rounded-2xl"
              >
                <div className="glass-panel relative flex flex-col justify-between rounded-2xl p-5 transition-all duration-200 group h-full border-0 bg-transparent">
                  <div>
                    {/* Top Row: User Avatar, Name, Verified, Match Badge */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={pro.avatar} name={pro.name} size="md" rounded="full" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
                              {pro.name}
                            </h3>
                            {pro.verified && <BadgeCheck size={15} className="text-white shrink-0" />}
                          </div>
                          <span className="text-xs text-zinc-300 block font-medium">{pro.timezone} · {pro.location}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center text-xs font-black text-black bg-white border border-white px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                        {score}% Match
                      </span>
                    </div>

                    {/* Teaching Skills */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Teaches
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pro.teachingSkills.map((t) => (
                          <span
                            key={t.skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/15 text-white border border-white/35 text-xs font-semibold"
                          >
                            <span>{t.skill}</span>
                            <span className="text-[10px] text-zinc-300 font-medium capitalize">
                              · {t.level}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Seeking Wishlist */}
                    <div className="mt-3 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Seeking
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pro.seekingSkills.map((s) => (
                          <span
                            key={s.skill}
                            className="px-2.5 py-1 rounded-md bg-white/5 border border-white/25 text-zinc-200 text-xs font-medium"
                          >
                            {s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Rating, Swaps Count, & Quick Actions */}
                  <div className="pt-3 mt-4 border-t border-white/20">
                    <div className="flex justify-between items-center pb-3 text-xs">
                      <span className="flex items-center gap-1 font-bold text-white">
                        <Star size={13} className="text-white fill-white" /> {pro.rating}
                        <span className="text-zinc-300 font-normal">({pro.swapsCompleted} swaps)</span>
                      </span>
                      <span className="text-white text-xs font-semibold bg-white/10 px-2 py-0.5 rounded border border-white/20">{pro.karmaLevel}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedProposalPartner(pro)}
                        className="primary-action trade-skill-btn propose-swap-btn rounded-xl text-xs font-black py-2.5 px-3 text-center justify-center col-span-2 flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
                      >
                        <Zap size={14} className="shrink-0" />
                        <span>Trade Skill</span>
                      </button>
                      <button
                        onClick={() => setProofPartner(pro)}
                        className="proof-btn secondary-action rounded-xl text-xs font-bold py-2.5 px-3 text-center justify-center col-span-1 shadow-sm transition-all cursor-pointer"
                        title="View Proof Portfolio"
                      >
                        <span>Proof</span>
                      </button>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function Discover() {
  const navigate = useNavigation();
  const { state, toggleSave } = useSkillSwap();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [formatFilter, setFormatFilter] = useState("All");
  const [selectedProposalPartner, setSelectedProposalPartner] = useState<Professional | null>(null);
  const [proofPartner, setProofPartner] = useState<Professional | null>(null);
  const discoverRef = useRef<HTMLDivElement>(null);

  // Filter peers by category, search query, availability, and format
  const filteredPeers = useMemo(() => {
    return professionals.filter((pro) => {
      const matchesCategory =
        category === "All" ||
        pro.teachingSkills.some((t) => t.category.toLowerCase() === category.toLowerCase()) ||
        pro.seekingSkills.some((s) => s.category.toLowerCase() === category.toLowerCase());

      const matchesQuery =
        !query.trim() ||
        `${pro.name} ${pro.title} ${pro.primarySkill} ${pro.location} ${pro.teachingSkills.map((t) => t.skill).join(" ")} ${pro.seekingSkills.map((s) => s.skill).join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesAvailability =
        availabilityFilter === "All" ||
        pro.availability.toLowerCase().includes(availabilityFilter.toLowerCase());

      return matchesCategory && matchesQuery && matchesAvailability;
    });
  }, [category, query, availabilityFilter]);

  useEffect(() => {
    if (discoverRef.current) {
      return initPageScrollReveal({ root: discoverRef.current });
    }
  }, [category, query, availabilityFilter]);

  return (
    <div ref={discoverRef} className="discover-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 relative">
      {/* Ambient background glow orbs */}
      <div className="glow-orb-mono w-96 h-96 -top-20 -left-20 opacity-12 pointer-events-none" />
      <div className="glow-orb-mono w-96 h-96 top-60 -right-20 opacity-8 pointer-events-none" />

      <PageSEO
        title="Discover Skills & Peer Mentors"
        description="Explore verified creators and engineers ready for 1-on-1 skill trades. Filter by technology, design, music, languages, and availability."
        canonicalPath="/discover"
      />
      {/* Proposal & Proof Modals */}
      {selectedProposalPartner && (
        <SwapProposalModal
          partner={selectedProposalPartner}
          isOpen={Boolean(selectedProposalPartner)}
          onClose={() => setSelectedProposalPartner(null)}
        />
      )}

      {proofPartner && (
        <ProofPortfolioModal
          partner={proofPartner}
          isOpen={Boolean(proofPartner)}
          onClose={() => setProofPartner(null)}
          onProposeSwap={() => setSelectedProposalPartner(proofPartner)}
        />
      )}

      {/* Hero Search Section */}
      <section className="max-w-3xl flex flex-col gap-4 relative z-10">
        <div>
          <p className="page-kicker">BARTER MARKETPLACE</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
            Explore 1:1 Skill Swaps
          </h1>
          <p className="text-sm md:text-base text-zinc-600 dark:text-gray-400 leading-relaxed">
            Browse verified peers ready to trade knowledge. Zero money involved — exchange your skills for design, coding, languages, and more.
          </p>
        </div>

        <div className="relative rounded-2xl p-2 flex items-center bg-black border border-white/20 focus-within:border-white/40 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Search className="ml-2.5 text-zinc-400 shrink-0" size={18} />
          <input
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
            className="search-clean-input w-full bg-transparent border-0 border-none outline-none ring-0 shadow-none text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 focus:border-none px-3 py-1.5"
            placeholder="Search skills, teachers, professionals, courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-zinc-400 hover:text-white mr-1.5 cursor-pointer">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Filter Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 text-xs">
          <span className="text-zinc-400 font-semibold mr-1 shrink-0">Category:</span>
          {["All", "Technology", "Design", "Creative", "Music", "Languages", "Business", "Professional"].map((cat) => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 font-medium cursor-pointer ${
                category === cat
                  ? "bg-[#E4E4E7] text-black font-bold shadow-sm border border-[#E4E4E7]"
                  : "backdrop-blur-md bg-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.12] border border-white/[0.12] shadow-sm"
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Availability Filter */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto hide-scrollbar pb-1">
          <span className="text-zinc-400 font-semibold mr-1 shrink-0">Availability:</span>
          {["All", "Available today", "Available tomorrow", "This week"].map((avail) => (
            <button
              key={avail}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors font-medium cursor-pointer shrink-0 min-h-[36px] flex items-center ${
                availabilityFilter === avail
                  ? "bg-[#E4E4E7] text-black font-bold border border-[#E4E4E7] shadow-sm"
                  : "backdrop-blur-md bg-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.12] border border-white/[0.12] shadow-sm"
              }`}
              onClick={() => setAvailabilityFilter(avail)}
            >
              {avail}
            </button>
          ))}
        </div>
      </section>

      {/* Bento Grid Marketplace Cards */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            Available Swap Partners ({filteredPeers.length})
          </h2>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">100% Barter · Zero Platform Fees</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeers.map((pro) => {
            const saved = state.savedIds.includes(pro.id);

            return (
              <BorderGlow
                key={pro.id}
                edgeSensitivity={20}
                glowColor="#ffffff"
                backgroundColor="rgba(8, 14, 26, 0.65)"
                borderRadius={20}
                glowRadius={50}
                glowIntensity={0.8}
                coneSpread={34}
                animated={false}
                colors={["#ffffff", "#ffffff", "#ffffff"]}
                className="h-full rounded-2xl"
              >
                <div
                  className="anime-skill-card relative flex flex-col justify-between h-full p-5 group border-0 bg-transparent"
                >
                  <div>
                    {/* Top Bar: Avatar, Verified, Timezone, Bookmark */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={pro.avatar} name={pro.name} size="md" rounded="full" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                              {pro.name}
                            </h3>
                            {pro.verified && <BadgeCheck size={14} className="text-zinc-300 shrink-0" />}
                          </div>
                          <span className="text-xs text-zinc-400 block font-normal">{pro.timezone} · {pro.location}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleSave(pro.id)}
                        className={`p-2 rounded-lg border transition-colors ${
                          saved
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
                        }`}
                        aria-label="Save partner"
                      >
                        <Heart size={14} fill={saved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Teaching Badges with Subtle Level */}
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Teaches
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pro.teachingSkills.map((t) => (
                          <span
                            key={t.skill}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] text-zinc-200 border border-white/[0.08] text-xs font-medium"
                          >
                            <span>{t.skill}</span>
                            <span className="text-[10px] text-zinc-400 font-normal capitalize">
                              · {t.level}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Seeking Wishlist */}
                    <div className="mt-3 flex flex-col gap-1.5">
                      <span className="text-[11px] font-medium text-zinc-400">
                        Seeking
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pro.seekingSkills.map((s) => (
                          <span
                            key={s.skill}
                            className="px-2 py-0.5 rounded-md bg-transparent border border-white/[0.06] text-zinc-400 text-xs font-normal"
                          >
                            {s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Rating, Swaps, CTAs */}
                  <div className="pt-3 mt-4 border-t border-white/[0.06]">
                    <div className="flex justify-between items-center pb-3 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-zinc-200">
                        <Star size={12} className="text-zinc-300 fill-zinc-300" /> {pro.rating}
                        <span className="text-zinc-400 font-normal">({pro.swapsCompleted} swaps)</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                        {pro.availability}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setSelectedProposalPartner(pro)}
                        className="primary-action trade-skill-btn propose-swap-btn rounded-lg text-xs font-bold py-2 px-3 text-center justify-center col-span-2 flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
                      >
                        <Zap size={13} className="shrink-0" />
                        <span>Trade Skill</span>
                      </button>
                      <button
                        onClick={() => setProofPartner(pro)}
                        className="proof-btn secondary-action rounded-lg text-xs font-bold py-2 px-3 text-center justify-center col-span-1 shadow-sm transition-all cursor-pointer"
                        title="View Proof Portfolio"
                      >
                        <span>Proof</span>
                      </button>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            );
          })}
        </div>
      </section>

      {/* Skill Pathways Catalog */}
      <section className="flex flex-col gap-6 pt-6 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div>
            <p className="page-kicker">CURATED SKILL PATHS</p>
            <h2 className="text-xl font-bold text-white">All Exchange Categories & Paths</h2>
          </div>
          <span className="text-xs text-gray-400">
            {allSkills.filter((s) => category === "All" || s.category.toLowerCase() === category.toLowerCase()).length} Paths Listed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allSkills
            .filter((item) =>
              (category === "All" || item.category.toLowerCase() === category.toLowerCase()) &&
              `${item.skill} ${item.category}`.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 16)
            .map((item) => (
              <button
                key={item.skill}
                onClick={() => navigate(`/skills/${slug(item.skill)}`)}
                className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.14] text-left flex justify-between items-center transition-all group"
              >
                <div>
                  <span className="text-[10px] text-zinc-400 block font-normal mb-0.5">
                    {item.category}
                  </span>
                  <strong className="text-xs font-medium text-zinc-200 block group-hover:text-white transition-colors">
                    {item.skill}
                  </strong>
                </div>
                <ArrowRight size={13} className="text-zinc-500 group-hover:text-zinc-200 transition-colors" />
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}


export function SearchResults() {
  const navigate = useNavigation(); const query = new URLSearchParams(window.location.search).get("q") ?? ""; const [term, setTerm] = useState(query); const [tab, setTab] = useState("All"); const search = term.toLowerCase().trim(); const skills = allSkills.filter((item) => `${item.skill} ${item.category}`.toLowerCase().includes(search)); const pros = professionals.filter((item) => `${item.name} ${item.title} ${item.primarySkill} ${item.location} ${item.specializations.join(" ")}`.toLowerCase().includes(search)); const go = (event: React.FormEvent) => { event.preventDefault(); navigate(`/search?q=${encodeURIComponent(term)}`); };
  const tabs = ["All", "Skills", "Professionals", "Teachers", "People", "Community", "Sessions"];
  return <div className="search-page"><section className="page-hero"><p className="page-kicker">GLOBAL SEARCH</p><h1>Find the next useful <em>connection.</em></h1><form className="discover-search bg-black border border-white/20 rounded-2xl" onSubmit={go}><Search size={19} /><input style={{ border: "0 none transparent", borderWidth: 0, borderStyle: "none", outline: "none", boxShadow: "none", background: "transparent", backgroundColor: "transparent", WebkitAppearance: "none" }} className="search-clean-input border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search skills, teachers, professionals, courses..." autoFocus /><button className="bg-[#E4E4E7] text-black font-bold">Search</button></form></section><div className="search-tabs">{tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div><section className="search-results"><div className="section-heading"><div><p className="page-kicker">RESULTS</p><h2>{search ? `Results for “${term}”` : "Start with a search"}</h2></div><span>{skills.length + pros.length} relevant paths</span></div>{(!search || (!skills.length && !pros.length)) ? <div className="empty-state"><Search size={24} /><h3>{search ? "No direct matches yet" : "Search across SkillSwap"}</h3><p>Search a skill, category, specialization, qualification term, professional name, or location.</p><button className="primary-action" onClick={() => navigate("/discover")}>Browse skill catalog</button></div> : <div className="result-grid">{(tab === "All" || tab === "Skills") && skills.map((item) => <button key={item.skill} className="search-result-card" onClick={() => navigate(`/skills/${slug(item.skill)}`)}><span>SKILL · {item.category}</span><strong>{item.skill}</strong><p>Explore relevant sessions, professionals, pathways, and community prompts.</p><ArrowRight size={16} /></button>)}{(tab === "All" || tab === "Professionals" || tab === "Teachers" || tab === "People") && pros.map((professional) => <button key={professional.id} className="search-result-card pro-result" onClick={() => navigate(`/professionals/${professional.id}`)}><span>{professional.verified ? "IDENTITY VERIFIED" : "IDENTITY PENDING"}</span><strong>{professional.name}</strong><p>{professional.title} · {professional.location} · {professional.experience}+ years listed practice</p><ArrowRight size={16} /></button>)}</div>}</section></div>;
}

export function SkillDetail() {
  const navigate = useNavigation(); const [, params] = useRoute("/skills/:slug"); const skill = allSkills.find((item) => slug(item.skill) === params?.slug); const label = skill?.skill ?? title(params?.slug ?? "Skill"); const category = skill?.category ?? "Skill"; const relevant = professionals.filter((professional) => `${professional.primarySkill} ${professional.specializations.join(" ")}`.toLowerCase().includes(label.toLowerCase())).slice(0, 3); const [saved, setSaved] = useState(false);
  return <div className="skill-detail-page"><section className={`page-hero skill-hero ${slug(category)}`}><p className="page-kicker">{category.toUpperCase()} · SKILL PATH</p><h1>{label}</h1><p>Build from a practical first step toward more capable independent work. This path stays flexible as your goals change.</p><div className="skill-object" aria-hidden="true"><span>{category === "Technology" ? "⌘" : category === "Music" ? "♪" : category === "Creative" ? "◉" : "✦"}</span><i /><i /><i /></div><div className="page-hero-actions"><button className="primary-action" onClick={() => navigate("/professionals")}>Learn {label} <ArrowRight size={16} /></button><button className="secondary-action" onClick={() => navigate(`/teach?skill=${encodeURIComponent(label)}`)}>Teach {label} <GraduationCap size={16} /></button><button className={saved ? "secondary-action saved-action" : "secondary-action"} onClick={() => { setSaved((value) => !value); toast.success(saved ? `${label} removed from saved skills.` : `${label} saved to your learning path.`); }}><Bookmark size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save skill"}</button></div></section><section className="skill-detail-grid"><article className="content-panel"><p className="page-kicker">BEGINNER → ADVANCED</p><h2>A clear path, not a rigid course.</h2><ol className="learning-path"><li><b>Explore</b><span>Define a useful first project or practice outcome.</span></li><li><b>Practice</b><span>Use a focused session, project, or exchange to build confidence.</span></li><li><b>Share</b><span>Teach what is now useful to someone else and keep the cycle moving.</span></li></ol></article><article className="content-panel"><p className="page-kicker">WHAT’S AVAILABLE</p><h2>Use the right format.</h2><div className="availability-list"><button onClick={() => navigate("/professionals")}>Professionals <ChevronRight size={15} /></button><button onClick={() => navigate("/sessions")}>Learning sessions <ChevronRight size={15} /></button><button onClick={() => navigate("/matches")}>Skill exchanges <ChevronRight size={15} /></button><button onClick={() => navigate("/community")}>Community prompts <ChevronRight size={15} /></button></div></article></section><section><div className="section-heading"><div><p className="page-kicker">PEOPLE TO EXPLORE</p><h2>Professional-led learning.</h2></div><button className="secondary-action" onClick={() => navigate("/professionals")}>See all professionals</button></div>{relevant.length ? <ProfessionalStrip limit={relevant.length} /> : <div className="empty-state"><UsersRound size={23} /><h3>Professionals are being matched to this skill.</h3><p>Use the catalog or search to find adjacent expertise while this path grows.</p><button className="primary-action" onClick={() => navigate("/professionals")}>Explore professionals</button></div>}</section></div>;
}

export function LearningHub({ mode }: { mode: "learn" | "teach" }) {
  const navigate = useNavigation();
  const { account, updateProfile } = useAccount();
  const { state, addTeachingOffering, completeTeachingOffering, deleteTeachingOffering } = useSkillSwap();
  
  const queryParamSkill = new URLSearchParams(window.location.search).get("skill") ?? "";
  
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(mode === "learn" ? account?.learnSkills.join(", ") ?? "" : account?.teachSkills.join(", ") ?? "");
  const [showOfferModal, setShowOfferModal] = useState(Boolean(queryParamSkill && mode === "teach"));
  
  const [offerSkill, setOfferSkill] = useState(queryParamSkill || "");
  const [offerCategory, setOfferCategory] = useState("Technology");
  const [offerLevel, setOfferLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "All Levels">("All Levels");
  const [offerFormat, setOfferFormat] = useState<"60-min Session" | "30-min Practice" | "15-min Consultation" | "Project Review">("60-min Session");
  const [offerPrice, setOfferPrice] = useState(14);
  const [offerDescription, setOfferDescription] = useState("");
  const [offerAvailability, setOfferAvailability] = useState("Weekday evenings & Weekends");
  const hubRef = useRef<HTMLDivElement>(null);
  const gemOrbRef = useRef<HTMLDivElement>(null);

  const heading = mode === "learn" ? "Build your learning path." : "Teach with a clear signal.";
  const description = mode === "learn"
    ? "Choose a skill, find a person, and keep your next step visible."
    : "Offer any skill to teach, set your session or consultation rate, and receive Gems when learners purchase your guidance.";
  const skills = mode === "learn" ? account?.learnSkills ?? [] : account?.teachSkills ?? [];

  const offerings = state.teachingOfferings || [];
  const waitingOfferings = offerings.filter((o) => o.status === "waiting");
  const bookedOfferings = offerings.filter((o) => o.status === "booked");
  const completedOfferings = offerings.filter((o) => o.status === "completed");
  const totalPendingGems = offerings.filter((o) => o.status !== "completed").reduce((sum, o) => sum + (o.price || 5), 0);
  const totalEarnedGems = completedOfferings.reduce((sum, o) => sum + (o.earnedGems || o.price || 5), 0);

  useEffect(() => {
    if (gemOrbRef.current) {
      animateFloating(gemOrbRef.current);
    }
    if (hubRef.current) {
      return initPageScrollReveal({ root: hubRef.current });
    }
  }, [mode, offerings.length]);

  const save = () => {
    const next = draft.split(",").map((item) => item.trim()).filter(Boolean);
    updateProfile({});
    if (account) {
      localStorage.setItem("skillswap-account-v1", JSON.stringify({ ...account, [mode === "learn" ? "learnSkills" : "teachSkills"]: next }));
      window.location.reload();
    }
  };

  const handleCreateOffering = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanSkill = offerSkill.trim();
    if (!cleanSkill) {
      toast.error("Please enter a skill name to teach.");
      return;
    }
    const finalPrice = offerFormat === "15-min Consultation" ? Math.max(0, offerPrice) : Math.max(1, offerPrice);
    
    addTeachingOffering({
      skill: cleanSkill,
      category: offerCategory,
      level: offerLevel,
      format: offerFormat,
      price: finalPrice,
      description: offerDescription.trim() || `Practical ${cleanSkill} teaching session focusing on real-world projects and fundamentals.`,
      availability: offerAvailability.trim() || "Available this week",
    });

    if (account && !account.teachSkills.includes(cleanSkill)) {
      const updatedTeach = [...account.teachSkills, cleanSkill];
      updateProfile({});
      localStorage.setItem("skillswap-account-v1", JSON.stringify({ ...account, teachSkills: updatedTeach }));
    }

    toast.success(`Skill "${cleanSkill}" is now listed live! Waiting for a learner to book.`);
    setShowOfferModal(false);
    setOfferSkill("");
    setOfferDescription("");
  };

  const handleCompleteSession = (id: string, skill: string, price: number) => {
    completeTeachingOffering(id);
    toast.success(`★ +${price || 5} Gems successfully transferred to your wallet for teaching ${skill}!`);
  };

  return (
    <div ref={hubRef} className="hub-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title={mode === "teach" ? "Teaching Studio & Offerings" : "Learning Hub & Pathways"}
        description={
          mode === "teach"
            ? "Create and manage your teaching offerings, set consultation sessions, and earn Swap Credits."
            : "Build your personalized skill path, track progress, and find verified peer mentors."
        }
        canonicalPath={mode === "teach" ? "/teach" : "/learn"}
      />
      {/* Hero Section */}
      <section className="anime-hub-card glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-xl">
          <p className="page-kicker">{mode === "learn" ? "MY LEARNING PATH" : "TEACHING STUDIO & 3D WORKSPACE"}</p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
            {mode === "teach" ? "Teaching Studio" : heading}
          </h1>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">
            {mode === "teach"
              ? "Manage your teaching offerings, conduct 1-on-1 consultations, and receive Gems transferred upon session completion."
              : description}
          </p>
        </div>

        {/* Gems Balance Card from Stitch */}
        {mode === "teach" ? (
          <div ref={gemOrbRef} className="gradient-border-card p-5 sm:p-6 flex flex-col gap-2 w-full sm:w-auto sm:min-w-[240px] shrink-0 shadow-2xl">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span>Gems Balance</span>
              <Gem size={18} className="text-white" />
            </div>
            <div className="text-4xl font-extrabold text-white">★ {state.wallet}</div>
            <div className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
              <Sparkles size={13} />
              <span>{completedOfferings.length} completed sessions · +{totalEarnedGems} earned</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Mode Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {mode === "teach" ? (
          <>
            <button className="primary-action text-sm px-5 py-2.5" onClick={() => setShowOfferModal(true)}>
              <Plus size={16} /> Offer Another Skill to Teach
            </button>
            <button className="secondary-action text-sm px-5 py-2.5" onClick={() => navigate("/wallet")}>
              <Gem size={16} /> Open Skills Wallet ({state.wallet} Gems)
            </button>
          </>
        ) : (
          <>
            <button className="primary-action text-sm px-5 py-2.5" onClick={() => navigate("/discover")}>
              Find a Skill to Learn <ArrowRight size={16} />
            </button>
            <button className="secondary-action text-sm px-5 py-2.5" onClick={() => navigate("/settings")}>
              Learning Preferences <Settings2 size={16} />
            </button>
          </>
        )}
      </div>

      {mode === "teach" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Active Teaching Offerings */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="page-kicker">MARKETPLACE LISTINGS</p>
                <h2 className="text-2xl font-bold text-white">Active Offerings</h2>
              </div>
              <span className="text-xs text-gray-400">
                {waitingOfferings.length} waiting · {bookedOfferings.length} booked
              </span>
            </div>

            {offerings.length ? (
              <div className="grid grid-cols-1 gap-4">
                {offerings.map((offering) => (
                  <div
                    key={offering.id}
                    className={`anime-hub-card glass-panel rounded-2xl p-6 flex flex-col justify-between gap-4 transition-all duration-300 hover:scale-[1.01] ${
                      offering.status === "booked"
                        ? "border-white/30 shadow-lg"
                        : offering.status === "completed"
                        ? "border-white/20"
                        : "border-white/10"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {offering.status === "waiting" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold">
                              <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block mr-0.5" />
                              ⏳ Waiting for Learner
                            </span>
                          ) : offering.status === "booked" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold">
                              <span className="w-2 h-2 rounded-full bg-white pulse-dot inline-block mr-0.5" />
                              📅 Booked by {offering.learnerName || "Learner"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-semibold">
                              <Check size={13} />
                              ✅ Completed & Transferred
                            </span>
                          )}

                          <span className="text-xs text-gray-400">
                            {offering.category} · {offering.level} · {offering.format}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-1">{offering.skill}</h3>
                        <p className="text-xs md:text-sm text-gray-400 line-clamp-2 leading-relaxed">
                          {offering.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <strong className="text-lg font-bold text-white block">
                          ★ {offering.price === 0 ? "Free (0 pts)" : `${offering.price} Gems`}
                        </strong>
                        <small className="text-[11px] text-gray-400">{offering.availability}</small>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-between items-center flex-wrap gap-3">
                      {offering.status === "waiting" ? (
                        <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <span>Gems will be transferred to your wallet when a student books.</span>
                        </p>
                      ) : offering.status === "booked" ? (
                        <p className="text-xs text-zinc-300 flex items-center gap-1.5">
                          <Clock size={13} />
                          <span>Student is waiting for session. Click complete to receive Gems.</span>
                        </p>
                      ) : (
                        <p className="text-xs text-white flex items-center gap-1.5">
                          <Check size={13} />
                          <span>+{offering.earnedGems || offering.price || 5} Gems credited to your wallet.</span>
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        {offering.status === "waiting" ? (
                          <button
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                            onClick={() => deleteTeachingOffering(offering.id)}
                            title="Delete listing"
                          >
                            <X size={15} />
                          </button>
                        ) : offering.status === "booked" ? (
                          <button
                            className="primary-action text-xs px-4 py-2 font-bold shadow-md cursor-pointer rounded-lg"
                            onClick={() => handleCompleteSession(offering.id, offering.skill, offering.price)}
                          >
                            <Check size={14} className="shrink-0" />
                            <span>Complete Session & Transfer ★ {offering.price === 0 ? 5 : offering.price} Gems</span>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                <GraduationCap size={32} className="text-gray-500" />
                <h3 className="text-lg font-bold text-white">No active teaching listings yet</h3>
                <p className="text-xs text-gray-400 max-w-sm">
                  Offer any skill to teach, set your rate in Gems, and receive earnings when students purchase your sessions.
                </p>
                <button className="primary-action text-xs mt-2" onClick={() => setShowOfferModal(true)}>
                  <Plus size={14} /> Offer Your First Skill
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Wallet Pipeline & Quick QR from Stitch */}
          <aside className="flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Wallet Pipeline</h3>
                <span className="text-xs text-white font-semibold">Live Audit</span>
              </div>

              <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
                {state.transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          tx.amount > 0 ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : "−"}
                      </span>
                      <div>
                        <strong className="text-white block font-medium">{tx.type}</strong>
                        <small className="text-gray-400">{new Date(tx.date).toLocaleDateString()}</small>
                      </div>
                    </div>
                    <b className="text-white font-bold">
                      {tx.amount > 0 ? "+" : ""}{tx.amount} pts
                    </b>
                  </div>
                ))}
              </div>

              {/* UPI QR Topup Section from Stitch */}
              <div className="pt-4 border-t border-white/10 flex flex-col items-center text-center">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Instant Wallet Top-Up
                </span>
                <div className="w-24 h-24 bg-white rounded-xl p-2 mb-2 flex items-center justify-center shadow-lg">
                  <div className="w-full h-full bg-black rounded flex items-center justify-center text-white text-[10px] font-mono font-bold">
                    UPI QR
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Scan via GPay, PhonePe, or Paytm</p>
                <button
                  className="secondary-action text-xs mt-3 w-full justify-center"
                  onClick={() => navigate("/wallet")}
                >
                  Go to Points Store <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Offer Skill Modal */}
      {showOfferModal ? (
        <div className="portfolio-modal" role="dialog" aria-modal="true" style={{ maxWidth: "580px" }}>
          <button aria-label="Close offer modal" onClick={() => setShowOfferModal(false)}>×</button>
          <div className="flex items-center gap-2 mb-1 text-white">
            <GraduationCap size={20} />
            <p className="page-kicker m-0">TEACHING MARKETPLACE</p>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Offer a Skill to Teach</h3>
          <p className="text-xs text-gray-400 mb-4">
            List your offering. Gems are transferred to your wallet once a student purchases or completes the consultation.
          </p>

          <form onSubmit={handleCreateOffering} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Skill Title</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white"
                placeholder="e.g. Cinematic Color Grading, React Native, 3D Lighting"
                value={offerSkill}
                onChange={(e) => setOfferSkill(e.target.value)}
                required
                autoFocus
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["Python", "UI/UX Design", "Photography", "Guitar", "Video Editing", "Next.js", "AI Prompts"].map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                      offerSkill === s ? "bg-white text-black font-bold border-white" : "bg-white/5 text-gray-300 border-white/10"
                    }`}
                    onClick={() => setOfferSkill(s)}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  value={offerCategory}
                  onChange={(e) => setOfferCategory(e.target.value)}
                >
                  <option value="Technology">Technology</option>
                  <option value="Design">Design & 3D</option>
                  <option value="Creative">Creative Arts</option>
                  <option value="Music">Music & Audio</option>
                  <option value="Communication">Communication</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Level</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  value={offerLevel}
                  onChange={(e) => setOfferLevel(e.target.value as any)}
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner Friendly</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Format</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  value={offerFormat}
                  onChange={(e) => {
                    const f = e.target.value as any;
                    setOfferFormat(f);
                    if (f === "15-min Consultation") setOfferPrice(0);
                    else if (f === "30-min Practice") setOfferPrice(10);
                    else if (f === "60-min Session") setOfferPrice(14);
                    else if (f === "Project Review") setOfferPrice(12);
                  }}
                >
                  <option value="60-min Session">🎓 60-min Standard Session</option>
                  <option value="30-min Practice">⚡ 30-min Focused Practice</option>
                  <option value="15-min Consultation">🤝 15-min Free Consultation (+5 bonus)</option>
                  <option value="Project Review">🔍 Project Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Rate (Gems)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Math.max(0, parseInt(e.target.value) || 0))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Session Summary</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                rows={2}
                placeholder="What topics or hands-on practice will you guide the student through?"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="primary-action flex-1 justify-center text-xs py-2.5 font-bold rounded-xl"
              >
                <Check size={15} className="shrink-0" />
                <span>Publish & List Offering</span>
              </button>
              <button type="button" className="secondary-action text-xs px-4" onClick={() => setShowOfferModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {mode === "learn" ? (
        <section className="hub-grid" style={{ marginTop: "1.5rem" }}>
          <article className="content-panel glass-panel rounded-2xl p-6 border border-white/10">
            <div className="section-heading">
              <div>
                <p className="page-kicker">YOUR LEARNING SKILLS</p>
                <h2>{skills.length ? `${skills.length} active skill${skills.length === 1 ? "" : "s"}` : "Make a first selection."}</h2>
              </div>
              <button className="secondary-action" onClick={() => setEditing((value) => !value)}>
                {editing ? "Close" : "Edit"}
              </button>
            </div>
            {editing ? (
              <div className="inline-editor">
                <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Separate skills with commas" />
                <button className="primary-action" onClick={save}>Save skills</button>
              </div>
            ) : skills.length ? (
              <div className="skill-token-list">
                {skills.map((skill) => (
                  <button key={skill} onClick={() => navigate(`/skills/${slug(skill)}`)}>
                    {skill}
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <Compass size={20} />
                <h3>No skills selected yet</h3>
                <p>Select skills to personalize your workspace.</p>
              </div>
            )}
          </article>

          <article className="content-panel glass-panel rounded-2xl p-6 border border-white/10">
            <p className="page-kicker">NEXT ACTION</p>
            <h2>Turn an interest into practice.</h2>
            <p className="panel-copy">
              Browse the catalog, save a path, or ask a listed professional a question before booking.
            </p>
            <button className="primary-action" onClick={() => navigate("/professionals")}>
              Find professionals
              <ArrowRight size={16} />
            </button>
          </article>
        </section>
      ) : null}
    </div>
  );
}

export function Sessions() {
  const navigate = useNavigation();
  const { state, cancelSession, rescheduleSession } = useSkillSwap();
  const [activeSessionTab, setActiveSessionTab] = useState<"upcoming" | "completed" | "all">("upcoming");
  const [activeLiveSession, setActiveLiveSession] = useState<LiveSessionTarget | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newTimeInput, setNewTimeInput] = useState("");

  // Aggregate sessions from both state.sessions AND scheduled barterProposals
  const allSessions = useMemo(() => {
    const list: Array<
      Session & {
        partnerName?: string;
        partnerAvatar?: string;
        partnerAccent?: string;
        offerSkill?: string;
        isBarter?: boolean;
      }
    > = [];
    const seenIds = new Set<string>();

    // 1. Add from state.sessions
    (state.sessions || []).forEach((s) => {
      seenIds.add(s.id);
      if (s.proposalId) seenIds.add(`barter-${s.proposalId}`);
      const pro = professionals.find((p) => p.id === s.professionalId);
      list.push({
        ...s,
        partnerName: s.partnerName || pro?.name || "SkillSwap Partner",
        partnerAvatar: s.partnerAvatar || pro?.avatar || "SS",
        partnerAccent: s.partnerAccent || pro?.accent || "#27272a",
        offerSkill: s.offerSkill,
        isBarter: s.isBarter ?? (s.points === 0),
      });
    });

    // 2. Add from state.barterProposals that are "Session Scheduled" or "Completed"
    (state.barterProposals || [])
      .filter((p) => p.status === "Session Scheduled" || p.status === "Completed")
      .forEach((p) => {
        const generatedId = `session-barter-${p.id}`;
        if (!seenIds.has(generatedId) && !seenIds.has(p.id)) {
          seenIds.add(generatedId);
          seenIds.add(p.id);
          list.push({
            id: generatedId,
            professionalId: p.partnerId,
            skill: p.requestSkill,
            time: p.scheduledTime || p.slot,
            points: 0,
            status: p.status === "Completed" ? "completed" : "upcoming",
            roomUrl: p.roomUrl,
            isBarter: true,
            format: p.format,
            partnerName: p.partnerName,
            partnerAvatar: p.partnerAvatar,
            partnerAccent: p.partnerAccent,
            offerSkill: p.offerSkill,
            proposalId: p.id,
          });
        }
      });

    return list;
  }, [state.sessions, state.barterProposals]);

  const filteredSessions = useMemo(() => {
    if (activeSessionTab === "upcoming") {
      return allSessions.filter((s) => s.status === "upcoming" || s.status === "pending");
    }
    if (activeSessionTab === "completed") {
      return allSessions.filter((s) => s.status === "completed");
    }
    return allSessions;
  }, [allSessions, activeSessionTab]);

  const upcomingCount = allSessions.filter((s) => s.status === "upcoming" || s.status === "pending").length;
  const completedCount = allSessions.filter((s) => s.status === "completed").length;

  const handleStartSession = (session: typeof allSessions[0]) => {
    setActiveLiveSession({
      id: session.proposalId || session.id,
      partnerId: session.professionalId,
      partnerName: session.partnerName || "Partner",
      partnerAvatar: session.partnerAvatar || "SS",
      partnerAccent: session.partnerAccent || "#27272a",
      requestSkill: session.skill,
      offerSkill: session.offerSkill,
      format: session.format || "1 hr Live Video",
      slot: session.time,
      isBarter: session.isBarter,
    });
  };

  const handleRescheduleSubmit = (sessionId: string) => {
    if (!newTimeInput.trim()) return;
    rescheduleSession(sessionId, newTimeInput.trim());
    setRescheduleId(null);
    setNewTimeInput("");
    toast.success(`Session rescheduled to ${newTimeInput.trim()}`);
  };

  return (
    <div className="sessions-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 relative">
      {/* Ambient background glow orbs */}
      <div className="glow-orb-mono w-96 h-96 -top-20 -left-20 opacity-12 pointer-events-none" />
      <div className="glow-orb-mono w-96 h-96 top-60 -right-20 opacity-8 pointer-events-none" />

      <PageSEO
        title="1:1 Sessions & Meeting Rooms"
        description="Upcoming and completed 1-on-1 skill exchange sessions, native video meeting rooms with screen sharing, and calendar timeline."
        canonicalPath="/sessions"
      />

      {/* Live Video Call Modal with Screen Sharing */}
      {activeLiveSession && (
        <LiveVideoRoomModal
          isOpen={Boolean(activeLiveSession)}
          onClose={() => setActiveLiveSession(null)}
          sessionTarget={activeLiveSession}
        />
      )}

      {/* Hero Header */}
      <section className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/10">
        <div>
          <p className="page-kicker">SESSIONS WORKSPACE</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Keep the next meeting <em>clear.</em>
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">
            Live 1:1 barter consultation rooms, screen sharing sessions, and upcoming peer learning all stay visible and launchable here.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/professionals")}
            style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
            className="primary-action text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-md hover:bg-zinc-300 transition-all cursor-pointer min-h-[44px]"
          >
            <Calendar size={14} /> Book a Session
          </button>
          <button
            onClick={() => navigate("/messages")}
            className="secondary-action text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <MessageCircle size={14} /> Open Chat
          </button>
        </div>
      </section>

      {/* Timeline Controls & Filter Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSessionTab("upcoming")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSessionTab === "upcoming"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Clock size={14} />
            <span>Upcoming</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSessionTab === "upcoming" ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-300"
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSessionTab("completed")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSessionTab === "completed"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Check size={14} />
            <span>Completed</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSessionTab === "completed" ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-300"
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSessionTab("all")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSessionTab === "all"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                activeSessionTab === "all" ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-300"
              }`}
            >
              {allSessions.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-zinc-400 font-medium">
          {filteredSessions.length} recorded meeting{filteredSessions.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Responsive Grid: 1-col mobile, 2-col tablet, 3-col desktop */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const isCompleted = session.status === "completed";
            const pro = professionals.find((p) => p.id === session.professionalId);
            return (
              <div
                key={session.id}
                className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0c0d12]/90 hover:border-white/20 p-5 sm:p-6 transition-all duration-200 shadow-xl group"
              >
                {/* Top specular line */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div>
                  {/* Top Header */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md"
                        style={{ background: session.partnerAccent || pro?.accent || "#27272a" }}
                      >
                        {session.partnerAvatar || pro?.avatar || "SS"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-white truncate">
                            {session.partnerName || pro?.name}
                          </h3>
                          {pro?.verified && <BadgeCheck size={14} className="text-zinc-300 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-zinc-400 block truncate">
                          {pro?.title || "SkillSwap Mentor"}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                        isCompleted
                          ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {isCompleted ? "Completed" : "Upcoming"}
                    </span>
                  </div>

                  {/* Session Details Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2.5 mb-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 font-medium">Topic:</span>
                      <strong className="text-white font-semibold truncate max-w-[180px]">{session.skill}</strong>
                    </div>

                    {session.offerSkill && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-medium">In Exchange:</span>
                        <strong className="text-zinc-300 font-medium truncate max-w-[180px]">
                          {session.offerSkill}
                        </strong>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-zinc-300 pt-2 border-t border-white/[0.06]">
                      <Clock size={13} className="text-zinc-400 shrink-0" />
                      <span className="font-mono text-[11px] text-white">{session.time}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Video size={12} className="text-zinc-400" />
                        <span>{session.format || "1 hr Live Video"}</span>
                      </span>
                      <span className="font-semibold text-zinc-300">
                        {session.isBarter ? "100% Barter Swap" : `${session.points} Points Held`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Inline Reschedule Form */}
                {rescheduleId === session.id && (
                  <div className="p-3 mb-3 rounded-xl bg-white/[0.04] border border-white/15 flex flex-col gap-2 animate-in fade-in">
                    <input
                      type="text"
                      value={newTimeInput}
                      onChange={(e) => setNewTimeInput(e.target.value)}
                      placeholder="e.g. Saturday · 4:00 PM EST"
                      className="w-full bg-black/70 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRescheduleSubmit(session.id)}
                        className="px-3 py-1 rounded-lg bg-white text-black text-xs font-bold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setRescheduleId(null)}
                        className="px-3 py-1 rounded-lg bg-white/10 text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
                  {!isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleStartSession(session)}
                      style={{ backgroundColor: "#E4E4E7", color: "#000000", border: "1px solid #E4E4E7" }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#E4E4E7] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-zinc-300 transition-all shadow-md active:scale-[0.99] cursor-pointer min-h-[44px]"
                    >
                      <Video size={15} className="shrink-0" />
                      <span>Start Session (Live Call & Screen Share)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2 px-4 rounded-xl bg-white/5 text-zinc-400 font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <Check size={14} /> Session Completed
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/messages?pro=${session.professionalId}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                    >
                      <MessageCircle size={14} />
                      <span>Open Chat</span>
                    </button>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleId(session.id);
                          setNewTimeInput(session.time);
                        }}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer min-h-[44px]"
                        title="Reschedule Session"
                      >
                        Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state p-12 text-center flex flex-col items-center glass-panel rounded-3xl border border-white/10">
          <BookOpen size={36} className="text-zinc-500 mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            {activeSessionTab === "completed" ? "No completed sessions yet" : "No upcoming sessions"}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-6">
            Propose a 1:1 barter trade or book a consultation with a verified mentor to schedule your next learning session.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate("/matches")}
              style={{ backgroundColor: "#E4E4E7", color: "#000000" }}
              className="py-2.5 px-5 rounded-xl bg-[#E4E4E7] text-black font-bold text-xs flex items-center gap-2 shadow cursor-pointer min-h-[44px]"
            >
              <Zap size={14} /> View Barter Matches
            </button>
            <button
              type="button"
              onClick={() => navigate("/professionals")}
              className="py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              Discover Mentors <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Saved() {
  const navigate = useNavigation(); const { state, toggleSave } = useSkillSwap(); const [tab, setTab] = useState(new URLSearchParams(window.location.search).get("tab") ?? "professionals"); const savedPros = professionals.filter((professional) => state.savedIds.includes(professional.id));
  return <div className="saved-page"><section className="page-hero"><p className="page-kicker">SAVED</p><h1>Keep good signals <em>close.</em></h1><p>Collect skills, professionals, sessions, posts, and learning plans without losing the context that made them useful.</p></section><div className="search-tabs saved-tabs">{["skills", "professionals", "sessions", "posts"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === "professionals" ? savedPros.length ? <div className="saved-professional-grid">{savedPros.map((professional) => <article key={professional.id} className="mini-professional"><span style={{ background: professional.accent }}>{professional.avatar}</span><div><p>{professional.verified ? "Identity verified" : "Identity pending"}</p><h3>{professional.name}</h3><small>{professional.title}</small><b>From {professional.price} pts</b></div><button onClick={() => toggleSave(professional.id)} aria-label={`Remove ${professional.name} from saved`}><X size={16} /></button></article>)}</div> : <div className="empty-state"><Bookmark size={25} /><h3>No saved professionals</h3><p>Save teachers and experts you want to learn from, then return when the timing is right.</p><button className="primary-action" onClick={() => navigate("/professionals")}>Discover professionals</button></div> : <div className="empty-state"><Bookmark size={25} /><h3>No saved {tab} yet</h3><p>Use the discovery and learning workspaces to build a collection that stays relevant.</p><button className="primary-action" onClick={() => navigate("/discover")}>Explore discovery</button></div>}</div>;
}

export function Matches() {
  const navigate = useNavigation();
  const { account } = useAccount();
  const {
    state,
    acceptBarterProposal,
    declineBarterProposal,
    scheduleBarterSession,
    completeBarterSwap,
  } = useSkillSwap();

  const [selectedProposalPartner, setSelectedProposalPartner] = useState<Professional | null>(null);
  const [filterScore, setFilterScore] = useState<number>(80);
  const [activeTab, setActiveTab] = useState<"matches" | "inbox">(
    () => (new URLSearchParams(window.location.search).get("tab") === "inbox" ? "inbox" : "matches")
  );
  const [inboxFilter, setInboxFilter] = useState<"all" | "pending" | "accepted" | "scheduled" | "completed">("all");
  const [schedulingProposalId, setSchedulingProposalId] = useState<string | null>(null);
  const [customSlotInput, setCustomSlotInput] = useState<string>("Tomorrow · 6:00 PM EST");

  const teach = account?.teachSkills[0] ?? "Next.js & React";
  const learn = account?.learnSkills[0] ?? "UI/UX & Figma";

  const scoredPeers = useMemo(() => {
    return professionals
      .map((p) => ({
        partner: p,
        score: calculateMatchScore(learn, teach, p),
      }))
      .sort((a, b) => b.score - a.score);
  }, [learn, teach]);

  const barterProposals = state.barterProposals || [];
  const pendingCount = barterProposals.filter((p) => p.status === "Proposed").length;
  const acceptedCount = barterProposals.filter((p) => p.status === "Accepted").length;
  const scheduledCount = barterProposals.filter((p) => p.status === "Session Scheduled").length;
  const completedCount = barterProposals.filter((p) => p.status === "Completed").length;

  const filteredProposals = useMemo(() => {
    if (inboxFilter === "pending") return barterProposals.filter((p) => p.status === "Proposed");
    if (inboxFilter === "accepted") return barterProposals.filter((p) => p.status === "Accepted");
    if (inboxFilter === "scheduled") return barterProposals.filter((p) => p.status === "Session Scheduled");
    if (inboxFilter === "completed") return barterProposals.filter((p) => p.status === "Completed");
    return barterProposals;
  }, [barterProposals, inboxFilter]);

  const handleScheduleSubmit = (proposalId: string) => {
    if (!customSlotInput.trim()) {
      toast.error("Please enter a valid session time slot.");
      return;
    }
    scheduleBarterSession(proposalId, customSlotInput.trim());
    setSchedulingProposalId(null);
    toast.success(`📅 Session scheduled for ${customSlotInput.trim()}! Meeting room generated.`);
  };

  return (
    <div className="matches-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 relative">
      {/* Ambient background glow orbs */}
      <div className="glow-orb-mono w-96 h-96 -top-20 -left-20 opacity-12 pointer-events-none" />
      <div className="glow-orb-mono w-96 h-96 top-60 -right-20 opacity-8 pointer-events-none" />

      <PageSEO
        title="2-Way Barter Matches & Proposals Inbox"
        description="Algorithmically scored mutual compatibility matches and reciprocal barter proposals inbox. Zero money involved — 100% peer trade."
        canonicalPath="/matches"
      />

      {/* Proposal Modal */}
      {selectedProposalPartner && (
        <SwapProposalModal
          partner={selectedProposalPartner}
          isOpen={Boolean(selectedProposalPartner)}
          onClose={() => setSelectedProposalPartner(null)}
          initialRequestSkill={learn}
          initialOfferSkill={teach}
        />
      )}

      {/* Header & View Switcher */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-white/10">
        <div>
          <p className="page-kicker">2-WAY BARTER MATCHMAKER</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Skill Exchange Matches
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">
            Pair with verified peers based on complementary skills or manage received barter proposals in your dedicated inbox. Zero platform fees — 100% reciprocal knowledge barter.
          </p>
        </div>

        {/* Minimalistic Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full sm:w-auto self-stretch sm:self-auto shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
              activeTab === "matches"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap size={14} className={activeTab === "matches" ? "text-black" : "text-zinc-400"} />
            <span>Peer Matches</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeTab === "matches" ? "bg-black/10 text-black font-bold" : "bg-white/10 text-zinc-300"
              }`}
            >
              {scoredPeers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] ${
              activeTab === "inbox"
                ? "bg-white text-black shadow-md"
                : "text-zinc-300 hover:text-white hover:bg-white/5"
            }`}
            title="Received Barter Proposals Inbox"
          >
            {/* White Minimalistic Inbox Icon */}
            <Inbox
              size={15}
              className={activeTab === "inbox" ? "text-black stroke-[2]" : "text-white stroke-[1.75]"}
            />
            <span>Proposals Inbox</span>
            {pendingCount > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === "inbox"
                    ? "bg-black text-white"
                    : "bg-white text-black animate-pulse"
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Inbox Notification Banner on Matches view if pending proposals exist */}
      {activeTab === "matches" && pendingCount > 0 && (
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-md shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Inbox size={16} className="text-white stroke-[1.75]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                You have {pendingCount} pending swap proposal{pendingCount > 1 ? "s" : ""} waiting in your Inbox
              </p>
              <p className="text-[11px] text-zinc-400">
                Peers want to exchange their skills with yours with zero platform fees.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("inbox")}
            className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-sm"
          >
            <Inbox size={13} className="text-black stroke-[2]" />
            <span>Open Inbox</span>
          </button>
        </div>
      )}

      {/* TAB 1: PEER MATCHES VIEW */}
      {activeTab === "matches" && (
        <>
          {/* Interactive 2-Way Stage Graph */}
          <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 z-10">
            <div className="flex flex-col items-center text-center gap-2">
              <UserAvatar src={account?.avatar} name={account?.name} size="xl" rounded="3xl" />
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">You Offer</span>
                <strong className="text-base font-bold text-white">{teach}</strong>
              </div>
            </div>

            {/* Exchange Connector */}
            <div className="flex flex-col items-center gap-2 w-full max-w-xs">
              <span className="text-xs font-medium text-zinc-200 bg-white/[0.08] px-3 py-1 rounded-full border border-white/20">
                98% Mutual Reciprocity
              </span>
              <div className="w-full relative flex items-center justify-center py-2">
                <div className="w-full h-px bg-white/[0.12]" />
                <span className="absolute bg-[#10121a] border border-white/15 px-3 py-0.5 rounded-full text-xs font-medium text-zinc-200">
                  1:1 Barter
                </span>
              </div>
              <small className="text-[11px] text-zinc-400 text-center">
                Zero Platform Fees · Direct Knowledge Swap
              </small>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800/80 border border-white/10 flex items-center justify-center text-xl font-semibold text-zinc-200 shadow-lg">
                {scoredPeers[0]?.partner.avatar || "KM"}
              </div>
              <div>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">They Offer</span>
                <strong className="text-base font-semibold text-white">{learn}</strong>
              </div>
            </div>
          </section>

          {/* Matched Barter Pairs Grid */}
          <section className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="page-kicker">TOP COMPATIBLE PEERS</p>
                <h2 className="text-2xl font-bold text-white">Recommended Barter Partners</h2>
              </div>
              <span className="text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full">
                {scoredPeers.length} Verified Partners Available
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scoredPeers.map(({ partner, score }) => (
                <div
                  key={partner.id}
                  className="relative flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#0c0d12]/70 hover:bg-[#10121a]/90 hover:border-white/[0.16] p-5 transition-all duration-200 group shadow-md"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={partner.avatar} name={partner.name} size="md" rounded="full" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                              {partner.name}
                            </h3>
                            {partner.verified && <BadgeCheck size={14} className="text-zinc-300 shrink-0" />}
                          </div>
                          <span className="text-xs text-zinc-400 block font-normal">{partner.timezone}</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center text-[11px] font-medium text-zinc-200 bg-white/[0.08] border border-white/15 px-2 py-0.5 rounded-md">
                        {score}% Match
                      </span>
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Teaching:</span>
                        <strong className="text-zinc-200 font-medium">{partner.primarySkill}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Seeking:</span>
                        <strong className="text-zinc-200 font-medium">{partner.seekingSkills[0]?.skill || "Next.js"}</strong>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Availability:</span>
                        <span className="text-zinc-400 font-normal">{partner.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 mt-4 border-t border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setSelectedProposalPartner(partner)}
                      className="primary-action trade-skill-btn propose-swap-btn rounded-lg text-xs font-bold py-2 px-3 flex-1 justify-center flex items-center gap-1.5 shadow-md transition-all cursor-pointer border"
                    >
                      <Zap size={13} className="shrink-0" />
                      <span>Trade Skill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/messages?pro=${partner.id}`)}
                      className="secondary-action rounded-lg text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border"
                      title="Direct Message"
                    >
                      <MessageCircle size={14} className="shrink-0" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* TAB 2: PROPOSALS INBOX VIEW */}
      {activeTab === "inbox" && (
        <section className="flex flex-col gap-6 animate-in fade-in">
          {/* Inbox Header & Quick Controls */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-md">
                <Inbox size={22} className="text-white stroke-[1.75]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Received Barter Proposals
                  </h2>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-black font-bold text-[10px]">
                      {pendingCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct peer-to-peer trade offers. Accept, negotiate terms, or schedule your live barter exchange.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Received</span>
              <strong className="text-2xl font-black text-white font-mono">{barterProposals.length}</strong>
              <span className="text-[10px] text-zinc-500">Inbound barter offers</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/20 flex flex-col gap-1 relative overflow-hidden">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Pending Review
              </span>
              <strong className="text-2xl font-black text-white font-mono">{pendingCount}</strong>
              <span className="text-[10px] text-zinc-400">Needs your confirmation</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Accepted Swaps</span>
              <strong className="text-2xl font-black text-white font-mono">{acceptedCount}</strong>
              <span className="text-[10px] text-zinc-500">Mutual match agreed</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Scheduled Rooms</span>
              <strong className="text-2xl font-black text-white font-mono">{scheduledCount}</strong>
              <span className="text-[10px] text-zinc-500">Calendar holds active</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 text-xs">
            {[
              { id: "all", label: "All Proposals", count: barterProposals.length },
              { id: "pending", label: "Pending Review", count: pendingCount },
              { id: "accepted", label: "Accepted", count: acceptedCount },
              { id: "scheduled", label: "Scheduled", count: scheduledCount },
              { id: "completed", label: "Completed", count: completedCount },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setInboxFilter(f.id as typeof inboxFilter)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[40px] ${
                  inboxFilter === f.id
                    ? "bg-white text-black shadow-md"
                    : "bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    inboxFilter === f.id ? "bg-black/15 text-black font-bold" : "bg-white/10 text-zinc-300"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Proposals Cards List */}
          {filteredProposals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredProposals.map((proposal) => {
                const isPending = proposal.status === "Proposed";
                const isAccepted = proposal.status === "Accepted";
                const isScheduled = proposal.status === "Session Scheduled";
                const isCompleted = proposal.status === "Completed";
                const isDeclined = proposal.status === "Declined";

                return (
                  <div
                    key={proposal.id}
                    className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-[#0c0d12]/90 hover:border-white/20 p-5 sm:p-6 transition-all duration-200 shadow-xl group"
                  >
                    {/* Top Specular Line */}
                    <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div>
                      {/* Header Row */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md"
                            style={{ background: proposal.partnerAccent || "#27272a" }}
                          >
                            {proposal.partnerAvatar || "SS"}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-white truncate">
                                {proposal.partnerName}
                              </h3>
                              <BadgeCheck size={14} className="text-zinc-300 shrink-0" />
                            </div>
                            <span className="text-[11px] text-zinc-400 font-mono block">
                              Received {new Date(proposal.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
                            isPending
                              ? "bg-white/10 text-white border-white/25"
                              : isAccepted
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                              : isScheduled
                              ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/25"
                              : isCompleted
                              ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                              : "bg-red-500/10 text-red-300 border-red-500/20"
                          }`}
                        >
                          {isPending ? "Pending Review" : proposal.status}
                        </span>
                      </div>

                      {/* 2-Way Barter Reciprocal Box */}
                      <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                          {/* What They Offer */}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                              They Teach You
                            </span>
                            <strong className="text-xs font-semibold text-white line-clamp-2 mt-0.5">
                              {proposal.requestSkill}
                            </strong>
                          </div>

                          {/* What You Teach */}
                          <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                              In Exchange For
                            </span>
                            <strong className="text-xs font-semibold text-zinc-200 line-clamp-2 mt-0.5">
                              {proposal.offerSkill}
                            </strong>
                          </div>
                        </div>

                        {/* Format & Proposed Slot */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06] text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Video size={13} className="text-zinc-400 shrink-0" />
                            <span className="text-[11px] font-medium">{proposal.format}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <Clock size={13} className="text-zinc-400 shrink-0" />
                            <span className="text-[11px] font-medium">{proposal.slot}</span>
                          </div>
                        </div>

                        {/* Notes */}
                        {proposal.notes && (
                          <p className="text-xs text-zinc-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] italic leading-relaxed">
                            "{proposal.notes}"
                          </p>
                        )}

                        {/* Scheduled Slot / Live Room details */}
                        {isScheduled && proposal.roomUrl && (
                          <div className="p-3 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                                Live Session Room Ready
                              </span>
                              <span className="text-xs text-white truncate block font-mono">
                                {proposal.scheduledTime || proposal.slot}
                              </span>
                            </div>
                            <a
                              href={proposal.roomUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-colors flex items-center gap-1.5 shrink-0 shadow-md"
                            >
                              <Video size={13} />
                              <span>Join Room</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Inline Schedule Time Input */}
                      {schedulingProposalId === proposal.id && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 flex flex-col sm:flex-row items-center gap-2 animate-in fade-in">
                          <div className="flex-1 w-full">
                            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                              Confirm Barter Time Slot
                            </label>
                            <input
                              type="text"
                              value={customSlotInput}
                              onChange={(e) => setCustomSlotInput(e.target.value)}
                              placeholder="e.g. Tomorrow · 6:00 PM EST"
                              className="w-full bg-black/70 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-white/40"
                            />
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-4">
                            <button
                              type="button"
                              onClick={() => handleScheduleSubmit(proposal.id)}
                              className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
                            >
                              Confirm Slot
                            </button>
                            <button
                              type="button"
                              onClick={() => setSchedulingProposalId(null)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 mt-4 border-t border-white/[0.06]">
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              acceptBarterProposal(proposal.id);
                              toast.success(`🎉 Proposal from ${proposal.partnerName} accepted! Schedule your session slot.`);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex-1 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Check size={14} className="stroke-[2.5]" />
                            <span>Accept Swap</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              declineBarterProposal(proposal.id);
                              toast.info(`Proposal from ${proposal.partnerName} declined.`);
                            }}
                            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {isAccepted && !schedulingProposalId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSchedulingProposalId(proposal.id);
                            setCustomSlotInput(proposal.slot || "Tomorrow · 6:00 PM EST");
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex-1 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Calendar size={14} />
                          <span>Schedule Session</span>
                        </button>
                      )}

                      {isScheduled && (
                        <button
                          type="button"
                          onClick={() => {
                            completeBarterSwap(proposal.id);
                            toast.success(`🎉 Swap completed with ${proposal.partnerName}! +1.0 Swap Credit & +50 Karma Points earned.`);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors flex-1 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Check size={14} className="stroke-[2.5]" />
                          <span>Complete & Endorse</span>
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 flex-1">
                          <Check size={14} /> Swap Completed (+1 Credit)
                        </span>
                      )}

                      {/* Message / Chat button */}
                      <button
                        type="button"
                        onClick={() => navigate(`/messages?pro=${proposal.partnerId}`)}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Direct Message"
                      >
                        <MessageCircle size={14} />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/15 flex items-center justify-center mb-1 shadow-inner">
                <Inbox size={28} className="text-white stroke-[1.5]" />
              </div>
              <h3 className="text-base font-bold text-white">No Proposals In This View</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                {inboxFilter === "pending"
                  ? "You have reviewed all incoming proposals. New barter offers from peers will appear here."
                  : "No proposals match your current filter selection."}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function Community() {
  const [composerOpen, setComposerOpen] = useState(false); const [type, setType] = useState("Ask Question"); const [draft, setDraft] = useState(""); const [posts, setPosts] = useState<{ id: string; type: string; text: string; saved: boolean }[]>([]);
  const add = () => { if (!draft.trim()) { toast.error("Write a short prompt, question, project update, or achievement first."); return; } setPosts((current) => [{ id: `post-${Date.now()}`, type, text: draft.trim(), saved: false }, ...current]); setDraft(""); setComposerOpen(false); toast.success("Your post has been published to the community feed!"); };
  return <div className="community-page"><section className="page-hero"><p className="page-kicker">COMMUNITY</p><h1>Share the work behind the <em>skill.</em></h1><p>Ask focused questions, share a project, celebrate learning progress, and trade useful context with people who are building too.</p><div className="page-hero-actions"><button className="primary-action" onClick={() => { setType("Create Post"); setComposerOpen(true); }}><Plus size={16} /> Create post</button><button className="secondary-action" onClick={() => { setType("Ask Question"); setComposerOpen(true); }}>Ask question</button><button className="secondary-action" onClick={() => { setType("Share Project"); setComposerOpen(true); }}>Share project</button></div></section>{composerOpen ? <section className="content-panel community-composer"><div><p className="page-kicker">{type.toUpperCase()}</p><h2>Share a useful signal.</h2></div><button className="icon-action" onClick={() => setComposerOpen(false)} aria-label="Close composer"><X size={16} /></button><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={type === "Ask Question" ? "What would help you move forward?" : "Describe the idea, project, progress, or resource..."} /><div className="community-composer-actions"><div>{["Ask Question", "Share Project", "Share Achievement", "Share Resource"].map((item) => <button key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}>{item}</button>)}</div><button className="primary-action" onClick={add}>Share <Send size={15} /></button></div></section> : null}<section className="community-feed"><div className="section-heading"><div><p className="page-kicker">YOUR ACTIVITY</p><h2>Begin with a useful post.</h2></div><span>Real-time signals from creators and learners across the network.</span></div>{posts.length ? posts.map((post) => <article key={post.id} className="community-post"><span className="post-mark">SS</span><div><p>{post.type.toUpperCase()} · YOU</p><h3>{post.text}</h3><div><button onClick={() => toast.success("Post appreciated!")}><Heart size={15} /> Appreciate</button><button onClick={() => toast.info("Comments thread opened.")}><MessageCircle size={15} /> Comment</button><button onClick={() => setPosts((current) => current.map((item) => item.id === post.id ? { ...item, saved: !item.saved } : item))}><Bookmark size={15} fill={post.saved ? "currentColor" : "none"} /> {post.saved ? "Saved" : "Save"}</button><button onClick={() => toast.success("Share link copied to clipboard!")}>Share</button><button onClick={() => toast.success("Thank you for helping keep our community safe. Report submitted.")}>Report</button></div></div></article>) : <div className="empty-state"><UsersRound size={25} /><h3>Community starts with a useful question.</h3><p>Use the composer to ask, share a project, post a learning signal, or add a resource. No fabricated community activity is shown here.</p><button className="primary-action" onClick={() => { setType("Ask Question"); setComposerOpen(true); }}>Ask your first question</button></div>}</section></div>;
}

export function Profile() {
  const { account, updateProfile } = useAccount(); const navigate = useNavigation(); const [editing, setEditing] = useState(new URLSearchParams(window.location.search).has("edit")); const [name, setName] = useState(account?.name ?? ""); const [location, setLocation] = useState(account?.location ?? ""); const [languages, setLanguages] = useState(account?.languages.join(", ") ?? "English"); const [mode, setMode] = useState<string>(account?.mode ?? "both"); const [sessionPrice, setSessionPrice] = useState(account?.sessionPrice ?? 14);
  const save = () => { updateProfile({ name, location, languages: languages.split(",").map((item) => item.trim()).filter(Boolean), mode: mode as "learn" | "teach" | "both", sessionPrice: Math.max(12, Math.round(Number(sessionPrice) || 12)) }); setEditing(false); toast.success("Your profile details were updated."); };
  return <div className="profile-workspace"><section className="profile-workspace-hero card-3d"><UserAvatar src={account?.avatar} name={account?.name} size="xl" rounded="3xl" /><div><p className="page-kicker">MY PROFILE</p><h1>{account?.name ?? "SkillSwap member"}</h1><p>{account?.location || "Add a location"} · {account?.languages.join(" / ") || "English"}</p><div className="profile-role-chips"><span>{mode === "both" ? "Learner & teacher" : mode === "learn" ? "Learner" : "Teacher"}</span><span>★ {account?.sessionPrice ?? 14} pts/session</span><span><ShieldCheck size={13} /> Profile controls ready</span></div></div><button className="secondary-action" onClick={() => setEditing((value) => !value)}>{editing ? "Cancel" : "Edit profile"}</button></section>{editing ? <section className="content-panel profile-editor"><div className="form-grid"><label>Full name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City" /></label><label>Languages<input value={languages} onChange={(event) => setLanguages(event.target.value)} placeholder="English, Hindi" /></label><label>Account use<select value={mode} onChange={(event) => setMode(event.target.value)}><option value="learn">I want to learn</option><option value="teach">I want to teach</option><option value="both">Both</option></select></label><label>Session rate (Skill Points)<input type="number" min="12" step="1" value={sessionPrice} onChange={(event) => setSessionPrice(Math.max(12, parseInt(event.target.value) || 12))} /><small style={{ color: "#a1a1aa" }}>Minimum 12 Points per 60-min session.</small></label></div><button className="primary-action" onClick={save}>Save profile <Check size={16} /></button></section> : null}<section className="profile-workspace-grid"><article className="content-panel"><p className="page-kicker">MY SKILLS</p><h2>Learn and teach without a hard boundary.</h2><div className="profile-skill-columns"><div><span>Learning</span>{account?.learnSkills.length ? account.learnSkills.map((skill) => <button key={skill} onClick={() => navigate(`/skills/${slug(skill)}`)}>{skill}<ArrowRight size={13} /></button>) : <p>No learning skills yet.</p>}</div><div><span>Teaching</span>{account?.teachSkills.length ? account.teachSkills.map((skill) => <button key={skill} onClick={() => navigate(`/skills/${slug(skill)}`)}>{skill}<ArrowRight size={13} /></button>) : <p>No teaching skills yet.</p>}</div></div></article><article className="content-panel"><p className="page-kicker">QUALIFICATIONS & PORTFOLIO</p><h2>Show claims with context.</h2><p className="panel-copy">Add professional details and portfolio evidence only when you can explain the source and verification scope clearly.</p><div className="profile-quick-links"><button onClick={() => toast.info("Qualification editing is active on your profile.")}><BadgeCheck size={16} /> My qualifications</button><button onClick={() => toast.info("Portfolio editing is active on your profile.")}><Library size={16} /> My portfolio</button><button onClick={() => toast.info("Accomplishments are visible when you add your first verified item.")}><Sparkles size={16} /> My accomplishments</button></div></article></section></div>;
}

export function Settings() {
  const { settings, updateSettings } = useAccount(); const [section, setSection] = useState("Account"); const sections = ["Account", "Notifications", "Privacy", "Security", "Learning Preferences", "Teaching Preferences", "Language", "Accessibility", "Payments & Skill Points", "Connected Accounts", "Help"];
  const toggleNotice = (key: string) => updateSettings({ notifications: { ...settings.notifications, [key]: !settings.notifications[key] } });
  const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => <button className={checked ? "setting-toggle on" : "setting-toggle"} onClick={onChange}><span><strong>{label}</strong><small>{checked ? "On" : "Off"}</small></span><i /></button>;
  return <div className="settings-page"><section className="page-hero"><p className="page-kicker">SETTINGS</p><h1>Make SkillSwap feel <em>right for you.</em></h1><p>Adjust notifications, privacy, learning preferences, and account controls without losing the flow of the product.</p></section><section className="settings-layout"><aside className="settings-sidebar">{sections.map((item) => <button key={item} className={section === item ? "active" : ""} onClick={() => setSection(item)}>{item}</button>)}</aside><div className="settings-panel"><p className="page-kicker">{section.toUpperCase()}</p><h2>{section}</h2>{section === "Notifications" ? <div className="settings-stack">{Object.keys(settings.notifications).map((key) => <Toggle key={key} label={key} checked={settings.notifications[key]} onChange={() => toggleNotice(key)} />)}</div> : null}{section === "Privacy" ? <div className="settings-stack"><div className="setting-row"><div><strong>Profile visibility</strong><small>Choose who can discover your public profile details.</small></div><select value={settings.profileVisibility} onChange={(event) => updateSettings({ profileVisibility: event.target.value as "Public" | "Members only" | "Private" })}><option>Public</option><option>Members only</option><option>Private</option></select></div><Toggle label="Show online status" checked={settings.showOnline} onChange={() => updateSettings({ showOnline: !settings.showOnline })} /><Toggle label="Show learning activity" checked={settings.showLearning} onChange={() => updateSettings({ showLearning: !settings.showLearning })} /><Toggle label="Show teaching activity" checked={settings.showTeaching} onChange={() => updateSettings({ showTeaching: !settings.showTeaching })} /><div className="setting-row"><div><strong>Allow messages from</strong><small>Control who can begin a conversation.</small></div><select value={settings.allowMessages} onChange={(event) => updateSettings({ allowMessages: event.target.value as typeof settings.allowMessages })}><option>Everyone</option><option>Members</option><option>People I've interacted with</option></select></div></div> : null}{section === "Accessibility" ? <div className="settings-stack"><Toggle label="High contrast" checked={settings.highContrast} onChange={() => updateSettings({ highContrast: !settings.highContrast })} /><div className="setting-row"><div><strong>Text size</strong><small>Increase reading comfort while keeping the interface structured.</small></div><div className="segmented">{(["default", "large", "larger"] as const).map((item) => <button key={item} className={settings.textScale === item ? "active" : ""} onClick={() => updateSettings({ textScale: item })}>{item}</button>)}</div></div><div className="setting-note"><Eye size={18} /> Keyboard focus indicators and screen-reader labels remain active throughout the product.</div></div> : null}{section === "Payments & Skill Points" ? <div className="settings-stack"><div className="setting-card"><Gem size={19} /><div><strong>Skill Point wallet</strong><small>View your balance, optional INR-denominated point packs, and transaction history.</small></div><Link href="/wallet" className="secondary-action">Open wallet <ArrowRight size={14} /></Link></div><div className="setting-card"><CircleHelp size={19} /><div><strong>Payment methods & invoices</strong><small>Secure UPI direct bank settlement and invoice receipts are managed under Payments.</small></div><button className="secondary-action" onClick={() => toast.info("Payment methods are active and secured.")}>Manage</button></div></div> : null}{section === "Security" ? <div className="settings-stack"><div className="setting-card"><LockKeyhole size={19} /><div><strong>Password & sign-in</strong><small>Manage your password and active multi-factor devices securely.</small></div><Link href="/login" className="secondary-action">Account access</Link></div>{["Two-factor authentication", "Login activity", "Active sessions", "Sign out of all devices", "Account recovery"].map((item) => <button key={item} className="settings-action" onClick={() => toast.info(`${item} preferences updated.`)}>{item}<ChevronRight size={15} /></button>)}</div> : null}{["Account", "Learning Preferences", "Teaching Preferences", "Language", "Connected Accounts", "Help"].includes(section) ? <div className="settings-stack"><div className="setting-note"><Settings2 size={19} /><div><strong>{section} controls</strong><p>Update your learning speed, session pacing, and language settings.</p></div></div><button className="primary-action" onClick={() => toast.success(`${section} preferences saved successfully.`)}>Save preferences <Check size={15} /></button></div> : null}</div></section></div>;
}

export function Help() { const [query, setQuery] = useState(""); const topics = ["Account", "Skill Points", "Learning", "Teaching", "Booking", "Messaging", "Payments", "Safety", "Technical Issues"].filter((item) => item.toLowerCase().includes(query.toLowerCase())); return <div className="help-page"><section className="page-hero"><p className="page-kicker">HELP CENTER</p><h1>What can we help you <em>with?</em></h1><div className="discover-search bg-black border border-white/20 rounded-2xl"><Search size={19} /><input style={{ border: "0 none transparent", borderWidth: 0, borderStyle: "none", outline: "none", boxShadow: "none", background: "transparent", backgroundColor: "transparent", WebkitAppearance: "none" }} className="search-clean-input border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search help topics" /></div></section><section className="help-grid">{topics.map((topic) => <button key={topic} onClick={() => toast.info(`${topic} help is available as an in-product prototype panel.`)}><CircleHelp size={20} /><strong>{topic}</strong><p>Guidance, next steps, and clear routes for this part of SkillSwap.</p><ArrowRight size={15} /></button>)}</section></div>; }
export function About() {
  const navigate = useNavigation();
  return (
    <div className="about-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <PageSEO
        title="About SkillSwap & Barter Manifesto"
        description="Learn how SkillSwap enables zero-fiat knowledge barter, reciprocal peer mentorship, and TimeBank credits."
        canonicalPath="/about"
      />
      <section className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col items-start gap-4">
        <p className="page-kicker">ABOUT SKILLSWAP</p>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Teach what you know. Learn what you <span className="text-white underline">want.</span>
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl leading-relaxed">
          SkillSwap is designed around a simple reciprocal loop: discover, connect, learn, teach, earn, and grow. The platform makes every exchange legible without forcing users into one permanent role.
        </p>
        <button className="primary-action text-xs px-6 py-3 mt-2" onClick={() => navigate("/discover")}>
          Explore SkillSwap <ArrowRight size={15} />
        </button>
      </section>
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {["Discover", "Connect", "Learn", "Teach", "Earn", "Grow"].map((item, index) => (
          <article key={item} className="glass-panel p-5 rounded-2xl flex flex-col gap-2">
            <span className="text-xs font-mono font-bold text-white">0{index + 1}</span>
            <h2 className="text-base font-bold text-white">{item}</h2>
            <p className="text-xs text-gray-400 leading-normal">
              One purposeful step in a reciprocal learning economy.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
