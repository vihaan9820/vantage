import { describe, expect, it } from "vitest";
import { type SkillSwapState, type BarterProposal, type Session } from "./contexts/SkillSwapContext";

describe("Trade skill session scheduling", () => {
  it("creates a scheduled session with roomUrl when a barter swap proposal is submitted", () => {
    const initialState: SkillSwapState = {
      starterRewardClaimed: true,
      starterPoints: 20,
      wallet: 20,
      walletVisited: true,
      savedIds: [],
      savedSkills: [],
      qualifications: [],
      portfolioProjects: [],
      accomplishments: [],
      referral: { code: "SKILL-DEMO", invites: 0, joined: 0, earned: 0, history: [] },
      paymentMethods: [],
      communityPosts: [],
      conversationSafety: {},
      conversationReports: [],
      calls: [],
      security: { twoFactorEnabled: false, recoveryEmail: "", backupCodes: [], sessions: [] },
      selectedProfessionalId: "maya",
      messages: [],
      transactions: [],
      sessions: [],
      notifications: [],
      typingProfessionalIds: [],
      barterProposals: [],
    };

    const proposalInput = {
      partnerId: "maya",
      partnerName: "Maya Lin",
      partnerAvatar: "ML",
      partnerAccent: "#ec4899",
      requestSkill: "Portrait Lighting",
      offerSkill: "React Architecture",
      format: "1 hr Live Video",
      slot: "Tomorrow · 6:00 PM",
    };

    const proposalId = `barter-${Date.now()}`;
    const roomUrl = `https://meet.skillswap.pro/room-${proposalInput.partnerId}-1234`;
    const newProposal: BarterProposal = {
      ...proposalInput,
      id: proposalId,
      createdAt: Date.now(),
      status: "Session Scheduled",
      scheduledTime: proposalInput.slot,
      roomUrl,
      direction: "outgoing",
    };

    const barterSession: Session = {
      id: `session-barter-${proposalId}`,
      professionalId: proposalInput.partnerId,
      skill: proposalInput.requestSkill,
      time: proposalInput.slot,
      points: 0,
      status: "upcoming",
      roomUrl,
      isBarter: true,
      format: proposalInput.format,
      partnerName: proposalInput.partnerName,
      partnerAvatar: proposalInput.partnerAvatar,
      partnerAccent: proposalInput.partnerAccent,
      offerSkill: proposalInput.offerSkill,
      proposalId,
    };

    const nextState: SkillSwapState = {
      ...initialState,
      barterProposals: [newProposal, ...initialState.barterProposals],
      sessions: [barterSession, ...initialState.sessions],
    };

    expect(nextState.sessions.length).toBe(1);
    expect(nextState.sessions[0].id).toBe(`session-barter-${proposalId}`);
    expect(nextState.sessions[0].skill).toBe("Portrait Lighting");
    expect(nextState.sessions[0].isBarter).toBe(true);
    expect(nextState.sessions[0].points).toBe(0);
    expect(nextState.sessions[0].status).toBe("upcoming");
    expect(nextState.sessions[0].roomUrl).toContain("meet.skillswap.pro");
    expect(nextState.barterProposals[0].status).toBe("Session Scheduled");
  });

  it("permits learners to book directly with Gems and deducts points", () => {
    const initialState: SkillSwapState = {
      starterRewardClaimed: true,
      starterPoints: 20,
      wallet: 20,
      walletVisited: true,
      savedIds: [],
      savedSkills: [],
      qualifications: [],
      portfolioProjects: [],
      accomplishments: [],
      referral: { code: "SKILL-DEMO", invites: 0, joined: 0, earned: 0, history: [] },
      paymentMethods: [],
      communityPosts: [],
      conversationSafety: {},
      conversationReports: [],
      calls: [],
      security: { twoFactorEnabled: false, recoveryEmail: "", backupCodes: [], sessions: [] },
      selectedProfessionalId: "maya",
      messages: [],
      transactions: [],
      sessions: [],
      notifications: [],
      typingProfessionalIds: [],
      barterProposals: [],
    };

    const cost = 6;
    const balance = initialState.wallet - cost;
    const sessionId = `session-${Date.now()}`;
    const bookedSession: Session = {
      id: sessionId,
      professionalId: "maya",
      skill: "Portrait Lighting",
      time: "Tomorrow · 6:00 PM",
      points: cost,
      status: "upcoming",
      roomUrl: "https://meet.skillswap.pro/room-maya-9999",
      partnerName: "Maya Lin",
    };

    const updatedState: SkillSwapState = {
      ...initialState,
      wallet: balance,
      sessions: [bookedSession, ...initialState.sessions],
      transactions: [
        { id: `hold-${Date.now()}`, type: "Session Hold", amount: -cost, balance, date: Date.now(), status: "Held" },
        ...initialState.transactions,
      ],
    };

    expect(updatedState.wallet).toBe(14);
    expect(updatedState.sessions.length).toBe(1);
    expect(updatedState.sessions[0].points).toBe(6);
    expect(updatedState.sessions[0].status).toBe("upcoming");
    expect(updatedState.transactions[0].type).toBe("Session Hold");
  });
});
