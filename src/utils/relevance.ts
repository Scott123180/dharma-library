import { RelevanceTier } from "../types/search";

export function getRelevanceTier(similarity: number): RelevanceTier {
  if (similarity >= 0.85) return "excellent";
  if (similarity >= 0.70) return "strong";
  if (similarity >= 0.55) return "good";
  return "partial";
}

export const TIER_LABELS: Record<RelevanceTier, string> = {
  excellent: "Excellent match",
  strong: "Strong match",
  good: "Good match",
  partial: "Partial match",
};

export const TIER_DOTS: Record<RelevanceTier, number> = {
  excellent: 4,
  strong: 3,
  good: 2,
  partial: 1,
};
