import { getWorkspaceOverviewData } from "@/features/workspace/api/workspace-data";
import WorkspaceScreen from "@/features/workspace/components/workspace-screen";

export default async function Page() {
  const data = await getWorkspaceOverviewData();
  return <WorkspaceScreen {...data} />;
}
