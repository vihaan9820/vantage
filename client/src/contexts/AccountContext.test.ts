import { describe, expect, it } from "vitest";
import { accountInitials, createPrototypeAccount, defaultProductSettings, findKnownAccount } from "./AccountContext";

describe("SkillSwap local account prototype", () => {
  it("normalizes a new account while preserving the selected role and safe defaults", () => {
    const account = createPrototypeAccount({ name: "  Riya Kapoor ", email: " RIYA@EXAMPLE.COM ", location: "Delhi", languages: [], mode: "both" }, "member-riya");
    expect(account).toMatchObject({ id: "member-riya", name: "Riya Kapoor", email: "riya@example.com", avatar: "RK", mode: "both", onboardingComplete: false, languages: ["English"], learnSkills: [], teachSkills: [] });
  });

  it("uses stable initials and returns non-shared notification settings", () => {
    expect(accountInitials("Ada Lovelace")).toBe("AL");
    expect(accountInitials(" ")).toBe("SS");
    const first = defaultProductSettings();
    const second = defaultProductSettings();
    first.notifications.Messages = false;
    expect(second.notifications.Messages).toBe(true);
    expect(first).toMatchObject({ language: "English", learningPreference: "Project-based practice", teachingPreference: "Open to one-to-one sessions", connectedAccounts: [] });
  });

  it("finds a prior prototype account by normalized email so login can restore its scoped state", () => {
    const saved = createPrototypeAccount({ name: "Riya Kapoor", email: "riya@example.com", location: "Delhi", languages: ["English"], mode: "both" }, "member-riya");
    expect(findKnownAccount([saved], " RIYA@EXAMPLE.COM ")).toBe(saved);
    expect(findKnownAccount([saved], "unknown@example.com")).toBeNull();
  });
});
