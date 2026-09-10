import type { ChatAction, ChatIntent, ChatMessage, ChatReply, ChatRuntimeContext, Professional, Session } from "@/contexts/SkillSwapContext";
import { findPointPackage } from "./points";
import { getSessionOptions } from "./sessionOptions";

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/\b(u|ur)\b/g, (match) => match === "u" ? "you" : "your")
  .replace(/\br\b/g, "are")
  .replace(/\btom\b/g, "tomorrow")
  .replace(/\bpts?\b/g, "points")
  .replace(/\s+/g, " ")
  .trim();

const has = (text: string, pattern: RegExp) => pattern.test(text);
const firstName = (professional: Professional) => professional.name.split(" ")[0] ?? professional.name;
const nextSession = (sessions: Session[], professionalId: string) => sessions.find((session) => session.professionalId === professionalId && session.status === "upcoming");

function action(type: ChatAction["type"], label: string, extras: Partial<ChatAction> = {}): ChatAction {
  return { type, label, ...extras };
}

function learningPath(professional: Professional) {
  return `${firstName(professional)} lists ${professional.specializations.join(", ")} within ${professional.primarySkill}. The profile does not publish a fixed syllabus, so a session can be shaped around your goal and current level.`;
}

function beginnerReply(professional: Professional) {
  const listed = professional.styles.some((style) => /beginner/i.test(style));
  if (listed) return `${firstName(professional)} lists “Beginner friendly” as a teaching style. ${learningPath(professional)}`;
  return `${firstName(professional)} does not list “Beginner friendly” as a teaching style. Their listed approach is ${professional.styles.join(", ")}; you can ask whether they can adapt the first session to your starting point.`;
}

function durationFromQuestion(text: string) {
  if (has(text, /\b(15|fifteen)\s*(?:mins?|minutes?|session)?\b/) && !has(text, /\bpoints?\b/)) return 15;
  if (has(text, /\b(30|thirty)\s*(?:mins?|minutes?|session)?\b|\bhalf an hour\b|\bhalf-hour\b/) && !has(text, /\bpoints?\b/)) return 30;
  if (has(text, /\b(60|sixty)\s*(?:mins?|minutes?|session)?\b|\bone hour\b|\b1 hour\b|\bhour-long\b|\ban hour\b/) && !has(text, /\bpoints?\b/)) return 60;
  return undefined;
}

