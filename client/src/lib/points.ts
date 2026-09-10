export const pointPackages = [
  {
    points: 15,
    price: "₹599",
    originalPrice: "₹735",
    discount: "Save 18%",
    label: "Starter",
    value: "15 Skill Points (₹49/pt base). Great for your first session.",
  },
  {
    points: 30,
    price: "₹1,099",
    originalPrice: "₹1,470",
    discount: "Save 25% · Most Popular",
    label: "Learner",
    value: "30 Skill Points. Ideal for multi-session learning paths.",
  },
  {
    points: 60,
    price: "₹1,999",
    originalPrice: "₹2,940",
    discount: "Save 32% · Best Value",
    label: "Pro Master",
    value: "60 Skill Points. Best rate for comprehensive skill mastery.",
  },
  {
    points: 120,
    price: "₹3,499",
    originalPrice: "₹5,880",
    discount: "Save 40% · Mega Sale",
    label: "Mastery",
    value: "120 Skill Points. Maximum discount for continuous learning.",
  },
  {
    points: 250,
    price: "₹6,499",
    originalPrice: "₹12,250",
    discount: "Save 47% · Studio Pack",
    label: "Studio",
    value: "250 Skill Points. Tailored for intensive mentorship, cohort trades, and teams.",
  },
  {
    points: 500,
    price: "₹11,999",
    originalPrice: "₹24,500",
    discount: "Save 51% · Guild Pass",
    label: "Guild",
    value: "500 Skill Points. Highest tier with maximum savings for active creators and institutions.",
  },
] as const;

export function findPointPackage(points: number) {
  return pointPackages.find((item) => item.points === points);
}
