import { WorkspaceShell } from "@/features/workspace/components/workspace-shell";

export default function LoadingNewSubmission() {
  return (
    <WorkspaceShell active="submissions">
      <div aria-label="Loading submission form" aria-busy="true" className="max-w-[900px] animate-pulse space-y-5">
        <div className="h-8 w-56 rounded bg-workspace-soft" />
        <div className="h-28 rounded-lg bg-workspace-soft" />
        <div className="h-40 rounded-lg bg-workspace-soft" />
      </div>
    </WorkspaceShell>
  );
}
