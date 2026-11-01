import Link from "next/link";
import { IconArrowUpRight, IconCode, IconFileText, IconLink } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { WorkspaceShell } from "./workspace-shell";

const types = [
  { name: "Document", detail: "PDF, DOCX, or TXT", href: "/submissions/new?type=document", icon: IconFileText },
  { name: "Source code", detail: "Python, Java, C, C++, JavaScript, TypeScript, C#, or Go", href: "/submissions/new?type=code", icon: IconCode },
  { name: "Paste text or link", detail: "Add text for review or request a public web search", href: "/submissions/new?type=paste", icon: IconLink },
] as const;

export function SubmissionsScreen() {
  return (
    <WorkspaceShell active="submissions">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="mb-2 font-heading text-[24px] font-semibold tracking-[-.7px] text-workspace-ink">Submissions</h1><p className="m-0 max-w-[620px] text-[12px] leading-relaxed text-workspace-muted">Choose a format to check for similarity and inspect the evidence with a reviewer.</p></div>
        <BrandButton asChild tone="ink" size="sm" className="h-9 cursor-pointer gap-2 px-3.5 text-[11px]"><Link href="/submissions/new">Add submission <IconArrowUpRight size={14} aria-hidden="true" /></Link></BrandButton>
      </header>
      <h2 className="mb-3 text-[12px] font-semibold text-workspace-ink">Submission types</h2>
      <ul className="m-0 list-none divide-y divide-workspace-border border-y border-workspace-border p-0">
        {types.map(({ name, detail, href, icon: Icon }) => <li key={name}><Link className="flex min-h-[72px] cursor-pointer items-center gap-3 py-4 transition-colors hover:bg-workspace-soft/60 sm:px-3" href={href}><Icon size={18} className="shrink-0 text-workspace-muted" aria-hidden="true" /><span className="min-w-0 flex-1"><strong className="block text-[12px] font-semibold text-workspace-ink">{name}</strong><small className="mt-1 block text-[10px] text-workspace-muted">{detail}</small></span><span className="inline-flex items-center gap-1 text-[10px] font-medium text-workspace-info">Open <IconArrowUpRight size={13} aria-hidden="true" /></span></Link></li>)}
      </ul>
    </WorkspaceShell>
  );
}
