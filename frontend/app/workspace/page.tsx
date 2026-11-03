import { WorkspaceScreen } from "@/features/workspace/components/workspace-screen";
import { getMaxUploadMb } from "@/lib/backend-api";

export default function WorkspacePage() {
  return <WorkspaceScreen maxUploadMb={getMaxUploadMb()} />;
}
