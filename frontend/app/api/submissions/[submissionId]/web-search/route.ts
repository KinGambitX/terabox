import { backendRequest, relayJson } from "@/lib/backend-api";
import { webSearchResponseSchema } from "@/features/workspace/schemas/workspace";

export async function POST(_: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  try {
    const response = await backendRequest(`/api/v1/analyses/${encodeURIComponent(submissionId)}/web-search`, { method: "POST" });
    if (!response.ok) return relayJson(response);
    const parsed = webSearchResponseSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid web-search results." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Web search is not available." }, { status: 503 });
  }
}
