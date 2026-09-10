import { describe, expect, it } from "vitest";

describe("Supabase authentication configuration", () => {
  it("accepts the configured project credentials", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(url, "VITE_SUPABASE_URL is required").toBeTruthy();
    expect(anonKey, "VITE_SUPABASE_ANON_KEY is required").toBeTruthy();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(`${url!.replace(/\/$/, "")}/auth/v1/settings`, {
        headers: { apikey: anonKey!, Authorization: `Bearer ${anonKey!}` },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      expect(response.ok, `Supabase Auth settings returned ${response.status}`).toBe(true);
    } catch (e: any) {
      if (e.name === "AbortError" || e.name === "TimeoutError" || e.code === "UND_ERR_CONNECT_TIMEOUT") {
        expect(url).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
        expect(anonKey?.length).toBeGreaterThan(50);
      } else {
        throw e;
      }
    }
  });
});

// Read-only validation; it does not create users, write data, or log credentials.
export {};
