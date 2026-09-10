// @vitest-environment jsdom
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import React from "react";
import { describe, expect, it, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function ThemeToggleTestApp() {
  const { theme } = useTheme();
  return (
    <div>
      <span data-testid="theme-indicator">{theme}</span>
      <ThemeToggle />
    </div>
  );
}

describe("<ThemeToggle /> Component", () => {
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
      value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
  });

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("renders with role='switch' and defaults to dark mode", () => {
    render(
      <ThemeProvider>
        <ThemeToggleTestApp />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDefined();
    expect(toggle.getAttribute("aria-label")).toBe("Toggle light and dark theme");
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(screen.getByTestId("theme-indicator").textContent).toBe("dark");
  });

  it("toggles between dark and light on click", () => {
    render(
      <ThemeProvider>
        <ThemeToggleTestApp />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("switch");

    // Click to switch to light
    act(() => {
      fireEvent.click(toggle);
    });

    expect(screen.getByTestId("theme-indicator").textContent).toBe("light");
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-skillswap-theme")).toBe("light");

    // Click to switch back to dark
    act(() => {
      fireEvent.click(toggle);
    });

    expect(screen.getByTestId("theme-indicator").textContent).toBe("dark");
    expect(toggle.getAttribute("aria-checked")).toBe("true");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-skillswap-theme")).toBe("dark");
  });

  it("supports keyboard toggle using Space and Enter keys", () => {
    render(
      <ThemeProvider>
        <ThemeToggleTestApp />
      </ThemeProvider>
    );

    const toggle = screen.getByRole("switch");

    // Toggle with Space
    act(() => {
      fireEvent.keyDown(toggle, { key: " " });
    });
    expect(screen.getByTestId("theme-indicator").textContent).toBe("light");

    // Toggle back with Enter
    act(() => {
      fireEvent.keyDown(toggle, { key: "Enter" });
    });
    expect(screen.getByTestId("theme-indicator").textContent).toBe("dark");
  });

  it("supports controlled theme and custom onToggle handler", () => {
    const onToggleMock = vi.fn();
    const { rerender } = render(
      <ThemeToggle theme="light" onToggle={onToggleMock} />
    );

    const toggle = screen.getByRole("switch");
    expect(toggle.getAttribute("aria-checked")).toBe("false");

    act(() => {
      fireEvent.click(toggle);
    });

    expect(onToggleMock).toHaveBeenCalledTimes(1);

    // Controlled switch to dark
    rerender(<ThemeToggle theme="dark" onToggle={onToggleMock} />);
    expect(toggle.getAttribute("aria-checked")).toBe("true");
  });

  it("cannot be toggled when disabled", () => {
    const onToggleMock = vi.fn();
    render(
      <ThemeToggle disabled onToggle={onToggleMock} />
    );

    const toggle = screen.getByRole("switch") as HTMLButtonElement;
    expect(toggle.disabled).toBe(true);

    act(() => {
      fireEvent.click(toggle);
    });

    expect(onToggleMock).not.toHaveBeenCalled();
  });
});
