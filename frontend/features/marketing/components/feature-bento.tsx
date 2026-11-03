"use client";

import { useState } from "react";
import {
  SkeletonModes,
  SkeletonPassages,
  SkeletonPrivacy,
  SkeletonReviewQueue,
  SkeletonSearch,
  SkeletonSourceList,
} from "./feature-skeletons";

const features = [
  {
    id: "passages",
    title: "See the overlap",
    body: "Open matched lines side by side. Lexical and semantic scores stay separate so you can judge the evidence.",
    Skeleton: SkeletonPassages,
  },
  {
    id: "modes",
    title: "One place to review",
    body: "Upload writing, source code, or pull candidate pages from the web — same review flow each time.",
    Skeleton: SkeletonModes,
  },
  {
    id: "sources",
    title: "Ranked by match",
    body: "Strongest sources rise first, with method and score shown clearly. Similarity is a signal, not a verdict.",
    Skeleton: SkeletonSourceList,
  },
  {
    id: "queue",
    title: "Keep the decision yours",
    body: "Mark items for review, add notes, dismiss noise. Machine output never overwrites your call.",
    Skeleton: SkeletonReviewQueue,
  },
  {
    id: "privacy",
    title: "Stays in your workspace",
    body: "Submissions stay private by default. Optional AI explanations are gated and never change the score.",
    Skeleton: SkeletonPrivacy,
  },
  {
    id: "search",
    title: "Find it fast",
    body: "Search submissions and evidence when the queue grows — jump straight to the passage that matters.",
    Skeleton: SkeletonSearch,
  },
] as const;

function BentoCard({
  id,
  title,
  body,
  Skeleton,
}: (typeof features)[number]) {
  const [active, setActive] = useState(false);

  return (
    <li
      className="flex flex-col overflow-hidden rounded-[22px] border border-workspace-border bg-white shadow-[0_1px_0_rgba(22,24,29,0.04)] transition-shadow duration-200 ease-out hover:shadow-[0_12px_40px_rgba(22,24,29,0.08)] focus-within:shadow-[0_12px_40px_rgba(22,24,29,0.08)]"
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setActive(false);
        }
      }}
    >
      <div
        className="flex min-h-[176px] items-center justify-center bg-workspace-soft/40 px-5 pt-6"
        tabIndex={0}
        aria-label={`${title} preview`}
      >
        <Skeleton active={active} id={id} />
      </div>
      <div className="mt-auto px-6 pb-7 pt-4">
        <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-workspace-ink">
          {title}
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-workspace-copy">{body}</p>
      </div>
    </li>
  );
}

export function FeatureBento() {
  return (
    <section
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-8 sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[560px] text-center">
        <h2
          id="features-heading"
          className="font-sans text-[clamp(1.75rem,3.5vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-workspace-ink"
        >
          Evidence you can inspect.
        </h2>
        <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-6 text-workspace-copy">
          Hover any card — the empty skeleton fills with the review UI.
        </p>
      </div>

      <ul className="mt-12 grid list-none grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {features.map((feature) => (
          <BentoCard key={feature.id} {...feature} />
        ))}
      </ul>
    </section>
  );
}
