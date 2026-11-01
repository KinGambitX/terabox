import { backendPublicRequest, relayJson } from "@/lib/backend-api";
import { healthResponseSchema } from "@/features/workspace/schemas/workspace";

export async function GET() {
  try {
    const response = await backendPublicRequest("/healthz");
    if (!response.ok) return relayJson(response);
    const parsed = healthResponseSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Analysis service returned invalid health data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not reach the analysis service." }, { status: 503 });
  }
}
