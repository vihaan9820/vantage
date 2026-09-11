import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { buildContextAwareReply } from "@/lib/chatEngine";

export type Professional = {
  id: string;
  name: string;
  title: string;
  primarySkill: string;
  specializations: string[];
  experience: number;
  location: string;
  timezone: string;
  languages: string[];
  price: number;
  availability: string;
  response: string;
  tier: "Rising" | "Trusted" | "Expert" | "Top Expert";
  verified: boolean;
  qualification: "verified" | "claimed";
  styles: string[];
  bio: string;
  avatar: string;
  accent: string;
  badges: string[];
  slots: string[];
  teachingSkills: { skill: string; level: "Expert" | "Advanced" | "Intermediate"; category: string }[];
  seekingSkills: { skill: string; category: string }[];
  swapsCompleted: number;
  rating: number;
  karmaLevel: string;
  completionRate: number;
  portfolioProof?: { title: string; link: string; metric: string }[];
};

export type BarterProposal = {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerAccent: string;
  requestSkill: string;
  offerSkill: string;
  format: "1 hr Live Video" | "2x 30-min Reviews" | "Async Code & Project Review";
  slot: string;
  status: "Proposed" | "Accepted" | "Session Scheduled" | "Completed" | "Declined";
  scheduledTime?: string;
  roomUrl?: string;
  notes?: string;
  createdAt: number;
  direction?: "incoming" | "outgoing";
};

export type WalletEntry = { id: string; type: "Starter Reward" | "Session Hold" | "Session Release" | "Earned" | "Purchased" | "Bonus" | "Referral Reward" | "Transfer"; amount: number; balance: number; date: number; status: "Completed" | "Held"; note?: string };
export type Proposal = { skill: string; duration: string; time: string; points: number; status: "pending" | "accepted" | "declined" };
export type ChatIntent = "greeting" | "skills" | "beginner" | "price" | "duration" | "availability" | "qualifications" | "experience" | "teaching" | "roadmap" | "portfolio" | "equipment" | "format" | "language" | "reschedule" | "cancel" | "booking" | "points" | "earning" | "platform" | "recommendation" | "reviews" | "project" | "fallback";
export type ChatAction = { type: "book" | "availability" | "qualifications" | "portfolio" | "wallet" | "teach" | "reschedule" | "cancel"; label: string; minutes?: 15 | 30 | 60; sessionId?: string };
export type ChatReply = { intent: ChatIntent; text: string; actions: ChatAction[] };
export type ChatMessage = { id: string; professionalId: string; sender: "learner" | "professional" | "system"; text: string; timestamp: number; status?: "Sending" | "Delivered" | "Read"; proposal?: Proposal; attachment?: string; intent?: ChatIntent; actions?: ChatAction[] };
export type Session = {
  id: string;
  professionalId: string;
  skill: string;
  time: string;
  points: number;
  status: "upcoming" | "pending" | "completed" | "cancelled";
  roomUrl?: string;
  isBarter?: boolean;
  format?: string;
  partnerName?: string;
  partnerAvatar?: string;
  partnerAccent?: string;
  offerSkill?: string;
  proposalId?: string;
};
export type ChatRuntimeContext = { wallet: number; sessions: Session[]; conversation: ChatMessage[]; marketplace: Professional[] };
export type SavedSkill = { id: string; name: string; category: string; savedAt: number };
export type ProfileQualification = { id: string; name: string; institution: string; year: string; status: "verified" | "claimed"; skill: string; evidence: string };
export type PortfolioProject = { id: string; title: string; description: string; skill: string; type: string; link: string; imageName?: string; createdAt: number };
export type Accomplishment = { id: string; title: string; description: string; date: string; category: string; evidence: string };
export type ReviewFeedback = { id: string; sessionId: string; professionalId: string; text: string; createdAt: number };
export type ReferralState = { code: string; invites: number; joined: number; earned: number; history: { id: string; action: "Copied" | "Shared" | "Completed"; label: string; date: number; reward?: number }[] };
export type PaymentMethod = { id: string; type: "Card" | "UPI"; label: string; last4?: string; createdAt: number };
export type CommunityAttachment = { id: string; name: string; size: number; type: string; url: string };
export type CommunityReply = { id: string; author: string; avatar: string; text: string; createdAt: number };
export type CommunityComment = { id: string; author: string; avatar: string; text: string; createdAt: number; liked: boolean; replies: CommunityReply[] };
export type CommunityPost = { id: string; type: string; text: string; author: string; avatar: string; createdAt: number; saved: boolean; appreciated: boolean; comments: CommunityComment[]; reported: boolean; shareCount: number; attachments?: CommunityAttachment[] };
export type ConversationSafety = { muted: boolean; blocked: boolean; clearedAt?: number };
export type ConversationReport = { id: string; professionalId: string; reason: string; description: string; createdAt: number };
export type CallRecord = { id: string; professionalId: string; kind: "audio" | "video"; startedAt: number; durationSeconds: number };
export type TeachingOffering = {
  id: string;
  skill: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  format: "60-min Session" | "30-min Practice" | "15-min Consultation" | "Project Review";
  price: number;
  description: string;
  availability: string;
  createdAt: number;
  status: "waiting" | "booked" | "completed";
  learnerName?: string;
  learnerAvatar?: string;
  bookedAt?: number;
  completedAt?: number;
  earnedGems?: number;
};
export type SecuritySession = { id: string; device: string; browser: string; location: string; lastActive: string; current: boolean };
export type SecurityState = { twoFactorEnabled: boolean; twoFactorMethod?: "Authenticator App" | "Email Code"; recoveryEmail: string; backupCodes: string[]; sessions: SecuritySession[] };
export type SkillSwapState = {
  starterRewardClaimed: boolean;
  starterPoints: number;
  wallet: number;
  walletVisited: boolean;
  savedIds: string[];
  savedSkills: SavedSkill[];
  qualifications: ProfileQualification[];
  portfolioProjects: PortfolioProject[];
  accomplishments: Accomplishment[];
  reviewFeedback: ReviewFeedback[];
  referral: ReferralState;
  paymentMethods: PaymentMethod[];
  communityPosts: CommunityPost[];
  conversationSafety: Record<string, ConversationSafety>;
  conversationReports: ConversationReport[];
  calls: CallRecord[];
  security: SecurityState;
  selectedProfessionalId: string;
  messages: ChatMessage[];
  transactions: WalletEntry[];
  sessions: Session[];
  notifications: string[];
  typingProfessionalIds: string[];
  teachingOfferings: TeachingOffering[];
  barterProposals: BarterProposal[];
  timebankHoursEarned: number;
  timebankHoursRedeemed: number;
  karmaScore: number;
};

const LEGACY_STORAGE_KEY = "skillswap-professional-demo-v1";
const STORAGE_KEY = "skillswap-professional-demo-v2";
export function skillSwapStorageKey(accountId?: string | null) { return `${STORAGE_KEY}:${accountId ?? "guest"}`; }

