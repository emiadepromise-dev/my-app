import type { Finding, Severity } from "./types";

const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
  informational: 0,
};

export function calculateScore(findings: Finding[]): number {
  let deductions = 0;
  for (const f of findings) {
    deductions += SEVERITY_WEIGHTS[f.severity];
  }
  const score = Math.max(0, Math.min(100, 100 - deductions));
  return score;
}

export function severityCounts(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  };
  for (const f of findings) {
    counts[f.severity]++;
  }
  return counts;
}

export function scoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 90) return { label: "Excellent", color: "text-green-500" };
  if (score >= 70) return { label: "Good", color: "text-blue-500" };
  if (score >= 50) return { label: "Fair", color: "text-yellow-500" };
  if (score >= 30) return { label: "Poor", color: "text-orange-500" };
  return { label: "Critical", color: "text-red-500" };
}
