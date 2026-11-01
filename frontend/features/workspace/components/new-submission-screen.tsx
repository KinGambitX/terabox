import { WorkspaceShell } from "./workspace-shell";
import { SubmissionForm } from "./submission-form";

type InitialTab = "document" | "code" | "paste";
type PasteKind = "text" | "link";

export function NewSubmissionScreen({ maxUploadMb, initialTab, initialPasteKind }: { maxUploadMb: number; initialTab: InitialTab; initialPasteKind: PasteKind }) {
  return (
    <WorkspaceShell active="submissions">
      <header className="mb-6 max-w-[780px]">
        <h1 className="mb-2 font-heading text-[24px] font-semibold tracking-[-.7px] text-workspace-ink">Add a submission</h1>
        <p className="m-0 text-[12px] leading-relaxed text-workspace-muted">Upload a document or source file, or paste text to find similarity evidence for review.</p>
      </header>
      <div className="max-w-[900px] rounded-lg border border-workspace-border bg-workspace-paper p-4 sm:p-6">
        <SubmissionForm maxUploadMb={maxUploadMb} initialTab={initialTab} initialPasteKind={initialPasteKind} />
      </div>
    </WorkspaceShell>
  );
}
