"use client";

import { useState, type SyntheticEvent } from "react";
import { IconDownload, IconSparkles } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { generateExplanation as requestExplanation, generateReport as requestReport } from "../api/workspace-client";
import { reportInputSchema } from "../schemas/workspace";
import type { SimilarityResult, SubmissionRecord } from "../schemas/workspace";

export function EvidenceActions({ submission, results, allowExternalAi, isExampleData }: { submission: SubmissionRecord; results: SimilarityResult[]; allowExternalAi: boolean; isExampleData: boolean }) {
  const [reportState, setReportState] = useState("");
  const [explanation, setExplanation] = useState("");
  const [explanationError, setExplanationError] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [reporting, setReporting] = useState(false);
  const availableResults = results.filter((result) => result.source_type !== "web" || result.evidence.source_excerpt || result.evidence.matched_passages?.some((passage) => passage.source_excerpt));
  const primaryResult = availableResults[0];

  async function loadExplanation(event: SyntheticEvent<HTMLDetailsElement>) {
    if (!(event.currentTarget as HTMLDetailsElement).open || !allowExternalAi || !primaryResult || explanation || loadingExplanation) return;
    setLoadingExplanation(true);
    setExplanationError("");
    try {
      const result = await requestExplanation(primaryResult.id);
      setExplanation(result.text);
    } catch (error) {
      setExplanationError(error instanceof Error ? error.message : "An explanation could not be generated.");
    } finally {
      setLoadingExplanation(false);
    }
  }

  async function generateReport() {
    const reviewStatus = results[0]?.review_status ?? "pending";
    const input = reportInputSchema.safeParse({
      submissionId: submission.id,
      title: submission.filename,
      course: "No course recorded",
      kind: submission.content_type,
      language: submission.language ?? null,
      scores: availableResults.map((result) => ({ method: result.method, score: result.score, source: result.evidence.title ?? result.evidence.url ?? result.source_id })),
      reviewerStatus: reviewStatus,
      reviewerNote: results.find((result) => result.review_note)?.review_note ?? null,
      isExampleData,
    });
    if (!input.success) {
      setReportState("Report details are incomplete.");
      return;
    }
    setReporting(true);
    setReportState("");
    try {
      const content = await requestReport(input.data);
      const objectUrl = URL.createObjectURL(content);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `sourcelens-report-${submission.id.replace(/[^a-zA-Z0-9_-]/g, "-")}.json`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setReportState("Report downloaded.");
    } catch (error) {
      setReportState(error instanceof Error ? error.message : "The report could not be generated.");
    } finally {
      setReporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-workspace-border pt-4">
      <p className="m-0 text-[11px] font-medium text-workspace-copy">Similarity is a review signal, not a verdict.</p>
      <div className="relative flex flex-wrap items-center gap-3">
        {allowExternalAi && primaryResult && !isExampleData && <details className="group" onToggle={loadExplanation}>
          <summary className="min-h-10 cursor-pointer list-none rounded-md border border-workspace-border px-3 py-2 text-[11px] text-workspace-copy focus-visible:outline-2 focus-visible:outline-workspace-info [&::-webkit-details-marker]:hidden"><IconSparkles size={14} className="mr-1 inline" aria-hidden="true" />AI explanation</summary>
          <div className="absolute z-10 mt-2 max-w-sm rounded-lg border border-workspace-border bg-workspace-paper p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-semibold text-workspace-ink">AI-generated, verify against the passages</p>
            <p className="m-0 text-[11px] leading-relaxed text-workspace-copy" aria-live="polite">{loadingExplanation ? "Generating explanation…" : explanationError || explanation || "Open to request an evidence-grounded explanation."}</p>
          </div>
        </details>}
        <BrandButton type="button" tone="ink" disabled={reporting} onClick={generateReport} className="h-10 cursor-pointer gap-2 px-3.5 text-[11px] disabled:cursor-wait"><IconDownload size={15} aria-hidden="true" />{reporting ? "Generating…" : "Generate report"}</BrandButton>
      </div>
      {reportState && <p className="m-0 w-full text-[10px] text-workspace-muted" role="status" aria-live="polite">{reportState}</p>}
    </div>
  );
}
