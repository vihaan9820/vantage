import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const indexCss = readFileSync(new URL("./index.css", import.meta.url), "utf8");
const accountCss = readFileSync(new URL("./account.css", import.meta.url), "utf8");
const appChromeSource = readFileSync(new URL("./components/AppChrome.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
const getStartedSource = readFileSync(new URL("./pages/GetStarted.tsx", import.meta.url), "utf8");
const quickTeachSource = readFileSync(new URL("./components/QuickTeachModal.tsx", import.meta.url), "utf8");
const swapProposalSource = readFileSync(new URL("./components/SwapProposalModal.tsx", import.meta.url), "utf8");
const productPagesSource = readFileSync(new URL("./pages/ProductPages.tsx", import.meta.url), "utf8");
const professionalsSource = readFileSync(new URL("./pages/Professionals.tsx", import.meta.url), "utf8");
const repairWorkspacesSource = readFileSync(new URL("./pages/RepairWorkspaces.tsx", import.meta.url), "utf8");

describe("Mobile Responsiveness & Viewport Integrity", () => {
  it("configures full-bleed mobile viewport-fit=cover in index.html", () => {
    expect(indexHtml).toContain('viewport-fit=cover');
  });

  it("defines mobile safe-area insets and touch-friendly styles in index.css", () => {
    expect(indexCss).toContain('--sat: env(safe-area-inset-top, 0px);');
    expect(indexCss).toContain('--sab: env(safe-area-inset-bottom, 0px);');
    expect(indexCss).toContain('-webkit-tap-highlight-color: transparent;');
    expect(indexCss).toContain('.table-responsive-wrapper');
  });

  it("configures modal portals with max-height and mobile-optimized bounds", () => {
    expect(indexCss).toContain('@media (max-width: 640px)');
    expect(indexCss).toContain('width: calc(100vw - 20px) !important;');
  });

  it("stacks auth layouts into a single column on tablet portrait and mobile in account.css", () => {
    expect(accountCss).toContain('@media (max-width: 980px)');
    expect(accountCss).toContain('@media (max-width: 720px)');
    expect(accountCss).toContain('@media (max-width: 380px)');
  });

  it("adapts AppChrome topbar and drawer for notch and narrow screen safety", () => {
    expect(appChromeSource).toContain('env(safe-area-inset-top');
    expect(appChromeSource).toContain('env(safe-area-inset-bottom');
    expect(appChromeSource).toContain('hidden min-[420px]:inline');
  });

  it("ensures landing pages wrap gracefully and preserve card padding on mobile", () => {
    expect(homeSource).toContain('p-5 sm:p-8 rounded-2xl sm:rounded-3xl');
    expect(getStartedSource).toContain('p-5 sm:p-8 rounded-2xl sm:rounded-3xl');
    expect(homeSource).toContain('hidden min-[420px]:inline');
    expect(getStartedSource).toContain('hidden min-[420px]:inline');
  });

  it("ensures modals support scrollable bodies for mobile keyboards", () => {
    expect(quickTeachSource).toContain('max-h-[92vh] overflow-y-auto');
    expect(swapProposalSource).toContain('max-h-[92vh] overflow-y-auto');
    expect(productPagesSource).toContain('max-h-[92vh] overflow-y-auto');
  });

  it("uses responsive 1-col mobile / 2-col tablet / 3-col desktop grids", () => {
    expect(professionalsSource).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
    expect(productPagesSource).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
    expect(repairWorkspacesSource).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3');
  });

  it("configures Option 1 mobile bottom navigation with Matches, Messages and proposal badges", () => {
    expect(appChromeSource).toContain('href: "/matches"');
    expect(appChromeSource).toContain('badge: (state.barterProposals || []).filter((p) => p.status === "Proposed").length');
    expect(appChromeSource).toContain('href: "/messages"');
  });

  it("equips Sessions page with Start Session live video call action and screen sharing", () => {
    expect(productPagesSource).toContain("Start Session (Live Call & Screen Share)");
    expect(productPagesSource).toContain("Screen Share Active");
    expect(productPagesSource).toContain("Stop Share");
  });
});
