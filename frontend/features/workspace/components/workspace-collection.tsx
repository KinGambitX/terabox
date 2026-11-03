"use client";

import { useState } from "react";
import type { SimilarityResult, SubmissionRecord } from "@/lib/review-schemas";
import { ReviewStatusSelect } from "./review-status-select";
import { useWorkspaceReports, useWorkspaceResults, useWorkspaceSubmissions } from "../hooks/use-workspace-queries";
import type { WorkspaceView } from "../types/workspace";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function EvidenceRows({ results, names }: { results: SimilarityResult[]; names: Map<string, string> }) {
  if (!results.length) return <p className="mb-0 mt-3 text-sm text-workspace-muted-strong">No comparison evidence was returned for this submission.</p>;
  return (
    <ul className="m-0 mt-3 list-none divide-y divide-workspace-line p-0">
      {results.map((result) => (
        <li key={result.id} className="grid gap-2 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <span className="text-sm font-medium text-workspace-ink">{names.get(result.source_id) ?? result.evidence.title ?? result.evidence.url ?? `Source ${result.source_id.slice(0, 8)}`}</span>
            <span className="font-heading text-lg tabular-nums text-workspace-ink">{Math.round(result.score * 100)}%</span>
          </div>
          <p className="m-0 text-xs leading-4 text-workspace-muted-strong">{result.method.replaceAll("_", " ")} · {result.evidence.matched_passages?.length ?? result.evidence.matched_token_blocks?.length ?? 0} matched passages or token blocks</p>
          {result.evidence.source_excerpt && <blockquote className="m-0 border-l-2 border-workspace-action pl-3 font-heading text-sm italic leading-5 text-workspace-copy">{result.evidence.source_excerpt}</blockquote>}
          <ReviewStatusSelect result={result} />
        </li>
      ))}
    </ul>
  );
}

function DownloadReport({ submission }: { submission: SubmissionRecord }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/reports?submission_id=${encodeURIComponent(submission.id)}`, { cache: "no-store" });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not create the report.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `sourcelens-report-${submission.id}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the report.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={download} disabled={busy} className="min-h-9 cursor-pointer rounded-md border border-workspace-control px-3 text-xs font-medium text-workspace-ink transition-colors duration-150 hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-focus disabled:cursor-wait disabled:opacity-50">{busy ? "Preparing…" : "Download JSON report"}</button>
      {error && <span className="text-xs text-workspace-danger" role="alert">{error}</span>}
    </div>
  );
}

