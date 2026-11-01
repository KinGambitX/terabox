"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconArrowUpRight, IconCheck, IconRefresh, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { tw } from "@/lib/tailwind-classes";
import { uploadToastSchema } from "../schemas/workspace";
import type { WorkspaceOverviewData } from "../api/workspace-data";
import { OverviewMetrics } from "./overview-metrics";
import { ReviewQueue } from "./review-queue";
import { WorkspaceShell } from "./workspace-shell";

export default function WorkspaceScreen({ reviews, isExampleData, error }: WorkspaceOverviewData) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("sourcelens-upload-toast");
    if (!stored) return;
    sessionStorage.removeItem("sourcelens-upload-toast");
    let decoded: unknown;
    try {
      decoded = JSON.parse(stored);
    } catch {
      return;
    }
    const parsed = uploadToastSchema.safeParse(decoded);
    if (!parsed.success) return;
    const showTimer = window.setTimeout(() => setToast(`${parsed.data.count} ${parsed.data.count === 1 ? "submission" : "submissions"} uploaded. Review the similarity evidence in the queue.${parsed.data.note ? ` ${parsed.data.note}` : ""}`), 0);
    const dismissTimer = window.setTimeout(() => setToast(null), 5000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(dismissTimer);
    };
  }, []);

  return (
    <WorkspaceShell active="overview">
      <section className={tw("hero-panel")} aria-labelledby="workspace-title">
        <div className={tw("hero-copy")}>
          <div className={tw("page-heading")}>
            <div>
              <h1 id="workspace-title" className="text-workspace-ink">Review workspace</h1>
              <p className={tw("page-subtitle")}>Inspect matching passages and sources across text, links, code, and files.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <BrandButton asChild tone="ink" size="sm" className="h-9 cursor-pointer gap-2 px-3.5 text-[11px]">
              <Link href="/submissions/new">Add submission <IconArrowUpRight size={14} aria-hidden="true" /></Link>
            </BrandButton>
            <Button asChild variant="outline" className="h-9 cursor-pointer rounded-md border-workspace-border bg-workspace-paper px-3.5 text-[11px] text-workspace-copy hover:bg-workspace-hover">
              <a href="#reviews">Review queue</a>
            </Button>
          </div>
        </div>
        <div className={tw("hero-photo")} aria-hidden="true" style={{ backgroundImage: "url('/images/workspace-mountains.jpg')" }} />
      </section>

      {isExampleData && <p className="mb-4 rounded-lg border border-workspace-border bg-workspace-soft px-3 py-2 text-[12px] text-workspace-copy" role="note">Example data · preview rows are shown until real submissions are available.</p>}

      {error && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-workspace-danger/30 bg-workspace-paper px-4 py-3" role="alert"><p className="m-0 text-[12px] text-workspace-danger">{error}</p><Button type="button" variant="outline" className="h-10 cursor-pointer gap-2 rounded-md border-workspace-border px-3 text-[12px]" onClick={() => router.refresh()}><IconRefresh size={14} aria-hidden="true" />Retry connection</Button></div>}

      <div className="grid gap-4">
        <OverviewMetrics reviews={reviews} />
        <ReviewQueue reviews={reviews} />
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div className="fixed right-5 bottom-5 z-40 flex max-w-[min(420px,calc(100vw-2rem))] items-start gap-3 rounded-lg border border-workspace-border bg-workspace-paper px-4 py-3 text-workspace-ink" role="status" aria-live="polite" initial={{ opacity: 0, transform: reduceMotion ? "translateY(0)" : "translateY(8px)" }} animate={{ opacity: 1, transform: "translateY(0)" }} exit={{ opacity: 0, transform: reduceMotion ? "translateY(0)" : "translateY(4px)" }} transition={{ duration: reduceMotion ? 0.01 : 0.18, ease: [0.23, 1, 0.32, 1] }}>
            <IconCheck size={17} className="mt-0.5 shrink-0 text-workspace-success" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-[12px] leading-relaxed">{toast}</span>
            <button type="button" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-md text-workspace-copy hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-info" aria-label="Dismiss upload confirmation" onClick={() => setToast(null)}><IconX size={15} aria-hidden="true" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </WorkspaceShell>
  );
}
