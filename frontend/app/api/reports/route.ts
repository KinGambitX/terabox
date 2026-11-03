import { backendRequest, relayJson } from "@/lib/backend-api";
import { reportRecordSchema, reportsListSchema } from "@/lib/review-schemas";

export async function GET(request: Request) {
  const submissionId = new URL(request.url).searchParams.get("submission_id");
  const path = submissionId
    ? `/api/v1/reports/${encodeURIComponent(submissionId)}`
    : "/api/v1/reports";
  try {
    const response = await backendRequest(path);
    if (!response.ok) return relayJson(response);
    const body: unknown = await response.json();
    const parsed = submissionId ? reportRecordSchema.safeParse(body) : reportsListSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Analysis service returned invalid report data." }, { status: 502 });
    const headers = new Headers({ "Cache-Control": "no-store" });
    if (submissionId) headers.set("Content-Disposition", `attachment; filename="sourcelens-report-${submissionId.replace(/[^a-zA-Z0-9_-]/g, "-")}.json"`);
    return Response.json(parsed.data, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load reports." }, { status: 503 });
  }
}
