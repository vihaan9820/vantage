import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, X, Zap, Sparkles, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useSkillSwap, type TeachingOffering } from "@/contexts/SkillSwapContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ModalPortal } from "@/components/ModalPortal";
import { useLocation } from "wouter";

const CATEGORIES = [
  "Development",
  "Design",
  "AI & Data Science",
  "Music & Audio",
  "Languages",
  "Business & Strategy",
  "Creative Arts",
];

const FORMAT_OPTIONS: { label: string; value: TeachingOffering["format"] }[] = [
  { label: "60-min Session", value: "60-min Session" },
  { label: "30-min Practice", value: "30-min Practice" },
  { label: "Consultation", value: "15-min Consultation" },
];

const TOP_SUGGESTIONS = [
  "React & Next.js",
  "UI Systems",
  "Python AI",
  "Guitar Fingerstyle",
];

interface QuickTeachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickTeachModal: React.FC<QuickTeachModalProps> = ({ isOpen, onClose }) => {
  const [, navigate] = useLocation();
  const { addTeachingOffering } = useSkillSwap();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [skill, setSkill] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [format, setFormat] = useState<TeachingOffering["format"]>("60-min Session");
  const [price, setPrice] = useState(15);
  const [level, setLevel] = useState<TeachingOffering["level"]>("All Levels");
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        skillInputRef.current?.focus();
      }, 80);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) {
      toast.error("Please enter the skill you want to teach.");
      skillInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const offering = addTeachingOffering({
        skill: skill.trim(),
        category,
        format,
        price: Math.max(1, price),
        level,
        description: description.trim() || `1:1 hands-on mentorship in ${skill.trim()} with real-world practice.`,
        availability: "Flexible weekdays & weekends",
      });

      toast.success(`"${offering.skill}" is now live on your Teaching Studio!`, {
        description: `Set at ${offering.price} Swap Credits (${offering.format}).`,
        action: {
          label: "View Studio",
          onClick: () => navigate("/teach"),
        },
      });

      setSkill("");
      setDescription("");
      setShowAdvanced(false);
      onClose();
    } catch {
      toast.error("Failed to list skill offering. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-teach-title"
      >
        <div
          className={`relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl transition-all p-5 sm:p-7 flex flex-col gap-4 sm:gap-5 ${
            isLight
              ? "bg-white text-black border border-[#D4AF37]/35 shadow-[0_20px_50px_-10px_rgba(212,175,55,0.2),0_10px_25px_-5px_rgba(0,0,0,0.06)]"
              : "bg-[#0c0c0c] text-white border border-white/20 shadow-2xl"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle luxury top gold bar in Light mode */}
          {isLight && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F3D978] to-[#C5A059]" />
          )}

          {/* Minimal Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isLight
                    ? "bg-[#D4AF37]/15 text-[#996515] border border-[#D4AF37]/30"
                    : "bg-white text-black font-bold"
                }`}
              >
                <GraduationCap size={18} />
              </div>
              <div>
                <h2
                  id="quick-teach-title"
                  className={`text-base sm:text-lg font-extrabold tracking-tight ${
                    isLight ? "text-black" : "text-white"
                  }`}
                >
                  Share Your Expertise
                </h2>
                <p className={`text-[11px] font-medium ${isLight ? "text-[#8C6B14]" : "text-zinc-400"}`}>
                  Teach peers 1:1 • Earn Swap Credits
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${
                isLight
                  ? "text-zinc-500 hover:text-black hover:bg-[#D4AF37]/10"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Minimal Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Primary Skill Input */}
            <div>
              <label
                htmlFor="teach-skill-input"
                className={`block text-xs font-bold mb-1.5 ${isLight ? "text-black" : "text-white"}`}
              >
                What skill do you want to teach? <span className={isLight ? "text-[#D4AF37]" : "text-zinc-400"}>*</span>
              </label>
              <input
                ref={skillInputRef}
                id="teach-skill-input"
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. Next.js 15, UI Systems, Python AI"
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none ${
                  isLight
                    ? "bg-stone-50 border border-[#D4AF37]/30 text-black placeholder-zinc-400 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                    : "bg-white/10 border border-white/20 text-white placeholder-zinc-500 focus:border-white"
                }`}
                required
              />

              {/* Tight 4 Suggestions Pill Row */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {TOP_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSkill(item)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                      skill === item
                        ? isLight
                          ? "bg-[#D4AF37] text-black border border-[#D4AF37] shadow-sm"
                          : "bg-white text-black font-bold"
                        : isLight
                        ? "bg-white hover:bg-[#D4AF37]/10 text-stone-700 border border-stone-200 hover:border-[#D4AF37]/40"
                        : "bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10"
                    }`}
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Pricing & Format in 1 Compact Row */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? "text-black" : "text-white"}`}>
                  <span className="flex items-center gap-1">
                    <Zap size={11} className={isLight ? "text-[#996515] fill-[#D4AF37]" : "text-white fill-white"} />
                    Rate (Credits)
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[10, 15, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPrice(preset)}
                      className={`py-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                        price === preset
                          ? isLight
                            ? "bg-[#D4AF37] text-black border border-[#D4AF37] shadow-sm font-extrabold"
                            : "bg-white text-black font-extrabold"
                          : isLight
                          ? "bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200"
                          : "bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[11px] font-bold mb-1.5 ${isLight ? "text-black" : "text-white"}`}>
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as TeachingOffering["format"])}
                  className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none transition-all ${
                    isLight
                      ? "bg-stone-50 border border-stone-200 text-black focus:border-[#D4AF37]"
                      : "bg-white/10 border border-white/20 text-white focus:border-white"
                  }`}
                >
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className={isLight ? "bg-white text-black" : "bg-black text-white"}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Collapsible Details: Keeps default modal short & uncluttered */}
            <div className={`rounded-xl border transition-all ${
              isLight ? "border-stone-200 bg-stone-50/50" : "border-white/10 bg-white/[0.02]"
            }`}>
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className={`w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold transition-colors ${
                  isLight ? "text-stone-600 hover:text-black" : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{showAdvanced ? "Hide additional details" : "+ Category, Level & Pitch (Optional)"}</span>
                {showAdvanced ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>

              {showAdvanced && (
                <div className="px-3 pb-3 pt-1 flex flex-col gap-3 border-t border-dashed border-stone-200 dark:border-white/10">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isLight ? "text-black" : "text-white"}`}>
                        Discipline
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-medium ${
                          isLight ? "bg-white border border-stone-200 text-black" : "bg-white/10 border border-white/15 text-white"
                        }`}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className={isLight ? "bg-white text-black" : "bg-black text-white"}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold mb-1 ${isLight ? "text-black" : "text-white"}`}>
                        Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as TeachingOffering["level"])}
                        className={`w-full px-2 py-1.5 rounded-lg text-[11px] font-medium ${
                          isLight ? "bg-white border border-stone-200 text-black" : "bg-white/10 border border-white/15 text-white"
                        }`}
                      >
                        {(["Beginner", "Intermediate", "Advanced", "All Levels"] as const).map((lvl) => (
                          <option key={lvl} value={lvl} className={isLight ? "bg-white text-black" : "bg-black text-white"}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold mb-1 ${isLight ? "text-black" : "text-white"}`}>
                      Quick Pitch
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what learners will build or solve together."
                      className={`w-full px-3 py-1.5 rounded-lg text-xs resize-none focus:outline-none ${
                        isLight ? "bg-white border border-stone-200 text-black placeholder-zinc-400" : "bg-white/10 border border-white/15 text-white placeholder-zinc-500"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${
              isLight ? "border-stone-100" : "border-white/10"
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isLight ? "text-stone-500 hover:text-black hover:bg-stone-100" : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isLight
                    ? "bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A059] text-black shadow-[0_4px_16px_rgba(212,175,55,0.35)] hover:brightness-105 active:scale-95"
                    : "bg-white text-black shadow-lg hover:bg-zinc-200 active:scale-95"
                }`}
              >
                <Sparkles size={14} className={isLight ? "text-black" : "text-black"} />
                <span>Publish Offering</span>
                <ArrowRight size={13} className={isLight ? "text-black" : "text-black"} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </ModalPortal>
  );
};

export default QuickTeachModal;
