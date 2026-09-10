import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  supabase,
  signInWithGoogle as supabaseSignInWithGoogle,
  signInWithGithub as supabaseSignInWithGithub,
  signOutSupabase,
} from "@/lib/supabase";

export type AccountMode = "learn" | "teach" | "both";
export type ExperienceLevel = "Beginner" | "Intermediate" | "Advanced" | "Professional";
export type ProfileVisibility = "Public" | "Members only" | "Private";
export type MessagingPermission = "Everyone" | "Members" | "People I've interacted with";
export type ThemePreference = "dark" | "light" | "system";

export type Account = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  languages: string[];
  mode: AccountMode;
  onboardingComplete: boolean;
  learnSkills: string[];
  teachSkills: string[];
  experience: ExperienceLevel;
  learningStyles: string[];
  sessionPrice?: number;
  passwordUpdatedAt?: number;
};

export type ProductSettings = {
  theme: ThemePreference;
  animation: "full" | "reduced" | "minimal";
  effects3d: boolean;
  highContrast: boolean;
  textScale: "default" | "large" | "larger";
  notifications: Record<string, boolean>;
  profileVisibility: ProfileVisibility;
  showOnline: boolean;
  showLearning: boolean;
  showTeaching: boolean;
  allowMessages: MessagingPermission;
  language: string;
  learningPreference: string;
  teachingPreference: string;
  connectedAccounts: string[];
};

const ACCOUNT_KEY = "skillswap-account-v1";
const ACCOUNTS_KEY = "skillswap-accounts-v1";
const SETTINGS_KEY = "skillswap-settings-v1";
const defaultSettings: ProductSettings = {
  theme: "dark",
  animation: "full",
  effects3d: true,
  highContrast: false,
  textScale: "default",
  notifications: {
    Messages: true,
    "Session reminders": true,
    "Booking updates": true,
    "Skill recommendations": true,
    "Professional responses": true,
    "Community activity": false,
    "Point transactions": true,
    Promotions: false,
    "Learning reminders": true,
    Email: true,
    Push: false,
  },
  profileVisibility: "Members only",
  showOnline: true,
  showLearning: true,
  showTeaching: true,
  allowMessages: "Members",
  language: "English",
  learningPreference: "Project-based practice",
  teachingPreference: "Open to one-to-one sessions",
  connectedAccounts: [],
};

type AccountContextValue = {
  account: Account | null;
  settings: ProductSettings;
  logIn: (email: string, displayName?: string) => Account;
  createAccount: (input: Pick<Account, "name" | "email" | "location" | "languages" | "mode">) => Account;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  continueWithProvider: (provider: "GitHub" | "Google" | "Apple" | "Microsoft") => Promise<Account | void> | Account;
  finishOnboarding: (input: Pick<Account, "learnSkills" | "teachSkills" | "experience" | "learningStyles">) => void;
  signOut: () => void;
  updateSettings: (patch: Partial<ProductSettings>) => void;
  updateProfile: (patch: Partial<Pick<Account, "name" | "location" | "languages" | "mode" | "sessionPrice">>) => void;
  updateCredential: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function accountInitials(value: string) {
  if (!value || typeof value !== "string") return "SS";
  const trimmed = value.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/") || trimmed.startsWith("data:")) {
    return "SS";
  }
  return (
    trimmed
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "SS"
  );
}

export function extractAccountNameFromSupabase(user: any): string {
  const metadata = user?.user_metadata || {};
  const identityData = user?.identities?.[0]?.identity_data || {};

  const fullName =
    metadata.full_name ||
    metadata.name ||
    identityData.full_name ||
    identityData.name;
  if (fullName && typeof fullName === "string" && fullName.trim()) {
    return fullName.trim();
  }

  const given = metadata.given_name || identityData.given_name;
  const family = metadata.family_name || identityData.family_name;
  if (given || family) {
    const combined = `${given || ""} ${family || ""}`.trim();
    if (combined) return combined;
  }

  const username =
    metadata.user_name ||
    metadata.preferred_username ||
    identityData.user_name;
  if (username && typeof username === "string" && username.trim()) {
    return username.trim();
  }

  if (user?.email) {
    return user.email
      .split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
  }

  return "SkillSwap Member";
}

