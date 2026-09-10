import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("./theme-correction.css", import.meta.url), "utf8");
const documentHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("editorial typography and warm light palette", () => {
  it("loads one editorial display font alongside the readable UI sans-serif", () => {
    expect(documentHtml).toContain("DM+Serif+Display");
    expect(stylesheet).toContain('--ss-font-ui: "DM Sans", sans-serif');
    expect(stylesheet).toContain('--ss-font-display: "DM Serif Display", Georgia, serif');
    expect(stylesheet).toContain("html, body, button, input, textarea, select { font-family: var(--ss-font-ui); }");
  });

  it("keeps the reference warm palette inside the persisted light-mode layer", () => {
    const warmLayer = stylesheet.slice(stylesheet.indexOf("Reference-inspired warm editorial palette"));
    expect(warmLayer).toContain('html[data-skillswap-theme="light"]');
    ["#f7f4ee", "#20201d", "#f27668", "#d8e9e1", "#f4d7cc", "#f4e4a8", "#355c52", "#ddd9d0"].forEach((color) => expect(warmLayer).toContain(color));
    expect(warmLayer).not.toContain(".product-theme-dark");
  });
});
