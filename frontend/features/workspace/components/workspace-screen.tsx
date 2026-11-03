"use client";

import { useState } from "react";
import { IconBell, IconMenu2 } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AnalysisPanel } from "./analysis-panel";
import { CodeComposer } from "./code-composer";
import { FileComposer } from "./file-composer";
import { ModePicker } from "./mode-picker";
import { TextComposer } from "./text-composer";
import { WorkspaceCollection } from "./workspace-collection";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { useWorkspaceState } from "../state/use-workspace-state";
import { useWorkspaceSubmissions } from "../hooks/use-workspace-queries";
import type { WorkspaceView } from "../types/workspace";

export function WorkspaceScreen({ maxUploadMb }: { maxUploadMb: number }) {
  const workspace = useWorkspaceState(maxUploadMb);
  const submissionsQuery = useWorkspaceSubmissions(workspace.view === "detect");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = (view: WorkspaceView) => {
    workspace.setView(view);
    setMobileMenuOpen(false);
  };
  return (
    <div className="min-h-svh bg-workspace-ground text-workspace-ink scheme-light">
      <a href="#workspace-main" className="fixed left-3 top-[-5rem] z-[100] rounded-md bg-workspace-action px-3 py-2 text-sm text-white focus:top-3 focus:outline-2 focus:outline-workspace-focus">Skip to content</a>
      <div className="flex min-h-svh">
        <WorkspaceSidebar active={workspace.view} onNavigate={navigate} />
        <div className="min-w-0 flex-1">
          <header className="flex h-14 items-center justify-between border-b border-workspace-line px-8 max-[800px]:px-4">
            <div className="flex items-center gap-2">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" aria-label="Open workspace navigation" className="min-h-10 min-w-10 text-workspace-ink hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-focus min-[801px]:hidden">
                    <IconMenu2 size={16} stroke={1.5} aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" showCloseButton={false} className="h-dvh w-full max-w-none border-workspace-line bg-workspace-ground p-0 text-workspace-ink sm:max-w-none">
                  <div className="flex items-center justify-between border-b border-workspace-line px-4 py-3">
                    <SheetTitle className="text-sm font-medium text-workspace-ink">Workspace</SheetTitle>
                    <SheetClose asChild><Button type="button" variant="outline" className="min-h-10 rounded-md border-workspace-control bg-transparent text-workspace-ink">Close</Button></SheetClose>
                  </div>
                  <WorkspaceSidebar active={workspace.view} onNavigate={navigate} mobile />
                </SheetContent>
              </Sheet>
              <span className="text-[13px] text-workspace-muted-strong">Workspace <span className="px-1.5 text-workspace-control">/</span><span className="text-workspace-ink">{workspace.view === "detect" ? "Detect" : workspace.view}</span></span>
            </div>
            <div className="flex items-center gap-1">
              <details className="relative">
                <summary aria-label="Notifications" className="grid size-9 cursor-pointer list-none place-items-center rounded-md text-workspace-muted-strong transition-colors duration-150 hover:bg-workspace-hover hover:text-workspace-ink focus-visible:outline-2 focus-visible:outline-workspace-focus [&::-webkit-details-marker]:hidden">
                  <IconBell size={16} stroke={1.5} aria-hidden="true" />
                </summary>
                <p className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-workspace-line bg-workspace-paper p-3 text-sm leading-[22px] text-workspace-copy">No new activity.</p>
              </details>
            </div>
          </header>

          <main id="workspace-main" className="grid min-h-[calc(100svh-3.5rem)] grid-cols-[minmax(0,1.5fr)_minmax(19rem,1fr)] items-start px-8 max-[1023px]:grid-cols-1 max-[800px]:px-4">
            {workspace.view === "detect" ? (
              <>
                <div className="min-w-0 py-9 pr-8 max-[1023px]:pr-0 max-[800px]:py-7">
                  <header className="mb-8 max-w-2xl">
                    <p className="m-0 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">Similarity review</p>
                    <h1 id="workspace-title" className="mb-0 mt-3 font-heading text-[28px] font-normal leading-8 tracking-[-0.025em] text-workspace-ink">Inspect a submission.</h1>
                    <p className="mb-0 mt-2 text-sm leading-[22px] text-workspace-copy">Review text, source code, or a document against another source.</p>
                  </header>

                  <section data-ui="workspace-composer" aria-label="Prepare a similarity review" className="grid gap-6">
                    <ModePicker value={workspace.mode} onChange={workspace.selectMode} />
                    <div id="workspace-composer-panel" role="tabpanel" aria-labelledby={`workspace-tab-${workspace.mode}`} className="min-w-0">
                      {workspace.mode === "text" && <TextComposer value={workspace.text} onChange={workspace.setText} comparisonValue={workspace.comparisonText} onComparisonChange={workspace.setComparisonText} compare={workspace.compare} onCompareChange={workspace.setCompare} />}
                      {workspace.mode === "code" && <CodeComposer value={workspace.code} onChange={workspace.setCode} language={workspace.language} onLanguageChange={workspace.setLanguage} comparisonValue={workspace.comparisonCode} onComparisonChange={workspace.setComparisonCode} comparisonLanguage={workspace.comparisonLanguage} onComparisonLanguageChange={workspace.setComparisonLanguage} compare={workspace.compare} onCompareChange={workspace.setCompare} />}
                      {workspace.mode === "file" && <FileComposer files={workspace.files} onAdd={(incoming) => workspace.addFiles(incoming)} onRemove={(index) => workspace.removeFileByIndex(index)} comparisonFiles={workspace.comparisonFiles} onComparisonAdd={(incoming) => workspace.addFiles(incoming, true)} onComparisonRemove={(index) => workspace.removeFileByIndex(index, true)} compare={workspace.compare} onCompareChange={workspace.setCompare} maxUploadMb={maxUploadMb} error={workspace.fileError} />}
                      {workspace.runError && <p className="mb-0 mt-4 text-sm leading-[22px] text-workspace-danger" role="alert">{workspace.runError}</p>}
                      <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-workspace-line pt-4">
                        <span className="text-xs leading-4 text-workspace-muted-strong">Review service</span>
                        <BrandButton tone="ink" type="button" onClick={workspace.runReview} disabled={workspace.running} className="min-h-10 gap-2 px-4 text-sm font-medium disabled:opacity-50">
                          {workspace.running ? <><span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-white motion-reduce:animate-none" />Checking…</> : <>Run detection <span aria-hidden="true">→</span></>}
                        </BrandButton>
                      </div>
                      <p className="mb-0 mt-3 text-right text-xs leading-4 tabular-nums text-workspace-muted-strong">50,000 characters · {maxUploadMb} MB per file · 10 files per source</p>
                      <p className="mb-0 mt-2 text-right text-xs leading-4 text-workspace-muted-strong">When enabled, public web search sends up to 400 characters of document text to an external search service.</p>
                    </div>
                  </section>
                </div>
                <AnalysisPanel submission={workspace.reviewSubmission} submissions={submissionsQuery.data ?? []} results={workspace.reviewResults} externalChecks={workspace.reviewExternalChecks} notice={workspace.notice} loading={workspace.running} />
              </>
            ) : (
              <div className="col-span-full">
                <WorkspaceCollection view={workspace.view} />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
