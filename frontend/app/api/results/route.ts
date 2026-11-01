import { backendRequest, relayJson } from "@/lib/backend-api";
import { resultListSchema } from "@/features/workspace/schemas/workspace";

export async function GET(request: Request) {
  const submissionId = new URL(request.url).searchParams.get("submission_id");
  const query = submissionId ? `?submission_id=${encodeURIComponent(submissionId)}` : "";
  try {
    const response = await backendRequest(`/api/v1/results${query}`);
    if (!response.ok) return relayJson(response);
    const parsed = resultListSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid result data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load results." }, { status: 503 });
  }
}
