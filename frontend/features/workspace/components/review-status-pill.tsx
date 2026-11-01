import { statusLabel } from "../lib/review-display";
import type { Review } from "../types/review";

const tone: Record<Review["status"], string> = {
  pending: "border-workspace-warning/20 bg-workspace-warning-soft text-workspace-warning",
  reviewed: "border-workspace-success/20 bg-workspace-success-soft text-workspace-success",
  relevant: "border-workspace-info/20 bg-workspace-info-soft text-workspace-info",
  dismissed: "border-workspace-border bg-workspace-soft text-workspace-muted",
};

export function ReviewStatusPill({ status, className = "", readable = false }: { status: Review["status"]; className?: string; readable?: boolean }) {
  const size = readable ? "text-[12px]" : "text-[10px]";
  const statusTone = readable && status === "dismissed" ? tone.dismissed.replace("text-workspace-muted", "text-workspace-copy") : tone[status];
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 ${size} font-medium ${statusTone} ${className}`}>{statusLabel(status)}</span>;
}
