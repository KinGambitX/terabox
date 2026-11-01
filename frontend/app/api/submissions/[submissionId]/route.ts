import { backendRequest, relayJson } from "@/lib/backend-api";
import { deleteSubmissionResponseSchema, submissionSchema } from "@/features/workspace/schemas/workspace";

export async function GET(_: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  try {
    const response = await backendRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}`);
    if (!response.ok) return relayJson(response);
    const parsed = submissionSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid submission data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load this submission." }, { status: 503 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const { submissionId } = await params;
  try {
    const response = await backendRequest(`/api/v1/submissions/${encodeURIComponent(submissionId)}`, { method: "DELETE" });
    if (!response.ok) return relayJson(response);
    const parsed = deleteSubmissionResponseSchema.safeParse(await response.json());
    return parsed.success ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } }) : Response.json({ error: "Analysis service returned invalid deletion data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not delete this submission." }, { status: 503 });
  }
}
