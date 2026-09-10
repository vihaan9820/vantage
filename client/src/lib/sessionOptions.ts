import type { Professional } from "@/contexts/SkillSwapContext";

export type SessionOption = { minutes: 15 | 30 | 60; points: number; label: string };

export function getSessionOptions(professional: Professional): SessionOption[] {
  const fullPrice = Math.max(12, professional.price);
  const halfPrice = Math.max(12, Math.round(fullPrice * 0.75));
  return [
    { minutes: 15, points: 0, label: "15 min consultation (Free)" },
    { minutes: 30, points: halfPrice, label: `30 min session · ${halfPrice} pts` },
    { minutes: 60, points: fullPrice, label: `60 min session · ${fullPrice} pts` },
  ];
}
