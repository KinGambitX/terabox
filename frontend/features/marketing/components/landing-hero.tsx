"use client";

import { useState } from "react";
import { TextMorph } from "torph/react";
import { FeatureBento } from "./feature-bento";
import { HeroModePicker } from "./hero-mode-picker";
import { HeroPowerSkeleton } from "./hero-power-skeleton";
import { LandingSplitSections } from "./landing-split-sections";
import { heroModes, type HeroMode } from "./hero-modes";

export function LandingHero() {
  const [active, setActive] = useState<HeroMode>(heroModes[0]);

  const morphLabel =
    active.id === "documents"
      ? "documents"
      : active.id === "code"
        ? "source code"
        : "web sources";

  return (
    <>
      <section className="mx-auto w-full max-w-[1280px] px-5 pb-10 pt-14 text-center sm:px-8 sm:pt-16 lg:px-12 lg:pt-20">
        <h1 className="mx-auto max-w-[920px] font-sans text-[clamp(2.6rem,6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.06em] text-ink">
          <span className="block">
            Review{" "}
            <TextMorph
              as="span"
              duration={280}
              ease="cubic-bezier(0.77, 0, 0.175, 1)"
              scale={false}
              respectReducedMotion
              className="inline-block text-workspace-action"
            >
              {morphLabel}
            </TextMorph>
          </span>
          <span className="block">with evidence.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[540px] text-[15px] leading-6 text-workspace-copy sm:text-[16px] sm:leading-7">
          Compare writing and source code across submissions and public sources. Inspect the match,
          then make the call.
        </p>
        <div className="mx-auto mt-8 flex justify-center">
          <HeroModePicker active={active} onChange={setActive} />
        </div>
        <div id="product-preview" className="mx-auto mt-10 max-w-[1180px] text-left sm:mt-12">
          <HeroPowerSkeleton key={active.id} mode={active} />
          <p className="mt-4 text-center text-[11px] tracking-[0.01em] text-workspace-muted-strong">
            Sample review workspace
            <span className="px-1.5 text-workspace-control">·</span>
            Not live analysis
          </p>
        </div>
      </section>
      <FeatureBento />
      <LandingSplitSections />
    </>
  );
}