export const professionals: Professional[] = [
  {
    id: "maya",
    name: "Maya Sharma",
    title: "Commercial & Portrait Photographer",
    primarySkill: "Photography",
    specializations: ["Portraits", "Studio Lighting", "Color Grading"],
    experience: 8,
    location: "Mumbai",
    timezone: "UTC+5:30 (IST)",
    languages: ["English", "Hindi"],
    price: 16,
    availability: "Available today",
    response: "Usually replies in 5 min",
    tier: "Top Expert",
    verified: true,
    qualification: "verified",
    styles: ["Hands-on", "Project-based", "Beginner friendly"],
    bio: "Commercial photographer specializing in visual storytelling and lighting. Eager to trade portrait lessons for Next.js or React animation guidance.",
    avatar: "MS",
    accent: "#27272a",
    badges: ["Identity Verified", "Top Mentor", "99% Swap Rate"],
    slots: ["Today · 6:00 PM", "Tomorrow · 5:30 PM", "Saturday · 11:00 AM"],
    teachingSkills: [
      { skill: "Portrait Photography", level: "Expert", category: "Creative" },
      { skill: "Studio Lighting", level: "Expert", category: "Creative" },
      { skill: "Lightroom & Color Grading", level: "Advanced", category: "Design" },
    ],
    seekingSkills: [
      { skill: "Next.js", category: "Technology" },
      { skill: "3D Blender", category: "Design" },
      { skill: "UI/UX Design", category: "Design" },
    ],
    swapsCompleted: 34,
    rating: 4.9,
    karmaLevel: "Level 4 Mentor",
    completionRate: 99,
    portfolioProof: [
      { title: "Vogue India Editorial Shoot", link: "https://portfolio.mayasharma.lens", metric: "Featured in 2024" },
      { title: "Commercial Studio Lighting Guide", link: "https://learn.mayasharma.lens", metric: "140+ students" },
    ],
  },
  {
    id: "rahul",
    name: "Rahul Mehta",
    title: "Senior Full Stack & AI Engineer",
    primarySkill: "Python",
    specializations: ["FastAPI", "Next.js", "AI Pipelines", "System Design"],
    experience: 6,
    location: "Bengaluru",
    timezone: "UTC+5:30 (IST)",
    languages: ["English", "Hindi"],
    price: 14,
    availability: "Available tomorrow",
    response: "Usually replies within an hour",
    tier: "Expert",
    verified: true,
    qualification: "verified",
    styles: ["Project-based", "Code Review", "Theory + Practice"],
    bio: "Building full-stack AI agents and microservices. Trading Python/Next.js backend expertise for UI/UX Figma design systems or conversational Italian.",
    avatar: "RM",
    accent: "#18181b",
    badges: ["Identity Verified", "OSS Contributor", "98% Swap Rate"],
    slots: ["Tomorrow · 7:00 PM", "Friday · 6:30 PM", "Sunday · 4:00 PM"],
    teachingSkills: [
      { skill: "Python & FastAPI", level: "Expert", category: "Technology" },
      { skill: "Full Stack Architecture", level: "Advanced", category: "Technology" },
      { skill: "LLM Agent Pipelines", level: "Advanced", category: "Technology" },
    ],
    seekingSkills: [
      { skill: "Figma UI/UX Systems", category: "Design" },
      { skill: "Conversational Italian", category: "Languages" },
      { skill: "Product Copywriting", category: "Creative" },
    ],
    swapsCompleted: 42,
    rating: 4.9,
    karmaLevel: "Level 5 Master",
    completionRate: 98,
    portfolioProof: [
      { title: "Open-source Agent Framework (1.2k stars)", link: "https://github.com/rahulm/agent-flow", metric: "1.2k GitHub Stars" },
      { title: "Distributed Task Pipeline Demo", link: "https://demo.rahulm.dev", metric: "50k ops/sec" },
    ],
  },
  {
    id: "riya",
    name: "Riya Kapoor",
    title: "Lead Product Designer & Design System Architect",
    primarySkill: "UI/UX Design",
    specializations: ["Figma Systems", "Design Tokens", "Mobile UX", "User Research"],
    experience: 8,
    location: "Mumbai",
    timezone: "UTC+5:30 (IST)",
    languages: ["English", "Hindi"],
    price: 15,
    availability: "Available tomorrow",
    response: "Usually replies in 30 min",
    tier: "Top Expert",
    verified: true,
    qualification: "verified",
    styles: ["Portfolio focused", "Figma Live Work", "Career focused"],
    bio: "Designing fintech & consumer apps. Trading Figma design systems and UX audits for Python machine learning or guitar fundamentals.",
    avatar: "RK",
    accent: "#27272a",
    badges: ["Identity Verified", "Design Mentor", "100% Swap Rate"],
    slots: ["Tomorrow · 6:00 PM", "Saturday · 2:00 PM", "Sunday · 12:00 PM"],
    teachingSkills: [
      { skill: "UI/UX & Figma", level: "Expert", category: "Design" },
      { skill: "Design Systems & Tokens", level: "Expert", category: "Design" },
      { skill: "Portfolio Critique", level: "Advanced", category: "Design" },
    ],
    seekingSkills: [
      { skill: "Python Data Science", category: "Technology" },
      { skill: "Acoustic Guitar", category: "Music" },
      { skill: "Japanese (JLPT N5)", category: "Languages" },
    ],
    swapsCompleted: 29,
    rating: 5.0,
    karmaLevel: "Level 4 Mentor",
    completionRate: 100,
    portfolioProof: [
      { title: "Fintech Mobile App Rebrand (Dribbble)", link: "https://dribbble.com/riyadesign", metric: "45k Views" },
      { title: "Published Figma UI Kit (8k copies)", link: "https://figma.com/@riyadesign", metric: "8.2k Figma Clones" },
    ],
  },
  {
    id: "aisha",
    name: "Aisha Khan",
    title: "Executive Public Speaking Coach",
    primarySkill: "Public Speaking",
    specializations: ["TEDx Prep", "Pitch Presentations", "Executive Presence"],
    experience: 7,
    location: "Delhi",
    timezone: "UTC+5:30 (IST)",
    languages: ["English", "Hindi", "Urdu"],
    price: 12,
    availability: "Available today",
    response: "Usually replies in 15 min",
    tier: "Expert",
    verified: true,
    qualification: "claimed",
    styles: ["Interactive Practice", "Mock Pitches", "Confidence Building"],
    bio: "Coaching founders and engineers for keynotes and demo days. Trading presentation coaching for growth marketing and video editing skills.",
    avatar: "AK",
    accent: "#18181b",
    badges: ["Identity Verified", "Top Speaker", "99% Swap Rate"],
    slots: ["Today · 7:30 PM", "Saturday · 3:00 PM", "Sunday · 10:00 AM"],
    teachingSkills: [
      { skill: "Keynote Delivery", level: "Expert", category: "Professional" },
      { skill: "Pitch Deck Narrative", level: "Expert", category: "Business" },
      { skill: "Vocal Modulation", level: "Advanced", category: "Lifestyle" },
    ],
    seekingSkills: [
      { skill: "Video Editing", category: "Creative" },
      { skill: "SEO & Growth", category: "Business" },
      { skill: "Podcast Production", category: "Music" },
    ],
    swapsCompleted: 38,
    rating: 4.9,
    karmaLevel: "Level 4 Mentor",
    completionRate: 99,
    portfolioProof: [
      { title: "TEDx Coaching Alumni Roster", link: "https://aishakhan.speaker", metric: "18 TEDx Talks Coached" },
    ],
  },
  {
    id: "arjun",
    name: "Arjun Patel",
    title: "Guitarist & Audio Producer",
    primarySkill: "Guitar",
    specializations: ["Acoustic & Electric", "Songwriting", "Logic Pro X"],
    experience: 10,
    location: "Pune",
    timezone: "UTC+5:30 (IST)",
    languages: ["English", "Hindi", "Gujarati"],
    price: 12,
    availability: "This week",
    response: "Usually replies within a day",
    tier: "Trusted",
    verified: true,
    qualification: "claimed",
    styles: ["Hands-on", "Tab & Theory", "Beginner friendly"],
    bio: "Touring musician & studio producer. Trading guitar technique and audio mastering for 3D Blender models and Unreal Engine basics.",
    avatar: "AP",
    accent: "#27272a",
    badges: ["Identity Verified", "Studio Certified", "97% Swap Rate"],
    slots: ["Friday · 8:00 PM", "Saturday · 6:00 PM", "Sunday · 5:00 PM"],
    teachingSkills: [
      { skill: "Acoustic & Electric Guitar", level: "Expert", category: "Music" },
      { skill: "Music Theory & Chords", level: "Expert", category: "Music" },
      { skill: "DAW Mixing in Logic Pro", level: "Advanced", category: "Music" },
    ],
    seekingSkills: [
      { skill: "3D Blender Modeling", category: "Design" },
      { skill: "Unreal Engine 5", category: "Technology" },
      { skill: "French Language", category: "Languages" },
    ],
    swapsCompleted: 24,
    rating: 4.8,
    karmaLevel: "Level 3 Pioneer",
    completionRate: 97,
    portfolioProof: [
      { title: "Spotify Artist Profile (200k streams)", link: "https://spotify.com/artist/arjunpatel", metric: "200k+ Streams" },
    ],
  },
  {
    id: "kabir",
    name: "Kabir Shah",
    title: "Commercial Video Editor & Colorist",
    primarySkill: "Video Editing",
    specializations: ["Premiere Pro", "DaVinci Resolve", "Short-Form Storytelling"],
    experience: 7,
    location: "Ahmedabad",
    timezone: "UTC+5:30 (IST)",
    languages: ["English", "Hindi", "Gujarati"],
    price: 12,
    availability: "This week",
    response: "Usually replies within an hour",
    tier: "Rising",
    verified: false,
    qualification: "claimed",
    styles: ["Timeline Breakdown", "Project-based", "Color Science"],
    bio: "Editing commercials and YouTube viral stories. Trading video editing and color grading for full-stack web development.",
    avatar: "KS",
    accent: "#18181b",
    badges: ["Experience Listed", "Colorist Pro"],
    slots: ["Friday · 5:00 PM", "Saturday · 4:30 PM", "Monday · 7:00 PM"],
    teachingSkills: [
      { skill: "Premiere Pro & DaVinci", level: "Expert", category: "Creative" },
      { skill: "Short-Form Story Pacing", level: "Advanced", category: "Creative" },
      { skill: "Motion Graphics & After Effects", level: "Intermediate", category: "Design" },
    ],
    seekingSkills: [
      { skill: "React & TypeScript", category: "Technology" },
      { skill: "Prompt Engineering", category: "Technology" },
      { skill: "Public Speaking", category: "Professional" },
    ],
    swapsCompleted: 19,
    rating: 4.8,
    karmaLevel: "Level 3 Pioneer",
    completionRate: 96,
    portfolioProof: [
      { title: "YouTube Commercial Showreel (1M views)", link: "https://kabirfilms.reel", metric: "1.4M Total Views" },
    ],
  },
];

