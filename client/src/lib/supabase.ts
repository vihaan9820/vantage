import { createClient, type Provider } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://yhbgukystflgmwubtyvo.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloYmd1a3lzdGZsZ213dWJ0eXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5Njk4ODMsImV4cCI6MjEwMzU0NTg4M30.C3V2M2Wppg26OE9snqvFbbSmIaxasWNsZWw1i87VUnw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
    },
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
    },
  });

  if (error) {
    throw error;
  }
  return data;
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase sign out error:", error);
  }
}
