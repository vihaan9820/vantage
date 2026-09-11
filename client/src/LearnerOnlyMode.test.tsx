import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const appChromeSource = readFileSync(new URL("./components/AppChrome.tsx", import.meta.url), "utf8");
const swapProposalSource = readFileSync(new URL("./components/SwapProposalModal.tsx", import.meta.url), "utf8");
const productPagesSource = readFileSync(new URL("./pages/ProductPages.tsx", import.meta.url), "utf8");
const profileWorkspaceSource = readFileSync(new URL("./pages/ProfileWorkspace.tsx", import.meta.url), "utf8");
const professionalsSource = readFileSync(new URL("./pages/Professionals.tsx", import.meta.url), "utf8");

describe("Learner Only Mode & UI Condensation", () => {
  it("condenses AppChrome header and removes Teach button and Barter links for learners", () => {
    // Check left shift of header content
    expect(appChromeSource).toContain("w-full px-2 sm:px-4 lg:px-6");
    // Check isLearnerOnly condition
    expect(appChromeSource).toContain('const isLearnerOnly = account?.mode === "learn";');
    // Check quick teach button is gated
    expect(appChromeSource).toContain("{!isLearnerOnly && (");
    // Check navLinks filters out matches and teach
    expect(appChromeSource).toContain("if (!isLearnerOnly) {");
    // Check mobile drawer also gates teach button
    expect(appChromeSource).toContain("{!isLearnerOnly && (");
    // Check profile menu wrap has shrink-0 to prevent clipping
    expect(appChromeSource).toContain("profile-menu-wrap relative shrink-0");
  });

  it("restricts SwapProposalModal to direct Gems booking for learners without barter trade tab", () => {
    expect(swapProposalSource).toContain('const isLearnerOnly = account?.mode === "learn";');
    expect(swapProposalSource).toContain("const effectiveBookingType = isLearnerOnly ? \"gems\" : bookingType;");
    // Switcher is hidden for learners
    expect(swapProposalSource).toContain("{!isLearnerOnly && (");
    expect(swapProposalSource).toContain("⇄ Trade Skill (0 Gems)");
  });

  it("removes barter exchange pipeline, offer inputs, and barter spotlight from Dashboard for learners", () => {
    expect(productPagesSource).toContain('const isLearnerOnly = account?.mode === "learn";');
    // Hide offer to teach button
    expect(productPagesSource).toContain("{!isLearnerOnly && (");
    // Single search input for learners
    expect(productPagesSource).toContain("What do you want to learn?");
    // Exchange pipeline hidden for learners
    expect(productPagesSource).toContain("{!isLearnerOnly && (");
    expect(productPagesSource).toContain("EXCHANGE PIPELINE");
    // Specialty to learn displayed instead of 2-way barter grid
    expect(productPagesSource).toContain("Specialty to Learn");
    // Seeking wishlist hidden or replaced for learners
    expect(productPagesSource).toContain("Session Rate:");
  });

  it("removes teaching tab and Teaches & Mentors card from ProfileWorkspace for learners", () => {
    expect(profileWorkspaceSource).toContain('const isLearnerOnly = account?.mode === "learn";');
    expect(profileWorkspaceSource).toContain('tabs.filter((t) => t !== "teaching")');
    // Overview hides Teaches & Mentors
    expect(profileWorkspaceSource).toContain("Learning Goals");
    expect(profileWorkspaceSource).toContain("{!isLearnerOnly && (");
  });

  it("adapts Professionals directory to direct Gems booking for learners", () => {
    expect(professionalsSource).toContain('account?.mode !== "learn"');
    expect(professionalsSource).toContain('account?.mode === "learn" ? "Book with Gems" : "Direct 1:1 barter"');
  });
});
