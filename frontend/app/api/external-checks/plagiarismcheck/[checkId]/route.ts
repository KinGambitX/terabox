import { backendRequest, relayJson } from "@/lib/backend-api";
import { externalReportSchema } from "@/lib/review-schemas";

export async function GET(_: Request, { params }: { params: Promise<{ checkId: string }> }) {
  const { checkId } = await params;
  try {
    const response = await backendRequest(`/api/v1/external-checks/plagiarismcheck/${encodeURIComponent(checkId)}`);
    if (!response.ok) return relayJson(response);
    const parsed = externalReportSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Invalid provider report." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load provider report." }, { status: 503 });
  }
}
