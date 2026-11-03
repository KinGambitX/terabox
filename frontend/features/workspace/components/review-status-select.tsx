"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SimilarityResult } from "@/lib/review-schemas";
import { updateResultReview } from "../api/workspace-api";
import { workspaceResultsKey } from "../hooks/use-workspace-queries";

const statuses: SimilarityResult["review_status"][] = ["pending", "reviewed", "relevant", "dismissed"];

export function ReviewStatusSelect({ result }: { result: SimilarityResult }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (status: SimilarityResult["review_status"]) => updateResultReview(result.id, status, result.review_note ?? null),
    onSuccess: (updated) => queryClient.setQueryData<SimilarityResult[]>(workspaceResultsKey, (current) => current?.map((item) => item.id === updated.id ? updated : item)),
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={`review-status-${result.id}`} className="text-xs text-workspace-muted-strong">Reviewer status</label>
      <select
        id={`review-status-${result.id}`}
        value={mutation.data?.review_status ?? result.review_status}
        onChange={(event) => mutation.mutate(event.target.value as SimilarityResult["review_status"])}
        disabled={mutation.isPending}
        className="h-8 max-w-full rounded-md border border-workspace-line bg-white px-2 text-xs text-workspace-ink outline-2 outline-transparent transition-colors duration-150 focus-visible:outline-workspace-focus disabled:cursor-wait disabled:opacity-60"
      >
        {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      {mutation.error && <span className="text-xs text-workspace-danger" role="alert">{mutation.error.message}</span>}
      {mutation.isSuccess && <span className="text-xs text-workspace-muted-strong" role="status">Saved</span>}
    </div>
  );
}
