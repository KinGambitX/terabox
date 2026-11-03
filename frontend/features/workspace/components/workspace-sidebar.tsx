import { SourceLensLogo } from "@/components/brand/sourcelens-logo";
import { IconClock, IconFileSearch, IconFiles, IconReportAnalytics } from "@tabler/icons-react";
import type { WorkspaceView } from "../types/workspace";

const navigation = [
  { id: "detect", label: "Detect", icon: IconFileSearch },
  { id: "history", label: "History", icon: IconClock },
  { id: "comparisons", label: "Comparisons", icon: IconFiles },
  { id: "reports", label: "Reports", icon: IconReportAnalytics },
] as const;

export function WorkspaceSidebar({
  active, onNavigate, mobile = false,
}: { active: WorkspaceView; onNavigate: (view: WorkspaceView) => void; mobile?: boolean }) {
  return (
    <aside aria-label="SourceLens workspace navigation" className={`flex flex-col bg-workspace-ground ${mobile ? "min-h-full w-full px-4 py-5" : "sticky top-0 hidden h-dvh w-[220px] shrink-0 border-r border-workspace-line px-4 py-6 min-[801px]:flex"}`}>
      <div className="px-2">
        <SourceLensLogo size={34} showWordmark />
      </div>
      <p className="mb-2 mt-10 px-2 text-xs font-medium uppercase tracking-[0.04em] text-workspace-muted-strong">Workspace</p>
      <nav aria-label="Workspace" className="grid gap-1">
        {navigation.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onNavigate(id)}
              className={`relative flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-3 text-left text-[13px] outline-2 outline-transparent outline-offset-2 transition-colors duration-150 ease-out focus-visible:outline-workspace-focus motion-reduce:transition-none ${selected ? "before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:bg-workspace-action font-medium text-workspace-ink" : "text-workspace-muted-strong hover:bg-workspace-hover hover:text-workspace-ink"}`}
            >
              <Icon size={16} stroke={1.5} aria-hidden="true" />{label}
            </button>
          );
        })}
      </nav>
      <p className="mb-0 mt-auto border-t border-workspace-line px-2 pt-4 text-xs leading-4 text-workspace-muted-strong">Uploads go to the configured review service.</p>
    </aside>
  );
}
