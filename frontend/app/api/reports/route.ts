import { reportInputSchema } from "@/features/workspace/schemas/workspace";

export async function POST(request: Request) {
  const input = reportInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return Response.json({ error: "The report data is incomplete or invalid." }, { status: 400 });

  const report = { ...input.data, generatedAt: new Date().toISOString() };
  const safeName = input.data.submissionId.replace(/[^a-zA-Z0-9_-]/g, "-");
  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="sourcelens-report-${safeName}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
