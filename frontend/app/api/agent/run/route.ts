import { backendRequest, relayJson } from "@/lib/backend-api";
import { agentRequestSchema, agentResponseSchema } from "@/features/workspace/schemas/workspace";

export async function POST(request: Request) {
  const input = agentRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "Provide a submission ID and a reviewer request under 6,000 characters." }, { status: 400 });
  try {
    const response = await backendRequest("/api/v1/agent/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input.data) });
    if (!response.ok) return relayJson(response);
    const parsed = agentResponseSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Analysis service returned an invalid agent report." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not run the evidence assistant." }, { status: 503 });
  }
}
