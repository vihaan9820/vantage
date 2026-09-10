import { ArrowLeft, ArrowRight, Check, Compass, GraduationCap, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { type ExperienceLevel, useAccount } from "@/contexts/AccountContext";
import { PageSEO } from "@/components/PageSEO";
import { FerrofluidBackground } from "@/components/FerrofluidBackground";

const learningSkills = ["Photography", "Python", "UI Design", "Public Speaking", "Guitar", "Video Editing", "Data Science", "Marketing", "Languages", "Fitness", "Writing", "Leadership"];
const styles = ["One-on-one", "Group", "Project-based", "Practical", "Theory", "Casual", "Career-focused"];
const levels: ExperienceLevel[] = ["Beginner", "Intermediate", "Advanced", "Professional"];
const titles = ["What do you want to learn?", "What can you teach?", "What’s your experience level?", "How do you prefer to learn?", "You’re ready."];

function toggle(list: string[], value: string) { return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]; }

export default function Onboarding() {
  const [, navigate] = useLocation(); const { account, finishOnboarding } = useAccount(); const [step, setStep] = useState(0); const [learn, setLearn] = useState(account?.learnSkills ?? []); const [teach, setTeach] = useState(account?.teachSkills ?? []); const [level, setLevel] = useState<ExperienceLevel>(account?.experience ?? "Beginner"); const [stylesChosen, setStylesChosen] = useState(account?.learningStyles ?? ["Practical"]);
  const complete = () => { finishOnboarding({ learnSkills: learn, teachSkills: teach, experience: level, learningStyles: stylesChosen }); toast.success("Your learning path is tailored and ready."); navigate("/welcome"); };
  const next = () => { if (step === 0 && !learn.length) { toast.error("Choose at least one skill you want to explore."); return; } if (step === 1 && !teach.length) { toast.error("Choose at least one skill you can share—or add one to begin."); return; } if (step === 4) { complete(); return; } setStep((current) => current + 1); };
  const body = useMemo(() => { if (step === 0) return <><p>Select a few interests first. Recommendations will adapt as you learn.</p><div className="choice-cloud">{learningSkills.map((skill) => <button key={skill} className={learn.includes(skill) ? "selected" : ""} onClick={() => setLearn((current) => toggle(current, skill))}>{learn.includes(skill) ? <Check size={14} /> : <Compass size={14} />}{skill}</button>)}</div></>; if (step === 1) return <><p>Start with skills you would feel comfortable helping someone practice.</p><div className="choice-cloud">{learningSkills.map((skill) => <button key={skill} className={teach.includes(skill) ? "selected" : ""} onClick={() => setTeach((current) => toggle(current, skill))}>{teach.includes(skill) ? <Check size={14} /> : <Sparkles size={14} />}{skill}</button>)}</div></>; if (step === 2) return <><p>This helps us set the right starting point. It does not restrict you later.</p><div className="onboard-option-grid">{levels.map((item) => <button key={item} className={level === item ? "selected" : ""} onClick={() => setLevel(item)}><GraduationCap size={19} /><strong>{item}</strong></button>)}</div></>; if (step === 3) return <><p>Pick the ways you learn best. You can revise these preferences in Settings.</p><div className="choice-cloud">{styles.map((item) => <button key={item} className={stylesChosen.includes(item) ? "selected" : ""} onClick={() => setStylesChosen((current) => toggle(current, item))}>{stylesChosen.includes(item) ? <Check size={14} /> : <span className="choice-dot" />}{item}</button>)}</div></>; return <div className="onboard-ready"><img src="/vantage-logo.png" alt="Vantage" className="h-16 w-auto mx-auto mb-4 object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] pointer-events-none select-none" /><h3>Your Vantage path is ready.</h3><p>You chose {learn.length || "new"} learning interest{learn.length === 1 ? "" : "s"}, {teach.length || "new"} skill{teach.length === 1 ? "" : "s"} to share, and a {level.toLowerCase()} starting point.</p><div className="ready-row"><span>Learn</span><i>↔</i><span>Teach</span><i>→</i><b>Grow</b></div></div>; }, [step, learn, teach, level, stylesChosen]);
  return <div className="onboarding-page">
    <PageSEO
      title="Personalize Your Profile — Onboarding · Vantage"
      description="Choose skills to learn and teach, set your experience level, and tailor your reciprocal knowledge barter path."
      canonicalPath="/onboarding"
    />
    <FerrofluidBackground opacity={0.20} />
    <section className="onboarding-card"><button className="onboard-brand flex items-center gap-3" onClick={() => navigate("/")}><img src="/vantage-logo.png" alt="Vantage" className="w-8 h-8 sm:w-9 sm:h-9 object-contain pointer-events-none select-none" /><span className="font-megiko font-morenn font-bold text-2xl sm:text-3xl tracking-wide text-white">Vantage</span></button><div className="onboard-progress" aria-label={`Step ${step + 1} of 5`}>{titles.map((title, index) => <span key={title} className={index <= step ? "active" : ""}><i />{index + 1}</span>)}</div><p className="page-kicker">STEP {String(step + 1).padStart(2, "0")} OF 05</p><h1 className="font-megiko font-morenn font-bold">{titles[step]}</h1><div className="onboard-body">{body}</div><footer className="onboard-actions"><button className="secondary-action" onClick={() => step === 0 ? navigate("/signup") : setStep((current) => current - 1)}><ArrowLeft size={16} /> {step === 0 ? "Account" : "Back"}</button><button className="primary-action" onClick={next}>{step === 4 ? "Reveal my starter points" : "Continue"}<ArrowRight size={16} /></button></footer></section></div>;
}