export function createPrototypeAccount(
  input: Pick<Account, "name" | "email" | "location" | "languages" | "mode">,
  id = "member-test"
): Account {
  return {
    id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    avatar: accountInitials(input.name),
    location: input.location,
    languages: input.languages.length ? input.languages : ["English"],
    mode: input.mode,
    onboardingComplete: false,
    learnSkills: [],
    teachSkills: [],
    experience: "Beginner",
    learningStyles: [],
    sessionPrice: 14,
  };
}

export function defaultProductSettings(): ProductSettings {
  return { ...defaultSettings, notifications: { ...defaultSettings.notifications } };
}

function readAccounts(): Account[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function findKnownAccount(accounts: Account[], email: string) {
  return accounts.find((account) => account.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function mapSupabaseUserToAccount(user: any, existingAccounts: Account[]): Account {
  const name = extractAccountNameFromSupabase(user);
  const email = user.email || `${user.id.slice(0, 8)}@user.supabase`;
  const existing = findKnownAccount(existingAccounts, email);

  if (existing) {
    return {
      ...existing,
      id: user.id,
      name,
      avatar: accountInitials(name),
      sessionPrice: existing.sessionPrice ? Math.max(12, existing.sessionPrice) : 14,
    };
  }

  return {
    id: user.id,
    name,
    email,
    avatar: accountInitials(name),
    location: "",
    languages: ["English"],
    mode: "both",
    onboardingComplete: false,
    learnSkills: [],
    teachSkills: [],
    experience: "Beginner",
    learningStyles: [],
    sessionPrice: 14,
  };
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => readStored<Account | null>(ACCOUNT_KEY, null));
  const [accounts, setAccounts] = useState<Account[]>(readAccounts);
  const [settings, setSettings] = useState<ProductSettings>(() => readStored(SETTINGS_KEY, defaultSettings));

  // Sync Supabase Auth session on mount and state changes without creating render loops
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted || !session?.user) return;
      const nextAccount = mapSupabaseUserToAccount(session.user, readAccounts());
      setAccount((current) => {
        if (
          current &&
          current.id === nextAccount.id &&
          current.name === nextAccount.name &&
          current.email === nextAccount.email
        ) {
          return current;
        }
        return nextAccount;
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        const nextAccount = mapSupabaseUserToAccount(session.user, readAccounts());
        setAccount((current) => {
          if (
            current &&
            current.id === nextAccount.id &&
            current.name === nextAccount.name &&
            current.email === nextAccount.email
          ) {
            return current;
          }
          return nextAccount;
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (account) {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
      setAccounts((current) => {
        const index = current.findIndex((item) => item.email.toLowerCase() === account.email.toLowerCase());
        if (index === -1) return [...current, account];
        if (JSON.stringify(current[index]) === JSON.stringify(account)) return current;
        const next = [...current];
        next[index] = account;
        return next;
      });
    } else {
      localStorage.removeItem(ACCOUNT_KEY);
    }
  }, [account]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.dataset.skillswapTheme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }, []);

  const logIn = useCallback(
    (email: string, displayName?: string) => {
      const name =
        displayName?.trim() ||
        account?.name ||
        email
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
        "SkillSwap Member";
      const next: Account =
        account && account.email.toLowerCase() === email.toLowerCase()
          ? account
          : findKnownAccount(accounts, email) ?? {
              id: `member-${Date.now()}`,
              name,
              email: email.trim().toLowerCase(),
              avatar: accountInitials(name),
              location: "",
              languages: ["English"],
              mode: "both",
              onboardingComplete: false,
              learnSkills: [],
              teachSkills: [],
              experience: "Beginner",
              learningStyles: [],
            };
      setAccount(next);
      return next;
    },
    [account, accounts]
  );

  const createAccount = useCallback((input: Pick<Account, "name" | "email" | "location" | "languages" | "mode">) => {
    const next = createPrototypeAccount(input, `member-${Date.now()}`);
    try {
      const storageKey = `skillswap-professional-demo-v2:${next.id}`;
      const now = Date.now();
      const initialMemberState = {
        starterRewardClaimed: true,
        starterPoints: 20,
        wallet: 20,
        walletVisited: false,
        savedIds: [],
        savedSkills: [],
        qualifications: [],
        portfolioProjects: [],
        accomplishments: [],
        reviewFeedback: [],
        referral: { code: `SKILL-${next.id.slice(-6).toUpperCase()}`, invites: 0, joined: 0, earned: 0, history: [] },
        paymentMethods: [],
        communityPosts: [],
        conversationSafety: {},
        conversationReports: [],
        calls: [],
        security: {
          twoFactorEnabled: false,
          recoveryEmail: "",
          backupCodes: [],
          sessions: [
            { id: "current", device: "Current device", browser: "Browser session", location: input.location || "Approximate local area", lastActive: "Active now", current: true },
          ],
        },
        selectedProfessionalId: "maya",
        messages: [],
        transactions: [
          {
            id: `starter-${now}`,
            type: "Starter Reward",
            amount: 20,
            balance: 20,
            date: now,
            status: "Completed",
            note: "Welcome Bonus: 20 Skill Points credited upon registration",
          },
        ],
        sessions: [],
        notifications: [
          "Welcome to SkillSwap! +20 Starter Skill Points credited to your wallet.",
        ],
        typingProfessionalIds: [],
        teachingOfferings: [],
        barterProposals: [],
        timebankHoursEarned: 0,
        timebankHoursRedeemed: 0,
        karmaScore: 100,
      };
      localStorage.setItem(storageKey, JSON.stringify(initialMemberState));
    } catch {
      // LocalStorage fallback
    }
    setAccount(next);
    return next;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabaseSignInWithGoogle();
  }, []);

  const signInWithGithub = useCallback(async () => {
    await supabaseSignInWithGithub();
  }, []);

  const continueWithProvider = useCallback(
    async (provider: "GitHub" | "Google" | "Apple" | "Microsoft") => {
      if (provider === "GitHub") {
        await supabaseSignInWithGithub();
        return;
      }
      if (provider === "Google") {
        await supabaseSignInWithGoogle();
        return;
      }
      const next = logIn(`${provider.toLowerCase()}-member@skillswap.demo`, `${provider} Member`);
      setAccount({ ...next, onboardingComplete: false });
      return { ...next, onboardingComplete: false };
    },
    [logIn]
  );

  const finishOnboarding = useCallback(
    (input: Pick<Account, "learnSkills" | "teachSkills" | "experience" | "learningStyles">) =>
      setAccount((current) => (current ? { ...current, ...input, onboardingComplete: true } : current)),
    []
  );

  const signOut = useCallback(async () => {
    await signOutSupabase();
    setAccount(null);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<ProductSettings>) => setSettings((current) => ({ ...current, ...patch })),
    []
  );

  const updateProfile = useCallback(
    (patch: Partial<Pick<Account, "name" | "location" | "languages" | "mode" | "sessionPrice">>) =>
      setAccount((current) => {
        if (!current) return current;
        const nextPrice =
          patch.sessionPrice !== undefined
            ? Math.max(12, Math.round(Number(patch.sessionPrice) || 12))
            : (current.sessionPrice ?? 14);
        return {
          ...current,
          ...patch,
          sessionPrice: nextPrice,
          avatar: patch.name ? accountInitials(patch.name) : current.avatar,
        };
      }),
    []
  );

  const updateCredential = useCallback(
    () => setAccount((current) => (current ? { ...current, passwordUpdatedAt: Date.now() } : current)),
    []
  );

  const value = useMemo(
    () => ({
      account,
      settings,
      logIn,
      createAccount,
      signInWithGoogle,
      signInWithGithub,
      continueWithProvider,
      finishOnboarding,
      signOut,
      updateSettings,
      updateProfile,
      updateCredential,
    }),
    [
      account,
      settings,
      logIn,
      createAccount,
      signInWithGoogle,
      signInWithGithub,
      continueWithProvider,
      finishOnboarding,
      signOut,
      updateSettings,
      updateProfile,
      updateCredential,
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount must be used within AccountProvider");
  return context;
}
