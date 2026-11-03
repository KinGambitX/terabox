import { backendRequest, getMaxUploadMb, relayJson } from "@/lib/backend-api";
import { supportedExtensions, submissionListSchema, uploadResponseSchema } from "@/lib/review-schemas";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const contentType = query.get("content_type");
  const search = contentType === "document" || contentType === "code" ? `?content_type=${contentType}` : "";
  try {
    const response = await backendRequest(`/api/v1/submissions${search}`);
    if (!response.ok) return relayJson(response);
    const parsed = submissionListSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid submission data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load submissions." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Choose a supported file and try again." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a file before submitting." }, { status: 400 });
  if (file.size === 0) return Response.json({ error: `${file.name} is empty. Choose a file with content.` }, { status: 400 });
  const maxMb = getMaxUploadMb();
  if (file.size > maxMb * 1024 * 1024) return Response.json({ error: `${file.name} exceeds the ${maxMb} MB limit.` }, { status: 413 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!supportedExtensions.includes(extension as (typeof supportedExtensions)[number])) {
    return Response.json({ error: `${file.name} is not a supported document or source file.` }, { status: 415 });
  }

  const upload = new FormData();
  upload.append("file", file, file.name);
  try {
    const response = await backendRequest("/api/v1/submissions", { method: "POST", body: upload });
    if (!response.ok) return relayJson(response);
    const parsed = uploadResponseSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json(parsed.data, { headers: { "Cache-Control": "no-store" } })
      : Response.json({ error: "Analysis service returned invalid upload data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed. Try again." }, { status: 503 });
  }
}