export function WorkspaceCollection({ view }: { view: Exclude<WorkspaceView, "detect"> }) {
  const reportsView = view === "reports";
  const submissionsQuery = useWorkspaceSubmissions(!reportsView);
  const resultsQuery = useWorkspaceResults(!reportsView);
  const reportsQuery = useWorkspaceReports(reportsView);
  const loading = reportsView ? reportsQuery.isLoading : submissionsQuery.isLoading || resultsQuery.isLoading;
  const error = reportsView ? reportsQuery.error : submissionsQuery.error ?? resultsQuery.error;
  const submissions = submissionsQuery.data ?? [];
  const results = resultsQuery.data ?? [];
  const names = new Map(submissions.map((item) => [item.id, item.filename]));

  if (loading) return <p className="py-10 text-sm text-workspace-muted-strong" role="status">Loading workspace records…</p>;
  if (error) return <section className="max-w-xl py-10" role="alert"><h1 className="font-heading text-[28px] font-normal">Could not load {reportsView ? "reports" : "workspace records"}</h1><p className="text-sm leading-[22px] text-workspace-copy">{error.message}</p><button type="button" onClick={() => { if (reportsView) void reportsQuery.refetch(); else { void submissionsQuery.refetch(); void resultsQuery.refetch(); } }} className="min-h-9 rounded-md border border-workspace-control px-3 text-sm hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-focus">Try again</button></section>;

  if (view === "history") {
    return (
      <section className="max-w-3xl py-9 max-[800px]:py-7" aria-labelledby="collection-title">
        <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">History</p>
        <h1 id="collection-title" className="mb-0 mt-3 font-heading text-[28px] font-normal leading-8 tracking-[-0.02em]">Review history</h1>
        {!submissions.length ? <p className="mb-0 mt-8 text-sm leading-[22px] text-workspace-muted-strong">Submissions will appear here after their first review.</p> : (
          <ul className="m-0 mt-7 list-none divide-y divide-workspace-line border-y border-workspace-line p-0">
            {submissions.map((submission) => {
              const related = results.filter((result) => result.submission_id === submission.id);
              return <li key={submission.id} className="py-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="m-0 text-sm font-medium text-workspace-ink">{submission.filename}</h2><time className="text-xs text-workspace-muted-strong">{dateLabel(submission.created_at)}</time></div><p className="mb-0 mt-1 text-xs text-workspace-muted-strong">{submission.content_type}{submission.language ? ` · ${submission.language}` : ""} · {related.length} result{related.length === 1 ? "" : "s"}</p><EvidenceRows results={related} names={names} /></li>;
            })}
          </ul>
        )}
      </section>
    );
  }

  if (view === "comparisons") {
    const linked = results.filter((result) => result.source_type === "internal");
    return (
      <section className="max-w-3xl py-9 max-[800px]:py-7" aria-labelledby="collection-title">
        <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">Comparisons</p>
        <h1 id="collection-title" className="mb-0 mt-3 font-heading text-[28px] font-normal leading-8 tracking-[-0.02em]">Source comparisons</h1>
        {!linked.length ? <p className="mb-0 mt-8 text-sm leading-[22px] text-workspace-muted-strong">Internal source matches will appear here after a review finds comparable submissions.</p> : <div className="mt-7 divide-y divide-workspace-line border-y border-workspace-line">{linked.map((result) => <article key={result.id} className="py-5"><div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="m-0 text-sm font-medium">{names.get(result.submission_id) ?? "Submission"} <span className="px-1 text-workspace-muted-strong">↔</span> {names.get(result.source_id) ?? `Source ${result.source_id.slice(0, 8)}`}</h2><span className="font-heading text-lg tabular-nums">{Math.round(result.score * 100)}%</span></div><p className="mb-0 mt-1 text-xs text-workspace-muted-strong">{result.method.replaceAll("_", " ")} · {result.evidence.matched_passages?.length ?? result.evidence.matched_token_blocks?.length ?? 0} matched passages or token blocks</p>{result.evidence.source_excerpt && <blockquote className="mb-0 mt-3 border-l-2 border-workspace-action pl-3 font-heading text-sm italic leading-5">{result.evidence.source_excerpt}</blockquote>}<div className="mt-3"><ReviewStatusSelect result={result} /></div></article>)}</div>}
      </section>
    );
  }

  return (
    <section className="max-w-3xl py-9 max-[800px]:py-7" aria-labelledby="collection-title">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">Reports</p>
      <h1 id="collection-title" className="mb-0 mt-3 font-heading text-[28px] font-normal leading-8 tracking-[-0.02em]">Review reports</h1>
      {!(reportsQuery.data?.length ?? 0) ? <p className="mb-0 mt-8 text-sm leading-[22px] text-workspace-muted-strong">Reports will appear here after a submission is saved.</p> : (
        <ul className="m-0 mt-7 list-none divide-y divide-workspace-line border-y border-workspace-line p-0">
          {reportsQuery.data?.map((report) => <li key={report.submission.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h2 className="m-0 text-sm font-medium text-workspace-ink">{report.submission.filename}</h2><p className="mb-0 mt-1 text-xs text-workspace-muted-strong">{dateLabel(report.submission.created_at)} · {report.results.length} similarity results</p></div><DownloadReport submission={report.submission} /></li>)}
        </ul>
      )}
    </section>
  );
}
