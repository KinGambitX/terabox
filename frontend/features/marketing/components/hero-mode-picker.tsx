"use client";

import { motion, useReducedMotion } from "motion/react";
import { heroModes, type HeroMode } from "./hero-modes";

const accentText = {
  sky: "text-sky-300",
  orange: "text-orange-300",
  violet: "text-violet-300",
};

export function HeroModePicker({
  active,
  onChange,
}: {
  active: HeroMode;
  onChange: (mode: HeroMode) => void;
}) {
  const reduceMotion = useReducedMotion();
  const activeIndex = heroModes.findIndex((mode) => mode.id === active.id);

  return (
    <div
      className="relative grid w-full max-w-[450px] grid-cols-3 rounded-full border border-divider bg-surface p-1"
      role="group"
      aria-label="Choose a review example"
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1 top-1 bottom-1 w-[calc((100%-8px)/3)] rounded-full border border-divider bg-surface-hover"
        initial={false}
        animate={{ transform: `translateX(${activeIndex * 100}%)` }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 32, mass: 0.9 }}
      />
      {heroModes.map((mode) => {
        const Icon = mode.icon;
        const selected = active.id === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(mode)}
            className={`relative z-10 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-2 text-[12px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:gap-2.5 sm:px-3 sm:text-[13px] ${selected ? "text-ink" : "text-muted-text hover:text-copy"}`}
          >
            <Icon
              className={selected ? accentText[mode.accent] : "text-muted-text"}
              size={16}
              stroke={1.8}
            />
            <span>{mode.label}</span>
            {selected && (
              <i className={`h-1.5 w-1.5 rounded-full ${mode.accent === "sky" ? "bg-sky-300" : mode.accent === "orange" ? "bg-orange-300" : "bg-violet-300"}`} aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
