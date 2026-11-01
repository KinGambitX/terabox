"use client";

import Link from "next/link";
import {
  IconActivity, IconBook2, IconCheck, IconChevronDown, IconCode,
  IconFileText, IconSearch, IconShieldCheck,
} from "@tabler/icons-react";
import { SiftMascot } from "@/components/brand/sourcelens-logo";
import { BrandButton } from "@/components/ui/brand-button";
import type { HeroMode } from "./hero-modes";

const accent = {
  sky: { text: "text-sky-300", bar: "bg-sky-300", highlight: "bg-sky-300/15 text-sky-100" },
  orange: { text: "text-orange-300", bar: "bg-orange-300", highlight: "bg-orange-300/15 text-orange-100" },
  violet: { text: "text-violet-300", bar: "bg-violet-300", highlight: "bg-violet-300/15 text-violet-100" },
};

function Highlight({ text, hit, className }: { text: string; hit: string; className: string }) {
  const start = text.indexOf(hit);
  if (start < 0) return <>{text}</>;

  return <>{text.slice(0, start)}<mark className={`rounded px-0.5 ${className}`}>{hit}</mark>{text.slice(start + hit.length)}</>;
}

function SummaryMetric({ label, value, context, tone }: { label: string; value: string; context: string; tone: string }) {
  return (
    <div className="min-w-0 px-3 py-3 first:pl-0 last:pr-0 sm:px-4">
      <p className="truncate text-[10px] text-[#858585] sm:text-[11px]">{label}</p>
      <p className="mt-1 font-mono text-[21px] leading-none tabular-nums text-[#f0f0f0] sm:text-[24px]">{value}</p>
      <p className={`mt-2 flex items-center gap-1.5 truncate text-[10px] ${tone}`}><i className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{context}</p>
    </div>
  );
}

function QueueRow({ title, course, score, kind, active = false }: { title: string; course: string; score: string; kind: "Document" | "Source code"; active?: boolean }) {
  const CodeIcon = kind === "Source code" ? IconCode : IconFileText;
  const isHigh = Number.parseInt(score, 10) >= 80;

  return (
    <div className={`grid min-h-[58px] grid-cols-[minmax(0,1fr)_74px_106px] items-center gap-2 border-t border-[#292929] px-3 text-[11px] sm:grid-cols-[minmax(0,1fr)_110px_90px_116px] sm:gap-3 ${active ? "bg-[#181818]" : "hover:bg-[#151515]"}`}>
      <div className="flex min-w-0 items-center gap-2.5">
        <CodeIcon size={15} className={active ? "text-sky-300" : "text-[#747474]"} />
        <span className="min-w-0"><strong className="block truncate font-medium text-[#dedede]">{title}</strong><small className="mt-1 block truncate text-[10px] text-[#777]">{course}</small></span>
      </div>
      <span className="hidden text-[10px] text-[#858585] sm:block">{kind}</span>
      <span className={`font-mono tabular-nums ${isHigh ? "text-rose-300" : "text-[#d0d0d0]"}`}>{score}<small className="ml-1 hidden font-sans text-[9px] text-[#777] lg:inline">match</small></span>
      <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-300"><i className="h-1.5 w-1.5 rounded-full bg-amber-300" />Needs review</span>
    </div>
  );
}

function SourceRow({ mode, source }: { mode: HeroMode; source: HeroMode["sources"][number] }) {
  return (
    <article className="border-b border-[#292929] py-3 last:border-0">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="truncate text-[12px] font-medium text-[#e7e7e7]">{source.title}</h4>
        <span className={`shrink-0 font-mono text-[11px] tabular-nums ${accent[mode.accent].text}`}>{source.score}</span>
      </div>
      <p className="mt-1 truncate text-[10px] text-[#7f7f7f]">{source.detail}</p>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#292929]" role="img" aria-label={`${source.score} similarity`}>
        <div className={`h-full rounded-full ${accent[mode.accent].bar}`} style={{ width: source.score }} />
      </div>
    </article>
  );
}

