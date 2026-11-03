"use client";

import { motion, useReducedMotion } from "motion/react";
import { heroModes, type HeroMode } from "./hero-modes";

const accentText = {
  sky: "text-sky-600",
  orange: "text-orange-500",
  violet: "text-violet-500",
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
      className="relative grid w-full max-w-[450px] grid-cols-3 rounded-full border border-workspace-border bg-white p-1 shadow-[0_1px_0_rgba(22,24,29,0.04)]"
      role="group"
      aria-label="Choose a review example"
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-8px)/3)] rounded-full border border-workspace-border bg-workspace-soft"
        initial={false}
        animate={{ transform: `translateX(${activeIndex * 100}%)` }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: "spring", stiffness: 260, damping: 32, mass: 0.9 }
        }
      />
      {heroModes.map((mode) => {
        const Icon = mode.icon;
        const selected = mode.id === active.id;

        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(mode)}
            className={`relative z-10 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-2 text-[12px] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-focus sm:gap-2.5 sm:px-3 sm:text-[13px] ${selected ? "text-ink" : "text-muted-text hover:text-copy"}`}
          >
            <Icon
              className={selected ? accentText[mode.accent] : "text-muted-text"}
              size={16}
              stroke={1.8}
            />
            <span>{mode.label}</span>
            {selected ? (
              <i
                className={`h-1.5 w-1.5 rounded-full ${mode.accent === "sky" ? "bg-sky-600" : mode.accent === "orange" ? "bg-orange-500" : "bg-violet-500"}`}
                aria-hidden="true"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
