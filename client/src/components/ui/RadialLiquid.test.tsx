// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import React from "react";
import RadialLiquid from "./radial-liquid";

describe("<RadialLiquid />", () => {
  it("renders container and canvas with default props", () => {
    const { container } = render(<RadialLiquid className="test-liquid-container" />);
    const wrapper = container.querySelector(".test-liquid-container");
    expect(wrapper).toBeDefined();
    const canvas = wrapper?.querySelector("canvas");
    expect(canvas).toBeDefined();
  });

  it("renders children when provided", () => {
    render(
      <RadialLiquid>
        <div data-testid="liquid-child">Liquid Child Content</div>
      </RadialLiquid>
    );
    expect(screen.getByTestId("liquid-child")).toBeDefined();
    expect(screen.getByText("Liquid Child Content")).toBeDefined();
  });

  it("accepts custom colors, distortion, and dimensions without throwing", () => {
    const { container } = render(
      <RadialLiquid
        width="100%"
        height={400}
        color1="#ffffff"
        color2="#27272a"
        color3="#09090b"
        backgroundColor="#000000"
        distortionType="plasma"
        speed={0.5}
        waveSize={4.0}
        scale={1.2}
      />
    );
    expect(container.querySelector("canvas")).toBeDefined();
  });
});