function EvidencePanel({ mode }: { mode: HeroMode }) {
  const isCode = mode.id === "code";
  const tone = accent[mode.accent];

  return (
    <section aria-label="Selected submission evidence" className="mt-5 rounded-lg border border-[#2a2a2a] bg-[#121212]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#292929] px-4 py-3 sm:px-5">
        <div><h3 className="text-[12px] font-medium text-[#e5e5e5]">Selected submission</h3><p className="mt-1 text-[10px] text-[#777]">{mode.type} <span className="px-1 text-[#555]">·</span> 1 of 3 candidate matches</p></div>
        <span className={`font-mono text-[12px] tabular-nums ${tone.text}`}>{mode.score} similarity</span>
      </div>
      <div className="grid gap-3 p-3.5 sm:grid-cols-2 sm:p-4">
        <article className="min-w-0 rounded-md bg-[#191919] p-3.5 sm:p-4">
          <p className="mb-2.5 text-[9px] font-medium tracking-[0.06em] text-[#747474]">SUBMITTED PASSAGE</p>
          <pre className={`whitespace-pre-wrap font-sans text-[11px] leading-[1.8] text-[#bdbdbd] ${isCode ? "font-mono text-[10px]" : ""}`}><Highlight text={mode.submitted} hit={mode.submittedHit} className={tone.highlight} /></pre>
          <p className="mt-3 font-mono text-[9px] text-[#666]">{isCode ? "LINES 08–15" : "PAGE 02 · PARAGRAPH 04"}</p>
        </article>
        <article className="min-w-0 rounded-md border border-[#303030] bg-[#151515] p-3.5 sm:p-4">
          <div className="mb-2.5 flex items-center justify-between gap-2"><p className="text-[9px] font-medium tracking-[0.06em] text-[#747474]">CANDIDATE SOURCE</p><span className={`text-[9px] ${tone.text}`}>{mode.matchType}</span></div>
          <pre className={`whitespace-pre-wrap font-sans text-[11px] leading-[1.8] text-[#e2e2e2] ${isCode ? "font-mono text-[10px]" : ""}`}><Highlight text={mode.matched} hit={mode.matchedHit} className={tone.highlight} /></pre>
          <p className="mt-3 flex items-center gap-1.5 text-[9px] text-[#818181]"><IconBook2 size={12} />Earlier submission · Research Methods</p>
        </article>
      </div>
      <p className="flex items-center gap-2 border-t border-[#292929] px-4 py-2.5 text-[10px] text-[#858585] sm:px-5"><IconShieldCheck size={13} />Similarity is a signal for human review, not a verdict.</p>
    </section>
  );
}

