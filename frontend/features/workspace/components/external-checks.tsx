"use client";

import { useState } from "react";
import { externalReportSchema, type ExternalCheck, type SubmissionRecord } from "@/lib/review-schemas";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Bag : {};
}
function asPercent(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(100, value * 100)) : null;
}
function metric(check: ExternalCheck): { label: string; value: number } | null {
  const result = bag(check.result);
  if (check.provider === "sapling") {
    const value = asPercent(result.score);
    return value === null ? null : { label: "AI likelihood", value };
  }
  if (check.provider === "plagiarismcheck" && check.status === "completed") {
    const report = bag(bag(result.data).report);
    const parsed = Number(report.percent);
    return Number.isFinite(parsed) ? { label: "Potential text overlap", value: Math.max(0, Math.min(100, parsed)) } : null;
  }
  return null;
}
function aiReading(value: number) {
  if (value >= 70) return "higher AI likelihood signal";
  if (value >= 40) return "mixed AI likelihood signal";
  return "lower AI likelihood signal";
}
function aiConfidence(check: ExternalCheck) {
  const result = bag(check.result);
  if (result.low_confidence === true || result.confidence_category === "low") return "low confidence";
  if (result.confidence_category === "medium") return "medium confidence";
  return "estimated signal";
}
function title(provider: string) {
  return ({ sapling: "AI detector", plagiarismcheck: "Text overlap check", tavily: "Public source search", dolos: "Code similarity check" } as Record<string, string>)[provider] ?? "Analysis check";
}
function detail(check: ExternalCheck) {
  if (check.status === "not_configured") return "Add the provider key and enable its backend setting.";
  if (check.status === "failed") {
    const code = bag(check).status_code;
    return typeof code === "number"
      ? `This check was rejected (HTTP ${code}). Other checks still completed.`
      : "This check failed. Other checks still completed.";
  }
  if (check.status === "no_matches") return "No candidate pages returned for this text.";
  if (check.status === "submitted") return `Scan queued · reference ${check.check_id}`;
  if (check.status === "skipped" && check.reason === "no_comparable_code_submissions") return "Upload another code file to compare against.";
  if (check.status === "skipped" && check.reason === "dataset_exceeds_9_mb") return "Comparison set exceeds the provider upload limit.";
  return check.status.replaceAll("_", " ");
}
function category(provider: string) {
  if (provider === "sapling") return "AI likelihood";
  if (provider === "plagiarismcheck") return "Plagiarism review";
  if (provider === "dolos") return "Code overlap";
  if (provider === "tavily") return "Public source discovery";
  return "Source comparison";
}

