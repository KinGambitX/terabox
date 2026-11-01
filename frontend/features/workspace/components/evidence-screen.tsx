import Link from "next/link";
import { IconArrowLeft, IconCode, IconFileText } from "@tabler/icons-react";
import { EvidenceActions } from "./evidence-actions";
import { ComparisonEvidence } from "./comparison-evidence";
import { EvidenceError } from "./evidence-error";
import { EvidenceScoreStrip } from "./evidence-score-strip";
import { ReviewerPanel } from "./reviewer-panel";
import { ReviewStatusPill } from "./review-status-pill";
import { WorkspaceShell } from "./workspace-shell";
import type { EvidencePageData } from "../api/evidence-data";

function getDisplayId(id: string) {
  return id.startsWith("SL-") ? id : `SL-${id.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export function EvidenceScreen({ data }: { data: EvidencePageData }) {
  const submission = data.submission;
  const status = data.results[0]?.review_status ?? "pending";
  const kind = submission?.content_type === "code" ? "Source code" : "Document";
  const KindIcon = kind === "Source code" ? IconCode : IconFileText;

  return <WorkspaceShell active="submissions">
    {data.error || !submission ? <EvidenceError message={data.error ?? "This submission is not available."} /> : <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/workspace#reviews" className="mb-3 inline-flex min-h-9 items-center gap-1.5 rounded-md text-[10px] text-workspace-muted hover:text-workspace-ink focus-visible:outline-2 focus-visible:outline-workspace-info"><IconArrowLeft size={14} aria-hidden="true" />Back to queue</Link>
          <div className="flex flex-wrap items-center gap-2"><KindIcon size={18} className="shrink-0 text-workspace-muted" aria-hidden="true" /><h1 className="m-0 max-w-[760px] break-words font-heading text-[22px] font-semibold tracking-[-.6px] text-workspace-ink">{submission.filename}</h1><span className="rounded-full border border-workspace-border px-2.5 py-1 text-[10px] text-workspace-muted">{kind}</span><ReviewStatusPill status={status} /></div>
          <p className="mb-0 mt-2 text-[10px] text-workspace-muted"><span className="font-mono text-workspace-copy">{getDisplayId(submission.id)}</span><span className="mx-2">·</span>Course and section not recorded<span className="mx-2">·</span>{submission.language ? `Detected language: ${submission.language}` : "Language: not applicable"}</p>
        </div>
        {data.isExampleData && <span className="mt-2 text-[10px] text-workspace-muted">Example data</span>}
      </header>

      <EvidenceScoreStrip submission={submission} results={data.results} sourceNames={data.sourceNames} isExampleData={data.isExampleData} exampleScore={data.isExampleData ? (awaitlessExampleScore(submission.id)) : null} />

      <div className="grid min-w-0 items-start gap-7 xl:grid-cols-[minmax(0,1fr)_280px]">
        <ComparisonEvidence submission={submission} results={data.results} sourceNames={data.sourceNames} />
        <ReviewerPanel results={data.results} isExampleData={data.isExampleData} />
      </div>

      <div className="mt-6"><EvidenceActions submission={submission} results={data.results} allowExternalAi={data.allowExternalAi} isExampleData={data.isExampleData} /></div>
    </>}
  </WorkspaceShell>;
}

function awaitlessExampleScore(id: string) {
  const scores: Record<string, number> = { "SL-2408": 0.87, "SL-2407": 0.72, "SL-2406": 0.64, "SL-2405": 0.28 };
  return scores[id] ?? null;
}
