import { backendRequest, getExternalAiEnabled, relayJson } from "@/lib/backend-api";

export async function POST(_: Request, { params }: { params: Promise<{ resultId: string }> }) {
  if (!getExternalAiEnabled()) return Response.json({ error: "AI explanations are disabled." }, { status: 404 });
  const { resultId } = await params;
  try {
    const response = await backendRequest(`/api/v1/results/${encodeURIComponent(resultId)}/explanation`, { method: "POST" });
    return relayJson(response);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not generate an explanation." }, { status: 503 });
  }
}
