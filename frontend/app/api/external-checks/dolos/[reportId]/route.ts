import { backendRequest, relayJson } from "@/lib/backend-api";

export async function GET(_: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  try {
    const response = await backendRequest(`/api/v1/external-checks/dolos/${encodeURIComponent(reportId)}`);
    return response.ok ? Response.json(await response.json(), { headers: { "Cache-Control": "no-store" } }) : relayJson(response);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load Dolos report." }, { status: 503 });
  }
}
