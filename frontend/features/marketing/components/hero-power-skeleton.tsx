"use client";

import { useState } from "react";
import { BrandButton } from "@/components/ui/brand-button";
import { AnalysisPanel } from "@/features/workspace/components/analysis-panel";
import { ComparisonToggle } from "@/features/workspace/components/comparison-toggle";
import { ModePicker } from "@/features/workspace/components/mode-picker";
import { TextComposer } from "@/features/workspace/components/text-composer";
import { WorkspaceSidebar } from "@/features/workspace/components/workspace-sidebar";
import type { ReviewMode } from "@/features/workspace/types/workspace";
import { sampleWorkspaceFromMode } from "./hero-sample-results";
import type { HeroMode } from "./hero-modes";

function reviewModeFor(mode: HeroMode): ReviewMode {
  return mode.id === "code" ? "code" : "text";
}

function CodeSampleFields({
  value,
  comparison,
}: {
  value: string;
  comparison: string;
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2.5">
        <label className="text-sm font-medium text-workspace-ink">Code to review</label>
        <pre className="min-h-40 overflow-auto rounded-md border border-workspace-line bg-workspace-paper px-4 py-4 font-mono text-[12px] leading-5 text-workspace-ink">
          {value}
        </pre>
        <p className="m-0 text-xs text-workspace-muted-strong">Sample Python submission</p>
      </div>
      <ComparisonToggle checked onChange={() => {}} />
      <div className="grid gap-2.5">
        <label className="text-sm font-medium text-workspace-ink">Comparison source</label>
        <pre className="min-h-32 overflow-auto rounded-md border border-workspace-line bg-workspace-paper px-4 py-4 font-mono text-[12px] leading-5 text-workspace-ink">
          {comparison}
        </pre>
      </div>
    </div>
  );
}

export function HeroPowerSkeleton({ mode }: { mode: HeroMode }) {
  const sample = sampleWorkspaceFromMode(mode);
  const [composerMode, setComposerMode] = useState<ReviewMode>(() => reviewModeFor(mode));
  const [text, setText] = useState<string>(mode.submitted);
  const [comparisonText, setComparisonText] = useState<string>(mode.matched);

  return (
    <div
      data-ui="hero-workspace-preview"
      className="h-[min(720px,80vh)] overflow-hidden rounded-[22px] border border-workspace-border bg-workspace-ground text-left text-workspace-ink shadow-[0_24px_80px_rgba(22,24,29,0.08)]"
    >
      <div className="[&_*]:[scrollbar-width:none] [&_*::-webkit-scrollbar]:hidden flex h-full min-h-0 [&_aside]:!h-full [&_aside]:!max-h-full [&_aside]:overflow-y-auto [&_[data-ui=analysis-panel]]:!static [&_[data-ui=analysis-panel]]:!min-h-0 [&_[data-ui=analysis-panel]]:overflow-y-auto">
        <WorkspaceSidebar active="detect" onNavigate={() => {}} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-workspace-line px-5 sm:px-8">
            <span className="text-[13px] text-workspace-muted-strong">
              Workspace
              <span className="px-1.5 text-workspace-control">/</span>
              <span className="text-workspace-ink">Detect</span>
            </span>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,1fr)]">
            <div className="min-w-0 border-b border-workspace-line px-5 py-7 sm:px-8 lg:border-b-0 lg:pr-8">
              <header className="mb-6 max-w-2xl">
                <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">
                  Similarity review
                </p>
                <h2 className="mb-0 mt-3 font-heading text-[26px] font-normal leading-8 tracking-[-0.025em] text-workspace-ink">
                  Inspect a submission.
                </h2>
                <p className="mb-0 mt-2 text-sm leading-[22px] text-workspace-copy">
                  Sample workspace layout — same Detect flow as the product.
                </p>
              </header>

              <section aria-label="Sample similarity review" className="grid gap-6">
                <ModePicker value={composerMode} onChange={setComposerMode} />
                <div className="min-w-0">
                  {composerMode === "code" ? (
                    <CodeSampleFields value={text} comparison={comparisonText} />
                  ) : (
                    <TextComposer
                      value={text}
                      onChange={setText}
                      comparisonValue={comparisonText}
                      onComparisonChange={setComparisonText}
                      compare
                      onCompareChange={() => {}}
                    />
                  )}
                  <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-workspace-line pt-4">
                    <span className="text-xs leading-4 text-workspace-muted-strong">
                      Sample review service
                    </span>
                    <BrandButton tone="ink" type="button" disabled className="min-h-10 gap-2 px-4 text-sm font-medium">
                      Run detection <span aria-hidden>→</span>
                    </BrandButton>
                  </div>
                  <p className="mb-0 mt-3 text-right text-xs leading-4 text-workspace-muted-strong">
                    Illustrative sample — open the workspace to run a real check.
                  </p>
                </div>
              </section>
            </div>

            <AnalysisPanel
              submission={sample.submission}
              submissions={sample.submissions}
              results={sample.results}
              externalChecks={[]}
              notice=""
              loading={false}
              interactive={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
