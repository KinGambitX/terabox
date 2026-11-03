import type { ExternalCheck, SimilarityResult, SubmissionRecord } from "@/lib/review-schemas";
import { ReviewStatusSelect } from "./review-status-select";
import { ExternalChecks } from "./external-checks";

function sourceLabel(result: SimilarityResult, sources: Map<string, string>) {
  return sources.get(result.source_id) ?? result.evidence.title ?? result.evidence.url ?? `Source ${result.source_id.slice(0, 8)}`;
}

function ResultEvidence({
  result, sources, candidateSources, interactive, contentType,
}: {
  result: SimilarityResult; sources: Map<string, string>; candidateSources: number; interactive: boolean;
  contentType: SubmissionRecord["content_type"] | undefined;
}) {
  const passages = result.evidence.matched_passages ?? [];
  const firstPassage = passages[0];
  const excerpt = firstPassage?.source_excerpt ?? result.evidence.source_excerpt;
  const percentage = Math.round(result.score * 100);
  const signalLabel = contentType === "code" ? "Code similarity" : "Text similarity";
  return (
    <article className="border-t border-workspace-line py-5 first:border-t-0">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">{result.source_type === "web" ? "Public web source" : "Workspace source"}</p>
      {result.source_type === "web" && result.evidence.url ? (
        <a href={result.evidence.url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-workspace-ink underline decoration-workspace-control underline-offset-4 hover:decoration-workspace-action focus-visible:outline-2 focus-visible:outline-workspace-focus">{sourceLabel(result, sources)}</a>
      ) : <p className="mb-0 mt-1 text-sm text-workspace-ink">{sourceLabel(result, sources)}</p>}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-heading text-[38px] leading-10 tabular-nums tracking-[-0.03em] text-workspace-ink">{percentage}%</span>
        <span className="text-xs text-workspace-muted-strong">{signalLabel}</span>
      </div>
      <div className="mt-2 h-0.5 bg-workspace-line" role="img" aria-label={`${percentage}% ${signalLabel.toLowerCase()}`}>
        <div className="h-full bg-workspace-action" style={{ width: `${percentage}%` }} />
      </div>
      <dl className="mb-0 mt-5 grid grid-cols-2 border-y border-workspace-line">
        <div className="py-3 pr-3">
          <dt className="text-xs leading-4 text-workspace-muted-strong">Matched passages</dt>
          <dd className="mb-0 mt-1 font-heading text-xl tabular-nums text-workspace-ink">{passages.length || result.evidence.matched_token_blocks?.length || 0}</dd>
        </div>
        <div className="border-l border-workspace-line py-3 pl-4">
          <dt className="text-xs leading-4 text-workspace-muted-strong">Candidate sources</dt>
          <dd className="mb-0 mt-1 font-heading text-xl tabular-nums text-workspace-ink">{candidateSources}</dd>
        </div>
      </dl>
      <section className="mt-5" aria-label="Matched source evidence">
        <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">Source passage</p>
        {excerpt ? <blockquote className="mb-0 mt-2 border-l-2 border-workspace-action pl-3 font-heading text-base italic leading-6 text-workspace-copy">{excerpt}</blockquote> : <p className="mb-0 mt-2 text-sm leading-[22px] text-workspace-copy">{result.evidence.matched_token_blocks?.length ?? 0} matching code token blocks were found. Open the compared files to inspect their surrounding code.</p>}
      </section>
      {interactive ? <div className="mt-4"><ReviewStatusSelect result={result} /></div> : (
        <p className="mb-0 mt-4 text-xs text-workspace-muted-strong">Reviewer status · {result.review_status}</p>
      )}
    </article>
  );
}

export function AnalysisPanel({
  submission, submissions, results, externalChecks, notice, loading, interactive = true,
}: {
  submission: SubmissionRecord | null; submissions: SubmissionRecord[]; results: SimilarityResult[];
  externalChecks: ExternalCheck[]; notice: string; loading: boolean; interactive?: boolean;
}) {
  const sources = new Map<string, string>(submissions.map((item) => [item.id, item.filename]));
  const candidateSources = new Set(results.map((result) => result.source_id)).size;
  return (
    <aside
      aria-label="Evidence ledger"
      data-ui="analysis-panel"
      className="sticky top-0 min-h-[calc(100svh-3.5rem)] border-l border-workspace-line pl-7 pt-8 max-[1023px]:static max-[1023px]:min-h-0 max-[1023px]:border-l-0 max-[1023px]:border-t max-[1023px]:pl-0 max-[1023px]:pt-7"
    >
      <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">Evidence ledger</p>
      <h2 className="mb-0 mt-3 font-heading text-[23px] font-normal leading-7 tracking-[-0.02em] text-workspace-ink">Review evidence</h2>
      {loading ? (
        <p className="mb-0 mt-8 text-sm leading-[22px] text-workspace-muted-strong" role="status">Submitting and comparing your input…</p>
      ) : results.length ? (
        <div className="mt-5 divide-y divide-workspace-line">{results.slice(0, 5).map((result) => <ResultEvidence key={result.id} result={result} sources={sources} candidateSources={candidateSources} interactive={interactive} contentType={submission?.content_type} />)}</div>
      ) : submission ? (
        <p className="mb-0 mt-8 max-w-sm text-sm leading-[22px] text-workspace-muted-strong" role="status">{notice || `No comparable ${submission.content_type === "code" ? "code" : "text"} sources were found. This does not establish whether the work is original or AI-generated.`}</p>
      ) : (
        <div className="mt-10 max-w-sm">
          <svg aria-hidden="true" viewBox="0 0 40 40" className="mb-5 size-9 fill-none stroke-workspace-control" strokeWidth="1.25">
            <path d="M8 5.75h15l9 9V34H8z" />
            <path d="M23 6v9h9M13 21h14M13 26h10" />
          </svg>
          <p className="mb-0 text-sm leading-[22px] text-workspace-muted-strong">Evidence and source matches will appear here after a connected review.</p>
        </div>
      )}
      {!loading && submission && interactive && <>
        <p className="mb-0 mt-5 border-t border-workspace-line pt-4 text-xs leading-5 text-workspace-muted-strong">
          Similarity reports possible source overlap. AI likelihood is a separate estimate; neither signal alone proves plagiarism.
        </p>
        <ExternalChecks key={submission.id} submission={submission} checks={externalChecks} />
      </>}
    </aside>
  );
}
