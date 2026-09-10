// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { SpecularButton } from "./SpecularButton";

describe("<SpecularButton />", () => {
  afterEach(cleanup);

  it("renders with default props and text content", () => {
    render(<SpecularButton>Get Started</SpecularButton>);
    const button = screen.getByRole("button", { name: /get started/i });
    expect(button).toBeDefined();
    expect(button.classList.contains("specular-button")).toBe(true);
    expect(button.classList.contains("specular-button--lg")).toBe(true);
  });

  it("handles click events properly", () => {
    const handleClick = vi.fn();
    render(
      <SpecularButton
        size="lg"
        radius={18}
        tint="#ffffff"
        tintOpacity={0}
        blur={0}
        textColor="#f5f5f5"
        lineColor="#ffffff"
        baseColor="#525252"
        intensity={1}
        shineSize={10}
        shineFade={40}
        thickness={1}
        speed={0.35}
        followMouse
        proximity={250}
        autoAnimate={false}
        onClick={handleClick}
      >
        Click Me
      </SpecularButton>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders with disabled state", () => {
    const handleClick = vi.fn();
    render(
      <SpecularButton disabled onClick={handleClick}>
        Disabled Action
      </SpecularButton>
    );
    const button = screen.getByRole("button", { name: /disabled action/i });
    expect(button.hasAttribute("disabled")).toBe(true);
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
