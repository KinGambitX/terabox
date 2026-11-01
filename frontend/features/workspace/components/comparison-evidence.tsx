"use client";

import { useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { IconExternalLink, IconFileText, IconWorld } from "@tabler/icons-react";
import type { SimilarityResult, SubmissionRecord } from "../schemas/workspace";

type SourceGroup = { sourceId: string; results: SimilarityResult[] };
type PassagePair = { submission: string; source: string; key: string };

function getPassagePairs(results: SimilarityResult[]): PassagePair[] {
  const primary = results.find((result) => (result.evidence.matched_passages?.length ?? 0) > 0)
    ?? results.find((result) => result.evidence.submission_excerpt && result.evidence.source_excerpt);
  if (!primary) return [];
  const passages = primary.evidence.matched_passages ?? [];
  if (passages.length) return passages.flatMap((passage, index) => passage.submission_excerpt && passage.source_excerpt ? [{ submission: passage.submission_excerpt, source: passage.source_excerpt, key: `${primary.id}-${index}` }] : []);
  if (primary.evidence.submission_excerpt && primary.evidence.source_excerpt) return [{ submission: primary.evidence.submission_excerpt, source: primary.evidence.source_excerpt, key: primary.id }];
  return [];
}

function getPassageCount(results: SimilarityResult[]) {
  const primary = results.find((result) => (result.evidence.matched_passages?.length ?? 0) > 0 || (result.evidence.matched_token_blocks?.length ?? 0) > 0) ?? results[0];
  return (primary?.evidence.matched_passages?.length ?? 0) + (primary?.evidence.matched_token_blocks?.length ?? 0);
}

function getSourceName(group: SourceGroup, sourceNames: Record<string, string>) {
  const result = group.results[0];
  return result.evidence.title ?? sourceNames[group.sourceId] ?? result.evidence.url ?? group.sourceId;
}

function webUnavailable(group: SourceGroup) {
  return group.results.some((result) => result.source_type === "web")
    && !group.results.some((result) => result.evidence.source_excerpt || result.evidence.matched_passages?.some((passage) => passage.source_excerpt));
}

export function ComparisonEvidence({ submission, results, sourceNames }: { submission: SubmissionRecord; results: SimilarityResult[]; sourceNames: Record<string, string> }) {
  const reduceMotion = useReducedMotion();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [activePassage, setActivePassage] = useState<number | null>(null);
  const submittedRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sourceRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const groups = useMemo(() => {
    const bySource = new Map<string, SimilarityResult[]>();
    const matches = results.filter((result) => result.score > 0 || (result.evidence.matched_passages?.length ?? 0) > 0 || (result.evidence.matched_token_blocks?.length ?? 0) > 0);
    for (const result of matches) bySource.set(result.source_id, [...(bySource.get(result.source_id) ?? []), result]);
    return Array.from(bySource, ([sourceId, items]) => ({ sourceId, results: items }));
  }, [results]);
  const current = groups.find((group) => group.sourceId === selectedSource) ?? groups[0];
  const pairs = current ? getPassagePairs(current.results) : [];
  const tokenBlocks = current?.results.find((result) => (result.evidence.matched_token_blocks?.length ?? 0) > 0)?.evidence.matched_token_blocks ?? [];
  const url = current?.results.find((result) => result.evidence.url)?.evidence.url;
  const unavailable = current ? webUnavailable(current) : false;

  function focusCounterpart(side: "submission" | "source", index: number) {
    setActivePassage(index);
    const target = side === "submission" ? sourceRefs.current[index] : submittedRefs.current[index];
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  return (
    <section className="min-w-0" aria-labelledby="comparison-title">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><div><h2 id="comparison-title" className="mb-1 text-[14px] font-semibold text-workspace-ink">Matched sources</h2><p className="m-0 text-[10px] text-workspace-muted">Select a source to compare its available passages.</p></div><span className="text-[10px] text-workspace-muted">{groups.length} {groups.length === 1 ? "source" : "sources"}</span></div>
      {groups.length === 0 ? <div className="border-y border-workspace-border py-7"><p className="m-0 text-[12px] font-medium text-workspace-ink">No matches returned</p><p className="mb-0 mt-1.5 max-w-[580px] text-[11px] leading-relaxed text-workspace-muted">The analysis service did not find a comparable source for this submission. A zero or missing result is not a verdict.</p></div> : <>
        <ul className="m-0 list-none divide-y divide-workspace-border border-y border-workspace-border p-0">
          {groups.map((group) => {
            const primary = group.results[0];
            const availableScores = webUnavailable(group) ? [] : group.results.map((result) => result.score);
            const score = availableScores.length ? Math.max(...availableScores) : Number.NaN;
            const isUnavailable = webUnavailable(group);
            const selected = current?.sourceId === group.sourceId;
            const sourceUrl = group.results.find((result) => result.evidence.url)?.evidence.url;
            return <li key={group.sourceId} className={`flex flex-wrap items-center gap-3 py-3 ${selected ? "bg-workspace-soft/60" : ""}`}>
              <button type="button" aria-pressed={selected} onClick={() => { setSelectedSource(group.sourceId); setActivePassage(null); }} className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md px-2 text-left focus-visible:outline-2 focus-visible:outline-workspace-info">
                {primary.source_type === "web" ? <IconWorld size={16} className="shrink-0 text-workspace-muted" aria-hidden="true" /> : <IconFileText size={16} className="shrink-0 text-workspace-muted" aria-hidden="true" />}
                <span className="min-w-0 flex-1"><strong className="block truncate text-[11px] font-medium text-workspace-ink">{getSourceName(group, sourceNames)}</strong><small className="mt-1 block text-[10px] text-workspace-muted">{primary.source_type === "web" ? "Web page" : "Internal submission"} · {getPassageCount(group.results)} matched {getPassageCount(group.results) === 1 ? "passage" : "passages"}</small></span>
              </button>
              {isUnavailable ? <span className="text-[10px] text-workspace-warning">Content unavailable, not fully checked</span> : <span className="font-mono text-[12px] tabular-nums text-workspace-ink">{Number.isFinite(score) ? `${Math.round(score * 100)}%` : "—"}</span>}
              {sourceUrl && <a href={sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-[10px] text-workspace-info hover:underline focus-visible:outline-2 focus-visible:outline-workspace-info">Open URL <IconExternalLink size={13} aria-hidden="true" /></a>}
            </li>;
          })}
        </ul>

        {current && <div className="mt-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div><h3 className="mb-1 text-[12px] font-semibold text-workspace-ink">Comparison</h3><p className="m-0 text-[10px] text-workspace-muted">{getSourceName(current, sourceNames)}</p></div>{url && <p className="m-0 max-w-full break-all text-[10px] text-workspace-info"><a href={url} target="_blank" rel="noreferrer" className="hover:underline focus-visible:outline-2 focus-visible:outline-workspace-info">{url}</a><span className="ml-2 text-workspace-muted">· {current.results.find((result) => result.evidence.provider)?.evidence.provider ?? "Web source"} · {current.results.find((result) => result.evidence.retrieved_at)?.evidence.retrieved_at ?? "Retrieval date unavailable"}</span></p>}</div>
          {unavailable ? <p className="border-y border-workspace-border py-5 text-[11px] text-workspace-warning">Content unavailable, not fully checked</p> : <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <article className="min-w-0 rounded-lg border border-workspace-border bg-workspace-paper p-3.5"><h4 className="mb-3 text-[10px] font-semibold text-workspace-muted">Submitted {submission.content_type === "code" ? "code" : "text"}</h4>{pairs.length ? <div className="grid gap-3">{pairs.map((pair, index) => <button key={pair.key} ref={(element) => { submittedRefs.current[index] = element; }} type="button" aria-pressed={activePassage === index} aria-label={`Scroll to matched source passage ${index + 1}`} onClick={() => focusCounterpart("submission", index)} className={`block w-full cursor-pointer rounded-md px-2.5 py-2 text-left text-[11px] leading-relaxed text-workspace-ink underline decoration-2 decoration-workspace-info underline-offset-4 focus-visible:outline-2 focus-visible:outline-workspace-info ${activePassage === index ? "bg-workspace-info-soft" : "hover:bg-workspace-soft"}`}>{pair.submission}</button>)}</div> : tokenBlocks.length ? <div className="grid gap-2"><p className="m-0 text-[10px] leading-relaxed text-workspace-muted">The API returned token positions but not source-code lines or text.</p><ol className="m-0 list-decimal pl-6 font-mono text-[10px] text-workspace-copy">{tokenBlocks.map((block, index) => <li key={`${block.submission_token_start}-${block.source_token_start}-${index}`}>submission tokens {block.submission_token_start}–{block.submission_token_start + block.token_count}</li>)}</ol></div> : <p className="m-0 text-[11px] leading-relaxed text-workspace-muted">Matched submission excerpts weren’t returned for this result.</p>}</article>
            <article className="min-w-0 rounded-lg border border-workspace-border bg-workspace-paper p-3.5"><h4 className="mb-3 text-[10px] font-semibold text-workspace-muted">Matched source</h4>{pairs.length ? <div className="grid gap-3">{pairs.map((pair, index) => <button key={pair.key} ref={(element) => { sourceRefs.current[index] = element; }} type="button" aria-pressed={activePassage === index} aria-label={`Scroll to submitted passage ${index + 1}`} onClick={() => focusCounterpart("source", index)} className={`block w-full cursor-pointer rounded-md px-2.5 py-2 text-left text-[11px] leading-relaxed text-workspace-ink underline decoration-2 decoration-workspace-info underline-offset-4 focus-visible:outline-2 focus-visible:outline-workspace-info ${activePassage === index ? "bg-workspace-info-soft" : "hover:bg-workspace-soft"}`}>{pair.source}</button>)}</div> : tokenBlocks.length ? <p className="m-0 text-[11px] leading-relaxed text-workspace-muted">The API does not return matched code excerpts. Token positions are shown on the submission side.</p> : <p className="m-0 text-[11px] leading-relaxed text-workspace-muted">Matched source excerpts weren’t returned for this result.</p>}</article>
          </div>}
          {current.results.some((result) => result.source_type === "web") && <p className="mb-0 mt-3 text-[10px] text-workspace-muted">Provider: {current.results.find((result) => result.evidence.provider)?.evidence.provider ?? "not returned"} · Retrieved: {current.results.find((result) => result.evidence.retrieved_at)?.evidence.retrieved_at ?? "not returned"}</p>}
        </div>}
      </>}
    </section>
  );
}