function availabilityReply(professional: Professional, text: string): ChatReply {
  const requestedDay = ["today", "tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].find((day) => text.includes(day));
  const matching = requestedDay ? professional.slots.filter((slot) => slot.toLowerCase().includes(requestedDay)) : professional.slots;
  const subject = requestedDay ? `${requestedDay[0]?.toUpperCase()}${requestedDay.slice(1)}` : "currently";
  const reply = matching.length
    ? `${firstName(professional)} has these listed ${subject} times: ${matching.join(", ")}. Each displayed slot is a 60-minute session for ${professional.price} Skill Points.`
    : `I do not see a listed ${requestedDay} time for ${firstName(professional)}. The currently listed times are ${professional.slots.join(", ")}.`;
  return { intent: "availability", text: reply, actions: [action("availability", "View available sessions")] };
}

function priceReply(professional: Professional, text: string, runtime: ChatRuntimeContext): ChatReply {
  const pointsPackage = text.match(/\b(15|30|60|120|20|50|100|250|\d+)\s*(?:skill\s*)?points?\b/i);
  if (pointsPackage) {
    const pack = findPointPackage(Number(pointsPackage[1]));
    if (pack) return { intent: "points", text: `The current ${pack.points}-Point package can be purchased for ${pack.price} through your Wallet. Package prices are shown separately from a professional’s session Point requirement.`, actions: [action("wallet", "Buy Points")] };
  }
  const option = getSessionOptions(professional).find((item) => item.minutes === durationFromQuestion(text)) ?? getSessionOptions(professional).find((item) => item.minutes === 60)!;
  const after = runtime.wallet - option.points;
  const balanceLine = runtime.wallet >= option.points
    ? ` You currently have ${runtime.wallet} Skill Points, so ${after} would remain after booking.`
    : ` You currently have ${runtime.wallet} Skill Points, so you would need ${option.points - runtime.wallet} more to book it.`;
  return { intent: option.minutes === 60 ? "price" : "duration", text: `A ${option.minutes}-minute ${professional.primarySkill} session with ${firstName(professional)} is ${option.points} Skill Points.${balanceLine}`, actions: runtime.wallet >= option.points ? [action("book", `Book ${option.minutes} min · ${option.points} pts`, { minutes: option.minutes })] : [action("wallet", "Buy Points")] };
}

function sessionReply(intent: "reschedule" | "cancel", professional: Professional, runtime: ChatRuntimeContext): ChatReply {
  const session = nextSession(runtime.sessions, professional.id);
  if (!session) return {
    intent,
    text: `I do not see an upcoming ${professional.primarySkill} booking with ${firstName(professional)} in this local account. You can review listed times before making a new booking.`,
    actions: [action("availability", "View available sessions")],
  };
  if (intent === "reschedule") return {
    intent,
    text: `Your upcoming ${session.skill} session with ${firstName(professional)} is listed for ${session.time}. You can choose another currently listed time before keeping the same ${session.points}-Point session hold.`,
    actions: [action("reschedule", "Reschedule session", { sessionId: session.id })],
  };
  return {
    intent,
    text: `Your upcoming ${session.skill} session with ${firstName(professional)} is listed for ${session.time}. Would you like to choose another time or cancel this local reservation?`,
    actions: [action("reschedule", "Reschedule", { sessionId: session.id }), action("cancel", "Cancel session", { sessionId: session.id })],
  };
}

function skillsReply(professional: Professional, text: string): ChatReply {
  const catalog = [professional.primarySkill, ...professional.specializations].map((skill) => skill.toLowerCase());
  const requested = ["python", "photography", "photo editing", "portrait", "lighting", "react", "apis", "code review", "public speaking", "interviews", "presentations", "confidence", "guitar", "songwriting", "music theory", "production", "ui design", "figma", "portfolios", "design systems", "video editing", "premiere", "storytelling", "short-form"].find((skill) => text.includes(skill));
  if (requested && !catalog.some((skill) => skill.includes(requested) || requested.includes(skill))) {
    return { intent: "skills", text: `${firstName(professional)} does not list ${requested} among the skills on this profile. Their listed focus is ${professional.primarySkill}: ${professional.specializations.join(", ")}.`, actions: [] };
  }
  return { intent: "skills", text: `${firstName(professional)} lists ${professional.primarySkill} with focus areas in ${professional.specializations.join(", ")}.`, actions: [] };
}

function recommendationReply(text: string, runtime: ChatRuntimeContext): ChatReply {
  const creative = /creative|visual|art|design|photo|video|music/.test(text);
  const lastLearnerText = runtime.conversation.filter((message) => message.sender === "learner").map((message) => normalize(message.text)).join(" ");
  const related = creative || /photo|portrait|camera/.test(lastLearnerText)
    ? runtime.marketplace.filter((professional) => ["Photography", "UI Design", "Video Editing", "Guitar"].includes(professional.primarySkill))
    : runtime.marketplace.slice(0, 4);
  const list = related.map((professional) => professional.primarySkill).filter((skill, index, all) => all.indexOf(skill) === index);
  return { intent: "recommendation", text: `Based on ${creative ? "a creative learning goal" : "the skills currently listed in SkillSwap"}, you could explore ${list.join(", ")}. These are marketplace categories, not a promise of a specific outcome.`, actions: [action("availability", "Browse professionals")] };
}

function resolveContextAwareReply(professional: Professional, question: string, runtime: ChatRuntimeContext): ChatReply {
  const text = normalize(question);
  const refersToSelectedProfessional = /\b(she|he|her|him|they|them|it)\b/.test(text);
  const previousProfessional = [...runtime.conversation].reverse().find((message) => message.sender === "professional");
  const previousIntent = previousProfessional?.intent;
  const session = nextSession(runtime.sessions, professional.id);

  if (/^(hi|hello|hey|good (morning|afternoon|evening))\b/.test(text)) return { intent: "greeting", text: `Hi — I’m here to help you understand ${firstName(professional)}’s listed ${professional.primarySkill} sessions, availability, and Skill Point cost.`, actions: [] };
  if (has(text, /\b(skill ?swap|how do skill points work|what are points)\b/)) return { intent: "platform", text: "SkillSwap lets people teach what they know and use Skill Points to book learning sessions. New prototype accounts receive 20 starter Points; you can also earn Points by teaching or buy a package with ₹ in the Wallet.", actions: [action("wallet", "Open Wallet"), action("teach", "Start teaching")] };
  if (has(text, /\b(earn|earning|teach to earn|make points)\b/)) return { intent: "earning", text: "You earn Skill Points by teaching through completed sessions. You can add skills, qualifications, and availability from your teaching workspace; this prototype keeps that progress locally to your account.", actions: [action("teach", "Start teaching")] };
  if (has(text, /\b(buy|purchase|payment|pay|more points|top up)\b/)) return { intent: "points", text: "You can earn Skill Points by teaching or buy a current package with ₹ in your Wallet. You can complete your checkout directly in your Wallet.", actions: [action("wallet", "Buy Points")] };
  if (has(text, /\b(reschedul|change (my |the )?(time|session)|move (my |the )?session)\b/)) return sessionReply("reschedule", professional, runtime);
  if (has(text, /\b(cancel|can.t make it|cannot make it|won.t make it)\b/)) return sessionReply("cancel", professional, runtime);
  if (has(text, /\b(afford|enough points|can i book this)\b/)) return priceReply(professional, "60 minutes", runtime);
  if (has(text, /\b(book|reserve|how do i book)\b/)) return { intent: "booking", text: `Choose one of ${firstName(professional)}’s listed times, then review the ${professional.price}-Point 60-minute cost and your remaining balance before confirming. ${runtime.wallet >= professional.price ? `You currently have enough Points for that session.` : `You need ${professional.price - runtime.wallet} more Points for the listed 60-minute session.`}`, actions: runtime.wallet >= professional.price ? [action("book", `Book 60 min · ${professional.price} pts`, { minutes: 60 })] : [action("wallet", "Buy Points"), action("availability", "View available sessions")] };
  if (has(text, /\b(available|availability|free|when|schedule|slot|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/)) return availabilityReply(professional, text);
  if (has(text, /\b(half an hour|half-hour|30|15|60|one hour|1 hour|hour-long|how long|duration|minutes?)\b/) || (text === "how much" && previousIntent === "availability")) return priceReply(professional, text === "how much" ? "60 minutes" : text, runtime);
  if (has(text, /\b(price|cost|how much|fee|points?)\b/)) return priceReply(professional, text, runtime);
  if (has(text, /\b(qualif\w*|credential\w*|certificate\w*|certif\w*|verified)\b/)) return { intent: "qualifications", text: `${firstName(professional)}’s profile shows a ${professional.qualification === "verified" ? "platform-verified" : "professional-claimed"} ${professional.primarySkill} practice credential and ${professional.experience}+ years of listed practice. The profile does not provide a named certification in chat, so review the Qualifications tab for the latest record context.`, actions: [action("qualifications", "View qualifications")] };
  if (has(text, /\b(review|rating|other students|learners think)\b/)) return { intent: "reviews", text: `I do not see user-authored feedback saved for ${firstName(professional)} in this account. SkillSwap only displays private feedback that a learner has actually written after a session, so the chat will not invent ratings or review summaries.`, actions: [] };
  if (has(text, /\b(portfolio|see (your|their) work|show (your|their) work|review (my )?(work|photos|design|edit))\b/)) return { intent: "portfolio", text: `${firstName(professional)}’s profile has a Portfolio tab with interactive demo previews for ${professional.primarySkill}. Open it to inspect the items shown on this profile.`, actions: [action("portfolio", "View portfolio")] };
  if (has(text, /\b(why should i learn|experience|years|background|worked)\b/)) return { intent: "experience", text: `${firstName(professional)} lists ${professional.experience}+ years of ${professional.primarySkill} practice, ${professional.verified ? "a completed identity check" : "an identity review that is still pending"}, and a ${professional.qualification === "verified" ? "verified" : "claimed"} practice credential. Their listed teaching styles are ${professional.styles.join(", ")}.`, actions: [action("qualifications", "View qualifications")] };
  if (has(text, /\b(beginners?|from zero|no experience|start from scratch|new to|do i need.*experience)\b/)) return { intent: "beginner", text: beginnerReply(professional), actions: [] };
  if (has(text, /\b(camera|equipment|gear|laptop|device|guitar)\b/)) return { intent: "equipment", text: professional.primarySkill === "Photography" ? "Maya’s profile lists hands-on, project-based teaching. A smartphone or entry-level camera is enough to discuss fundamentals; tell her what you have so the session can stay practical." : professional.primarySkill === "Guitar" ? "An instrument that is safe and able to stay in tune is enough for a first guitar conversation. You can tell Arjun what you already have before booking." : `The profile does not list required equipment for ${professional.primarySkill}. Tell ${firstName(professional)} what tools you already use so they can confirm a suitable first exercise.`, actions: [] };
  if (has(text, /\b(online|offline|in person|location|remote)\b/)) return { intent: "format", text: `${firstName(professional)} is listed in ${professional.location}. The profile does not guarantee a delivery format in chat; review the session details and ask before booking.`, actions: [action("availability", "View available sessions")] };
  if (has(text, /\b(language|hindi|english|urdu|gujarati|telugu)\b/)) return { intent: "language", text: `${firstName(professional)} lists ${professional.languages.join(", ")} on this profile. You can mention the language that feels most comfortable before confirming a session.`, actions: [] };
  if (has(text, /\b(creative|what else can i learn|recommend|suggest)\b/)) return recommendationReply(text, runtime);
  if (has(text, /\b(swap|barter|exchange|trade|counter offer)\b/)) return { intent: "platform", text: `You can barter or swap directly with ${firstName(professional)}. In SkillSwap, you use TimeBank credits earned from your own teaching or starter rewards. You can also send a custom session proposal or schedule from available slots (${professional.slots[0]}).`, actions: [action("book", `Book (${professional.price} pts)`), action("availability", "View Slots")] };
  if (has(text, /\b(call|zoom|meet|meeting|1-on-1|one-on-one|talk|discuss)\b/)) return { intent: "availability", text: `${firstName(professional)} conducts 1-on-1 live audio/video sessions directly in SkillSwap. The next listed slot is ${professional.slots[0]}. Each session is interactive and point-backed.`, actions: [action("book", `Book (${professional.price} pts)`), action("availability", "View All Times")] };
  if (has(text, /\b(help|guide|mentor|project|feedback|advice|consult|collaborat\w*)\b/)) return { intent: "skills", text: `Yes! ${firstName(professional)} works with learners on practical projects and skill development in ${professional.primarySkill}: ${professional.specializations.join(", ")}. You can reserve a 60-minute session or propose a custom agenda.`, actions: [action("book", `Book 60 min · ${professional.price} pts`), action("availability", "Check Times")] };
  if (has(text, /\b(teach|topics|cover|learn|what do you teach|do you teach|python|photography|editing|guitar|figma|speaking|presentation)\b/)) return skillsReply(professional, text);
  if (has(text, /\b(method|style|approach|how do you teach)\b/)) return { intent: "teaching", text: `${firstName(professional)} lists ${professional.styles.join(", ")} as their teaching styles. ${learningPath(professional)}`, actions: [] };
  if (text === "how much" && previousIntent === "duration") return priceReply(professional, "60 minutes", runtime);
  return { intent: "fallback", text: refersToSelectedProfessional ? `I’m treating that reference as ${firstName(professional)}, the professional selected in this chat. I can answer specifically about their listed ${professional.primarySkill} skills, session price, availability, teaching style, qualifications, or an existing booking.` : `I can answer specifically about ${firstName(professional)}’s listed ${professional.primarySkill} skills, session price, availability, teaching style, qualifications, or an existing booking. Which of those would you like to check?`, actions: [action("book", `Book 60 min · ${professional.price} pts`), action("availability", "View Schedule")] };
}

export function buildContextAwareReply(professional: Professional, question: string, runtime: ChatRuntimeContext): ChatReply {
  const reply = resolveContextAwareReply(professional, question, runtime);
  const repeatedIntentCount = runtime.conversation.filter((message) => message.sender === "professional" && message.intent === reply.intent).length;
  if (!repeatedIntentCount || reply.intent === "fallback") return reply;
  const leadIns: Partial<Record<ChatIntent, string[]>> = {
    skills: ["To recap the listed focus: ", "From the profile details: "],
    price: ["To restate the listed rate: ", "For the same session option: "],
    duration: ["For that shorter option: ", "Looking at the listed session lengths: "],
    availability: ["Checking the listed calendar again: ", "For the currently shown times: "],
    beginner: ["For your starting point: ", "Keeping that beginner context in mind: "],
    qualifications: ["From the current profile record: ", "To clarify the credential state: "],
  };
  const prefix = leadIns[reply.intent]?.[repeatedIntentCount % (leadIns[reply.intent]?.length ?? 1)];
  return prefix ? { ...reply, text: `${prefix}${reply.text}` } : reply;
}
