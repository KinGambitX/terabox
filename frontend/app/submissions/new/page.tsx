import { NewSubmissionScreen } from "@/features/workspace/components/new-submission-screen";
import { getMaxUploadMb } from "@/lib/backend-api";

type SearchParams = Promise<{ type?: string; kind?: string }>;

export default async function NewSubmissionPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const initialTab = params.type === "code" || params.type === "paste" ? params.type : "document";
  const initialPasteKind = params.kind === "link" ? "link" : "text";
  return <NewSubmissionScreen maxUploadMb={getMaxUploadMb()} initialTab={initialTab} initialPasteKind={initialPasteKind} />;
}
