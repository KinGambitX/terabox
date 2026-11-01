import { backendRequest, relayJson } from "@/lib/backend-api";
import { readinessResponseSchema } from "@/features/workspace/schemas/workspace";

export async function GET() {
  try {
    const response = await backendRequest("/readyz");
    if (!response.ok) return relayJson(response);
    const parsed = readinessResponseSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Analysis service returned invalid readiness data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not check analysis service readiness." }, { status: 503 });
  }
}
