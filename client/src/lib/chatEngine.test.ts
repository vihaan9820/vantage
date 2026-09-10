import { describe, expect, it } from "vitest";
import { applySessionCancellation, applySessionReschedule, professionals, type ChatRuntimeContext, type SkillSwapState } from "@/contexts/SkillSwapContext";
import { buildContextAwareReply } from "./chatEngine";

const maya = professionals.find((professional) => professional.id === "maya")!;
const rahul = professionals.find((professional) => professional.id === "rahul")!;

function runtime(overrides: Partial<ChatRuntimeContext> = {}): ChatRuntimeContext {
  return { wallet: 20, sessions: [], conversation: [], marketplace: professionals, ...overrides };
}

const blankState: SkillSwapState = {
  starterRewardClaimed: true, starterPoints: 20, wallet: 20, walletVisited: false, savedIds: [], savedSkills: [], qualifications: [], portfolioProjects: [], accomplishments: [], reviewFeedback: [], referral: { code: "TEST", invites: 0, joined: 0, earned: 0, history: [] }, paymentMethods: [], communityPosts: [], conversationSafety: {}, conversationReports: [], calls: [], security: { twoFactorEnabled: false, recoveryEmail: "", backupCodes: [], sessions: [] }, selectedProfessionalId: "maya", messages: [], transactions: [], sessions: [], notifications: [], typingProfessionalIds: [],
};

describe("context-aware SkillSwap chat engine", () => {
  it("answers unrelated selected-professional questions with different factual responses", () => {
    const skills = buildContextAwareReply(rahul, "u teach python?", runtime());
    const price = buildContextAwareReply(rahul, "how much is a 1 hour session?", runtime());
    const availability = buildContextAwareReply(rahul, "r u free tom?", runtime());
    expect(skills.intent).toBe("skills");
    expect(skills.text).toMatch(/Python|APIs|React/i);
    expect(price.intent).toBe("price");
    expect(price.text).toContain("14 Skill Points");
    expect(price.text).toContain("6 would remain");
    expect(availability.intent).toBe("availability");
    expect(availability.text).toContain("Tomorrow · 7:00 PM");
    expect(new Set([skills.text, price.text, availability.text]).size).toBe(3);
  });

  it("uses duration and prior reply context instead of a generic response", () => {
    const shortSession = buildContextAwareReply(maya, "What about half an hour?", runtime());
    expect(shortSession.intent).toBe("duration");
    expect(shortSession.text).toContain("30-minute");
    expect(shortSession.text).toContain("12 Skill Points");
    const followUp = buildContextAwareReply(maya, "How much?", runtime({ conversation: [{ id: "availability", professionalId: "maya", sender: "professional", text: "Saturday is available", intent: "availability", timestamp: 1 }] }));
    expect(followUp.intent).toBe("price");
    expect(followUp.text).toContain("16 Skill Points");
  });

  it("uses only listed qualification, review, and beginner facts", () => {
    const qualification = buildContextAwareReply(maya, "what r ur qualifications", runtime());
    const reviews = buildContextAwareReply(maya, "what do other students think?", runtime());
    const beginner = buildContextAwareReply(maya, "I am a complete beginner", runtime());
    expect(qualification.text).toMatch(/platform-verified|8\+ years/i);
    expect(qualification.text).not.toMatch(/Adobe|Certified Professional/i);
    expect(reviews.intent).toBe("reviews");
    expect(reviews.text).toMatch(/will not invent ratings/i);
    expect(beginner.text).toMatch(/Beginner friendly/i);
  });

  it("keeps package facts distinct from the Skill Point session price", () => {
    const packageReply = buildContextAwareReply(maya, "How much is 30 points?", runtime());
    expect(packageReply.intent).toBe("points");
    expect(packageReply.text).toContain("30-Point package");
    expect(packageReply.text).toContain("₹1,099");
    expect(packageReply.text).not.toContain("30 Points =");
  });

  it("varies repeated phrasing while retaining the same listed price fact", () => {
    const first = buildContextAwareReply(maya, "How much is a session?", runtime());
    const repeated = buildContextAwareReply(maya, "How much is a session?", runtime({ conversation: [{ id: "price-1", professionalId: "maya", sender: "professional", text: first.text, intent: first.intent, timestamp: 1 }] }));
    expect(first.text).toContain("16 Skill Points");
    expect(repeated.text).toContain("16 Skill Points");
    expect(repeated.text).not.toBe(first.text);
  });

  it("resolves she, he, and her against the professional selected for the conversation", () => {
    const beginner = buildContextAwareReply(maya, "Can she teach beginners?", runtime());
    const availability = buildContextAwareReply(rahul, "Is he available tomorrow?", runtime());
    const booking = buildContextAwareReply(maya, "Can I book her?", runtime());
    expect(beginner.intent).toBe("beginner");
    expect(beginner.text).toContain("Maya");
    expect(availability.intent).toBe("availability");
    expect(availability.text).toContain("Tomorrow · 7:00 PM");
    expect(booking.intent).toBe("booking");
    expect(booking.actions[0]?.type).toBe("book");
  });

  it("uses the current held session for reschedule and cancellation guidance", () => {
    const session = { id: "session-1", professionalId: "maya", skill: "Photography", time: "Saturday · 11:00 AM", points: 8, status: "upcoming" as const };
    const reschedule = buildContextAwareReply(maya, "Can I change my session time?", runtime({ sessions: [session] }));
    const cancellation = buildContextAwareReply(maya, "I can't make it", runtime({ sessions: [session] }));
    expect(reschedule.actions[0]).toMatchObject({ type: "reschedule", sessionId: "session-1" });
    expect(cancellation.actions.map((item) => item.type)).toEqual(["reschedule", "cancel"]);
    const moved = applySessionReschedule({ ...blankState, sessions: [session] }, "session-1", "Tomorrow · 5:30 PM");
    expect(moved.sessions[0]?.time).toBe("Tomorrow · 5:30 PM");
    const cancelled = applySessionCancellation({ ...blankState, sessions: [session] }, "session-1", 44);
    expect(cancelled.wallet).toBe(28);
    expect(cancelled.sessions[0]?.status).toBe("cancelled");
    expect(cancelled.transactions[0]).toMatchObject({ type: "Session Release", amount: 8, balance: 28 });
  });
});
