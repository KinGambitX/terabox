import { ReviewStatusChart, SimilarityBySubmissionChart } from "./overview-charts";
import type { Review } from "../types/review";

function MetricRow({ title, value, detail, tone }: { title: string; value: number; detail: string; tone: string }) {
  return <li className="grid min-h-14 grid-cols-[minmax(0,1fr)_48px] items-center gap-3 border-b border-workspace-border py-2 last:border-0">
    <div className="min-w-0"><h3 className="mb-0.5 text-[12px] font-medium text-workspace-copy">{title}</h3><p className="m-0 truncate text-[12px] text-workspace-copy">{detail}</p></div>
    <strong className={`text-right font-mono text-[18px] font-medium tabular-nums ${tone}`}>{value}</strong>
  </li>;
}

export function OverviewMetrics({ reviews }: { reviews: Review[] }) {
  const pending = reviews.filter((review) => review.status === "pending").length;
  const reviewed = reviews.filter((review) => review.status === "reviewed").length;
  const sources = reviews.reduce((total, review) => total + review.matches, 0);

  return <section className="grid gap-4" aria-label="Workspace metrics">
    <div className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-lg border border-workspace-border bg-workspace-paper p-4" aria-labelledby="submission-count-title">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="submission-count-title" className="m-0 text-[13px] font-medium text-workspace-copy">Submissions</h2>
          <strong className="font-mono text-[28px] font-medium leading-none tracking-[-1px] tabular-nums text-workspace-ink">{reviews.length}</strong>
        </div>
        <ul className="m-0 list-none border-t border-workspace-border p-0" aria-label="Review summary">
          <MetricRow title="Awaiting review" value={pending} detail="Awaiting a reviewer decision" tone="text-workspace-warning" />
          <MetricRow title="Reviewed" value={reviewed} detail="Reviewer decision saved" tone="text-workspace-success" />
          <MetricRow title="Matched sources" value={sources} detail="Across submissions in this queue" tone="text-workspace-info" />
        </ul>
      </article>

      <article className="rounded-lg border border-workspace-border bg-workspace-paper p-4" aria-labelledby="status-chart-title">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 id="status-chart-title" className="m-0 text-[13px] font-medium text-workspace-copy">Review status</h2>
          <span className="text-[12px] text-workspace-copy">{reviews.length} total</span>
        </div>
        <ReviewStatusChart reviews={reviews} />
        <p className="mb-0 mt-1 text-[12px] leading-relaxed text-workspace-copy">Needs review amber · Relevant blue · Reviewed green · Dismissed gray</p>
      </article>
    </div>

    <article className="rounded-lg border border-workspace-border bg-workspace-paper p-4" aria-labelledby="similarity-chart-title">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="similarity-chart-title" className="m-0 text-[13px] font-medium text-workspace-copy">Similarity by submission</h2>
        <span className="text-[12px] text-workspace-copy">Highest to lowest · top 10 scored submissions</span>
      </div>
      {reviews.some((review) => review.score !== null) ? <SimilarityBySubmissionChart reviews={reviews} /> : <p className="m-0 border-t border-workspace-border py-4 text-[12px] text-workspace-copy">No similarity scores are available yet.</p>}
      <p className="mb-0 mt-2 border-t border-workspace-border pt-2 text-[12px] text-workspace-copy">Green below 40% · Amber 40–75% · Red above 75%</p>
    </article>
  </section>;
}
