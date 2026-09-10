// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach, beforeAll } from "vitest";
import { SkillSwapProvider, useSkillSwap } from "./contexts/SkillSwapContext";
import { AccountProvider } from "./contexts/AccountContext";

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(AccountProvider, null, React.createElement(SkillSwapProvider, null, children));
}

describe("Teaching Skill Pipeline & Gem Transfer", () => {
  beforeAll(() => {
    const store: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      writable: true,
      value: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => { store[k] = String(v); },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); }
      }
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }),
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("initializes with starter offerings in waiting state", () => {
    const { result } = renderHook(() => useSkillSwap(), { wrapper });
    expect(result.current.state.teachingOfferings.length).toBeGreaterThanOrEqual(2);
    expect(result.current.state.teachingOfferings[0].status).toBe("waiting");
  });

  it("adds a new skill to teach without transferring gems upfront", () => {
    const { result } = renderHook(() => useSkillSwap(), { wrapper });
    const initialWallet = result.current.state.wallet;

    act(() => {
      result.current.addTeachingOffering({
        skill: "Next.js Architecture",
        category: "Technology",
        level: "Advanced",
        format: "60-min Session",
        price: 16,
        description: "Master server components and caching architecture.",
        availability: "Weekends",
      });
    });

    const created = result.current.state.teachingOfferings.find(
      (o) => o.skill === "Next.js Architecture"
    );

    expect(created).toBeDefined();
    expect(created?.status).toBe("waiting");
    expect(created?.price).toBe(16);
    // Gems should NOT be transferred upfront when listing the skill
    expect(result.current.state.wallet).toBe(initialWallet);
  });

  it("simulates learner purchase and transitions to booked status", () => {
    const { result } = renderHook(() => useSkillSwap(), { wrapper });
    let offeringId = "";

    act(() => {
      const off = result.current.addTeachingOffering({
        skill: "Machine Learning",
        category: "Technology",
        level: "Intermediate",
        format: "30-min Practice",
        price: 10,
        description: "Hands-on PyTorch model training.",
        availability: "Weekday evenings",
      });
      offeringId = off.id;
    });

    const initialWallet = result.current.state.wallet;

    act(() => {
      result.current.simulateLearnerBooking(offeringId, "Elena Rostova");
    });

    const updated = result.current.state.teachingOfferings.find((o) => o.id === offeringId);
    expect(updated?.status).toBe("booked");
    expect(updated?.learnerName).toBe("Elena Rostova");
    expect(updated?.learnerAvatar).toBe("ER");
    // Wallet remains unchanged until completed
    expect(result.current.state.wallet).toBe(initialWallet);
  });

  it("transfers gems to wallet and records transaction upon completing session/consultation", () => {
    const { result } = renderHook(() => useSkillSwap(), { wrapper });
    let offeringId = "";

    act(() => {
      const off = result.current.addTeachingOffering({
        skill: "Public Speaking Mastery",
        category: "Communication",
        level: "All Levels",
        format: "60-min Session",
        price: 15,
        description: "Executive presentation coaching.",
        availability: "Anytime",
      });
      offeringId = off.id;
    });

    act(() => {
      result.current.simulateLearnerBooking(offeringId, "Marcus Chen");
    });

    const walletBefore = result.current.state.wallet;

    act(() => {
      result.current.completeTeachingOffering(offeringId);
    });

    const completed = result.current.state.teachingOfferings.find((o) => o.id === offeringId);
    expect(completed?.status).toBe("completed");
    expect(completed?.earnedGems).toBe(15);
    // Exact gems transferred to wallet
    expect(result.current.state.wallet).toBe(walletBefore + 15);

    // Verify transaction record exists
    const tx = result.current.state.transactions.find(
      (t) => t.type === "Earned" && t.amount === 15
    );
    expect(tx).toBeDefined();
    expect(tx?.status).toBe("Completed");
    expect(tx?.note).toContain("Public Speaking Mastery");
    expect(tx?.note).toContain("Marcus Chen");
  });

  it("transfers bonus gems for free 15-min consultations upon completion", () => {
    const { result } = renderHook(() => useSkillSwap(), { wrapper });
    let offeringId = "";

    act(() => {
      const off = result.current.addTeachingOffering({
        skill: "Intro Consultation",
        category: "Creative",
        level: "Beginner",
        format: "15-min Consultation",
        price: 0,
        description: "Free intro call.",
        availability: "Today",
      });
      offeringId = off.id;
    });

    act(() => {
      result.current.simulateLearnerBooking(offeringId, "David Kim");
    });

    const walletBefore = result.current.state.wallet;

    act(() => {
      result.current.completeTeachingOffering(offeringId);
    });

    expect(result.current.state.wallet).toBe(walletBefore + 5);
  });
});
