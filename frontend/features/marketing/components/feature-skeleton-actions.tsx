"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { fade, morph, type SkeletonProps } from "./feature-skeleton-shared";

function Bone({ className = "" }: { className?: string }) {
  return <div className={cn("rounded-sm bg-neutral-200", className)} />;
}

/** Empty dots → review queue with status text */
export function SkeletonReviewQueue({ active, id }: SkeletonProps) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : morph;
  const items = [
    { status: "Needs review", tone: "bg-amber-500" },
    { status: "In progress", tone: "bg-sky-600" },
    { status: "Dismissed", tone: "bg-neutral-300" },
  ];

  return (
    <LayoutGroup id={`${id}-queue`}>
      <div className="mx-auto flex h-[148px] w-full max-w-[220px] flex-col justify-center gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.status}
            layout
            layoutId={`${id}-queue-${i}`}
            transition={t}
            animate={{
              width: active ? "100%" : 32,
              height: active ? 44 : 32,
              paddingLeft: active ? 10 : 0,
              paddingRight: active ? 10 : 0,
              alignSelf: active ? "stretch" : "center",
            }}
            className="flex items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-workspace-border bg-white"
          >
            <i className={cn("h-2 w-2 shrink-0 rounded-full", item.tone)} />
            <AnimatePresence initial={false}>
              {active ? (
                <motion.div
                  key="meta"
                  initial={reduce ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -4 }}
                  transition={reduce ? { duration: 0 } : fade}
                  className="min-w-0 flex-1"
                >
                  <Bone className="h-1.5 w-[70%]" />
                  <p className="mt-1.5 text-[10px] font-medium text-workspace-copy">
                    {item.status}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </LayoutGroup>
  );
}

/** Closed privacy card → toggle on + provenance note */
export function SkeletonPrivacy({ active, id }: SkeletonProps) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : morph;

  return (
    <LayoutGroup id={`${id}-privacy`}>
      <div className="mx-auto flex h-[148px] w-full max-w-[200px] items-center justify-center">
        <motion.div
          layout
          layoutId={`${id}-privacy-shell`}
          transition={t}
          animate={{
            width: active ? "100%" : 96,
            minHeight: active ? 132 : 40,
            padding: active ? 16 : 8,
          }}
          className="overflow-hidden rounded-2xl border border-workspace-border bg-white shadow-[0_1px_0_rgba(22,24,29,0.04)]"
        >
          <div className="flex items-center justify-between gap-2">
            <Bone className={active ? "h-2 w-16" : "h-2 w-8"} />
            <motion.div
              layout
              layoutId={`${id}-toggle`}
              transition={t}
              className="relative h-5 w-9 rounded-full"
              animate={{ backgroundColor: active ? "#0284c7" : "#e5e5e5" }}
            >
              <motion.span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                animate={{ left: active ? 16 : 2 }}
                transition={t}
              />
            </motion.div>
          </div>
          <AnimatePresence initial={false}>
            {active ? (
              <motion.div
                key="note"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.28, ease: [0.77, 0, 0.175, 1] }
                }
                className="overflow-hidden"
              >
                <Bone className="mt-4 h-1.5 w-full" />
                <Bone className="mt-2 h-1.5 w-[80%]" />
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-workspace-border bg-workspace-soft px-2.5 py-2">
                  <i className="h-3 w-3 rounded-full border border-sky-600" />
                  <span className="text-[10px] font-medium text-workspace-copy">
                    Workspace only
                  </span>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}

/** Empty search field → typed query + result lines */
export function SkeletonSearch({ active, id }: SkeletonProps) {
  const reduce = useReducedMotion();
  const t = reduce ? { duration: 0 } : morph;

  return (
    <LayoutGroup id={`${id}-search`}>
      <div className="mx-auto flex h-[148px] w-full max-w-[220px] items-center justify-center">
        <motion.div
          layout
          layoutId={`${id}-search-shell`}
          transition={t}
          animate={{
            width: active ? "100%" : 152,
            minHeight: active ? 120 : 36,
            padding: active ? 12 : 0,
            paddingLeft: active ? 12 : 12,
            paddingRight: active ? 12 : 12,
          }}
          className="overflow-hidden rounded-2xl border border-workspace-border bg-white shadow-[0_8px_24px_rgba(22,24,29,0.06)]"
        >
          <div className="flex h-9 items-center gap-2">
            <i className="h-3 w-3 shrink-0 rounded-full border border-workspace-control" />
            <AnimatePresence initial={false} mode="wait">
              {active ? (
                <motion.span
                  key="typed"
                  layoutId={`${id}-search-value`}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={reduce ? { duration: 0 } : fade}
                  className="truncate text-[11px] font-medium text-workspace-ink"
                >
                  literature review match
                </motion.span>
              ) : (
                <motion.div
                  key="empty"
                  layoutId={`${id}-search-value`}
                  className="h-1.5 w-14 rounded-sm bg-neutral-200"
                  transition={t}
                />
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence initial={false}>
            {active ? (
              <motion.div
                key="results"
                initial={reduce ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                transition={
                  reduce ? { duration: 0 } : { duration: 0.28, ease: [0.77, 0, 0.175, 1] }
                }
                className="overflow-hidden"
              >
                <div className="space-y-2 border-t border-workspace-line px-1 pb-1 pt-3">
                  <Bone className="h-1.5 w-[90%]" />
                  <Bone className="h-1.5 w-[70%]" />
                  <Bone className="h-1.5 w-[55%]" />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </LayoutGroup>
  );
}
