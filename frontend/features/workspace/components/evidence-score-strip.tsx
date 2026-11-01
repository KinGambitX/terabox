import { similarityBand } from "../lib/review-display";
import type { SimilarityResult, SubmissionRecord } from "../schemas/workspace";

function scorePercent(score: number) {
  return `${Math.round(score * 100)}%`;
}

function unavailableOnWeb(result: SimilarityResult) {
  return result.source_type === "web" && !hasWebEvidence(result);
}

function hasWebEvidence(result: SimilarityResult) {
  return Boolean(result.evidence.source_excerpt || result.evidence.matched_passages?.some((passage) => passage.source_excerpt));
}

function ScoreRows({ results, method, sourceNames }: { results: SimilarityResult[]; method: string; sourceNames: Record<string, string> }) {
  const rows = results.filter((result) => result.method === method);
  if (!rows.length) return <p className="m-0 text-[10px] text-workspace-muted">No score returned for this method.</p>;
  return <ul className="m-0 grid list-none gap-2 p-0">{rows.map((result) => {
    const unavailable = unavailableOnWeb(result);
    const source = result.evidence.title ?? sourceNames[result.source_id] ?? (result.source_type === "web" ? result.evidence.url : null) ?? result.source_id;
    const band = similarityBand(result.score);
    return <li key={result.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-workspace-border pt-2 first:border-0 first:pt-0"><span className="min-w-0 flex-1 truncate text-[10px] text-workspace-muted">{source}</span>{unavailable ? <span className="text-[10px] text-workspace-warning">Content unavailable, not fully checked</span> : <span className={`text-[13px] font-medium tabular-nums ${band.className}`}>{scorePercent(result.score)}</span>}</li>;
  })}</ul>;
}

function ScoreCard({ title, description, version, results, method, sourceNames, note }: { title: string; description: string; version: string; results: SimilarityResult[]; method: string; sourceNames: Record<string, string>; note?: string }) {
  return (
    <article className="min-w-0 rounded-lg border border-workspace-border bg-workspace-paper p-3.5">
      <h3 className="mb-1 text-[12px] font-semibold text-workspace-ink">{title}</h3>
      <p className="mb-3 min-h-8 text-[10px] leading-relaxed text-workspace-muted">{description}</p>
      <ScoreRows results={results} method={method} sourceNames={sourceNames} />
      <p className="mb-0 mt-3 border-t border-workspace-border pt-2 text-[9px] text-workspace-muted">{version}{note ? ` · ${note}` : ""}</p>
    </article>
  );
}

export function EvidenceScoreStrip({ submission, results, sourceNames, isExampleData, exampleScore }: { submission: SubmissionRecord; results: SimilarityResult[]; sourceNames: Record<string, string>; isExampleData: boolean; exampleScore: number | null }) {
  const type = submission.content_type;
  const sampleScore = exampleScore === null ? [] : [{ id: "sample-score", submission_id: submission.id, source_id: "Example source", source_type: "internal" as const, method: type === "code" ? "normalized_token_sequence" : "tfidf_cosine", score: exampleScore, evidence: { method: type === "code" ? "normalized_token_sequence" : "tfidf_cosine", matched_passages: [], matched_token_blocks: [] }, review_status: "pending" as const, review_note: null, explanation: null, explanation_model: null, created_at: submission.created_at } satisfies SimilarityResult];
  const visibleResults = isExampleData ? sampleScore : results;
  const embeddingModel = results.find((result) => result.method === "huggingface_embedding_cosine")?.evidence.model ?? "No model name returned";

  return (
    <section aria-labelledby="score-strip-title" className="mb-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 id="score-strip-title" className="m-0 text-[13px] font-semibold text-workspace-ink">Similarity methods</h2>{isExampleData && <span className="text-[10px] text-workspace-muted">Example data</span>}</div>
      {type === "document" ? <div className="grid gap-3 md:grid-cols-2">
        <ScoreCard title="TF-IDF cosine" description="Weights shared words and phrases, then compares their vectors." version="Method: tfidf_cosine · passage threshold ≥ 0.28" results={visibleResults} method="tfidf_cosine" sourceNames={sourceNames} />
        <ScoreCard title="Semantic similarity" description="Compares document meaning through the configured embedding model." version="Method: huggingface_embedding_cosine" note={embeddingModel} results={visibleResults} method="huggingface_embedding_cosine" sourceNames={sourceNames} />
      </div> : <div className="max-w-[620px]"><ScoreCard title="Normalized token similarity" description="Compares normalized code-token sequences while ignoring comments and identifier names." version="Method: normalized_token_sequence · matching blocks start at 3 tokens" note={`Detected language: ${submission.language ?? "not returned"}`} results={visibleResults} method="normalized_token_sequence" sourceNames={sourceNames} /></div>}
      <p className="mb-0 mt-3 text-[10px] text-workspace-muted">Each method stays separate. Similarity helps locate passages for review; it does not determine intent.</p>
    </section>
  );
}
