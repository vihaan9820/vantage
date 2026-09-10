// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React from "react";
import Ferrofluid, { Ferrofluid as FerrofluidNamed } from "./Ferrofluid";
import FerrofluidAlias from "./ferro-fluid";
import FerrofluidBackground from "@/components/FerrofluidBackground";

describe("<Ferrofluid />", () => {
  it("renders container with default props and does not throw in jsdom", () => {
    const { container, unmount } = render(
      <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <Ferrofluid
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          speed={0.5}
          scale={1}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={3}
          shimmer={1}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.3}
        />
      </div>
    );

    const fluidContainer = container.querySelector(".ferrofluid-container");
    expect(fluidContainer).not.toBeNull();

    expect(() => unmount()).not.toThrow();
  });

  it("applies custom className and mixBlendMode", () => {
    const { container } = render(
      <Ferrofluid
        className="custom-fluid-class"
        mixBlendMode="screen"
        style={{ pointerEvents: "none" }}
      />
    );

    const fluidEl = container.querySelector(".ferrofluid-container");
    expect(fluidEl).not.toBeNull();
    expect(fluidEl?.classList.contains("custom-fluid-class")).toBe(true);
    expect((fluidEl as HTMLElement).style.mixBlendMode).toBe("screen");
    expect((fluidEl as HTMLElement).style.pointerEvents).toBe("none");
  });

  it("exports properly via named and alias exports", () => {
    expect(Ferrofluid).toBeDefined();
    expect(FerrofluidNamed).toBeDefined();
    expect(FerrofluidAlias).toBeDefined();
  });

  it("renders <FerrofluidBackground /> with fixed full-screen layout", () => {
    const { container, unmount } = render(<FerrofluidBackground className="test-bg" />);
    const bg = container.querySelector(".fixed.inset-0.pointer-events-none");
    expect(bg).not.toBeNull();
    expect(bg?.classList.contains("test-bg")).toBe(true);
    expect(() => unmount()).not.toThrow();
  });
});
