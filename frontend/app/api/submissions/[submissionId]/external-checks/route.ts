import { backendRequest, relayJson } from "@/lib/backend-api";
import { externalChecksResponseSchema } from "@/lib/review-schemas";

export async function POST(_: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  try {
    const response = await backendRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}/external-checks`, { method: "POST" });
    if (!response.ok) return relayJson(response);
    const parsed = externalChecksResponseSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid external-check data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "External checks are unavailable." }, { status: 503 });
  }
}
