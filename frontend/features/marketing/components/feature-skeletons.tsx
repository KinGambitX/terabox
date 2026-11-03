"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { fade, morph, type SkeletonProps } from "./feature-skeleton-shared";

export {
  SkeletonPrivacy,
  SkeletonReviewQueue,
  SkeletonSearch,
} from "./feature-skeleton-actions";

function Bone({ className = "" }: { className?: string }) {
  return <div className={cn("rounded-sm bg-neutral-200", className)} />;
}

/** Empty dual cards → matched highlighted passages */
export function SkeletonPassages({ active, id }: SkeletonProps) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : morph;

  return (
    <LayoutGroup id={`${id}-passages`}>
      <div className="mx-auto flex h-[148px] w-full max-w-[240px] items-center justify-center gap-2">
        {(["left", "right"] as const).map((side) => (
          <motion.div
            key={side}
            layout
            layoutId={`${id}-${side}-card`}
            transition={t}
            animate={{
              width: active ? "48%" : "38%",
              minHeight: active ? 112 : 64,
              padding: active ? 10 : 8,
            }}
            className="overflow-hidden rounded-xl border border-workspace-border bg-white"
          >
            <Bone className="h-1.5 w-8" />
            <AnimatePresence initial={false} mode="popLayout">
              {active ? (
                <motion.div
                  key="filled"
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: 4 }}
                  transition={reduce ? { duration: 0 } : fade}
                  className="mt-2 space-y-1.5"
                >
                  <Bone className="h-1.5 w-full" />
                  <motion.div
                    layoutId={`${id}-${side}-hit`}
                    className="h-3 w-[90%] rounded bg-sky-600/20"
                    transition={t}
                  />
                  <Bone className="h-1.5 w-[70%]" />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  layoutId={`${id}-${side}-hit`}
                  className="mt-3 h-2 w-10 rounded bg-neutral-200"
                  transition={t}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
}

/** Compact dots → expanding mode pills with labels */
export function SkeletonModes({ active, id }: SkeletonProps) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : morph;
  const modes = [
    { label: "Documents", on: true },
    { label: "Source code", on: false },
    { label: "Web sources", on: false },
  ];

  return (
    <LayoutGroup id={`${id}-modes`}>
      <div className="mx-auto flex h-[148px] w-full max-w-[220px] flex-col items-center justify-center gap-2">
        {modes.map((mode, i) => (
          <motion.div
            key={mode.label}
            layout
            layoutId={`${id}-mode-${i}`}
            transition={t}
            animate={{
              width: active ? "100%" : 28,
              height: active ? 36 : 28,
              paddingLeft: active ? 12 : 0,
              paddingRight: active ? 12 : 0,
            }}
            className={cn(
              "flex items-center justify-center gap-2 overflow-hidden rounded-full border border-workspace-border bg-white",
              mode.on && active && "border-sky-600/40 bg-sky-600/5",
            )}
          >
            <i
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                mode.on ? "bg-sky-600" : "bg-neutral-300",
              )}
            />
            <AnimatePresence initial={false}>
              {active ? (
                <motion.span
                  key="label"
                  initial={reduce ? false : { opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={reduce ? undefined : { opacity: 0, width: 0 }}
                  transition={reduce ? { duration: 0 } : fade}
                  className={cn(
                    "overflow-hidden whitespace-nowrap text-[11px] font-medium",
                    mode.on ? "text-workspace-ink" : "text-workspace-copy",
                  )}
                >
                  {mode.label}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
}

/** Empty bars → ranked match rows with scores */
export function SkeletonSourceList({ active, id }: SkeletonProps) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : morph;
  const rows = [87, 74, 61];

  return (
    <LayoutGroup id={`${id}-sources`}>
      <div className="mx-auto flex h-[148px] w-full max-w-[220px] flex-col justify-center gap-2">
        {rows.map((score, i) => (
          <motion.div
            key={score}
            layout
            layoutId={`${id}-row-${i}`}
            transition={t}
            animate={{
              width: active ? "100%" : `${70 - i * 8}%`,
              height: active ? "auto" : 12,
              paddingTop: active ? 8 : 0,
              paddingBottom: active ? 8 : 0,
              paddingLeft: active ? 10 : 0,
              paddingRight: active ? 10 : 0,
              alignSelf: active ? "stretch" : "center",
            }}
            className={cn(
              "overflow-hidden rounded-lg border border-workspace-border bg-white",
              i === 0 && active && "border-sky-600/30",
            )}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {active ? (
                <motion.div
                  key="filled"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={reduce ? { duration: 0 } : fade}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Bone className={cn("h-1.5", i === 0 ? "w-24" : "w-20")} />
                    <span className="font-mono text-[10px] font-medium tabular-nums text-workspace-ink">
                      {score}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                    <motion.div
                      className="h-full rounded-full bg-sky-600"
                      initial={{ width: "8%" }}
                      animate={{ width: `${score}%` }}
                      transition={t}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  className="h-full w-full rounded bg-neutral-200"
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
}