export const initialBarterProposals: BarterProposal[] = [
  {
    id: "barter-1",
    partnerId: "maya",
    partnerName: "Maya Sharma",
    partnerAvatar: "MS",
    partnerAccent: "#27272a",
    requestSkill: "Portrait Photography & Studio Lighting",
    offerSkill: "Next.js & Frontend Architecture",
    format: "1 hr Live Video",
    slot: "Today · 7:00 PM EST",
    status: "Session Scheduled",
    direction: "incoming",
    scheduledTime: "Today at 7:00 PM EST",
    roomUrl: "https://meet.skillswap.pro/room-maya-79",
    notes: "Collaborative session notes: Discuss three-point lighting setup and WebGL portfolio shaders.",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: "barter-2",
    partnerId: "rahul",
    partnerName: "Rahul Mehta",
    partnerAvatar: "RM",
    partnerAccent: "#18181b",
    requestSkill: "FastAPI & Python Async Backend",
    offerSkill: "Design Systems & Figma Component Specs",
    format: "2x 30-min Reviews",
    slot: "Tomorrow · 6:30 PM",
    status: "Accepted",
    direction: "incoming",
    scheduledTime: "Tomorrow at 6:30 PM",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: "barter-3",
    partnerId: "aisha",
    partnerName: "Aisha Khan",
    partnerAvatar: "AK",
    partnerAccent: "#27272a",
    requestSkill: "Executive Keynote & Public Speaking",
    offerSkill: "SEO Strategy & Content Distribution",
    format: "1 hr Live Video",
    slot: "Saturday · 3:00 PM",
    status: "Proposed",
    direction: "incoming",
    notes: "Hi! I noticed your background in SEO and content. I would love to trade an hour of public speaking coaching for an SEO audit.",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
  {
    id: "barter-5",
    partnerId: "riya",
    partnerName: "Riya Sen",
    partnerAvatar: "RS",
    partnerAccent: "#27272a",
    requestSkill: "Figma Design Tokens & UI Architecture",
    offerSkill: "Next.js 15 & Server Components",
    format: "1 hr Live Video",
    slot: "Tomorrow · 5:30 PM",
    status: "Proposed",
    direction: "incoming",
    notes: "Hey! Loved your Next.js and frontend work. I'd love to swap a full Figma component & design token audit for insights on Server Actions in Next.js!",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "barter-4",
    partnerId: "arjun",
    partnerName: "Arjun Patel",
    partnerAvatar: "AP",
    partnerAccent: "#18181b",
    requestSkill: "Music Production & Vocal Mixing",
    offerSkill: "3D Blender Modeling & Texturing",
    format: "1 hr Live Video",
    slot: "Completed on Friday",
    status: "Completed",
    direction: "incoming",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
  },
];

export function calculateMatchScore(
  learnGoal: string,
  offerSkill: string,
  partner: Professional
): number {
  const learnLower = (learnGoal || "").toLowerCase().trim();
  const offerLower = (offerSkill || "").toLowerCase().trim();
  if (!learnLower && !offerLower) return 88;

  let score = 55;
  const teachesMatches =
    partner.teachingSkills?.some(
      (t) => t.skill.toLowerCase().includes(learnLower) || learnLower.includes(t.skill.toLowerCase())
    ) ||
    partner.primarySkill.toLowerCase().includes(learnLower) ||
    partner.specializations.some((s) => s.toLowerCase().includes(learnLower));

  const seeksMatches = partner.seekingSkills?.some(
    (s) => s.skill.toLowerCase().includes(offerLower) || offerLower.includes(s.skill.toLowerCase())
  );

  if (teachesMatches && seeksMatches) score = 98;
  else if (teachesMatches) score = 91;
  else if (seeksMatches) score = 84;
  else score = 72;

  return score;
}

export const initialOfferings: TeachingOffering[] = [
  {
    id: "offering-starter-1",
    skill: "Python",
    category: "Technology",
    level: "Beginner",
    format: "15-min Consultation",
    price: 0,
    description: "Introductory roadmap consultation to discuss coding goals and beginner projects.",
    availability: "Weekday evenings",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    status: "waiting",
  },
  {
    id: "offering-starter-2",
    skill: "UI Design",
    category: "Design",
    level: "Intermediate",
    format: "60-min Session",
    price: 14,
    description: "Hands-on Figma portfolio critique and practical UI system refinement.",
    availability: "Weekends · 11:00 AM - 4:00 PM",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    status: "waiting",
  },
];

const initialMessages: ChatMessage[] = [
  { id: "hello-maya", professionalId: "maya", sender: "professional", text: "Hi! Tell me what you would like to make with photography, and I’ll suggest a good first session.", timestamp: Date.now() - 1000 * 60 * 18, status: "Read" },
  { id: "hello-rahul", professionalId: "rahul", sender: "professional", text: "Hi! If you share your current level, I can recommend a small Python project to begin with.", timestamp: Date.now() - 1000 * 60 * 14, status: "Read" },
  { id: "hello-aisha", professionalId: "aisha", sender: "professional", text: "Welcome — what kind of room or moment are you preparing to speak in?", timestamp: Date.now() - 1000 * 60 * 11, status: "Read" },
  { id: "hello-arjun", professionalId: "arjun", sender: "professional", text: "Hey! Are you hoping to play songs, understand chords, or make your own music?", timestamp: Date.now() - 1000 * 60 * 9, status: "Read" },
  { id: "hello-riya", professionalId: "riya", sender: "professional", text: "Hi! I’m happy to look at your portfolio goal and suggest a focused first exercise.", timestamp: Date.now() - 1000 * 60 * 7, status: "Read" },
];

export function applyStarterReward(current: SkillSwapState, now = Date.now()): SkillSwapState {
  if (current.starterRewardClaimed) return current;
  const balance = current.wallet + 20;
  return { ...current, starterRewardClaimed: true, starterPoints: 20, wallet: balance, transactions: [{ id: `starter-${now}`, type: "Starter Reward", amount: 20, balance, date: now, status: "Completed" }, ...current.transactions], notifications: ["Starter Reward received: +20 Skill Points", ...current.notifications] };
}

export function canReserveSession(current: SkillSwapState, points: number) { return current.wallet >= points; }

export function applyPointTransfer(current: SkillSwapState, recipient: string, amount: number, message = "", now = Date.now()): { state: SkillSwapState; success: boolean; error?: string } {
  const normalized = recipient.trim();
  if (!normalized) return { state: current, success: false, error: "Choose a recipient before transferring points." };
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount <= 0) return { state: current, success: false, error: "Enter a whole number of Skill Points greater than zero." };
  if (amount > current.wallet) return { state: current, success: false, error: `You only have ${current.wallet} Skill Points available.` };
  const balance = current.wallet - amount;
  return { state: { ...current, wallet: balance, starterPoints: Math.max(0, current.starterPoints - amount), transactions: [{ id: `transfer-${now}`, type: "Transfer", amount: -amount, balance, date: now, status: "Completed", note: `${normalized}${message.trim() ? ` · ${message.trim()}` : ""}` }, ...current.transactions], notifications: [`Transferred ${amount} Skill Points to ${normalized}`, ...current.notifications] }, success: true };
}

