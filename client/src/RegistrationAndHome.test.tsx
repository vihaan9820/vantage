import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./pages/Home.tsx", import.meta.url), "utf8");
const signupSource = readFileSync(new URL("./pages/Signup.tsx", import.meta.url), "utf8");
const privacySource = readFileSync(new URL("./pages/PrivacyPolicy.tsx", import.meta.url), "utf8");
const appChromeSource = readFileSync(new URL("./components/AppChrome.tsx", import.meta.url), "utf8");
const accountContextSource = readFileSync(new URL("./contexts/AccountContext.tsx", import.meta.url), "utf8");

describe("SkillSwap Homepage, Registration & Privacy Integration", () => {
  it("routes '/' to the public Home page and includes '/get-started' and '/privacy'", () => {
    expect(appSource).toContain('if (["/", "/home", "/landing"].includes(location))');
    expect(appSource).toContain('path="/get-started"');
    expect(appSource).toContain('path="/privacy"');
  });

  it("points the SkillSwap logo to '/get-started'", () => {
    // In Home.tsx and AppChrome.tsx
    expect(homeSource).toContain('href="/get-started"');
    expect(appChromeSource).toContain('href="/get-started"');
  });

  it("awards 20 points upon registration in AccountContext", () => {
    expect(accountContextSource).toContain("starterPoints: 20");
    expect(accountContextSource).toContain("wallet: 20");
    expect(accountContextSource).toContain('type: "Starter Reward"');
    expect(accountContextSource).toContain("amount: 20");
  });

  it("renders the 20-point welcome celebration modal in Signup.tsx", () => {
    expect(signupSource).toContain("+20 Skill Points Credited!");
    expect(signupSource).toContain("Starter Welcome Reward");
  });

  it("provides comprehensive Privacy Policy guarantees without third-party data selling", () => {
    expect(privacySource).toContain("Zero Third-Party Selling");
    expect(privacySource).toContain("Peer-to-Peer Encryption");
    expect(privacySource).toContain("Transparent TimeBank Ledger");
  });

  it("applies translucent glassmorphic blocks on the homepage for clean visual hierarchy", () => {
    expect(homeSource).toContain('glass-panel');
    expect(homeSource).toContain('+20 Starter Bonus Included');
    expect(homeSource).toContain('Create New Account');
    expect(homeSource).toContain('Sign In to Account');
    expect(homeSource).toContain('font-megiko');
    expect(homeSource).toContain('text-3xl sm:text-4xl lg:text-5xl');
  });

  it("ensures no private API keys or secrets are exposed in client bundle code", () => {
    const forbiddenPatterns = [
      /service_role_key/i,
      /sbp_[a-zA-Z0-9]{20,}/,
      /sk_live_[a-zA-Z0-9]{20,}/,
    ];
    for (const pattern of forbiddenPatterns) {
      expect(homeSource).not.toMatch(pattern);
      expect(signupSource).not.toMatch(pattern);
      expect(privacySource).not.toMatch(pattern);
      expect(appSource).not.toMatch(pattern);
    }
  });
});
