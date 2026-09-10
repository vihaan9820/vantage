// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React from "react";
import { BorderGlow } from "./BorderGlow";

describe("<BorderGlow />", () => {
  it("renders children successfully", () => {
    render(
      <BorderGlow>
        <div data-testid="test-content">Interactive Content</div>
      </BorderGlow>
    );

    expect(screen.getByTestId("test-content")).toBeDefined();
    expect(screen.getByText("Interactive Content")).toBeDefined();
  });

  it("applies custom className and custom colors", () => {
    const { container } = render(
      <BorderGlow
        className="custom-glow-class"
        backgroundColor="#141824"
        borderRadius={20}
        colors={["#F59E0B", "#6366F1", "#10B981"]}
      >
        <span>Content</span>
      </BorderGlow>
    );

    const card = container.querySelector(".border-glow-card");
    expect(card).not.toBeNull();
    expect(card?.classList.contains("custom-glow-class")).toBe(true);
  });

  it("renders with exact user configuration and applies color variables", () => {
    const { container } = render(
      <BorderGlow
        edgeSensitivity={30}
        glowColor="40 80 80"
        backgroundColor="#120F17"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1.0}
        coneSpread={25}
        animated={false}
        colors={["#c084fc", "#f472b6", "#38bdf8"]}
      >
        <div style={{ padding: "2em" }}>
          <h2>Your Content Here</h2>
          <p>Hover near the edges to see the glow.</p>
        </div>
      </BorderGlow>
    );

    expect(screen.getByText("Your Content Here")).toBeDefined();
    expect(screen.getByText("Hover near the edges to see the glow.")).toBeDefined();

    const card = container.querySelector(".border-glow-card") as HTMLElement;
    expect(card).not.toBeNull();
    expect(card.style.getPropertyValue("--color-1")).toBe("#c084fc");
    expect(card.style.getPropertyValue("--color-2")).toBe("#f472b6");
    expect(card.style.getPropertyValue("--color-3")).toBe("#38bdf8");
    expect(card.style.getPropertyValue("--card-bg")).toBe("#120F17");
  });
});