export function applyConversationClear(current: SkillSwapState, professionalId: string, now = Date.now()): SkillSwapState {
  return { ...current, messages: current.messages.filter((message) => message.professionalId !== professionalId), conversationSafety: { ...current.conversationSafety, [professionalId]: { ...(current.conversationSafety[professionalId] ?? { muted: false, blocked: false }), clearedAt: now } } };
}

export function applySessionReschedule(current: SkillSwapState, sessionId: string, time: string): SkillSwapState {
  const session = current.sessions.find((item) => item.id === sessionId && item.status === "upcoming");
  if (!session || !time.trim()) return current;
  return { ...current, sessions: current.sessions.map((item) => item.id === sessionId ? { ...item, time } : item), notifications: [`${session.skill} session rescheduled locally to ${time}`, ...current.notifications] };
}

export function applySessionCancellation(current: SkillSwapState, sessionId: string, now = Date.now()): SkillSwapState {
  const session = current.sessions.find((item) => item.id === sessionId && item.status === "upcoming");
  if (!session) return current;
  const balance = current.wallet + session.points;
  return { ...current, wallet: balance, sessions: current.sessions.map((item) => item.id === sessionId ? { ...item, status: "cancelled" } : item), transactions: [{ id: `release-${now}`, type: "Session Release", amount: session.points, balance, date: now, status: "Completed", note: `Local cancellation · ${session.skill}` }, ...current.transactions], notifications: [`${session.skill} session cancelled locally; ${session.points} Skill Points released`, ...current.notifications] };
}

export function applySelectedProfessional(current: SkillSwapState, id: string): SkillSwapState {
  return current.selectedProfessionalId === id ? current : { ...current, selectedProfessionalId: id };
}

const intentActions = (intent: ChatIntent, professional: Professional): ChatAction[] => {
  if (intent === "price" || intent === "duration") return [{ type: "book", label: `Book 60 min · ${professional.price} pts` }];
  if (intent === "availability") return [{ type: "availability", label: "View available times" }];
  if (intent === "qualifications") return [{ type: "qualifications", label: "View qualifications" }];
  if (intent === "portfolio") return [{ type: "portfolio", label: "View portfolio" }];
  return [];
};

const skillPath = (professional: Professional) => {
  const paths: Record<string, string> = {
    Photography: "We can begin with exposure, composition, and light, then use a small shooting exercise to turn those ideas into a repeatable habit.",
    Python: "We can begin with core Python ideas, then build a small useful program so variables, functions, debugging, and problem-solving have a real purpose.",
    "Public Speaking": "We can begin with a simple speaking structure, a low-pressure practice round, and feedback you can reuse for the next room or interview.",
    Guitar: "We can begin with tuning, comfortable chord changes, and a short musical pattern so you can start playing something recognizable right away.",
    "UI Design": "We can begin with a clear user problem, a simple Figma flow, and a portfolio-ready explanation of the decisions behind it.",
    "Video Editing": "We can begin with clip selection, pacing, and a simple edit structure, then refine one short sequence into a stronger story.",
  };
  return paths[professional.primarySkill] ?? `We can start with the fundamentals of ${professional.primarySkill}, then move into a practical exercise shaped around your goal.`;
};

export function getContextualQuickQuestions(professional: Professional): string[] {
  const bySkill: Record<string, string[]> = {
    Photography: ["What will I learn first?", "What camera or equipment do I need?", "Can you teach portrait photography?", "Can you review my photos?"],
    Python: ["Do I need coding experience?", "What projects will we build?", "Can you help me debug code?", "Can you help me prepare for interviews?"],
    Guitar: ["Do I need my own guitar?", "Can you teach chords and songs?", "How often should I practice?", "Can you teach fingerstyle?"],
    "Public Speaking": ["Is this suitable for beginners?", "Can you help with interviews?", "What will I practise first?", "Can we work on confidence?"],
    "UI Design": ["Can you review my portfolio?", "Do I need Figma experience?", "What project should I start with?", "Can you help me prepare for design interviews?"],
    "Video Editing": ["Which editing tool should I start with?", "Can you review my edit?", "What clips should I practise with?", "How do we work on storytelling?"],
  };
  return bySkill[professional.primarySkill] ?? ["Is this suitable for beginners?", "What will I learn first?", "When are you available?", "How much is a session?"];
}

export function buildProfessionalReply(professional: Professional, question: string, conversation: ChatMessage[] = []): ChatReply {
  const text = question.toLowerCase().trim();
  const mentionedBeginner = conversation.some((message) => message.sender === "learner" && /\b(beginners?|from zero|no experience|new to)\b/i.test(message.text));
  let intent: ChatIntent = "fallback";
  let reply = "I want to make sure I understand. Are you asking about the session price, what you’ll learn, availability, or whether this is suitable for your level?";
  if (/\b(price|cost|how much|fee|points?)\b/.test(text)) { intent = "price"; reply = `A 60-minute ${professional.primarySkill} session is ${professional.price} Skill Points. You can book when the time feels right, or ask a question first.`; }
  else if (/\b(duration|how long|minutes?|60 min)\b/.test(text)) { intent = "duration"; reply = `The standard session is 60 minutes and costs ${professional.price} Skill Points. We can use that time for a focused goal, practice, and clear next steps.`; }
  else if (/\b(available|availability|when|schedule|slot|time)\b/.test(text)) { intent = "availability"; reply = `My next listed ${professional.primarySkill} times are ${professional.slots.slice(0, 3).join(", ")}. Open the available times to choose the one that works for you.`; }
  else if (/\b(qualification|credential|certificate|certif|verified)\b/.test(text)) { intent = "qualifications"; reply = `My profile shows ${professional.qualification === "verified" ? "a platform-verified qualification" : "a qualification I have listed as a professional claim"}, alongside ${professional.experience}+ years of listed ${professional.primarySkill} practice. You can review the scope before booking.`; }
  else if (/\b(experience|years|background|worked)\b/.test(text) && !/do i need.*experience/.test(text)) { intent = "experience"; reply = `I have ${professional.experience}+ years of listed practice in ${professional.primarySkill}. My sessions focus on ${professional.specializations.slice(0, 3).join(", ")}, using a ${professional.styles.slice(0, 2).join(" and ").toLowerCase()} approach.`; }
  else if (/\b(portfolio|review my|review (my )?(work|photos|design|edit))\b/.test(text)) { intent = "portfolio"; reply = `Yes—bring the work you already have. We can review it against your goal, identify one or two useful gaps, and turn that into a practical next project.`; }
  else if (/\b(camera|equipment|gear|laptop|device|guitar)\b/.test(text)) { intent = "equipment"; reply = professional.primarySkill === "Photography" ? "You do not need a professional camera to begin. A smartphone or entry-level camera is enough; I’ll adapt the exercises to the equipment you have." : professional.primarySkill === "Guitar" ? "An entry-level guitar that stays in tune is enough to begin. We can work with the instrument you have and focus on comfortable technique." : `You do not need specialist equipment to start. Tell me what tools you already use and I’ll shape the first ${professional.primarySkill} exercise around them.`; }
  else if (/\b(online|offline|in person|location|remote)\b/.test(text)) { intent = "format"; reply = `This ${professional.primarySkill} session can be planned around an online conversation. Once you book, the session information will be visible in your Sessions area.`; }
  else if (/\b(language|hindi|english|urdu|gujarati|telugu)\b/.test(text)) { intent = "language"; reply = `I can communicate in ${professional.languages.join(", ")}. Let me know which one feels most comfortable for your session.`; }
  else if (/\b(cancel|reschedul|move (the )?session)\b/.test(text)) { intent = "reschedule"; reply = "If your plan changes, open your Sessions area first. You can review the held booking and choose another time before making a decision."; }
  else if (/\b(debug|project|portfolio|interview|career|feedback)\b/.test(text)) { intent = "project"; reply = professional.primarySkill === "Python" ? "Yes. We can use a small Python project or a real bug as the session anchor, then work through the reasoning instead of only handing over an answer." : `Yes. Bring the project or goal you are working on and we can turn it into focused ${professional.primarySkill} feedback with one useful next step.`; }
  else if (/\b(beginners?|from zero|no experience|start from scratch|new to)\b/.test(text) || /do i need.*experience/.test(text)) { intent = "beginner"; reply = `Yes. ${skillPath(professional)} No previous ${professional.primarySkill} experience is required.`; }
  else if (/\b(teach|method|style|approach)\b/.test(text)) { intent = "teaching"; reply = `My listed teaching style is ${professional.styles.join(", ")}. I’ll adapt the session to your current level, the outcome you want, and the time you have.`; }
  else if (/\b(learn|first|roadmap|outcome|cover|zero)\b/.test(text)) { intent = "roadmap"; reply = `${mentionedBeginner ? "Since you mentioned you are new to this, " : ""}${skillPath(professional)}`; }
  return { intent, text: reply, actions: intentActions(intent, professional) };
}

