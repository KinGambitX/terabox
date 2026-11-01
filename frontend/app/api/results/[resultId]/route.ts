import { backendRequest, relayJson } from "@/lib/backend-api";
import { resultSchema, reviewUpdateSchema } from "@/features/workspace/schemas/workspace";

export async function GET(_: Request, { params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await params;
  try {
    const response = await backendRequest(`/api/v1/results/${encodeURIComponent(resultId)}`);
    if (!response.ok) return relayJson(response);
    const parsed = resultSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid review data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load this review." }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resultId: string }> }) {
  const { resultId } = await params;
  const input = reviewUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "Choose a valid review status and keep the note under 4,000 characters." }, { status: 400 });

  try {
    const response = await backendRequest(`/api/v1/results/${encodeURIComponent(resultId)}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input.data),
    });
    if (!response.ok) return relayJson(response);
    const parsed = resultSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid review data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save this review." }, { status: 503 });
  }
}
