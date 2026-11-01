import { backendRequest, getMaxUploadMb, relayJson } from "@/lib/backend-api";
import { submissionFieldsSchema, submissionListSchema, supportedExtensions, uploadResponseSchema, documentExtensions, codeExtensions } from "@/features/workspace/schemas/workspace";

const languageExtension: Record<string, string> = {
  python: "py", java: "java", c: "c", cpp: "cpp", javascript: "js", typescript: "ts", c_sharp: "cs", go: "go",
};

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

  const input = submissionFieldsSchema.safeParse({
    title: form.get("title"), course: form.get("course"), section: form.get("section"),
    notes: form.get("notes") ?? "", kind: form.get("kind"), language: form.get("language") ?? "auto",
  });
  if (!input.success) return Response.json({ error: input.error.issues[0]?.message ?? "Check the submission details." }, { status: 400 });

  const value = form.get("file");
  if (!(value instanceof File)) return Response.json({ error: "Choose a file before submitting." }, { status: 400 });
  if (value.size === 0) return Response.json({ error: `${value.name} is empty. Choose a file with content.` }, { status: 400 });
  const maxMb = getMaxUploadMb();
  if (value.size > maxMb * 1024 * 1024) return Response.json({ error: `${value.name} exceeds the ${maxMb} MB limit.` }, { status: 413 });

  const originalExtension = value.name.split(".").pop()?.toLowerCase() ?? "";
  const allowed = input.data.kind === "code"
    ? codeExtensions.includes(originalExtension as (typeof codeExtensions)[number])
    : input.data.kind === "document"
      ? documentExtensions.includes(originalExtension as (typeof documentExtensions)[number])
      : originalExtension === "txt";
  if (!allowed || !supportedExtensions.includes(originalExtension as (typeof supportedExtensions)[number])) {
    return Response.json({ error: `${value.name} is not supported for the selected submission type.` }, { status: 415 });
  }

  const extension = input.data.kind === "code" && input.data.language !== "auto"
    ? languageExtension[input.data.language]
    : originalExtension;
  const outgoingName = extension === originalExtension
    ? value.name
    : `${value.name.replace(/\.[^.]+$/, "")}.${extension}`;
  const upload = new FormData();
  upload.append("file", new File([value], outgoingName, { type: value.type }));
  upload.append("title", input.data.title);
  upload.append("course", input.data.course);
  upload.append("section", input.data.section);
  upload.append("notes", input.data.notes);

  try {
    const response = await backendRequest("/api/v1/submissions", { method: "POST", body: upload });
    if (!response.ok) return relayJson(response);
    const parsed = uploadResponseSchema.safeParse(await response.json());
    return parsed.success
      ? Response.json({ ...parsed.data, metadataSaved: false })
      : Response.json({ error: "Analysis service returned invalid upload data." }, { status: 502 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed. Try again." }, { status: 503 });
  }
}
