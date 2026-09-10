import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const getStartedSource = readFileSync(new URL("./pages/GetStarted.tsx", import.meta.url), "utf8");
const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("Vantage Get Started Page & Logo Integration", () => {
  it("mounts GetStarted component on route /get-started in App.tsx", () => {
    expect(appSource).toContain('import GetStarted from "./pages/GetStarted"');
    expect(appSource).toContain('<Route path="/get-started" component={GetStarted} />');
  });

  it("features the official Vantage logo image", () => {
    expect(getStartedSource).toContain('src="/vantage-logo.png"');
    expect(getStartedSource).toContain('alt="Vantage Official Logo"');
  });

  it("prominently presents the +20 Starter Bonus and both Create Account and Sign In actions", () => {
    expect(getStartedSource).toContain("+20 Starter Bonus Included");
    expect(getStartedSource).toContain("Create New Account");
    expect(getStartedSource).toContain("Sign In to Account");
    expect(getStartedSource).toContain('href="/signup"');
    expect(getStartedSource).toContain('href="/login"');
  });

  it("ensures the logo is completely non-clickable with pointer-events disabled", () => {
    // Must be completely non-clickable with no pointer cursor or navigate handler
    expect(getStartedSource).toContain('pointer-events-none');
    expect(getStartedSource).toContain('cursor-default');
    expect(getStartedSource).not.toContain('onClick={() => navigate("/")}');
    expect(getStartedSource).not.toMatch(/cursor-pointer[^"]*vantage-logo/);
  });

  it("applies the Megiko typography font family to page headings and brand", () => {
    expect(getStartedSource).toContain("font-megiko");
  });

  it("renders large prominent Vantage brand typography in navigation and hero", () => {
    expect(getStartedSource).toContain("text-3xl sm:text-4xl lg:text-5xl");
    expect(getStartedSource).toContain("text-4xl sm:text-6xl md:text-7xl tracking-widest uppercase");
  });
});