export function ExternalChecks({ submission, checks: initialChecks }: { submission: SubmissionRecord; checks: ExternalCheck[] }) {
  const [checks, setChecks] = useState(initialChecks);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function refreshPlagiarism(checkId: string) {
    setBusy("plagiarismcheck");
    setError("");
    try {
      const response = await fetch(
        `/api/external-checks/plagiarismcheck/${encodeURIComponent(checkId)}`,
        { cache: "no-store" },
      );
      const parsed = externalReportSchema.safeParse(await response.json().catch(() => null));
      if (!response.ok || !parsed.success) throw new Error("Could not load PlagiarismCheck report.");
      setChecks((items) => items.map((item) =>
        item.provider === "plagiarismcheck" && item.check_id === checkId
          ? { ...item, ...parsed.data }
          : item,
      ));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refresh provider report.");
    } finally {
      setBusy("");
    }
  }

  async function refreshCodeReport(reportId: string) {
    setBusy("dolos");
    setError("");
    try {
      const response = await fetch(
        `/api/external-checks/dolos/${encodeURIComponent(reportId)}`,
        { cache: "no-store" },
      );
      const body = bag(await response.json().catch(() => null));
      if (!response.ok || typeof body.status !== "string") throw new Error("Could not load the code similarity report.");
      setChecks((items) => items.map((item) =>
        item.provider === "dolos" && item.report_id === reportId
          ? { ...item, status: body.status as string }
          : item,
      ));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refresh provider report.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mt-8 border-t border-workspace-line pt-5" aria-label="External analysis tools">
      <div>
        <h3 className="m-0 text-sm font-medium text-workspace-ink">Provider checks</h3>
        <p className="mb-0 mt-1 text-xs leading-4 text-workspace-muted-strong">
          {submission.content_type === "code"
            ? "Code overlap is checked against available sources. AI-origin detection is not available for code yet."
            : "Text overlap, public sources, and AI-likelihood estimates are separate checks."}
        </p>
      </div>
      {!checks.length ? (
        <p className="mb-0 mt-4 text-sm text-workspace-muted-strong">
          Provider check status is unavailable for this submission.
        </p>
      ) : (
        <ul className="mb-0 mt-4 list-none divide-y divide-workspace-line border-y border-workspace-line p-0">
          {checks.map((check, index) => {
            const value = metric(check);
            const key = `${check.provider}:${check.submission_id ?? check.submission_filename ?? index}`;
            const status = check.status.replaceAll("_", " ");
            return (
              <li key={key} className="py-3">
                <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">{category(check.provider)}</p>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="m-0 text-sm font-medium text-workspace-ink">
                    {title(check.provider)}{check.submission_filename ? ` · ${check.submission_filename}` : ""}
                  </h4>
                  <span className="text-xs capitalize text-workspace-muted-strong">{status}</span>
                </div>
                <p className="mb-0 mt-1 text-xs leading-4 text-workspace-muted-strong">
                  {value
                    ? `${value.label}: ${value.value.toFixed(0)}%${check.provider === "sapling" ? ` · ${aiReading(value.value)} · ${aiConfidence(check)}` : ""}`
                    : check.provider === "tavily" && (check.results?.length ?? 0) > 0
                      ? `${check.results!.length} candidate ${check.results!.length === 1 ? "page" : "pages"} found`
                      : detail(check)}
                </p>
                {value && (
                  <div
                    className="mt-2 h-1 overflow-hidden rounded-sm bg-workspace-line"
                    role="img"
                    aria-label={`${value.label} ${value.value.toFixed(0)} percent`}
                  >
                    <div className="h-full bg-workspace-action" style={{ width: `${value.value}%` }} />
                  </div>
                )}
                {check.provider === "tavily" && check.results?.length ? (
                  <ul className="mb-0 mt-2 list-none space-y-1 p-0">
                    {check.results.slice(0, 3).map((item, resultIndex) => {
                      const match = bag(item);
                      const evidence = bag(match.evidence);
                      const url = typeof evidence.url === "string"
                        ? evidence.url
                        : typeof match.url === "string"
                          ? match.url
                          : typeof match.source_id === "string" && match.source_id.startsWith("http")
                            ? match.source_id
                            : "";
                      const label = typeof evidence.title === "string"
                        ? evidence.title
                        : typeof match.title === "string" ? match.title : url;
                      return url ? <li key={`${url}:${resultIndex}`}>
                        <a href={url} target="_blank" rel="noreferrer" className="text-xs leading-4 text-workspace-ink underline decoration-workspace-control underline-offset-4 hover:decoration-workspace-action focus-visible:outline-2 focus-visible:outline-workspace-focus">{label || "Open source"}</a>
                      </li> : null;
                    })}
                  </ul>
                ) : null}
                <div className="mt-2 flex gap-3">
                  {check.provider === "plagiarismcheck" && check.check_id && check.status !== "completed" && (
                    <button
                      type="button"
                      disabled={busy === check.provider}
                      onClick={() => void refreshPlagiarism(check.check_id!)}
                      className="text-xs text-workspace-ink underline underline-offset-4 disabled:opacity-50"
                    >
                      {busy === check.provider ? "Checking…" : "Refresh report"}
                    </button>
                  )}
                  {check.provider === "dolos" && check.report_id && (
                    <>
                      <button
                        type="button"
                        disabled={busy === check.provider}
                        onClick={() => void refreshCodeReport(check.report_id!)}
                        className="text-xs text-workspace-ink underline underline-offset-4 disabled:opacity-50"
                      >
                        {busy === check.provider ? "Checking…" : "Refresh status"}
                      </button>
                      {check.html_url && (
                        <a href={check.html_url} target="_blank" rel="noreferrer" className="text-xs text-workspace-ink underline underline-offset-4">
                          Open report
                        </a>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="mb-0 mt-3 text-xs text-workspace-danger" role="alert">{error}</p>}
      <p className="mb-0 mt-3 text-[11px] leading-4 text-workspace-muted-strong">
        {submission.content_type === "code"
          ? "Similarity points to code worth reviewing; it does not establish copying or AI authorship."
          : "AI scores are estimates, not proof. Similarity can identify overlap but does not determine plagiarism."}
      </p>
    </section>
  );
}
