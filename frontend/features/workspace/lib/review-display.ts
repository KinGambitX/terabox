import type { Review } from "../types/review";

export const reviewStatuses: Review["status"][] = ["pending", "reviewed", "relevant", "dismissed"];

export function statusLabel(status: Review["status"]) {
  return { pending: "Needs review", reviewed: "Reviewed", relevant: "Relevant", dismissed: "Dismissed" }[status];
}

export function similarityBand(score: number | null) {
  if (score === null) return { label: "No score", className: "text-workspace-muted", severity: "none" as const };
  if (score > 0.75) return { label: "Higher overlap", className: "text-workspace-danger", severity: "high" as const };
  if (score >= 0.4) return { label: "Moderate overlap", className: "text-workspace-warning", severity: "medium" as const };
  return { label: "Lower overlap", className: "text-workspace-success", severity: "low" as const };
}

export function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC",
  }).format(date);
}
