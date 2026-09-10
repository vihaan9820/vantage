// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AccountProvider } from "../contexts/AccountContext";
import { SkillSwapProvider } from "../contexts/SkillSwapContext";
import Messages from "./Messages";
import HelpRepair from "./HelpRepair";
import ProfileWorkspace from "./ProfileWorkspace";
import SessionsRepair from "./SessionsRepair";
import WalletRepair from "./WalletRepair";
import { SkillDetailRepair } from "./RepairWorkspaces";

function renderRepair(page: React.ReactNode) {
  return render(<AccountProvider><SkillSwapProvider accountId="repair-test">{page}</SkillSwapProvider></AccountProvider>);
}

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
  Object.defineProperty(window, "matchMedia", { writable: true, value: () => ({ matches: true, addEventListener: () => {}, removeEventListener: () => {} }) });
  Object.defineProperty(window.navigator, "clipboard", { writable: true, value: { writeText: () => Promise.resolve() } });
});

beforeEach(() => { window.localStorage.clear(); window.history.replaceState({}, "", "/skills/python"); });
afterEach(cleanup);

describe("repaired SkillSwap workspaces", () => {
  it("persists the local saved-skill UI state on the repaired skill detail", () => {
    renderRepair(<SkillDetailRepair />);
    const save = screen.getByRole("button", { name: /Save skill/i });
    fireEvent.click(save);
    expect(screen.getByRole("button", { name: /Saved/i })).toBeTruthy();
  });

  it("opens the explicit qualifications profile tab and its local add action", () => {
    window.history.replaceState({}, "", "/profile?tab=qualifications");
    renderRepair(<ProfileWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Qualifications" }));
    expect(screen.getByRole("heading", { name: /Keep claims and evidence clear/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Add qualification/i }));
    expect(screen.getByPlaceholderText("Qualification name")).toBeTruthy();
  });

  it("searches Help articles and opens an article rather than returning a placeholder notice", () => {
    renderRepair(<HelpRepair />);
    const input = screen.getByPlaceholderText("Search help articles");
    fireEvent.change(input, { target: { value: "earn points" } });
    fireEvent.click(screen.getByRole("button", { name: /How do I earn points/i }));
    expect(screen.getAllByRole("heading", { name: "How do I earn points?" }).length).toBeGreaterThan(0);
    expect(screen.getByText(/referral rewards/i)).toBeTruthy();
  });

  it("opens a local audio call from Messages and returns to the conversation", () => {
    window.history.replaceState({}, "", "/messages?pro=maya");
    renderRepair(<Messages />);
    fireEvent.click(screen.getByRole("button", { name: "Start audio call" }));
    expect(screen.getByText("LOCAL AUDIO CALL")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "End call" }));
    expect(screen.queryByText("LOCAL AUDIO CALL")).toBeNull();
  });

  it("preserves the private-feedback prerequisite and empty-review state without fabricating content", () => {
    renderRepair(<SessionsRepair />);
    expect(screen.getByText("No upcoming sessions")).toBeTruthy();
    window.history.replaceState({}, "", "/profile?tab=reviews");
    cleanup();
    renderRepair(<ProfileWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: "Reviews" }));
    expect(screen.getByText(/No feedback saved yet/i)).toBeTruthy();
  });

  it("explains Skill Points and opens a separated local purchase confirmation", () => {
    renderRepair(<WalletRepair />);
    expect(screen.getByText(/Start with 20 free Points/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Buy Points/i }));
    expect(screen.getByText("CONFIRM PURCHASE")).toBeTruthy();
    expect(screen.getByText("You pay")).toBeTruthy();
    expect(screen.getByText("You receive")).toBeTruthy();
  });
});
