import { useState } from "react";
import { ArrowRight, Calendar, Check, Clock, Sparkles, Video, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { useSkillSwap, type Professional } from "@/contexts/SkillSwapContext";
import { useAccount } from "@/contexts/AccountContext";

interface SwapProposalModalProps {
  partner: Professional;
  isOpen: boolean;
  onClose: () => void;
  initialRequestSkill?: string;
  initialOfferSkill?: string;
}

export function SwapProposalModal({
  partner,
  isOpen,
  onClose,
  initialRequestSkill = "",
  initialOfferSkill = "",
}: SwapProposalModalProps) {
  const { proposeBarterSwap } = useSkillSwap();
  const { account } = useAccount();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [requestSkill, setRequestSkill] = useState(
    initialRequestSkill || partner.teachingSkills?.[0]?.skill || partner.primarySkill
  );
  const [offerSkill, setOfferSkill] = useState(
    initialOfferSkill || account?.teachSkills?.[0] || "Next.js & Frontend Architecture"
  );
  const [format, setFormat] = useState<
    "1 hr Live Video" | "2x 30-min Reviews" | "Async Code & Project Review"
  >("1 hr Live Video");
  const [selectedSlot, setSelectedSlot] = useState(partner.slots?.[0] || "Tomorrow · 6:00 PM");
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const myTeachSkills =
    account?.teachSkills && account.teachSkills.length > 0
      ? account.teachSkills
      : ["Next.js & React", "UI/UX Design Systems", "Python Data Analysis", "Product Copywriting"];

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      proposeBarterSwap({
        partnerId: partner.id,
        partnerName: partner.name,
        partnerAvatar: partner.avatar,
        partnerAccent: partner.accent,
        requestSkill,
        offerSkill,
        format,
        slot: selectedSlot,
        notes: customNote.trim() || undefined,
      });
      setIsSubmitting(false);
      toast.success(
        `🎉 Barter proposal sent to ${partner.name}! They will be notified to accept your swap terms.`
      );
      onClose();
      setStep(1);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl border border-white/15 flex flex-col gap-5 sm:gap-6">
        {/* Header & Steps */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Zap size={12} /> 1:1 Barter Deal Builder
              </span>
              <span className="text-xs text-gray-400">Step {step} of 5</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Propose Swap with {partner.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden flex">
          <div
            className="bg-white h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Modal Body Based on Step */}
        <div className="min-h-[260px] flex flex-col justify-center">
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  1. What do you want to learn from {partner.name}?
                </h3>
                <p className="text-xs text-gray-400">
                  Choose from their verified specialties or enter a specific topic.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(partner.teachingSkills || []).map((item) => (
                  <button
                    key={item.skill}
                    onClick={() => setRequestSkill(item.skill)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      requestSkill === item.skill
                        ? "bg-white/20 border-white text-white shadow-lg"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{item.skill}</p>
                      <span className="text-[10px] text-gray-400">{item.level} · {item.category}</span>
                    </div>
                    {requestSkill === item.skill && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-semibold text-gray-300">Or type custom skill topic:</label>
                <input
                  type="text"
                  value={requestSkill}
                  onChange={(e) => setRequestSkill(e.target.value)}
                  placeholder="e.g. Next.js App Router Architecture, Studio Lighting Basics"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  2. What skill will you teach in return?
                </h3>
                <p className="text-xs text-gray-400">
                  {partner.name} is seeking:{" "}
                  <b className="text-white">
                    {partner.seekingSkills?.map((s) => s.skill).join(", ") || "Tech & Design"}
                  </b>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {myTeachSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setOfferSkill(skill)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      offerSkill === skill
                        ? "bg-white/20 border-white text-white shadow-lg"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xs font-bold text-white">{skill}</span>
                    {offerSkill === skill && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-semibold text-gray-300">Or offer custom expertise:</label>
                <input
                  type="text"
                  value={offerSkill}
                  onChange={(e) => setOfferSkill(e.target.value)}
                  placeholder="e.g. 3D Blender Modeling, Copywriting, French Speaking"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  3. Select Barter Session Format
                </h3>
                <p className="text-xs text-gray-400">
                  Choose the interaction structure that suits both of your schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    title: "1 hr Live Video Session",
                    desc: "30-min you learn + 30-min you teach in one interactive video room.",
                    icon: Video,
                    val: "1 hr Live Video" as const,
                  },
                  {
                    title: "2x 30-min Focused Reviews",
                    desc: "Two separate focused sessions for deep-dive feedback on real projects.",
                    icon: Clock,
                    val: "2x 30-min Reviews" as const,
                  },
                  {
                    title: "Async Code & Project Review",
                    desc: "Detailed Loom video walkthrough and annotated PR/Figma feedback.",
                    icon: Sparkles,
                    val: "Async Code & Project Review" as const,
                  },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setFormat(item.val)}
                    className={`p-4 rounded-2xl text-left border transition-all flex items-start gap-3.5 ${
                      format === item.val
                        ? "bg-white/20 border-white text-white shadow-lg"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <item.icon size={20} className={format === item.val ? "text-white" : "text-gray-400"} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                    {format === item.val && <Check size={18} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  4. Choose a Preferred Time Slot
                </h3>
                <p className="text-xs text-gray-400">
                  {partner.name}'s timezone: <b className="text-white">{partner.timezone || "UTC+5:30"}</b>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(partner.slots || ["Today · 7:00 PM", "Tomorrow · 6:00 PM", "Saturday · 2:00 PM"]).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      selectedSlot === slot
                        ? "bg-white/20 border-white text-white shadow-md"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className={selectedSlot === slot ? "text-white" : "text-gray-400"} />
                      <span className="text-xs font-bold text-white">{slot}</span>
                    </div>
                    {selectedSlot === slot && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[11px] font-semibold text-gray-300">Add an optional message or goal notes:</label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. I have a Figma file ready and want feedback on the dark mode design tokens."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  5. Review Barter Terms & Send Proposal
                </h3>
                <p className="text-xs text-gray-400">
                  100% peer-to-peer knowledge exchange. Zero money required.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white"
                      style={{ background: partner.accent }}
                    >
                      {partner.avatar}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{partner.name}</p>
                      <span className="text-[10px] text-gray-400">{partner.timezone}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-white bg-white/15 px-2.5 py-1 rounded-full border border-white/25">
                    ⇄ Direct Barter
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      You Learn
                    </span>
                    <p className="font-bold text-white">{requestSkill}</p>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      You Teach
                    </span>
                    <p className="font-bold text-white">{offerSkill}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-300 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Video size={14} className="text-white" /> {format}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-white" /> {selectedSlot}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="secondary-action text-xs py-2.5 px-4"
            >
              Back
            </button>
          ) : (
            <button onClick={onClose} className="secondary-action text-xs py-2.5 px-4">
              Cancel
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={() => {
                if (step === 1 && !requestSkill.trim()) {
                  toast.error("Please specify what skill you want to learn.");
                  return;
                }
                if (step === 2 && !offerSkill.trim()) {
                  toast.error("Please specify what skill you will offer in return.");
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
              style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
              className="primary-action text-xs py-2.5 px-5 flex items-center gap-1.5 bg-white text-black font-bold hover:bg-zinc-200 border border-white"
            >
              <span style={{ color: "#000000", fontWeight: 800 }}>Next Step</span>
              <ArrowRight size={14} className="text-black" style={{ color: "#000000" }} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ backgroundColor: "#FFFFFF", color: "#000000", border: "1px solid #FFFFFF" }}
              className="primary-action trade-skill-btn propose-swap-btn bg-white text-black hover:bg-zinc-100 border border-white text-xs py-2.5 px-6 flex items-center gap-2 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Zap size={14} className="text-black fill-black" style={{ color: "#000000", fill: "#000000" }} />
              <span style={{ color: "#000000", fontWeight: 800 }}>{isSubmitting ? "Sending..." : "Trade Skill · Send Proposal"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
