// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { initSpatial3DScroll } from "./spatialScrollEngine";

describe("spatialScrollEngine", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("identifies major sections and assigns spatial layers for depth choreography", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <section id="hero" class="hero">
        <div class="stage-glow">Glow</div>
        <div class="glass-panel">Panel</div>
        <h1>Headline</h1>
      </section>
      <section id="features" class="cycle-section">
        <div class="cycle-detail">Detail</div>
        <h2>Feature Headline</h2>
      </section>
    `;
    document.body.appendChild(root);

    // Mock matchMedia to simulate standard motion
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const controller = initSpatial3DScroll({ root });

    const hero = root.querySelector("#hero") as HTMLElement;
    const glow = root.querySelector(".stage-glow") as HTMLElement;
    const panel = root.querySelector(".glass-panel") as HTMLElement;
    const h1 = root.querySelector("h1") as HTMLElement;

    expect(hero.classList.contains("spatial-section-target")).toBe(true);
    expect(glow.classList.contains("spatial-bg-layer")).toBe(true);
    expect(panel.classList.contains("spatial-mid-layer")).toBe(true);
    expect(h1.classList.contains("spatial-fg-layer")).toBe(true);

    controller.destroy();
  });

  it("respects prefers-reduced-motion by returning a no-op controller", () => {
    const root = document.createElement("div");
    root.innerHTML = `<section id="hero"><h1>Title</h1></section>`;
    document.body.appendChild(root);

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const controller = initSpatial3DScroll({ root });
    const hero = root.querySelector("#hero") as HTMLElement;

    // Under reduced motion, no spatial target classes or inline transforms should be applied
    expect(hero.style.transform).toBe("");
    controller.destroy();
  });

  it("cleans up inline transforms and event listeners completely on destroy", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <section id="sec1">
        <div class="stage-glow"></div>
        <div class="glass-panel"></div>
        <h1>Title</h1>
      </section>
    `;
    document.body.appendChild(root);

    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const controller = initSpatial3DScroll({ root });
    const sec1 = root.querySelector("#sec1") as HTMLElement;
    sec1.style.transform = "translate3d(0, 0, -50px)";
    sec1.style.opacity = "0.7";

    controller.destroy();

    expect(sec1.style.transform).toBe("");
    expect(sec1.style.opacity).toBe("");
  });
});
