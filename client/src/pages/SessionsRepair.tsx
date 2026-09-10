import { ArrowRight, Calendar, Clock, MessageCircle, Sparkles, Star, Video, UsersRound } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { professionals, useSkillSwap } from "@/contexts/SkillSwapContext";
import { PageSEO } from "@/components/PageSEO";

export default function SessionsRepair() {
  const [, navigate] = useLocation();
  const { state, addReviewFeedback } = useSkillSwap();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const submitFeedback = (sessionId: string, professionalId: string) => {
    if (addReviewFeedback(sessionId, professionalId, draft)) {
      setDraft("");
      setFeedbackFor(null);
    }
  };

  const upcomingSessions = state.sessions.filter((s) => s.status === "upcoming");
  const pastSessions = state.sessions.filter((s) => s.status !== "upcoming");
  const visibleSessions = tab === "upcoming" ? upcomingSessions : pastSessions;

  return (
    <div className="sessions-page max-w-[1280px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10 relative">
      {/* Ambient background glow orbs */}
      <div className="glow-orb-mono w-96 h-96 -top-20 -left-20 opacity-12 pointer-events-none" />
      <div className="glow-orb-mono w-96 h-96 top-60 -right-20 opacity-8 pointer-events-none" />

      <PageSEO
        title="My Sessions & Schedule"
        description="Manage your scheduled skill-swap sessions, access live video rooms, and review completed peer learning exchanges."
        canonicalPath="/sessions"
      />
      {/* Header & Tabs */}
      <section className="flex flex-col gap-6 relative z-10">
        <header>
          <p className="page-kicker">MY LEARNING</p>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">My Sessions</h1>
          <p className="text-base text-gray-400 max-w-2xl">
            Manage your upcoming learning schedule, join live video rooms, and review past interactions.
          </p>
        </header>

        {/* Custom Stitch Tabs */}
        <div className="flex gap-6 border-b border-white/10 pb-2">
          <button
            className={`pb-2 px-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
              tab === "upcoming"
                ? "border-white text-white font-bold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setTab("upcoming")}
          >
            Upcoming ({upcomingSessions.length})
          </button>
          <button
            className={`pb-2 px-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all ${
              tab === "past"
                ? "border-white text-white font-bold"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
            onClick={() => setTab("past")}
          >
            Past Sessions ({pastSessions.length})
          </button>
        </div>
      </section>

      {/* Sessions Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        {visibleSessions.length ? (
          visibleSessions.map((session) => {
            const professional = professionals.find((item) => item.id === session.professionalId);
            const feedback = state.reviewFeedback.find((item) => item.sessionId === session.id);

            return (
              <article
                key={session.id}
                className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row gap-5 sm:gap-6 relative overflow-hidden group hover:border-white/40 transition-all duration-300 shadow-xl"
              >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shrink-0 flex items-center justify-center text-xl font-bold shadow-lg border border-white/10 text-white"
                  style={{ background: professional?.accent || "#000000" }}
                >
                  {professional?.avatar ?? "SS"}
                </div>

                <div className="flex flex-col flex-1 justify-between gap-4 z-10">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
                        {session.points > 0 ? "⚡ " + session.points + " pts held" : "Free Consultation"}
                      </span>
                      <div className="flex items-center text-gray-400 text-sm font-medium">
                        <Clock size={15} className="mr-1.5 text-white" />
                        {session.time}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1">{session.skill}</h3>
                    <p className="text-sm text-gray-300">
                      With <strong className="text-white">{professional?.name ?? "Mentor"}</strong> · {professional?.title ?? "Expert"}
                    </p>

                    {feedback ? (
                      <div className="mt-2 inline-flex items-center gap-1 text-xs text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-md">
                        <Star size={12} className="fill-white text-white" /> Private feedback saved
                      </div>
                    ) : null}
                  </div>

                  {feedbackFor === session.id ? (
                    <div className="inline-editor session-feedback-editor mt-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Share private, constructive feedback for this mentor..."
                        rows={2}
                      />
                      <div className="flex gap-2 mt-2">
                        <button className="primary-action text-xs bg-white text-black font-bold hover:bg-zinc-200" onClick={() => submitFeedback(session.id, session.professionalId)}>
                          Save Feedback
                        </button>
                        <button className="secondary-action text-xs" onClick={() => { setFeedbackFor(null); setDraft(""); }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                    <button
                      className="secondary-action text-xs px-3 py-2 flex items-center gap-1.5"
                      onClick={() => navigate(`/messages?pro=${session.professionalId}`)}
                    >
                      <MessageCircle size={14} /> Open Chat
                    </button>

                    {tab === "upcoming" ? (
                      <button
                        className="primary-action text-xs px-3 py-2 flex items-center gap-1.5 bg-white text-black font-bold hover:bg-zinc-200"
                        onClick={() => navigate(`/messages?pro=${session.professionalId}`)}
                      >
                        <Video size={14} /> Join Video Room
                      </button>
                    ) : null}

                    {!feedback && feedbackFor !== session.id ? (
                      <button
                        className="secondary-action text-xs px-3 py-2"
                        onClick={() => setFeedbackFor(session.id)}
                      >
                        Leave Feedback
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Calendar size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">
              {tab === "upcoming" ? "No upcoming sessions" : "No past sessions found"}
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              {tab === "upcoming"
                ? "Connect with an expert mentor, book a 1-on-1 consultation or standard session, and accelerate your learning journey."
                : "Your completed learning interactions and peer reviews will show here."}
            </p>
            <button
              style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
              className="primary-action discover-mentors-btn mt-2 bg-white text-black hover:bg-zinc-200 border border-white font-extrabold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
              onClick={() => navigate("/professionals")}
            >
              <span style={{ color: "#000000", fontWeight: 900 }}>Discover Mentors</span>
              <ArrowRight size={16} className="text-black" style={{ color: "#000000", stroke: "#000000" }} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
