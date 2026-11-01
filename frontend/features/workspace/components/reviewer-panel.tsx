"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { saveReview as saveReviewResult } from "../api/workspace-client";
import { reviewUpdateSchema } from "../schemas/workspace";
import type { ReviewStatus, SimilarityResult } from "../schemas/workspace";

const statuses: Array<{ value: ReviewStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "relevant", label: "Relevant" },
  { value: "dismissed", label: "Dismissed" },
];

export function ReviewerPanel({ results, isExampleData }: { results: SimilarityResult[]; isExampleData: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<ReviewStatus>(results[0]?.review_status ?? "pending");
  const [note, setNote] = useState(results[0]?.review_note ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const canSave = results.length > 0 && !isExampleData && !saving;

  async function saveReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = reviewUpdateSchema.safeParse({ status, note: note.trim() || null });
    if (!parsed.success) {
      setError("Keep the reviewer note under 4,000 characters.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await Promise.all(results.map((result) => saveReviewResult(result.id, parsed.data)));
      setMessage("Review decision saved. Machine similarity results were left unchanged.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The review could not be saved. Check the analysis service and retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-workspace-border bg-workspace-paper p-4" aria-labelledby="reviewer-panel-title">
      <h2 id="reviewer-panel-title" className="mb-1 text-[13px] font-semibold text-workspace-ink">Reviewer decision</h2>
      <p className="mb-4 text-[10px] leading-relaxed text-workspace-muted">Your decision and notes stay separate from the original similarity scores.</p>
      {isExampleData ? <p className="m-0 border-y border-workspace-border py-3 text-[11px] text-workspace-muted">Example rows are read-only and cannot be saved.</p> : results.length ? <form className="grid gap-3" onSubmit={saveReview}>
        <div className="grid gap-2"><label className="text-[11px] font-medium text-workspace-copy" htmlFor="review-status">Status</label><select id="review-status" value={status} onChange={(event) => setStatus(event.target.value as ReviewStatus)} className="h-10 cursor-pointer rounded-md border border-workspace-border bg-workspace-paper px-3 text-[11px] text-workspace-ink outline-none focus-visible:outline-2 focus-visible:outline-workspace-info">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
        <div className="grid gap-2"><label className="text-[11px] font-medium text-workspace-copy" htmlFor="review-note">Reviewer notes</label><textarea id="review-note" maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record the evidence you checked…" className="min-h-28 resize-y rounded-md border border-workspace-border bg-workspace-paper p-3 text-[11px] leading-relaxed text-workspace-ink outline-none placeholder:text-workspace-muted focus-visible:outline-2 focus-visible:outline-workspace-info" /></div>
        {error && <p className="m-0 text-[10px] text-workspace-danger" role="alert">{error}</p>}
        {message && <p className="m-0 text-[10px] text-workspace-success" role="status" aria-live="polite"><IconCheck size={14} className="mr-1 inline" aria-hidden="true" />{message}</p>}
        <BrandButton type="submit" tone="ink" disabled={!canSave} className="h-10 cursor-pointer gap-2 px-3.5 text-[11px] disabled:cursor-not-allowed"><IconDeviceFloppy size={15} aria-hidden="true" />{saving ? "Saving…" : "Save review"}</BrandButton>
        <p className="m-0 border-t border-workspace-border pt-3 text-[10px] leading-relaxed text-workspace-muted">Reviewer name and save timestamp are not returned by the current API.</p>
      </form> : <p className="m-0 border-y border-workspace-border py-3 text-[11px] text-workspace-muted">No result is available to update yet.</p>}
    </section>
  );
}
