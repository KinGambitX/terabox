import { backendRequest, relayJson } from "@/lib/backend-api";
import { analysisResponseSchema } from "@/features/workspace/schemas/workspace";

export async function POST(_: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  try {
    const response = await backendRequest(`/api/v1/analyses/${encodeURIComponent(submissionId)}`, { method: "POST" });
    if (!response.ok) return relayJson(response);
    const parsed = analysisResponseSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Analysis service returned invalid comparison results." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not run similarity analysis." }, { status: 503 });
  }
}
