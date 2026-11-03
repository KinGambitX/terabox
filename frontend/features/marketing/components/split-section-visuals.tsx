import { IconBook2 } from "@tabler/icons-react";
import { HighlightHit } from "./highlight-hit";
import { heroModes } from "./hero-modes";

const sample = heroModes[0];
const webSample = heroModes[2];

/** Side-by-side passage comparison with real sample text */
export function EvidenceVisual() {
  return (
    <div
      className="overflow-hidden rounded-[22px] border border-workspace-border bg-white shadow-[0_16px_48px_rgba(22,24,29,0.06)]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between border-b border-workspace-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <i className="h-2 w-2 shrink-0 rounded-full bg-sky-600" />
          <span className="truncate text-[12px] font-medium text-workspace-ink">{sample.title}</span>
        </div>
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-sky-700">
          {sample.score}
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <div className="rounded-xl border border-workspace-border bg-workspace-soft/70 p-3.5">
          <p className="mb-3 text-[9px] font-medium tracking-[0.08em] text-workspace-muted-strong">
            SUBMITTED
          </p>
          <p className="text-[12px] leading-5 text-workspace-copy">
            <HighlightHit
              text={sample.submitted}
              hit={sample.submittedHit}
              className="bg-sky-600/15 text-sky-900"
            />
          </p>
          <p className="mt-3 font-mono text-[9px] text-workspace-muted-strong">{sample.type}</p>
        </div>
        <div className="rounded-xl border border-workspace-border bg-white p-3.5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[9px] font-medium tracking-[0.08em] text-workspace-muted-strong">
              CANDIDATE
            </p>
            <span className="text-[9px] font-medium text-sky-700">{sample.matchType}</span>
          </div>
          <p className="text-[12px] leading-5 text-workspace-ink">
            <HighlightHit
              text={sample.matched}
              hit={sample.matchedHit}
              className="bg-sky-600/15 text-sky-900"
            />
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-[9px] text-workspace-muted-strong">
            <IconBook2 size={12} />
            {sample.sources[0].detail}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-workspace-border px-4 py-3">
        {["TF-IDF", "Embedding", "Offsets kept"].map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-workspace-border bg-workspace-soft px-2.5 py-1 text-[10px] font-medium text-workspace-copy"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Reviewer note on a real sample match */
export function DecisionVisual() {
  return (
    <div
      className="relative min-h-[360px] overflow-hidden rounded-[22px] border border-workspace-border bg-workspace-soft/50 p-5 shadow-[0_16px_48px_rgba(22,24,29,0.06)] sm:p-6"
      aria-hidden="true"
    >
      <div className="rounded-xl border border-workspace-border bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[12px] font-medium text-workspace-ink">{webSample.title}</p>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-workspace-ink">
            {webSample.sources[1].score}
          </span>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-workspace-copy">
          <HighlightHit
            text={webSample.submitted}
            hit={webSample.submittedHit}
            className="bg-sky-600/15 text-sky-900"
          />
        </p>
        <p className="mt-3 text-[11px] leading-5 text-workspace-muted-strong">
          Matched against {webSample.sources[1].title} · {webSample.sources[1].detail}
        </p>
      </div>

      <div className="mt-4 sm:absolute sm:bottom-8 sm:right-6 sm:mt-0 sm:w-[250px]">
        <div className="rounded-2xl border border-workspace-border bg-white p-3.5 shadow-[0_12px_32px_rgba(22,24,29,0.1)]">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-workspace-action text-[10px] font-semibold text-white">
              AM
            </span>
            <div>
              <p className="text-[11px] font-semibold text-workspace-ink">Reviewer note</p>
              <p className="text-[10px] text-workspace-muted-strong">Sample · relevant</p>
            </div>
          </div>
          <p className="mt-2.5 text-[12px] leading-5 text-workspace-copy">
            Shared wording on “{webSample.submittedHit}” — check citation before flagging.
          </p>
          <div className="mt-3 flex gap-1.5">
            {["Relevant", "Dismiss"].map((label, i) => (
              <span
                key={label}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${i === 0 ? "bg-workspace-action text-white" : "border border-workspace-border text-workspace-copy"}`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
