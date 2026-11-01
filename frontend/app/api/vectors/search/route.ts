import { backendRequest, relayJson } from "@/lib/backend-api";
import { vectorSearchRequestSchema, vectorSearchResponseSchema } from "@/features/workspace/schemas/workspace";

export async function POST(request: Request) {
  const input = vectorSearchRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "Enter search text up to 10,000 characters and a limit from 1 to 100." }, { status: 400 });
  try {
    const response = await backendRequest("/api/v1/vectors/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input.data) });
    if (!response.ok) return relayJson(response);
    const parsed = vectorSearchResponseSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Analysis service returned invalid vector matches." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not search the semantic index." }, { status: 503 });
  }
}
