import Link from "next/link";
import { IconCheck, IconLink, IconShieldCheck } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { DecisionVisual, EvidenceVisual } from "./split-section-visuals";

const evidencePoints = [
  {
    title: "Method stays visible",
    body: "Lexical, semantic, and code scores never collapse into one opaque number.",
  },
  {
    title: "Spans you can verify",
    body: "Matched passages keep offsets so you can open the exact lines in context.",
  },
  {
    title: "Source provenance",
    body: "Internal IDs or public URLs, with retrieval time when the web path is used.",
  },
];

const decisionPoints = [
  {
    title: "Status is yours",
    body: "Pending, relevant, or dismissed — stored apart from the machine output.",
  },
  {
    title: "Notes on the match",
    body: "Leave context on the evidence itself. The original scores stay unchanged.",
  },
  {
    title: "Optional explanations",
    body: "Groq summaries stay gated, labeled, and easy to ignore.",
  },
];

function PointList({
  points,
}: {
  points: { title: string; body: string }[];
}) {
  return (
    <ul className="mt-8 space-y-5">
      {points.map((point) => (
        <li key={point.title} className="flex gap-3">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-workspace-info-soft text-workspace-action">
            <IconCheck size={12} stroke={2.2} aria-hidden />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-workspace-ink">{point.title}</p>
            <p className="mt-1 text-[14px] leading-6 text-workspace-copy">{point.body}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function LandingSplitSections() {
  return (
    <div className="border-t border-workspace-border bg-canvas">
      <section className="mx-auto grid w-full max-w-[1120px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-12 lg:py-24">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.02em] text-workspace-action">
            <IconLink size={14} stroke={1.8} aria-hidden />
            Evidence handoff
          </p>
          <h2 className="mt-3 max-w-[22ch] font-sans text-[clamp(1.7rem,3vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-workspace-ink">
            Evidence is a passage, not a percentage.
          </h2>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-6 text-workspace-copy">
            SourceLens shows what matched, which method produced the score, and where it came from —
            so review starts from inspectable text, not a single bar.
          </p>
          <PointList points={evidencePoints} />
        </div>
        <EvidenceVisual />
      </section>

      <section className="border-t border-workspace-border bg-white">
        <div className="mx-auto grid w-full max-w-[1120px] items-center gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-12 lg:py-24">
          <div className="order-2 min-h-[320px] lg:order-1">
            <DecisionVisual />
          </div>
          <div className="order-1 lg:order-2">
            <p className="inline-flex items-center gap-1.5 text-[12px] font-medium tracking-[0.02em] text-workspace-action">
              <IconShieldCheck size={14} stroke={1.8} aria-hidden />
              Human review
            </p>
            <h2 className="mt-3 max-w-[22ch] font-sans text-[clamp(1.7rem,3vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-workspace-ink">
              Your note stays on the match.
            </h2>
            <p className="mt-4 max-w-[42ch] text-[15px] leading-6 text-workspace-copy">
              Similarity never writes the conclusion. Record status and notes on the evidence, keep
              AI text optional, and leave the original analysis intact.
            </p>
            <PointList points={decisionPoints} />
          </div>
        </div>
      </section>

      <section className="border-t border-workspace-border bg-canvas">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center sm:px-8 lg:px-12 lg:py-20">
          <div className="max-w-[520px]">
            <h2 className="font-sans text-[clamp(1.5rem,2.5vw,2rem)] font-semibold tracking-[-0.03em] text-workspace-ink">
              Open the workspace and review with evidence.
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-workspace-copy">
              Sample interface only — scores and sources are illustrative until you run a real
              analysis.
            </p>
          </div>
          <BrandButton asChild className="h-11 px-5 text-sm font-medium">
            <Link href="/workspace">Open workspace</Link>
          </BrandButton>
        </div>
      </section>
    </div>
  );
}
