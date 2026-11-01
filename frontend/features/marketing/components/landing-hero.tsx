"use client";

import { useState } from "react";
import { TextMorph } from "torph/react";
import { HeroModePicker } from "./hero-mode-picker";
import { heroModes, type HeroMode } from "./hero-modes";
import { ReviewPreview } from "./review-preview";

export function LandingHero() {
  const [active, setActive] = useState<HeroMode>(heroModes[0]);

  return (
    <section className="mx-auto w-full max-w-[1480px] px-5 pb-20 pt-12 text-center sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
      <h1 className="mx-auto max-w-[1000px] font-heading text-[clamp(2.8rem,5.5vw,4.7rem)] font-medium leading-[1.02] tracking-[-0.065em] text-ink">
        <span className="block">Review <TextMorph as="span" duration={280} ease="cubic-bezier(0.77, 0, 0.175, 1)" scale={false} respectReducedMotion className="inline-block text-sky-300">{active.id === "documents" ? "documents" : active.id === "code" ? "source code" : "web sources"}</TextMorph></span>
        <span className="block">with context.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-[670px] text-[14px] leading-6 text-[#a0a0a0] sm:text-[15px] sm:leading-7">
        Compare writing and source code across submissions and public sources. Inspect the evidence, then make the call.
      </p>
      <div className="mt-7"><HeroModePicker active={active} onChange={setActive} /></div>
      <div id="product-preview" className="mx-auto mt-10 max-w-[1320px] text-left sm:mt-12">
        <ReviewPreview mode={heroModes[0]} />
        <p className="mt-4 text-center text-[11px] tracking-[0.01em] text-[#737373]">Sample review interface <span className="px-1.5 text-[#505050]">·</span> Sources and scores are illustrative</p>
      </div>
    </section>
  );
}
