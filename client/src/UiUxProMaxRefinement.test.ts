import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(new URL("./uiux-pro-max.css", import.meta.url), "utf8");
const appChrome = readFileSync(new URL("./components/AppChrome.tsx", import.meta.url), "utf8");
const wallet = readFileSync(new URL("./pages/WalletRepair.tsx", import.meta.url), "utf8");

describe("UI/UX Pro Max shared refinement layer", () => {
  it("provides visible theme-aware focus, touch targets, disabled feedback, and reduced-motion support", () => {
    expect(stylesheet).toContain(":focus-visible");
    expect(stylesheet).toContain('html[data-skillswap-theme="light"]');
    expect(stylesheet).toContain("min-height: 44px");
    expect(stylesheet).toContain("cursor: not-allowed");
    expect(stylesheet).toContain("prefers-reduced-motion: reduce");
    expect(stylesheet).toContain(".wallet-quick-actions > button");
    expect(stylesheet).toContain("grid-template-columns: auto minmax(0, 1fr)");
  });

  it("exposes expanded state and current navigation to assistive technologies", () => {
    expect(appChrome).toContain('aria-controls="notification-center"');
    expect(appChrome).toContain('aria-controls="profile-navigation-menu"');
    expect(appChrome).toContain('id="main-mobile-navigation"');
    expect(appChrome).toContain('aria-current={active ? "page" : undefined}');
    expect(appChrome).toContain('aria-pressed={notificationTab === tab}');
  });

  it("provides representative accessible form feedback and a visible local action-pending state", () => {
    expect(stylesheet).toContain('.form-error[role="alert"]');
    expect(stylesheet).toContain('[aria-invalid="true"]');
    expect(wallet).toContain('id="transfer-feedback"');
    expect(wallet).toContain('aria-busy={isProcessingCheckout}');
    expect(wallet).toContain("Processing local payment…");
  });
});
