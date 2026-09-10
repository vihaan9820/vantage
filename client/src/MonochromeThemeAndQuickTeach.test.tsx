// @vitest-environment jsdom
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach, beforeAll } from "vitest";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { SkillSwapProvider, useSkillSwap } from "./contexts/SkillSwapContext";
import { AccountProvider } from "./contexts/AccountContext";
import { QuickTeachModal } from "./components/QuickTeachModal";

function ThemeConsumer() {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggleTheme}>Toggle</button>
      <button data-testid="set-light-btn" onClick={() => setTheme("light")}>Set Light</button>
      <button data-testid="set-dark-btn" onClick={() => setTheme("dark")}>Set Dark</button>
    </div>
  );
}

function FullTestApp({ isModalOpen, onClose }: { isModalOpen: boolean; onClose: () => void }) {
  return (
    <ThemeProvider>
      <AccountProvider>
        <SkillSwapProvider>
          <div>
            <ThemeConsumer />
            <QuickTeachModal isOpen={isModalOpen} onClose={onClose} />
          </div>
        </SkillSwapProvider>
      </AccountProvider>
    </ThemeProvider>
  );
}

describe("Monochrome Theme and Quick Teach Integration", () => {
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
      value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("toggles between dark and monochrome light themes", () => {
    render(<FullTestApp isModalOpen={false} onClose={() => {}} />);
    
    // Default is dark
    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-skillswap-theme")).toBe("dark");

    // Toggle to light
    act(() => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("current-theme").textContent).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-skillswap-theme")).toBe("light");
    expect(window.localStorage.getItem("skillswap-theme")).toBe("light");

    // Toggle back to dark
    act(() => {
      fireEvent.click(screen.getByTestId("toggle-btn"));
    });

    expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-skillswap-theme")).toBe("dark");
  });

  it("renders QuickTeachModal when open and allows fast skill listing", () => {
    let closed = false;
    const handleClose = () => { closed = true; };

    const { rerender } = render(<FullTestApp isModalOpen={false} onClose={handleClose} />);
    expect(screen.queryByRole("dialog")).toBeNull();

    // Open modal
    rerender(<FullTestApp isModalOpen={true} onClose={handleClose} />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Share Your Expertise")).toBeDefined();

    // Fill skill input
    const skillInput = screen.getByLabelText(/What skill do you want to teach/i);
    fireEvent.change(skillInput, { target: { value: "Advanced System Architecture" } });

    // Submit offering
    const submitBtn = screen.getByRole("button", { name: /Publish Offering/i });
    act(() => {
      fireEvent.click(submitBtn);
    });

    expect(closed).toBe(true);
  });
});
