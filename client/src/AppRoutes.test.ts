import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allSkills, skillTaxonomy } from "./pages/ProductPages";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("expanded product route contract", () => {
  const expectedRoutes = [
    "/dashboard", "/discover", "/search", "/skills/:slug", "/learn", "/teach", "/sessions", "/saved", "/matches", "/community", "/profile", "/settings", "/help", "/about",
  ];

  it("registers every expanded product route in the application shell", () => {
    for (const path of expectedRoutes) expect(appSource).toContain(`path=\"${path}\"`);
  });

  it("provides a broad taxonomy and a stable Python skill route target", () => {
    expect(skillTaxonomy).toHaveLength(10);
    expect(allSkills.length).toBeGreaterThan(90);
    expect(allSkills).toContainEqual({ skill: "Python", category: "Technology" });
  });
});