function ReviewWorkspace({ mode }: { mode: HeroMode }) {
  return (
    <div className="grid min-h-[740px] grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)_270px]">
      <aside className="hidden border-r border-[#292929] px-4 py-5 lg:block" aria-label="Preview workspace navigation">
        <p className="mb-3 text-[10px] font-medium tracking-[0.08em] text-[#686868]">WORKSPACE</p>
        <nav className="space-y-1 text-[12px]" aria-label="Preview sections">
          <div className="flex h-9 items-center gap-2 rounded-md bg-[#242424] px-2.5 text-[#f0f0f0]"><span className="h-1.5 w-1.5 rounded-full bg-sky-300" />Overview <span className="ml-auto text-[10px] text-[#888]">3</span></div>
          <div className="flex h-9 items-center gap-2 px-2.5 text-[#929292]"><IconFileText size={14} />Submissions <span className="ml-auto text-[10px]">24</span></div>
          <div className="flex h-9 items-center gap-2 px-2.5 text-[#929292]"><IconBook2 size={14} />Source library</div>
        </nav>
        <div className="mt-7 border-t border-[#292929] pt-4">
          <p className="mb-2 text-[10px] font-medium tracking-[0.08em] text-[#686868]">COURSES</p>
          <p className="flex items-center gap-2 py-2 text-[11px] text-[#999]"><span className="h-1.5 w-1.5 rounded-full bg-orange-300" />Research methods</p>
          <p className="flex items-center gap-2 py-2 text-[11px] text-[#999]"><span className="h-1.5 w-1.5 rounded-full bg-violet-300" />Data structures</p>
          <p className="flex items-center gap-2 py-2 text-[11px] text-[#999]"><span className="h-1.5 w-1.5 rounded-full bg-sky-300" />Environmental studies</p>
        </div>
        <div className="mt-8 flex gap-2 border-t border-[#292929] pt-4 text-[10px] leading-4 text-[#858585]"><IconShieldCheck className="mt-0.5 shrink-0 text-[#a1a1a1]" size={14} />Private workspace. You make the review decision.</div>
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[10px] text-[#777]">MONDAY · OCTOBER 26</p><h2 className="mt-1 text-[20px] font-medium tracking-[-0.035em] text-[#f0f0f0] sm:text-[23px]">Review overview</h2><p className="mt-1 text-[11px] text-[#888]">Check the evidence. You decide what it means.</p></div>
          <BrandButton asChild size="sm" className="h-8 px-3.5 text-[10px] font-medium"><Link href="/workspace">Open workspace</Link></BrandButton>
        </div>

        <div className="mt-5 grid grid-cols-2 divide-x divide-y divide-[#303030] border-y border-[#303030] xl:grid-cols-4 xl:divide-y-0">
          <SummaryMetric label="Submissions" value="24" context="this week" tone="text-sky-300" />
          <SummaryMetric label="Awaiting review" value="03" context="needs attention" tone="text-amber-300" />
          <SummaryMetric label="In progress" value="03" context="being reviewed" tone="text-sky-300" />
          <SummaryMetric label="Reviewed" value="18" context="this week" tone="text-green-300" />
        </div>

        <section className="mt-6" aria-label="Submissions needing review">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <div><h3 className="text-[13px] font-medium text-[#e7e7e7]">Needs your review</h3><p className="mt-1 text-[10px] text-[#7e7e7e]">Similarity surfaces passages to inspect; it does not determine intent.</p></div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#888]"><IconSearch size={13} />Search queue <IconChevronDown size={12} /></div>
          </div>
          <div className="overflow-hidden rounded-md border border-[#2c2c2c]">
            <div className="hidden h-8 grid-cols-[minmax(0,1fr)_110px_90px_116px] items-center gap-3 bg-[#151515] px-3 text-[9px] text-[#777] sm:grid"><span>Submission</span><span>Type</span><span>Top match</span><span>Status</span></div>
            <QueueRow title={mode.title} course="Research Methods · Section B" score={mode.score} kind={mode.id === "code" ? "Source code" : "Document"} active />
            <QueueRow title="Climate policy analysis" course="Environmental Studies · Section C" score="64%" kind="Document" />
            <QueueRow title="Database normalization exercise" course="Database Systems · Section A" score="28%" kind="Source code" />
          </div>
        </section>

        <EvidencePanel mode={mode} />
      </main>

      <aside className="border-t border-[#292929] px-5 py-5 lg:border-l lg:border-t-0 lg:px-5 lg:py-6" aria-label="Evidence summary">
        <div className="mb-2"><h3 className="text-[13px] font-medium text-[#e8e8e8]">Key matches</h3><p className="mt-1 text-[10px] text-[#777]">Ranked by strongest overlap</p></div>
        {mode.sources.map((source) => <SourceRow key={source.title} mode={mode} source={source} />)}
        <div className="mt-5 border-t border-[#292929] pt-4">
          <div className="mb-2 flex items-center gap-2"><IconActivity size={14} className="text-[#969696]" /><h3 className="text-[12px] font-medium text-[#d8d8d8]">Recent activity</h3></div>
          <div className="space-y-3.5 pt-2">
            <p className="flex items-start gap-2 text-[10px] leading-4 text-[#929292]"><IconCheck size={13} className="mt-0.5 shrink-0 text-green-300" /><span><strong className="font-medium text-[#d2d2d2]">Source scan complete</strong><br />3 sources checked · 10:42</span></p>
            <p className="flex items-start gap-2 text-[10px] leading-4 text-[#929292]"><i className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-300" /><span><strong className="font-medium text-rose-200">High match signal</strong><br />Inspect the full passage · 10:41</span></p>
            <p className="flex items-start gap-2 text-[10px] leading-4 text-[#929292]"><i className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-300" /><span><strong className="font-medium text-amber-200">Reviewer decision pending</strong><br />No decision recorded · 10:41</span></p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-[#292929] pt-4 text-[10px] leading-4 text-[#858585]"><IconShieldCheck size={14} className="shrink-0" />Similarity is evidence for your review, never a verdict.</div>
      </aside>
    </div>
  );
}

export function ReviewPreview({ mode }: { mode: HeroMode }) {
  return (
    <div data-ui="review-screen" className="overflow-hidden rounded-[18px] border border-[#2c2c2c] bg-[#111] text-left shadow-[0_24px_90px_rgba(0,0,0,0.24)]">
      <div className="flex h-[50px] items-center justify-between border-b border-[#292929] px-4 sm:px-5">
        <div className="flex items-center gap-2.5"><SiftMascot size={20} /><span className="text-[12px] font-medium text-[#e8e8e8]">SourceLens</span><span className="text-[#525252]">/</span><span className="hidden text-[11px] text-[#858585] sm:inline">Instructor workspace</span></div>
        <div className="flex items-center gap-2"><div className="hidden h-7 w-[190px] items-center gap-2 rounded-md border border-[#2c2c2c] px-2.5 text-[10px] text-[#777] sm:flex"><IconSearch size={13} />Search submissions</div><span className="inline-flex items-center gap-1.5 rounded-full border border-[#303030] px-2.5 py-1 text-[10px] text-[#999]"><i className="h-1.5 w-1.5 rounded-full bg-orange-300" />Sample workspace</span></div>
      </div>
      <ReviewWorkspace mode={mode} />
    </div>
  );
}
