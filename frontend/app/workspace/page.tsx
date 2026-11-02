import { SourceComposerScreen } from "@/features/workspace/components/source-composer-screen";
import { getMaxUploadMb } from "@/lib/backend-api";

export default function WorkspacePage() {
  return <SourceComposerScreen maxUploadMb={getMaxUploadMb()} />;
}
