import { getEvidencePageData } from "@/features/workspace/api/evidence-data";
import { EvidenceScreen } from "@/features/workspace/components/evidence-screen";

export default async function EvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getEvidencePageData(id);
  return <EvidenceScreen data={data} />;
}
