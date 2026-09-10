// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React from "react";
import GradualBlur from "./GradualBlur";

describe("<GradualBlur />", () => {
  it("renders with default props successfully", () => {
    const { container } = render(
      <section style={{ position: "relative", height: 500, overflow: "hidden" }}>
        <div style={{ height: "100%", overflowY: "auto", padding: "6rem 2rem" }}>
          <p>Test scrollable content</p>
        </div>
        <GradualBlur
          target="parent"
          position="bottom"
          height="6rem"
          strength={2}
          divCount={5}
          curve="bezier"
          exponential={true}
          opacity={1}
        />
      </section>
    );

    const gradualBlurEl = container.querySelector(".gradual-blur");
    expect(gradualBlurEl).not.toBeNull();
    expect(gradualBlurEl?.classList.contains("gradual-blur-parent")).toBe(true);

    const innerDivs = container.querySelectorAll(".gradual-blur-inner > div");
    expect(innerDivs.length).toBe(5);
  });

  it("renders with presets and custom directions", () => {
    const { container } = render(
      <GradualBlur
        preset="top"
        height="4rem"
        strength={1.5}
        divCount={3}
      />
    );

    const gradualBlurEl = container.querySelector(".gradual-blur");
    expect(gradualBlurEl).not.toBeNull();

    const innerDivs = container.querySelectorAll(".gradual-blur-inner > div");
    expect(innerDivs.length).toBe(3);
  });
});
