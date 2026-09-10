// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AccountProvider } from "../contexts/AccountContext";
import { SkillSwapProvider } from "../contexts/SkillSwapContext";
import { About, Community, Dashboard, Discover, Help, LearningHub, Matches, Profile, Saved, SearchResults, Sessions, Settings, SkillDetail } from "./ProductPages";

function renderPage(page: React.ReactNode) {
  return render(<AccountProvider><SkillSwapProvider>{page}</SkillSwapProvider></AccountProvider>);
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
});

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState({}, "", "/dashboard");
});

afterEach(cleanup);

describe("expanded SkillSwap product pages", () => {
  it("renders each added product workspace with its primary task heading", () => {
    const pages: React.ReactNode[] = [
      <Dashboard />, <Discover />, <LearningHub mode="learn" />, <LearningHub mode="teach" />, <Sessions />, <Saved />, <Matches />, <Community />, <Profile />, <Settings />, <Help />, <About />,
    ];
    for (const page of pages) {
      const view = renderPage(page);
      expect(view.container.querySelector("h1")?.textContent?.trim()).toBeTruthy();
      view.unmount();
    }
  });

  it("renders search results and a named skill detail from the route state", () => {
    window.history.replaceState({}, "", "/search?q=python");
    const search = renderPage(<SearchResults />);
    expect(screen.getByText(/Results for “python”/i)).toBeTruthy();
    expect(screen.getByText("Rahul Mehta")).toBeTruthy();
    search.unmount();

    window.history.replaceState({}, "", "/skills/python");
    renderPage(<SkillDetail />);
    expect(screen.getByRole("heading", { name: "Python" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Learn Python/i })).toBeTruthy();
  });

  it("filters the discovery catalog and switches the saved-content tab", () => {
    const discover = renderPage(<Discover />);
    const search = screen.getByPlaceholderText("Search skills, teachers, professionals, courses...");
    fireEvent.change(search, { target: { value: "Python" } });
    expect((search as HTMLInputElement).value).toBe("Python");
    expect(screen.getAllByText("Python").length).toBeGreaterThan(0);
    discover.unmount();

    const saved = renderPage(<Saved />);
    fireEvent.click(screen.getByRole("button", { name: "skills" }));
    expect(screen.getByText("No saved skills yet")).toBeTruthy();
    saved.unmount();
  });

  it("renders Proposals Inbox in Matches section, allows switching tabs and accepting proposals", () => {
    const matches = renderPage(<Matches />);
    expect(screen.getByRole("button", { name: /Peer Matches/i })).toBeTruthy();
    const inboxTab = screen.getByRole("button", { name: /Proposals Inbox/i });
    expect(inboxTab).toBeTruthy();

    // Switch to Inbox
    fireEvent.click(inboxTab);
    expect(screen.getByText("Received Barter Proposals")).toBeTruthy();

    // Accept proposal
    const acceptButtons = screen.getAllByRole("button", { name: /Accept Swap/i });
    expect(acceptButtons.length).toBeGreaterThan(0);
    fireEvent.click(acceptButtons[0]);

    // Check that schedule session appears
    expect(screen.getAllByRole("button", { name: /Schedule Session/i }).length).toBeGreaterThan(0);

    matches.unmount();
  });
});
