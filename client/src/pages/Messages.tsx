import { ArrowLeft, CalendarDays, ChevronDown, Mic, MicOff, MoreHorizontal, Paperclip, Phone, Pin, RefreshCw, ScreenShare, ScreenShareOff, Search, Send, ShieldAlert, Sparkles, SwitchCamera, Video, VideoOff, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { getContextualQuickQuestions, professionals, useSkillSwap, type ChatAction } from "@/contexts/SkillSwapContext";
import { getSessionOptions, type SessionOption } from "@/lib/sessionOptions";
import { animateStaggerEntrance } from "@/lib/animations";
import { PageSEO } from "@/components/PageSEO";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useNativeMediaStream } from "@/hooks/useNativeMediaStream";
import { NativeCameraFeed } from "@/components/video/NativeCameraFeed";

type BookingDraft = { time: string; option: SessionOption };

const CONVO_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "sessions", label: "Bookings" },
];

export default function Messages() {
  const [, navigate] = useLocation();
  const {
    state,
    selectProfessional,
    sendMessage,
    createProposal,
    respondToProposal,
    book,
    rescheduleSession,
    cancelSession,
    setConversationMuted,
    setConversationBlocked,
    clearConversation,
    reportConversation,
    recordCall,
  } = useSkillSwap();
  const [convoFilter, setConvoFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState("");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const [mobileList, setMobileList] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [callKind, setCallKind] = useState<"audio" | "video" | null>(null);
  const [callStartedAt, setCallStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Native camera & mic stream for in-chat video calls
  const videoMedia = useNativeMediaStream({
    autoStart: false,
    video: true,
    audio: true,
  });
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDescription, setReportDescription] = useState("");
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const currentId = new URLSearchParams(window.location.search).get("pro") ?? state.selectedProfessionalId;
  const selected = professionals.find((professional) => professional.id === currentId) ?? professionals[0];
  const safety = state.conversationSafety[selected.id] ?? { muted: false, blocked: false };
  const activeSession = state.sessions.find((session) => session.professionalId === selected.id && session.status === "upcoming");
  const sessionOptions = useMemo(() => getSessionOptions(selected), [selected]);
  const selectedOption = sessionOptions.find((option) => option.minutes === 60) ?? sessionOptions[sessionOptions.length - 1]!;

  useEffect(() => {
    if (state.selectedProfessionalId !== selected.id) selectProfessional(selected.id);
  }, [state.selectedProfessionalId, selectProfessional, selected.id]);
  useEffect(() => {
    if (!callKind) return;
    const timer = window.setInterval(() => setElapsed(Math.max(0, Math.floor((Date.now() - callStartedAt) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, [callKind, callStartedAt]);

  const conversations = useMemo(() => {
    let list = professionals.filter(
      (professional) =>
        professional.name.toLowerCase().includes(search.toLowerCase()) ||
        professional.primarySkill.toLowerCase().includes(search.toLowerCase())
    );

    if (convoFilter === "active") {
      const activeList = list.filter((p) => {
        const hasMessages = state.messages.some((m) => m.professionalId === p.id);
        const isOnline = p.availability.includes("today");
        return hasMessages || isOnline;
      });
      if (activeList.length) list = activeList;
    } else if (convoFilter === "sessions") {
      const sessionList = list.filter((p) =>
        state.sessions.some((s) => s.professionalId === p.id && s.status === "upcoming")
      );
      if (sessionList.length) {
        list = sessionList;
      } else {
        const anySessionList = list.filter((p) =>
          state.sessions.some((s) => s.professionalId === p.id)
        );
        if (anySessionList.length) list = anySessionList;
      }
    }

    return list.slice(0, 8);
  }, [search, convoFilter, state.messages, state.sessions]);
  const messages = state.messages.filter((message) => message.professionalId === selected.id && (!safety.clearedAt || message.timestamp > safety.clearedAt));
  const visibleMessages = messageSearch.trim() ? messages.filter((message) => message.text.toLowerCase().includes(messageSearch.toLowerCase())) : messages;
  const quickQuestions = useMemo(() => getContextualQuickQuestions(selected), [selected]);
  const isTyping = state.typingProfessionalIds.includes(selected.id);

  useEffect(() => {
    feedRef.current?.scrollTo?.({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleMessages.length, isTyping]);

  const submit = () => {
    if (!draft.trim() || safety.blocked) return;
    sendMessage(selected.id, draft.trim(), attachment || undefined);
    setDraft("");
    setAttachment("");
  };
  const openBooking = (minutes = 60, time = selected.slots[0]) => {
    const option = sessionOptions.find((item) => item.minutes === minutes) ?? selectedOption;
    setBookingDraft({ option, time });
  };
  const confirmBooking = () => {
    if (!bookingDraft) return;
    if (!book(selected.id, bookingDraft.time, bookingDraft.option.points, selected.primarySkill)) {
      toast.error(`You need ${bookingDraft.option.points - state.wallet} more Skill Points for this session.`);
      return;
    }
    setBookingDraft(null);
    toast.success("Session reserved locally. Your Points are held in the wallet.");
  };
  const proposal = () => {
    createProposal(selected.id, { skill: selected.primarySkill, duration: "60 minutes", time: selected.slots[0], points: selected.price });
    setProposalOpen(false);
  };
  const actOnReply = (chatAction: ChatAction) => {
    if (chatAction.type === "book") { openBooking(chatAction.minutes ?? 60); return; }
    if (chatAction.type === "availability") { navigate(`/professionals/${selected.id}?tab=availability`); return; }
    if (chatAction.type === "qualifications" || chatAction.type === "portfolio") { navigate(`/professionals/${selected.id}?tab=${chatAction.type}`); return; }
    if (chatAction.type === "wallet") { navigate("/wallet"); return; }
    if (chatAction.type === "teach") { navigate("/teach"); return; }
    if (chatAction.type === "reschedule") { setRescheduleOpen(true); return; }
    if (chatAction.type === "cancel") { setCancelConfirm(true); }
  };
  const startCall = (kind: "audio" | "video") => {
    setCallStartedAt(Date.now());
    setElapsed(0);
    setCallKind(kind);
    setMenuOpen(false);
    if (kind === "video") {
      videoMedia.start();
    }
  };
  const endCall = () => {
    if (!callKind) return;
    videoMedia.stop();
    const duration = Math.max(1, Math.floor((Date.now() - callStartedAt) / 1000));
    recordCall(selected.id, callKind, duration);
    const m = Math.floor(duration / 60);
    const s = duration % 60;
    const durStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
    sendMessage(selected.id, `${callKind === "video" ? "📹 1:1 Video Call" : "📞 Audio Call"} ended · Duration: ${durStr}`);
    toast.success(`${callKind === "video" ? "Video" : "Audio"} call ended · Duration: ${durStr} recorded`);
    setCallKind(null);
  };
  const submitReport = () => {
    reportConversation(selected.id, reportReason, reportDescription.trim());
    setReportDescription("");
    setReportOpen(false);
    setMenuOpen(false);
  };
  const confirmReschedule = (time: string) => {
    if (!activeSession || !rescheduleSession(activeSession.id, time)) return;
    toast.success(`Session rescheduled locally to ${time}.`);
    setRescheduleOpen(false);
  };
  const confirmCancellation = () => {
    if (!activeSession || !cancelSession(activeSession.id)) return;
    toast.success(`${activeSession.points} Skill Points were released to your local wallet.`);
    setCancelConfirm(false);
  };

  const convoListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (convoListRef.current) {
      const items = convoListRef.current.querySelectorAll(".anime-convo-item");
      animateStaggerEntrance(items, 35, 10);
    }
  }, [search]);

  return (
    <div className="messages-workspace max-w-[1400px] mx-auto h-[calc(100dvh-10.5rem)] md:h-[calc(100vh-8rem)] flex gap-6">
      <PageSEO
        title="Messages & Chat"
        description="Direct peer-to-peer barter messaging and live consultation rooms with verified skill exchange partners."
        canonicalPath="/messages"
      />
      {/* 1. Left Column: Conversations List */}
      <section
        className={`${
          mobileList ? "flex" : "hidden md:flex"
        } w-full md:w-80 shrink-0 glass-panel rounded-3xl p-4 flex-col gap-3 overflow-hidden`}
      >
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-2xl px-3 py-2">
          <Search size={15} className="text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
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
            className="search-clean-input w-full bg-transparent text-xs text-white focus:outline-none placeholder-zinc-500"
          />
        </div>

        <div className="w-full flex justify-center">
          <SegmentedControl
            label="Filter conversations"
            options={CONVO_FILTERS}
            value={convoFilter}
            onValueChange={setConvoFilter}
            className="w-full"
          />
        </div>

        <div className="flex justify-between items-center px-2 pt-1">
          <h1 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Messages</h1>
          <span className="text-[11px] text-white font-semibold">{conversations.length} active</span>
        </div>

        <div ref={convoListRef} className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 hide-scrollbar">
          {conversations.map((professional) => {
            const latest = state.messages
              .filter((message) => message.professionalId === professional.id)
              .slice(-1)[0];
            const status = state.conversationSafety[professional.id];
            const isSelected = professional.id === selected.id;

            return (
              <button
                key={professional.id}
                className={`anime-convo-item w-full p-3 rounded-2xl text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? "bg-white text-black font-semibold shadow-md border border-white"
                    : "hover:bg-white/5 text-zinc-300"
                }`}
                onClick={() => {
                  selectProfessional(professional.id);
                  navigate(`/messages?pro=${professional.id}`);
                  setMobileList(false);
                }}
              >
                <span
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow"
                  style={{ background: professional.accent }}
                >
                  {professional.avatar}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <strong
                      className={`text-xs truncate block ${
                        isSelected ? "text-black font-bold" : "text-white font-medium"
                      }`}
                    >
                      {professional.name}
                    </strong>
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        status?.muted
                          ? "bg-zinc-500"
                          : professional.availability.includes("today")
                          ? "bg-white"
                          : "bg-zinc-600"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-[11px] truncate m-0 ${
                      isSelected ? "text-white/90" : "text-zinc-400"
                    }`}
                  >
                    {status?.blocked
                      ? "Conversation blocked"
                      : latest?.text ?? "Start a conversation"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Middle Column: Active Chat Stream */}
      <section
        className={`${
          !mobileList ? "flex" : "hidden md:flex"
        } flex-1 min-w-0 glass-panel rounded-3xl flex flex-col overflow-hidden`}
      >
        {/* Chat Header */}
        <header className="p-4 border-b border-zinc-200/80 dark:border-white/10 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:text-gray-400 dark:hover:text-white"
              onClick={() => setMobileList(true)}
            >
              <ArrowLeft size={18} />
            </button>

            <button
              className="flex items-center gap-3 text-left group"
              onClick={() => setInfoOpen((v) => !v)}
            >
              <span
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow"
                style={{ background: selected.accent }}
              >
                {selected.avatar}
              </span>
              <div>
                <strong className="text-sm font-bold text-white group-hover:text-zinc-300 transition-colors block leading-tight">
                  {selected.name}
                </strong>
                <small className="text-[11px] text-gray-400 block mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                      selected.availability.includes("today") ? "bg-white" : "bg-zinc-600"
                    }`}
                  />
                  {safety.blocked
                    ? "Blocked"
                    : safety.muted
                    ? "Muted"
                    : selected.availability.includes("today")
                    ? "Online now"
                    : "Active recently"}{" "}
                  · {selected.title}
                </small>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              aria-label="Start audio call"
              onClick={() => startCall("audio")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
            >
              <Phone size={15} />
            </button>
            <button
              aria-label="Start video call"
              onClick={() => startCall("video")}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
            >
              <Video size={15} />
            </button>
            <button
              aria-label="Conversation actions"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors border border-white/10"
            >
              <MoreHorizontal size={15} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-black/95 backdrop-blur-xl border border-white/10 shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                <button
                  className="text-left px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5"
                  onClick={() => {
                    setConversationMuted(selected.id, !safety.muted);
                    setMenuOpen(false);
                  }}
                >
                  {safety.muted ? "Unmute conversation" : "Mute conversation"}
                </button>
                <button
                  className="text-left px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5"
                  onClick={() => setReportOpen(true)}
                >
                  Report conversation
                </button>
                <button
                  className="text-left px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-white/5"
                  onClick={() => setBlockConfirm(true)}
                >
                  {safety.blocked ? "Unblock conversation" : "Block conversation"}
                </button>
                <button
                  className="text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10"
                  onClick={() => setClearConfirm(true)}
                >
                  Clear conversation
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Pinned Info Banner */}
        <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-2 text-xs text-white">
          <Pin size={13} className="shrink-0 text-white" />
          <span className="truncate">
            Ask before booking—chat is free. Skill Points only move after you confirm a session.
          </span>
        </div>

        {/* In-chat search bar */}
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 bg-white/[0.01]">
          <Search size={13} className="text-gray-500" />
          <input
            value={messageSearch}
            onChange={(e) => setMessageSearch(e.target.value)}
            placeholder="Search this conversation"
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
            className="search-clean-input w-full bg-transparent text-xs text-white focus:outline-none placeholder-gray-600"
          />
        </div>

        {/* Message Feed */}
        <div ref={feedRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 hide-scrollbar">
          {visibleMessages.length ? (
            visibleMessages.map((message) => {
              const isLearner = message.sender === "learner";
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isLearner ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3.5 flex flex-col gap-1.5 ${
                      isLearner
                        ? "bg-white text-black rounded-tr-none font-medium shadow-md"
                        : "bg-white/10 text-white rounded-tl-none border border-white/10 shadow-sm"
                    }`}
                  >
                    {message.attachment && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-xs font-semibold">
                        <Paperclip size={12} /> {message.attachment}
                      </span>
                    )}

                    <p className="text-xs md:text-sm m-0 leading-relaxed">{message.text}</p>

                    {/* Proposal Card */}
                    {message.proposal && (
                      <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/15 flex flex-col gap-1.5 text-left">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                          Session Proposal
                        </span>
                        <strong className="text-xs text-white block">{message.proposal.skill}</strong>
                        <span className="text-[11px] text-gray-300">
                          {message.proposal.duration} · {message.proposal.time}
                        </span>
                        <b className="text-xs text-white font-bold">★ {message.proposal.points} Skill Points</b>

                        {message.proposal.status === "pending" ? (
                          <div className="flex gap-2 mt-2">
                            <button
                              className="primary-action text-xs px-3 py-1 bg-white text-black font-bold hover:bg-zinc-200"
                              onClick={() => respondToProposal(message.id, true)}
                            >
                              Accept
                            </button>
                            <button
                              className="secondary-action text-xs px-3 py-1"
                              onClick={() => respondToProposal(message.id, false)}
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <small className="text-[10px] text-zinc-500 dark:text-gray-400 mt-1">
                            {message.proposal.status === "accepted"
                              ? "✓ Session confirmed"
                              : "Session declined"}
                          </small>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {message.actions?.length ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {message.actions.map((act) => (
                          <button
                            key={`${message.id}-${act.type}-${act.label}`}
                            onClick={() => actOnReply(act)}
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/15 transition-all shadow-xs"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <small
                      className={`text-[9px] ${
                        isLearner ? "text-zinc-600 self-end" : "text-gray-400 self-start"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      {isLearner && message.status ? ` · ${message.status}` : ""}
                    </small>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500 text-xs flex flex-col items-center gap-2">
              <Sparkles size={24} className="text-gray-600" />
              <span>Conversation cleared from your view. Start a new message when ready.</span>
            </div>
          )}

          {isTyping && !safety.blocked && (
            <div className="flex items-center gap-2 text-xs text-gray-400 italic">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce delay-200" />
              </span>
              <span>{selected.name.split(" ")[0]} is typing…</span>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        {!safety.blocked && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-white/10 hide-scrollbar">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() => sendMessage(selected.id, question)}
                className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white whitespace-nowrap transition-colors shrink-0 shadow-xs"
              >
                {question}
              </button>
            ))}
          </div>
        )}

        {/* Proposal Composer Drawer */}
        {proposalOpen && (
          <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center gap-4">
            <div>
              <p className="page-kicker">PROPOSE SESSION</p>
              <h4 className="text-sm font-bold text-white">
                {selected.primarySkill} · 60 minutes
              </h4>
              <p className="text-xs text-gray-300">
                {selected.slots[0]} · ★ {selected.price} points
              </p>
            </div>
            <div className="flex gap-2">
              <button className="primary-action text-xs px-4 bg-white text-black font-bold hover:bg-zinc-200" onClick={proposal}>
                Send Proposal <Send size={13} />
              </button>
              <button
                className="secondary-action text-xs px-3"
                onClick={() => setProposalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Chat Composer */}
        <footer className="p-3 border-t border-white/10 bg-white/[0.02] flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 shadow-xs">
            <textarea
              ref={inputRef}
              value={draft}
              disabled={safety.blocked}
              onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
              maxLength={2000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={
                safety.blocked
                  ? "You blocked this conversation."
                  : "Ask about skills, session format, or availability..."
              }
              rows={1}
              style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent" }}
              className="chat-input w-full bg-transparent text-xs text-white focus:outline-none placeholder-gray-500 resize-none min-h-[26px] border-none outline-none shadow-none focus:ring-0 focus:border-none focus:outline-none"
            />

            <label title="Attach file" className="cursor-pointer text-gray-400 hover:text-white p-1">
              <input
                disabled={safety.blocked}
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? "")}
              />
              <Paperclip size={16} />
            </label>

            <button
              onClick={submit}
              disabled={!draft.trim() || safety.blocked}
              className="p-2 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>

          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              {attachment && (
                <span className="text-[11px] text-white flex items-center gap-1 font-medium">
                  <Paperclip size={11} /> {attachment}
                  <button onClick={() => setAttachment("")} className="text-gray-400 hover:text-red-400">
                    <X size={11} />
                  </button>
                </span>
              )}
            </div>

            {!safety.blocked && (
              <button
                onClick={() => setProposalOpen((v) => !v)}
                className="text-xs text-white hover:underline flex items-center gap-1 font-semibold"
              >
                <CalendarDays size={13} /> Propose Session
              </button>
            )}
          </div>
        </footer>
      </section>

      {/* 3. Right Column: Mentor Profile & Booking Card */}
      {infoOpen && (
        <aside className="hidden xl:flex w-72 shrink-0 glass-panel rounded-3xl p-6 flex-col justify-between gap-6 overflow-y-auto hide-scrollbar">
          <div className="flex flex-col items-center text-center gap-3">
            <span
              className="w-16 h-16 rounded-3xl flex items-center justify-center font-bold text-white text-xl shadow-xl"
              style={{ background: selected.accent }}
            >
              {selected.avatar}
            </span>
            <div>
              <h3 className="text-base font-bold text-white">{selected.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{selected.title}</p>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 font-semibold">
              {selected.experience}+ yrs listed · {selected.verified ? "Verified" : "Pending"}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                Next Availability
              </span>
              <button
                className="text-xs text-zinc-900 dark:text-white font-semibold flex items-center justify-between w-full hover:text-amber-600 dark:hover:text-amber-400"
                onClick={() => openBooking()}
              >
                <span>{selected.slots[0]}</span>
                <ChevronDown size={13} />
              </button>
            </div>

            <div>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                Specializations
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selected.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-gray-300 font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {state.calls.filter((c) => c.professionalId === selected.id).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/5">
                <span className="text-[10px] font-bold text-zinc-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Call History ({state.calls.filter((c) => c.professionalId === selected.id).length})
                </span>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                  {state.calls
                    .filter((c) => c.professionalId === selected.id)
                    .slice(0, 5)
                    .map((c) => {
                      const m = Math.floor(c.durationSeconds / 60);
                      const s = c.durationSeconds % 60;
                      const dur = m > 0 ? `${m}m ${s}s` : `${s}s`;
                      return (
                        <div key={c.id} className="flex justify-between items-center text-xs text-zinc-700 dark:text-zinc-300">
                          <span className="flex items-center gap-1.5">
                            {c.kind === "video" ? <Video size={12} className="text-emerald-400" /> : <Phone size={12} className="text-emerald-400" />}
                            <span className="capitalize">{c.kind} call</span>
                          </span>
                          <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{dur}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200/80 dark:border-white/10">
            <Link
              href={`/professionals/${selected.id}`}
              className="secondary-action text-xs justify-center"
            >
              View Full Profile
            </Link>
            <button
              className="primary-action text-xs justify-center bg-white text-black font-bold hover:bg-zinc-200 border border-white"
              onClick={() => openBooking()}
            >
              Book Session (★ {selected.price} pts)
            </button>
            {activeSession && (
              <button
                className="secondary-action text-xs justify-center"
                onClick={() => setRescheduleOpen(true)}
              >
                Manage Booked Session
              </button>
            )}
          </div>
        </aside>
      )}

      {/* Modals */}
      {/* Audio / Video Call Modal */}
      {/* Audio / Video Call Modal */}
      {callKind === "video" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-fade-in" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-4xl glass-panel rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 shadow-2xl border border-white/20 overflow-hidden flex flex-col gap-4 sm:gap-6 max-h-[96vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    1:1 Video Call with {selected.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Direct Mentor Consultation · {selected.primarySkill}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.15)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Call
                </span>
                <button onClick={endCall} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer" aria-label="Close video call">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Screen Share Stage (if active) */}
            {videoMedia.isScreenSharing && videoMedia.screenStream && (
              <div className="relative rounded-2xl bg-black border border-blue-500/40 overflow-hidden shadow-2xl p-2 flex flex-col items-center">
                <div className="w-full flex justify-between items-center px-2 py-1 mb-1 text-xs">
                  <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                    <ScreenShare size={14} /> Screen Share Live · High Definition
                  </span>
                  <button
                    onClick={videoMedia.stopScreenShare}
                    className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold hover:bg-red-500/40 cursor-pointer"
                  >
                    Stop Sharing
                  </button>
                </div>
                <NativeCameraFeed
                  stream={videoMedia.screenStream}
                  status="active"
                  videoEnabled={true}
                  audioEnabled={false}
                  isScreenShare={true}
                  allowFullscreen={true}
                  onStopScreenShare={videoMedia.stopScreenShare}
                  userName="Your Screen"
                  className="w-full aspect-video max-h-[360px]"
                />
              </div>
            )}

            {/* Video Feeds Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remote Partner Feed */}
              <div className="relative aspect-video rounded-2xl bg-[#141416] border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-inner">
                <span
                  className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center font-bold text-white text-2xl shadow-xl mb-3"
                  style={{ background: selected.accent }}
                >
                  {selected.avatar}
                </span>
                <span className="text-sm font-bold text-white">{selected.name} (Live)</span>
                <span className="text-xs text-zinc-400 mt-0.5">{selected.title}</span>
                <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] text-white backdrop-blur flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  {selected.name} · 1080p HD
                </div>
              </div>

              {/* Local Native Camera Feed */}
              <NativeCameraFeed
                stream={videoMedia.stream}
                status={videoMedia.status}
                errorMessage={videoMedia.errorMessage}
                videoEnabled={videoMedia.videoEnabled}
                audioEnabled={videoMedia.audioEnabled}
                audioLevel={videoMedia.audioLevel}
                hasMultipleCameras={videoMedia.hasMultipleCameras}
                userName="You"
                onToggleVideo={videoMedia.toggleVideo}
                onToggleAudio={videoMedia.toggleAudio}
                onSwitchCamera={videoMedia.switchCamera}
                onRetry={videoMedia.retry}
              />
            </div>

            {/* Controls Toolbar */}
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={videoMedia.toggleAudio}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    videoMedia.audioEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-red-500/20 border-red-500 text-red-400"
                  }`}
                  title={videoMedia.audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {videoMedia.audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
                </button>
                <button
                  onClick={videoMedia.toggleVideo}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    videoMedia.videoEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-red-500/20 border-red-500 text-red-400"
                  }`}
                  title={videoMedia.videoEnabled ? "Turn Camera Off" : "Turn Camera On"}
                >
                  {videoMedia.videoEnabled ? <Video size={16} /> : <VideoOff size={16} />}
                </button>
                {/* Screen Share Button */}
                <button
                  onClick={videoMedia.toggleScreenShare}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                    videoMedia.isScreenSharing
                      ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                  title={videoMedia.isScreenSharing ? "Stop Screen Sharing" : "Share Your Screen"}
                >
                  {videoMedia.isScreenSharing ? <ScreenShareOff size={16} /> : <ScreenShare size={16} />}
                  <span className="text-xs font-semibold hidden sm:inline">
                    {videoMedia.isScreenSharing ? "Stop Share" : "Share Screen"}
                  </span>
                </button>
                {videoMedia.hasMultipleCameras && (
                  <button
                    onClick={videoMedia.switchCamera}
                    className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                    title="Switch Camera (Flip)"
                  >
                    <SwitchCamera size={16} />
                  </button>
                )}
                <button
                  onClick={videoMedia.retry}
                  className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                  title="Reconnect Camera"
                >
                  <RefreshCw size={15} />
                </button>
              </div>

              <button
                onClick={endCall}
                style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
                className="primary-action px-6 py-2.5 rounded-xl font-bold text-xs bg-white text-black hover:bg-zinc-200 border border-white shadow-md cursor-pointer transition-all"
              >
                <span style={{ color: "#000000", fontWeight: 800 }}>End call</span>
              </button>
            </div>
          </div>
        </div>
      ) : callKind === "audio" ? (
        <div className="portfolio-modal call-modal text-center" role="dialog" aria-modal="true">
          <p className="page-kicker">LOCAL AUDIO CALL</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{selected.name}</h3>
          <span
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center font-bold text-white text-2xl shadow-xl my-4"
            style={{ background: selected.accent }}
          >
            {selected.avatar}
          </span>
          <p className="text-xs text-zinc-500 dark:text-gray-400 mb-2">
            Audio connection established
          </p>
          <div className="my-3 flex justify-center">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Connected · Audio Active
            </span>
          </div>
          <button className="primary-action text-xs justify-center mt-4 bg-white text-black font-bold hover:bg-zinc-200 border border-white" onClick={endCall}>
            End call
          </button>
        </div>
      ) : null}

      {/* Booking Modal */}
      {bookingDraft && (
        <div className="portfolio-modal checkout-modal" role="dialog" aria-modal="true">
          <button
            aria-label="Close chat booking confirmation"
            onClick={() => setBookingDraft(null)}
          >
            ×
          </button>
          <p className="page-kicker">CONFIRM BOOKING</p>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {selected.primarySkill} with {selected.name}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-gray-400">
            {bookingDraft.time} · {bookingDraft.option.minutes} minutes
          </p>

          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex justify-between items-center my-3">
            <div>
              <span className="text-xs text-zinc-500 dark:text-gray-400 block">Session Cost</span>
              <strong className="text-sm font-bold text-white">
                ★ {bookingDraft.option.points} Skill Points
              </strong>
            </div>
            <div>
              <span className="text-xs text-zinc-500 dark:text-gray-400 block">Your Balance</span>
              <strong className="text-sm font-bold text-zinc-900 dark:text-white">
                ★ {state.wallet} Skill Points
              </strong>
            </div>
          </div>

          {state.wallet >= bookingDraft.option.points ? (
            <div className="flex gap-3 mt-4">
              <button className="primary-action text-xs flex-1 bg-white text-black font-bold hover:bg-zinc-200 border border-white" onClick={confirmBooking}>
                Confirm booking
              </button>
              <button
                className="secondary-action text-xs flex-1"
                onClick={() => setBookingDraft(null)}
              >
                Go back
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <p className="text-xs text-red-400">
                You need {bookingDraft.option.points - state.wallet} more Points to book this session.
              </p>
              <button
                className="primary-action text-xs justify-center bg-white text-black font-bold hover:bg-zinc-200 border border-white"
                onClick={() => navigate("/wallet")}
              >
                Buy Points
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleOpen && activeSession && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close reschedule" onClick={() => setRescheduleOpen(false)}>
            ×
          </button>
          <p className="page-kicker">RESCHEDULE SESSION</p>
          <h3 className="text-xl font-bold text-white">Choose another listed time</h3>
          <p className="text-xs text-gray-400">
            Your {activeSession.skill} session is held for {activeSession.time}.
          </p>
          <div className="flex flex-col gap-2 my-4">
            {selected.slots.map((slot) => (
              <button
                key={slot}
                disabled={slot === activeSession.time}
                onClick={() => confirmReschedule(slot)}
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-left text-white hover:bg-white/10 transition-colors flex justify-between"
              >
                <span>{slot}</span>
                {slot === activeSession.time && <span className="text-gray-500">(Current)</span>}
              </button>
            ))}
          </div>
          <button
            className="secondary-action text-xs justify-center"
            onClick={() => setCancelConfirm(true)}
          >
            Cancel session instead
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelConfirm && activeSession && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close cancellation" onClick={() => setCancelConfirm(false)}>
            ×
          </button>
          <p className="page-kicker">CANCEL RESERVATION</p>
          <h3 className="text-xl font-bold text-white">Cancel this {activeSession.skill} session?</h3>
          <p className="text-xs text-gray-400">
            {activeSession.time} · {activeSession.points} Points will be released to your wallet.
          </p>
          <div className="flex gap-3 mt-4">
            <button className="primary-action text-xs flex-1 bg-white text-black font-bold hover:bg-zinc-200 border border-white" onClick={confirmCancellation}>
              Cancel session
            </button>
            <button
              className="secondary-action text-xs flex-1"
              onClick={() => setCancelConfirm(false)}
            >
              Keep session
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close report" onClick={() => setReportOpen(false)}>
            ×
          </button>
          <p className="page-kicker">REPORT CONVERSATION</p>
          <h3 className="text-xl font-bold text-white">Report {selected.name}</h3>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white"
          >
            {["Spam", "Harassment", "Inappropriate content", "Fraud", "Other"].map((item) => (
              <option key={item} value={item} className="bg-black text-white">
                {item}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Optional description..."
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value.slice(0, 500))}
            maxLength={500}
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white min-h-[90px]"
          />
          <button className="primary-action text-xs justify-center mt-2 bg-white text-black font-bold hover:bg-zinc-200 border border-white" onClick={submitReport}>
            Submit report
          </button>
        </div>
      )}

      {/* Block Modal */}
      {blockConfirm && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close block confirmation" onClick={() => setBlockConfirm(false)}>
            ×
          </button>
          <p className="page-kicker">BLOCK CONVERSATION</p>
          <h3 className="text-xl font-bold text-white">
            {safety.blocked ? `Unblock ${selected.name}?` : `Block ${selected.name}?`}
          </h3>
          <p className="text-xs text-gray-400">
            {safety.blocked
              ? "You will be able to receive messages again."
              : "You will no longer receive messages from this person."}
          </p>
          <div className="flex gap-3 mt-4">
            <button
              className="primary-action text-xs flex-1 bg-white text-black font-bold hover:bg-zinc-200 border border-white"
              onClick={() => {
                setConversationBlocked(selected.id, !safety.blocked);
                setBlockConfirm(false);
              }}
            >
              {safety.blocked ? "Unblock" : "Block"}
            </button>
            <button
              className="secondary-action text-xs flex-1"
              onClick={() => setBlockConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clear Modal */}
      {clearConfirm && (
        <div className="portfolio-modal" role="dialog" aria-modal="true">
          <button aria-label="Close clear confirmation" onClick={() => setClearConfirm(false)}>
            ×
          </button>
          <p className="page-kicker">CLEAR CONVERSATION</p>
          <h3 className="text-xl font-bold text-white">Clear messages?</h3>
          <p className="text-xs text-gray-400">
            This will remove visible local messages from your thread.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              className="primary-action text-xs flex-1 bg-white text-black font-bold hover:bg-zinc-200 border border-white"
              onClick={() => {
                clearConversation(selected.id);
                setClearConfirm(false);
              }}
            >
              Clear conversation
            </button>
            <button
              className="secondary-action text-xs flex-1"
              onClick={() => setClearConfirm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
