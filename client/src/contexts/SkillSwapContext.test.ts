import { describe, expect, it } from "vitest";
import { applyConversationClear, applyPointTransfer, applySelectedProfessional, applyStarterReward, buildProfessionalReply, canReserveSession, getContextualQuickQuestions, initialCommunityPosts, professionals, skillSwapStorageKey, type SkillSwapState } from "./SkillSwapContext";

const state: SkillSwapState = { starterRewardClaimed: false, starterPoints: 0, wallet: 0, walletVisited: false, savedIds: [], savedSkills: [], qualifications: [], portfolioProjects: [], accomplishments: [], referral: { code: "SKILL-DEMO", invites: 0, joined: 0, earned: 0, history: [] }, paymentMethods: [], communityPosts: [], conversationSafety: {}, conversationReports: [], calls: [], security: { twoFactorEnabled: false, recoveryEmail: "", backupCodes: [], sessions: [] }, selectedProfessionalId: "maya", messages: [], transactions: [], sessions: [], notifications: [], typingProfessionalIds: [] };

describe("SkillSwap starter point rules", () => {
  it("awards exactly 20 starter points and writes a completed reward transaction", () => {
    const rewarded = applyStarterReward(state, 42);
    expect(rewarded.wallet).toBe(20);
    expect(rewarded.starterPoints).toBe(20);
    expect(rewarded.starterRewardClaimed).toBe(true);
    expect(rewarded.transactions[0]).toMatchObject({ type: "Starter Reward", amount: 20, balance: 20, date: 42, status: "Completed" });
  });

  it("keeps the same state when a starter reward is claimed again", () => {
    const rewarded = applyStarterReward(state, 42);
    expect(applyStarterReward(rewarded, 100)).toBe(rewarded);
  });

  it("only permits session reservations when the wallet has enough points", () => {
    expect(canReserveSession({ ...state, wallet: 5 }, 5)).toBe(true);
    expect(canReserveSession({ ...state, wallet: 4 }, 5)).toBe(false);
  });

  it("keeps the same state when the active professional is selected again", () => {
    expect(applySelectedProfessional(state, "maya")).toBe(state);
    expect(applySelectedProfessional(state, "rahul")).toMatchObject({ selectedProfessionalId: "rahul" });
  });

  it("persists a validated transfer as a shared wallet transaction and rejects invalid transfers", () => {
    const funded = { ...state, wallet: 20, starterPoints: 20 };
    const completed = applyPointTransfer(funded, "Maya", 5, "Thanks", 99);
    expect(completed.success).toBe(true);
    expect(completed.state.wallet).toBe(15);
    expect(completed.state.transactions[0]).toMatchObject({ type: "Transfer", amount: -5, balance: 15, note: "Maya · Thanks" });
    expect(applyPointTransfer(funded, "", 5).success).toBe(false);
    expect(applyPointTransfer(funded, "Maya", 25).success).toBe(false);
  });

  it("clears only the selected local conversation and records a clear marker", () => {
    const current = { ...state, messages: [{ id: "m1", professionalId: "maya", sender: "learner" as const, text: "Hello", timestamp: 1 }, { id: "m2", professionalId: "rahul", sender: "learner" as const, text: "Hi", timestamp: 2 }] };
    const cleared = applyConversationClear(current, "maya", 40);
    expect(cleared.messages.map((message) => message.professionalId)).toEqual(["rahul"]);
    expect(cleared.conversationSafety.maya?.clearedAt).toBe(40);
  });
});

describe("SkillSwap account-scoped storage", () => {
  it("uses a different persistence key for each prototype account", () => {
    expect(skillSwapStorageKey()).toBe("skillswap-professional-demo-v2:guest");
    expect(skillSwapStorageKey("member-riya")).toBe("skillswap-professional-demo-v2:member-riya");
  });
});

describe("contextual professional chat", () => {
  const maya = professionals.find((professional) => professional.id === "maya")!;
  const rahul = professionals.find((professional) => professional.id === "rahul")!;
  const aisha = professionals.find((professional) => professional.id === "aisha")!;

  it("uses the selected professional and question intent instead of one generic reply", () => {
    const photography = buildProfessionalReply(maya, "Do I need a camera to start?");
    const programming = buildProfessionalReply(rahul, "Do I need coding experience?");
    expect(photography.intent).toBe("equipment");
    expect(photography.text).toMatch(/smartphone|camera/i);
    expect(programming.intent).toBe("beginner");
    expect(programming.text).toMatch(/Python|program/i);
    expect(programming.text).not.toBe(photography.text);
  });

  it("recognizes plural beginner wording used by the public-speaking quick question", () => {
    const response = buildProfessionalReply(aisha, "Is this suitable for beginners?");
    expect(response.intent).toBe("beginner");
    expect(response.text).toMatch(/simple speaking structure|previous Public Speaking experience/i);
  });

  it("adds actionable booking, availability, qualification, and portfolio responses", () => {
    expect(buildProfessionalReply(maya, "How much does a session cost?").actions).toContainEqual({ type: "book", label: "Book 60 min · 16 pts" });
    expect(buildProfessionalReply(maya, "When are you available?").actions[0]?.type).toBe("availability");
    expect(buildProfessionalReply(maya, "Are your qualifications verified?").actions[0]?.type).toBe("qualifications");
    expect(buildProfessionalReply(maya, "Can you review my portfolio?").actions[0]?.type).toBe("portfolio");
  });

  it("offers skill-specific quick questions and a safe fallback response", () => {
    expect(getContextualQuickQuestions(maya)).toContain("What camera or equipment do I need?");
    expect(getContextualQuickQuestions(rahul)).toContain("Can you help me debug code?");
    expect(buildProfessionalReply(maya, "Something completely unrelated").intent).toBe("fallback");
  });
});

describe("Community posts with file attachments", () => {
  it("includes pre-seeded initial community posts with image and code attachments", () => {
    expect(initialCommunityPosts.length).toBeGreaterThan(0);
    const postWithAttachments = initialCommunityPosts.find((p) => p.attachments && p.attachments.length > 0);
    expect(postWithAttachments).toBeDefined();
    expect(postWithAttachments?.attachments?.[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      size: expect.any(Number),
      type: expect.any(String),
      url: expect.any(String),
    });
  });

  it("contains both image and code/document sample attachments in community feed", () => {
    const allAttachments = initialCommunityPosts.flatMap((p) => p.attachments ?? []);
    const hasImage = allAttachments.some((a) => a.type.startsWith("image/") || a.name.endsWith(".svg"));
    const hasCode = allAttachments.some((a) => a.type.includes("json") || a.name.endsWith(".json"));
    expect(hasImage).toBe(true);
    expect(hasCode).toBe(true);
  });
});
