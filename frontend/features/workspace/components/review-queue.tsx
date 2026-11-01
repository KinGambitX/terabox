"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowUpRight, IconCode, IconFileText, IconSearch } from "@tabler/icons-react";
import { ReviewStatusPill } from "./review-status-pill";
import { formatReviewDate, reviewStatuses, similarityBand, statusLabel } from "../lib/review-display";
import type { Review } from "../types/review";

type SortMode = "similarity" | "date" | "status";

export function ReviewQueue({ reviews }: { reviews: Review[] }) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("All courses");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortMode>("date");
  const courses = Array.from(new Set(reviews.map((review) => review.course.split(" · ")[0]))).sort();
  const normalizedQuery = query.trim().toLowerCase();
  const visibleReviews = reviews.filter((review) => {
    const terms = `${review.title} ${review.course} ${review.id} ${review.kind}`.toLowerCase();
    return terms.includes(normalizedQuery)
      && (course === "All courses" || review.course.startsWith(course))
      && (status === "all" || review.status === status);
  }).toSorted((left, right) => {
    if (sort === "similarity") return (right.score ?? -1) - (left.score ?? -1);
    if (sort === "status") return reviewStatuses.indexOf(left.status) - reviewStatuses.indexOf(right.status);
    return new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime();
  });
  const hasFilters = query.length > 0 || course !== "All courses" || status !== "all";

  return (
    <section className="min-w-0" id="reviews" aria-labelledby="review-queue-title">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h2 id="review-queue-title" className="mb-1 font-heading text-[19px] font-semibold tracking-[-.45px] text-workspace-ink">Similarity review queue</h2>
          <p className="m-0 max-w-[620px] text-[12px] leading-relaxed text-workspace-copy">Inspect matched passages and sources. Similarity is a review signal, not a verdict.</p>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter submissions">
        <label className="flex h-10 w-full items-center gap-2.5 rounded-lg border border-workspace-border bg-workspace-paper px-3 text-workspace-copy outline-none focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-workspace-info sm:min-w-[220px] sm:flex-1">
          <IconSearch size={17} aria-hidden="true" />
          <input name="search" autoComplete="off" aria-label="Search submissions" placeholder="Search submissions, courses, or IDs…" value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 border-0 bg-transparent text-[12px] text-workspace-ink outline-none placeholder:text-workspace-copy" />
        </label>
        <label className="sr-only" htmlFor="course-filter">Filter by course</label>
        <select id="course-filter" className="h-10 w-full cursor-pointer rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-copy outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-workspace-info sm:w-auto sm:min-w-[150px]" value={course} onChange={(event) => setCourse(event.target.value)}>
          <option>All courses</option>
          {courses.map((name) => <option key={name}>{name}</option>)}
        </select>
        <label className="sr-only" htmlFor="status-filter">Filter by review status</label>
        <select id="status-filter" className="h-10 w-full cursor-pointer rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-copy outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-workspace-info sm:w-auto sm:min-w-[145px]" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          {reviewStatuses.map((item) => <option value={item} key={item}>{statusLabel(item)}</option>)}
        </select>
        <label className="sr-only" htmlFor="sort-reviews">Sort submissions</label>
        <select id="sort-reviews" className="h-10 w-full cursor-pointer rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-copy outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-workspace-info sm:w-auto sm:min-w-[155px]" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
          <option value="date">Newest first</option><option value="similarity">Similarity, high first</option><option value="status">Review status</option>
        </select>
        {hasFilters && <button className="h-10 cursor-pointer rounded-lg px-3 text-[12px] font-medium text-workspace-info hover:bg-workspace-info-soft focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-workspace-info" type="button" onClick={() => { setQuery(""); setCourse("All courses"); setStatus("all"); }}>Clear filters</button>}
      </div>

      {visibleReviews.length ? (
        <ul className="m-0 list-none border-y border-workspace-border p-0" aria-label="Submission matches">
          {visibleReviews.map((review) => {
            const TypeIcon = review.kind === "Document" ? IconFileText : IconCode;
            const band = similarityBand(review.score);
            return (
              <li className="grid min-w-0 grid-cols-2 items-center gap-x-3 gap-y-3 border-b border-workspace-border px-2 py-3 transition-colors hover:bg-workspace-soft/60 last:border-0 sm:px-3 xl:min-h-[76px] xl:grid-cols-[minmax(280px,1fr)_88px_120px_128px_132px] xl:gap-x-3 xl:gap-y-0 xl:py-3" key={review.submissionId}>
                <div className="col-span-2 flex min-w-0 items-center gap-3 xl:col-span-1">
                  <TypeIcon size={17} className="shrink-0 text-workspace-muted" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-baseline gap-2">
                      <h3 className="m-0 min-w-0 flex-1 break-words font-heading text-[13px] font-semibold tracking-[-.15px] text-workspace-ink">{review.title}</h3>
                      <span className="shrink-0 font-mono text-[12px] text-workspace-copy">{review.id}</span>
                    </div>
                    <p className="mb-0 mt-1 truncate text-[12px] text-workspace-copy">{review.course.replace(" · ", ", ")} <span aria-hidden="true">/</span> {review.kind} <span aria-hidden="true">/</span> {formatReviewDate(review.submittedAt)}</p>
                  </div>
                </div>
                <div className="col-start-1 flex min-w-0 items-baseline justify-between gap-2 xl:col-auto xl:flex-col xl:items-end xl:justify-center xl:gap-1">
                  <strong className={`text-[18px] font-medium leading-none tracking-[-.5px] tabular-nums ${band.className}`}>{review.score === null ? "—" : `${Math.round(review.score * 100)}%`}</strong>
                  <span className="text-[12px] text-workspace-copy xl:text-right">{band.label}</span>
                </div>
                <span className="min-w-0 text-right text-[12px] text-workspace-copy xl:text-right">{review.matches} matched {review.matches === 1 ? "source" : "sources"}</span>
                <ReviewStatusPill status={review.status} readable className="w-[128px] justify-center px-2" />
                <Link href={`/submissions/${encodeURIComponent(review.submissionId)}/evidence`} className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-1 rounded-md px-2 text-[12px] font-medium text-workspace-info hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-info xl:w-[132px]" aria-label={`Inspect evidence for ${review.id}`}>
                  Inspect evidence <IconArrowUpRight size={13} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-workspace-border bg-workspace-soft px-5 py-9 text-center">
          <p className="m-0 text-[12px] font-medium text-workspace-ink">{reviews.length ? "No matching submissions" : "No submissions to review"}</p>
          <p className="mb-0 mt-1.5 text-[12px] text-workspace-copy">{reviews.length ? "Try another search or clear your filters." : "Add a document or source file to start a similarity check."}</p>
        </div>
      )}

      <p className="mb-0 mt-3 text-[12px] text-workspace-copy" aria-live="polite">
        Showing {visibleReviews.length} of {reviews.length} submissions
      </p>
    </section>
  );
}