export const initialCommunityPosts: CommunityPost[] = [
  {
    id: "post-seed-1",
    type: "Share Project",
    text: "Completed our WebRTC peer-to-peer audio pipeline benchmark. Measured sub-45ms round-trip latency across distributed nodes. Sharing the latency distribution chart and audio filter preset!",
    author: "Maya Sharma",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    createdAt: Date.now() - 1000 * 60 * 180,
    saved: false,
    appreciated: true,
    shareCount: 4,
    reported: false,
    comments: [
      {
        id: "comment-seed-1",
        author: "Alex Chen",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        text: "Incredible latency numbers. Are you using Opus with DTX enabled or raw frames?",
        createdAt: Date.now() - 1000 * 60 * 120,
        liked: true,
        replies: [],
      },
    ],
    attachments: [
      {
        id: "att-seed-1",
        name: "webrtc-latency-benchmark.png",
        size: 142800,
        type: "image/png",
        url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><rect width='100%' height='100%' fill='%23050B14'/><g stroke='%231E3A5F' stroke-width='1'><line x1='60' y1='50' x2='740' y2='50'/><line x1='60' y1='130' x2='740' y2='130'/><line x1='60' y1='210' x2='740' y2='210'/><line x1='60' y1='290' x2='740' y2='290'/><line x1='60' y1='370' x2='740' y2='370'/></g><path d='M80,340 Q160,330 240,280 T400,160 T560,110 T720,80' fill='none' stroke='%234A93E8' stroke-width='4'/><circle cx='720' cy='80' r='6' fill='%23FFFFFF'/><text x='80' y='40' fill='%23FFFFFF' font-family='sans-serif' font-size='18' font-weight='bold'>Vantage WebRTC Latency Benchmark (ms)</text><text x='80' y='410' fill='%2380BAF8' font-family='sans-serif' font-size='13'>Avg: 42.4ms · P99: 68.1ms · 0 Packet Loss</text></svg>",
      },
      {
        id: "att-seed-2",
        name: "audio-filter-preset.json",
        size: 4096,
        type: "application/json",
        url: "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ sampleRate: 48000, channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true, latency: 0.01 }, null, 2)),
      },
    ],
  },
  {
    id: "post-seed-2",
    type: "Ask Question",
    text: "Building a custom reactive canvas for peer whiteboard barter sessions. Does anyone have experience with WebGL context loss recovery on mobile browsers during long meetings?",
    author: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    createdAt: Date.now() - 1000 * 60 * 600,
    saved: true,
    appreciated: false,
    shareCount: 1,
    reported: false,
    comments: [],
    attachments: [
      {
        id: "att-seed-3",
        name: "canvas-restore-handler.ts",
        size: 2840,
        type: "text/typescript",
        url: "data:text/plain;charset=utf-8," + encodeURIComponent("// WebGL Context Restoration Hook\nexport function useWebGLContextRestore(canvasRef: React.RefObject<HTMLCanvasElement>) {\n  // Context restoration logic\n}"),
      },
    ],
  },
];

const baseState: SkillSwapState = {
  starterRewardClaimed: false,
  starterPoints: 0,
  wallet: 4.5,
  walletVisited: false,
  savedIds: [],
  savedSkills: [],
  qualifications: [],
  portfolioProjects: [],
  accomplishments: [],
  reviewFeedback: [],
  referral: { code: "SKILL-BARTER", invites: 0, joined: 0, earned: 0, history: [] },
  paymentMethods: [],
  communityPosts: initialCommunityPosts,
  conversationSafety: {},
  conversationReports: [],
  calls: [],
  security: {
    twoFactorEnabled: false,
    recoveryEmail: "",
    backupCodes: [],
    sessions: [
      { id: "current", device: "Current device", browser: "Browser session", location: "Approximate local area", lastActive: "Active now", current: true },
      { id: "mobile-demo", device: "Mobile device", browser: "Local prototype", location: "Approximate local area", lastActive: "Earlier this week", current: false }
    ]
  },
  selectedProfessionalId: "maya",
  messages: initialMessages,
  transactions: [],
  sessions: [],
  notifications: [
    "⚡ 4.5 Swap Credits available in your TimeBank.",
    "⇄ Maya Sharma accepted your barter proposal (Portrait Photography ⇄ Next.js).",
    "📅 Upcoming 1:1 Live Video Session today at 7:00 PM EST.",
  ],
  typingProfessionalIds: [],
  teachingOfferings: initialOfferings,
  barterProposals: initialBarterProposals,
  timebankHoursEarned: 18.5,
  timebankHoursRedeemed: 14.0,
  karmaScore: 980,
};

type ContextValue = {
  state: SkillSwapState;
  professionals: Professional[];
  claimStarterReward: () => boolean;
  selectProfessional: (id: string) => void;
  toggleSave: (id: string) => void;
  toggleSavedSkill: (skill: Omit<SavedSkill, "savedAt">) => void;
  addQualification: (qualification: Omit<ProfileQualification, "id">) => void;
  addPortfolioProject: (project: Omit<PortfolioProject, "id" | "createdAt">) => void;
  addAccomplishment: (accomplishment: Omit<Accomplishment, "id">) => void;
  addReviewFeedback: (sessionId: string, professionalId: string, text: string) => boolean;
  recordReferralAction: (action: "Copied" | "Shared", label: string) => void;
  completeReferral: () => void;
  addPaymentMethod: (method: Omit<PaymentMethod, "id" | "createdAt">) => void;
  transferPoints: (recipient: string, amount: number, message: string) => { success: boolean; error?: string };
  purchase: (points: number, methodLabel?: string) => void;
  addCommunityPost: (type: string, text: string, author: string, avatar: string, attachments?: CommunityAttachment[]) => void;
  toggleCommunityReaction: (postId: string) => void;
  toggleCommunitySave: (postId: string) => void;
  addCommunityComment: (postId: string, text: string, author: string, avatar: string, parentCommentId?: string) => void;
  reportCommunityPost: (postId: string) => void;
  shareCommunityPost: (postId: string) => void;
  setConversationMuted: (professionalId: string, muted: boolean) => void;
  setConversationBlocked: (professionalId: string, blocked: boolean) => void;
  clearConversation: (professionalId: string) => void;
  reportConversation: (professionalId: string, reason: string, description: string) => void;
  recordCall: (professionalId: string, kind: "audio" | "video", durationSeconds: number) => void;
  enableTwoFactor: (method: "Authenticator App" | "Email Code") => void;
  signOutSecuritySession: (sessionId: string) => void;
  signOutOtherSecuritySessions: () => void;
  setRecoveryEmail: (email: string) => void;
  generateBackupCodes: () => void;
  sendMessage: (professionalId: string, text: string, attachment?: string) => void;
  createProposal: (professionalId: string, proposal: Omit<Proposal, "status">) => void;
  respondToProposal: (messageId: string, accept: boolean) => void;
  book: (professionalId: string, time: string, points?: number, skill?: string) => boolean;
  rescheduleSession: (sessionId: string, time: string) => boolean;
  cancelSession: (sessionId: string) => boolean;
  markWalletVisited: () => void;
  addTeachingOffering: (offering: Omit<TeachingOffering, "id" | "createdAt" | "status">) => TeachingOffering;
  simulateLearnerBooking: (offeringId: string, learnerName?: string, format?: "60-min Session" | "30-min Practice" | "15-min Consultation" | "Project Review") => void;
  completeTeachingOffering: (offeringId: string) => boolean;
  deleteTeachingOffering: (offeringId: string) => void;
  proposeBarterSwap: (proposal: Omit<BarterProposal, "id" | "createdAt" | "status">) => BarterProposal;
  acceptBarterProposal: (proposalId: string) => void;
  declineBarterProposal: (proposalId: string) => void;
  receiveBarterProposal: (proposal: Omit<BarterProposal, "id" | "createdAt" | "status">) => BarterProposal;
  deleteBarterProposal: (proposalId: string) => void;
  scheduleBarterSession: (proposalId: string, scheduledTime: string) => void;
  completeBarterSwap: (proposalId: string) => void;
};
const SkillSwapContext = createContext<ContextValue | null>(null);

