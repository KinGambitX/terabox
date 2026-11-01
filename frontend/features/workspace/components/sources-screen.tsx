import Link from "next/link";
import { IconArrowUpRight, IconBook2 } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { WorkspaceShell } from "./workspace-shell";

export function SourcesScreen() {
  return (
    <WorkspaceShell active="sources">
      <header className="mb-7">
        <p className="mb-1 text-[10px] text-workspace-muted">Reference material</p>
        <h1 className="mb-2 font-heading text-[24px] font-semibold tracking-[-.7px] text-workspace-ink">Source library</h1>
        <p className="m-0 max-w-[620px] text-[12px] leading-relaxed text-workspace-muted">Keep public links and submitted documents available as candidate sources for similarity review.</p>
      </header>
      <section className="border-y border-workspace-border py-8" aria-labelledby="empty-sources-title">
        <IconBook2 size={22} className="mb-3 text-workspace-muted" aria-hidden="true" />
        <h2 className="mb-1 text-[14px] font-semibold text-workspace-ink" id="empty-sources-title">No sources added yet</h2>
        <p className="mb-4 max-w-[540px] text-[11px] leading-relaxed text-workspace-muted">Add a public web page or a file to build a reference set. This preview does not store sources yet.</p>
        <div className="flex flex-wrap gap-3">
          <BrandButton asChild tone="ink" size="sm" className="h-9 cursor-pointer gap-1.5 px-3.5 text-[11px]">
            <Link href="/workspace/submissions/links">Add a web link <IconArrowUpRight size={14} aria-hidden="true" /></Link>
          </BrandButton>
          <Button asChild variant="outline" className="h-9 cursor-pointer gap-1.5 rounded-md border-workspace-border bg-workspace-paper px-3.5 text-[11px] text-workspace-copy hover:bg-workspace-hover">
            <Link href="/workspace/submissions/files">Add a file <IconArrowUpRight size={14} aria-hidden="true" /></Link>
          </Button>
        </div>
      </section>
    </WorkspaceShell>
  );
}