function loadState(storageKey: string, legacyFallback = false): SkillSwapState {
  try {
    const stored = localStorage.getItem(storageKey) ?? (legacyFallback ? localStorage.getItem(LEGACY_STORAGE_KEY) : null);
    if (!stored) {
      if (!legacyFallback && storageKey.includes("member-")) {
        const now = Date.now();
        return {
          ...baseState,
          starterRewardClaimed: true,
          starterPoints: 20,
          wallet: 20,
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
          notifications: [
            "Welcome to SkillSwap! +20 Starter Skill Points credited to your wallet.",
            ...baseState.notifications,
          ],
        };
      }
      return baseState;
    }
    const parsed = JSON.parse(stored) as SkillSwapState;
    const storedMessageIds = new Set((parsed.messages ?? []).map((message) => message.id));
    const cleared = parsed.conversationSafety ?? {};
    return {
      ...baseState,
      ...parsed,
      communityPosts: parsed.communityPosts && Array.isArray(parsed.communityPosts) && parsed.communityPosts.length ? parsed.communityPosts : initialCommunityPosts,
      barterProposals: parsed.barterProposals && Array.isArray(parsed.barterProposals) && parsed.barterProposals.length ? parsed.barterProposals : initialBarterProposals,
      teachingOfferings: parsed.teachingOfferings && Array.isArray(parsed.teachingOfferings) && parsed.teachingOfferings.length ? parsed.teachingOfferings : initialOfferings,
      messages: [...initialMessages.filter((message) => !storedMessageIds.has(message.id) && !cleared[message.professionalId]?.clearedAt), ...(parsed.messages ?? [])]
    };
  } catch { return baseState; }
}

export function SkillSwapProvider({ children, accountId }: { children: ReactNode; accountId?: string | null }) {
  const storageKey = skillSwapStorageKey(accountId);
  const [state, setState] = useState<SkillSwapState>(() => loadState(storageKey, !accountId));
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(state)); }, [state, storageKey]);
  const selectProfessional = useCallback((id: string) => {
    setState((current) => applySelectedProfessional(current, id));
  }, []);
  const value = useMemo<ContextValue>(() => ({
    state,
    professionals,
    claimStarterReward: () => {
      if (state.starterRewardClaimed) return false;
      setState((current) => applyStarterReward(current));
      return true;
    },
    selectProfessional,
    toggleSave: (id) => setState((current) => ({ ...current, savedIds: current.savedIds.includes(id) ? current.savedIds.filter((saved) => saved !== id) : [...current.savedIds, id] })),
    toggleSavedSkill: (skill) => setState((current) => current.savedSkills.some((saved) => saved.id === skill.id) ? { ...current, savedSkills: current.savedSkills.filter((saved) => saved.id !== skill.id) } : { ...current, savedSkills: [{ ...skill, savedAt: Date.now() }, ...current.savedSkills] }),
    addQualification: (qualification) => setState((current) => ({ ...current, qualifications: [{ ...qualification, id: `qualification-${Date.now()}` }, ...current.qualifications] })),
    addPortfolioProject: (project) => setState((current) => ({ ...current, portfolioProjects: [{ ...project, id: `portfolio-${Date.now()}`, createdAt: Date.now() }, ...current.portfolioProjects] })),
    addAccomplishment: (accomplishment) => setState((current) => ({ ...current, accomplishments: [{ ...accomplishment, id: `accomplishment-${Date.now()}` }, ...current.accomplishments] })),
    addReviewFeedback: (sessionId, professionalId, text) => {
      const feedback = text.trim();
      if (!feedback || state.reviewFeedback.some((item) => item.sessionId === sessionId)) return false;
      setState((current) => ({ ...current, reviewFeedback: [{ id: `feedback-${Date.now()}`, sessionId, professionalId, text: feedback, createdAt: Date.now() }, ...current.reviewFeedback], notifications: ["Session feedback saved privately to your profile", ...current.notifications] }));
      return true;
    },
    recordReferralAction: (action, label) => setState((current) => ({ ...current, referral: { ...current.referral, invites: action === "Shared" ? current.referral.invites + 1 : current.referral.invites, history: [{ id: `referral-${Date.now()}`, action, label, date: Date.now() }, ...current.referral.history] } })),
    completeReferral: () => setState((current) => { const reward = 5; const balance = current.wallet + reward; return { ...current, wallet: balance, referral: { ...current.referral, joined: current.referral.joined + 1, earned: current.referral.earned + reward, history: [{ id: `referral-completed-${Date.now()}`, action: "Completed", label: "A referred member completed their first session", reward, date: Date.now() }, ...current.referral.history] }, transactions: [{ id: `referral-reward-${Date.now()}`, type: "Referral Reward", amount: reward, balance, date: Date.now(), status: "Completed" }, ...current.transactions], notifications: [`Referral reward received: +${reward} Skill Points`, ...current.notifications] }; }),
    addPaymentMethod: (method) => setState((current) => ({ ...current, paymentMethods: [{ ...method, id: `payment-${Date.now()}`, createdAt: Date.now() }, ...current.paymentMethods] })),
    transferPoints: (recipient, amount, message) => { const result = applyPointTransfer(state, recipient, amount, message); if (result.success) setState(result.state); return { success: result.success, error: result.error }; },
    purchase: (points, methodLabel = "local checkout") => setState((current) => { const balance = current.wallet + points; return { ...current, wallet: balance, transactions: [{ id: `purchase-${Date.now()}`, type: "Purchased", amount: points, balance, date: Date.now(), status: "Completed", note: methodLabel }, ...current.transactions], notifications: [`Purchased ${points} Skill Points`, ...current.notifications] }; }),
    addCommunityPost: (type, text, author, avatar, attachments = []) => setState((current) => ({ ...current, communityPosts: [{ id: `post-${Date.now()}`, type, text, author, avatar, createdAt: Date.now(), saved: false, appreciated: false, comments: [], reported: false, shareCount: 0, attachments: attachments || [] }, ...current.communityPosts] })),
    toggleCommunityReaction: (postId) => setState((current) => ({ ...current, communityPosts: current.communityPosts.map((post) => post.id === postId ? { ...post, appreciated: !post.appreciated } : post) })),
    toggleCommunitySave: (postId) => setState((current) => ({ ...current, communityPosts: current.communityPosts.map((post) => post.id === postId ? { ...post, saved: !post.saved } : post) })),
    addCommunityComment: (postId, text, author, avatar, parentCommentId) => setState((current) => ({ ...current, communityPosts: current.communityPosts.map((post) => { if (post.id !== postId) return post; if (parentCommentId) return { ...post, comments: post.comments.map((comment) => comment.id === parentCommentId ? { ...comment, replies: [...comment.replies, { id: `reply-${Date.now()}`, author, avatar, text, createdAt: Date.now() }] } : comment) }; return { ...post, comments: [...post.comments, { id: `comment-${Date.now()}`, author, avatar, text, createdAt: Date.now(), liked: false, replies: [] }] }; }) })),
    reportCommunityPost: (postId) => setState((current) => ({ ...current, communityPosts: current.communityPosts.map((post) => post.id === postId ? { ...post, reported: true } : post) })),
    shareCommunityPost: (postId) => setState((current) => ({ ...current, communityPosts: current.communityPosts.map((post) => post.id === postId ? { ...post, shareCount: post.shareCount + 1 } : post) })),
    setConversationMuted: (professionalId, muted) => setState((current) => ({ ...current, conversationSafety: { ...current.conversationSafety, [professionalId]: { ...(current.conversationSafety[professionalId] ?? { blocked: false }), muted } } })),
    setConversationBlocked: (professionalId, blocked) => setState((current) => ({ ...current, conversationSafety: { ...current.conversationSafety, [professionalId]: { ...(current.conversationSafety[professionalId] ?? { muted: false }), blocked } } })),
    clearConversation: (professionalId) => setState((current) => applyConversationClear(current, professionalId)),
    reportConversation: (professionalId, reason, description) => setState((current) => ({ ...current, conversationReports: [{ id: `conversation-report-${Date.now()}`, professionalId, reason, description, createdAt: Date.now() }, ...current.conversationReports] })),
    recordCall: (professionalId, kind, durationSeconds) => setState((current) => ({ ...current, calls: [{ id: `call-${Date.now()}`, professionalId, kind, startedAt: Date.now(), durationSeconds }, ...current.calls] })),
    enableTwoFactor: (method) => setState((current) => ({ ...current, security: { ...current.security, twoFactorEnabled: true, twoFactorMethod: method } })),
    signOutSecuritySession: (sessionId) => setState((current) => ({ ...current, security: { ...current.security, sessions: current.security.sessions.filter((session) => session.id === "current" || session.id !== sessionId) } })),
    signOutOtherSecuritySessions: () => setState((current) => ({ ...current, security: { ...current.security, sessions: current.security.sessions.filter((session) => session.current) } })),
    setRecoveryEmail: (email) => setState((current) => ({ ...current, security: { ...current.security, recoveryEmail: email } })),
    generateBackupCodes: () => setState((current) => ({ ...current, security: { ...current.security, backupCodes: Array.from({ length: 6 }, (_, index) => `${String(index + 1).padStart(2, "0")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`) } })),
    sendMessage: (professionalId, text, attachment) => {
      const id = `message-${Date.now()}`;
      const professional = professionals.find((item) => item.id === professionalId) ?? professionals[0];
      const conversation = state.messages.filter((message) => message.professionalId === professionalId);
      const reply = buildContextAwareReply(professional, text, { wallet: state.wallet, sessions: state.sessions, conversation, marketplace: professionals });
      setState((current) => ({ ...current, selectedProfessionalId: professionalId, messages: [...current.messages, { id, professionalId, sender: "learner", text, attachment, timestamp: Date.now(), status: "Sending" }] }));
      window.setTimeout(() => setState((current) => ({ ...current, messages: current.messages.map((message): ChatMessage => message.id === id ? { ...message, status: "Delivered" } : message) })), 320);
      window.setTimeout(() => setState((current) => current.typingProfessionalIds.includes(professionalId) ? current : { ...current, typingProfessionalIds: [...current.typingProfessionalIds, professionalId] }), 620);
      window.setTimeout(() => setState((current) => ({ ...current, typingProfessionalIds: current.typingProfessionalIds.filter((item) => item !== professionalId), messages: [...current.messages.map((message): ChatMessage => message.id === id ? { ...message, status: "Read" } : message), { id: `reply-${Date.now()}`, professionalId, sender: "professional", text: reply.text, intent: reply.intent, actions: reply.actions, timestamp: Date.now(), status: "Read" }], notifications: [`New ${professional.name} reply received`, ...current.notifications] })), 1320);
    },
    createProposal: (professionalId, proposal) => setState((current) => {
      const nextProposal: Proposal = { ...proposal, status: "pending" };
      return { ...current, messages: [...current.messages, { id: `proposal-${Date.now()}`, professionalId, sender: "learner", text: "Session proposal sent", timestamp: Date.now(), proposal: nextProposal, status: "Delivered" }] };
    }),
    respondToProposal: (messageId, accept) => setState((current) => {
      const message = current.messages.find((item) => item.id === messageId);
      if (!message?.proposal) return current;
      const proposal = { ...message.proposal, status: accept ? "accepted" as const : "declined" as const };
      if (!accept || current.wallet < proposal.points) return { ...current, messages: current.messages.map((item) => item.id === messageId ? { ...item, proposal } : item), notifications: [accept ? "Session needs more Skill Points to confirm." : "Session proposal declined. Choose another time.", ...current.notifications] };
      const balance = current.wallet - proposal.points;
      return { ...current, wallet: balance, starterPoints: Math.max(0, current.starterPoints - proposal.points), messages: current.messages.map((item) => item.id === messageId ? { ...item, proposal } : item), sessions: [...current.sessions, { id: `session-${Date.now()}`, professionalId: message.professionalId, skill: proposal.skill, time: proposal.time, points: proposal.points, status: "upcoming" }], transactions: [{ id: `hold-${Date.now()}`, type: "Session Hold", amount: -proposal.points, balance, date: Date.now(), status: "Held" }, ...current.transactions], notifications: ["Session confirmed from chat", ...current.notifications] };
    }),
    book: (professionalId, time, points = professionals.find((item) => item.id === professionalId)?.price ?? 6, skill = professionals.find((item) => item.id === professionalId)?.primarySkill ?? "Skill session") => {
      if (!canReserveSession(state, points)) return false;
      const pro = professionals.find((item) => item.id === professionalId);
      const roomUrl = `https://meet.skillswap.pro/room-${professionalId}-${Math.floor(1000 + Math.random() * 9000)}`;
      setState((current) => {
        const balance = current.wallet - points;
        const newSession: Session = {
          id: `session-${Date.now()}`,
          professionalId,
          skill,
          time,
          points,
          status: "upcoming",
          roomUrl,
          partnerName: pro?.name,
          partnerAvatar: pro?.avatar,
          partnerAccent: pro?.accent,
        };
        return {
          ...current,
          wallet: balance,
          starterPoints: Math.max(0, current.starterPoints - points),
          sessions: [newSession, ...current.sessions],
          transactions: [{ id: `hold-${Date.now()}`, type: "Session Hold", amount: -points, balance, date: Date.now(), status: "Held" }, ...current.transactions],
          notifications: [`${skill} session confirmed with ${pro?.name || "mentor"}`, ...current.notifications],
        };
      });
      return true;
    },
    rescheduleSession: (sessionId, time) => {
      if (!state.sessions.some((session) => session.id === sessionId && session.status === "upcoming") || !time.trim()) return false;
      setState((current) => applySessionReschedule(current, sessionId, time));
      return true;
    },
    cancelSession: (sessionId) => {
      if (!state.sessions.some((session) => session.id === sessionId && session.status === "upcoming")) return false;
      setState((current) => applySessionCancellation(current, sessionId));
      return true;
    },
    markWalletVisited: () => setState((current) => current.walletVisited ? current : { ...current, walletVisited: true }),
    addTeachingOffering: (offering) => {
      const newOffering: TeachingOffering = {
        ...offering,
        id: `offering-${Date.now()}`,
        createdAt: Date.now(),
        status: "waiting",
      };
      setState((current) => ({
        ...current,
        teachingOfferings: [newOffering, ...(current.teachingOfferings || [])],
        notifications: [
          `Skill offering listed: "${offering.skill}" (${offering.format}). Waiting for a learner to purchase or book a consultation before Gems transfer.`,
          ...current.notifications,
        ],
      }));
      return newOffering;
    },
    simulateLearnerBooking: (offeringId, learnerName, format) => {
      const names = ["Ananya Roy", "David Kim", "Marcus Chen", "Priya Patel", "Elena Rostova", "Samir Mehta"];
      const chosenName = learnerName || names[Math.floor(Math.random() * names.length)];
      const initials = chosenName.split(" ").map((w) => w[0]).join("");
      setState((current) => {
        const offering = (current.teachingOfferings || []).find((item) => item.id === offeringId);
        if (!offering) return current;
        const updatedFormat = format || offering.format;
        const price = updatedFormat === "15-min Consultation" ? (offering.price || 0) : Math.max(12, offering.price || 14);
        return {
          ...current,
          teachingOfferings: (current.teachingOfferings || []).map((item) =>
            item.id === offeringId
              ? {
                  ...item,
                  status: "booked",
                  format: updatedFormat,
                  price,
                  learnerName: chosenName,
                  learnerAvatar: initials,
                  bookedAt: Date.now(),
                }
              : item
          ),
          notifications: [
            `🎉 New Booking! ${chosenName} booked your "${offering.skill}" (${updatedFormat}). Complete to claim Gems!`,
            ...current.notifications,
          ],
        };
      });
    },
    completeTeachingOffering: (offeringId) => {
      let earned = 0;
      let skillName = "";
      setState((current) => {
        const offering = (current.teachingOfferings || []).find((item) => item.id === offeringId);
        if (!offering) return current;
        skillName = offering.skill;
        earned = offering.price > 0 ? offering.price : 5; // Free consultations reward +5 reward gems for teaching time
        const balance = current.wallet + earned;
        const now = Date.now();
        return {
          ...current,
          wallet: balance,
          teachingOfferings: (current.teachingOfferings || []).map((item) =>
            item.id === offeringId
              ? {
                  ...item,
                  status: "completed",
                  completedAt: now,
                  earnedGems: earned,
                }
              : item
          ),
          transactions: [
            {
              id: `earned-${now}`,
              type: "Earned",
              amount: earned,
              balance,
              date: now,
              status: "Completed",
              note: `Taught ${offering.skill} (${offering.format}) · Learner: ${offering.learnerName || "Student"}`,
            },
            ...current.transactions,
          ],
          notifications: [
            `★ +${earned} Gems transferred to your wallet for teaching ${offering.skill}!`,
            ...current.notifications,
          ],
        };
      });
      return true;
    },
    deleteTeachingOffering: (offeringId) => {
      setState((current) => ({
        ...current,
        teachingOfferings: (current.teachingOfferings || []).filter((item) => item.id !== offeringId),
      }));
    },
    proposeBarterSwap: (proposal) => {
      const proposalId = `barter-${Date.now()}`;
      const scheduledTime = proposal.slot || "Tomorrow · 6:00 PM";
      const roomUrl = `https://meet.skillswap.pro/room-${proposal.partnerId}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newProposal: BarterProposal = {
        ...proposal,
        id: proposalId,
        createdAt: Date.now(),
        status: "Session Scheduled",
        scheduledTime,
        roomUrl,
        direction: "outgoing",
      };

      const barterSession: Session = {
        id: `session-barter-${proposalId}`,
        professionalId: proposal.partnerId,
        skill: proposal.requestSkill,
        time: scheduledTime,
        points: 0,
        status: "upcoming",
        roomUrl,
        isBarter: true,
        format: proposal.format,
        partnerName: proposal.partnerName,
        partnerAvatar: proposal.partnerAvatar,
        partnerAccent: proposal.partnerAccent,
        offerSkill: proposal.offerSkill,
        proposalId,
      };

      setState((current) => ({
        ...current,
        barterProposals: [newProposal, ...(current.barterProposals || [])],
        sessions: [barterSession, ...(current.sessions || [])],
        notifications: [
          `📅 Trade skill session with ${proposal.partnerName} scheduled for ${scheduledTime}! Added to your Sessions timeline.`,
          ...current.notifications,
        ],
      }));
      return newProposal;
    },
    acceptBarterProposal: (proposalId) => {
      setState((current) => {
        const proposal = (current.barterProposals || []).find((p) => p.id === proposalId);
        if (!proposal) return current;
        return {
          ...current,
          barterProposals: (current.barterProposals || []).map((p) =>
            p.id === proposalId ? { ...p, status: "Accepted" } : p
          ),
          notifications: [
            `🤝 Barter Proposal Accepted with ${proposal.partnerName}! Suggested next: Schedule your session slot.`,
            ...current.notifications,
          ],
        };
      });
    },
    declineBarterProposal: (proposalId) => {
      setState((current) => {
        const proposal = (current.barterProposals || []).find((p) => p.id === proposalId);
        if (!proposal) return current;
        return {
          ...current,
          barterProposals: (current.barterProposals || []).map((p) =>
            p.id === proposalId ? { ...p, status: "Declined" as const } : p
          ),
          notifications: [
            `Barter proposal from ${proposal.partnerName} was declined.`,
            ...current.notifications,
          ],
        };
      });
    },
    receiveBarterProposal: (proposal) => {
      const newProposal: BarterProposal = {
        ...proposal,
        id: `barter-${Date.now()}`,
        createdAt: Date.now(),
        status: "Proposed",
        direction: "incoming",
      };
      setState((current) => ({
        ...current,
        barterProposals: [newProposal, ...(current.barterProposals || [])],
        notifications: [
          `📥 New Barter Proposal received from ${proposal.partnerName}!`,
          ...current.notifications,
        ],
      }));
      return newProposal;
    },
    deleteBarterProposal: (proposalId) => {
      setState((current) => ({
        ...current,
        barterProposals: (current.barterProposals || []).filter((p) => p.id !== proposalId),
      }));
    },
    scheduleBarterSession: (proposalId, scheduledTime) => {
      setState((current) => {
        const proposal = (current.barterProposals || []).find((p) => p.id === proposalId);
        if (!proposal) return current;
        const generatedRoomUrl = `https://meet.skillswap.pro/room-${proposal.partnerId}-${Math.floor(1000 + Math.random() * 9000)}`;
        const barterSessionId = `session-barter-${proposalId}`;
        const existingSessionIndex = (current.sessions || []).findIndex(
          (s) => s.id === barterSessionId || s.proposalId === proposalId
        );

        const barterSession: Session = {
          id: barterSessionId,
          professionalId: proposal.partnerId,
          skill: proposal.requestSkill,
          time: scheduledTime,
          points: 0,
          status: "upcoming",
          roomUrl: generatedRoomUrl,
          isBarter: true,
          format: proposal.format,
          partnerName: proposal.partnerName,
          partnerAvatar: proposal.partnerAvatar,
          partnerAccent: proposal.partnerAccent,
          offerSkill: proposal.offerSkill,
          proposalId,
        };

        const updatedSessions = existingSessionIndex >= 0
          ? current.sessions.map((s, idx) => (idx === existingSessionIndex ? barterSession : s))
          : [barterSession, ...(current.sessions || [])];

        return {
          ...current,
          sessions: updatedSessions,
          barterProposals: (current.barterProposals || []).map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  status: "Session Scheduled",
                  scheduledTime,
                  roomUrl: generatedRoomUrl,
                }
              : p
          ),
          notifications: [
            `📅 Barter session with ${proposal.partnerName} scheduled for ${scheduledTime}! Added to your Sessions timeline.`,
            ...current.notifications,
          ],
        };
      });
    },
    completeBarterSwap: (proposalId) => {
      setState((current) => {
        const proposal = (current.barterProposals || []).find((p) => p.id === proposalId);
        if (!proposal) return current;
        const newEarnedHours = (current.timebankHoursEarned || 0) + 1;
        const newWallet = current.wallet + 1.0;
        const newKarma = (current.karmaScore || 900) + 50;
        return {
          ...current,
          wallet: newWallet,
          timebankHoursEarned: newEarnedHours,
          karmaScore: newKarma,
          sessions: (current.sessions || []).map((s) =>
            s.proposalId === proposalId || s.id === `session-barter-${proposalId}`
              ? { ...s, status: "completed" as const }
              : s
          ),
          barterProposals: (current.barterProposals || []).map((p) =>
            p.id === proposalId ? { ...p, status: "Completed" } : p
          ),
          notifications: [
            `★ Swap Completed & Endorsed with ${proposal.partnerName}! +1.0 Swap Credit & +50 Karma Points earned.`,
            ...current.notifications,
          ],
        };
      });
    },
  }), [state, selectProfessional]);
  return <SkillSwapContext.Provider value={value}>{children}</SkillSwapContext.Provider>;
}

export function useSkillSwap() { const context = useContext(SkillSwapContext); if (!context) throw new Error("useSkillSwap must be used within SkillSwapProvider"); return context; }
