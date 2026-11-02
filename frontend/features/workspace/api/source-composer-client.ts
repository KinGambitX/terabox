import { z } from "zod";
import { searchWebSources } from "./workspace-client";
import { codeExtensions, documentExtensions, uploadResponseSchema } from "../schemas/workspace";

const promptSchema = z.object({
  message: z.string().max(6000),
  mode: z.enum(["text", "code", "link"]),
  codeExtension: z.enum(["py", "java", "c", "cpp", "js", "ts", "cs", "go"]),
});
const codeExtensionSet = new Set<string>(codeExtensions);
const documentExtensionSet = new Set<string>(documentExtensions);
type ComposerAttachment = { name: string; file: File };

function readError(body: unknown) {
  if (typeof body === "object" && body !== null) {
    const value = body as Record<string, unknown>;
    if (typeof value.error === "string") return value.error;
    if (typeof value.detail === "string") return value.detail;
  }
  return "The analysis service could not process this input.";
}

export async function submitComposerInput({
  message, attachments, mode, codeExtension, signal,
}: { message: string; attachments: readonly ComposerAttachment[]; mode: "text" | "code" | "link"; codeExtension: "py" | "java" | "c" | "cpp" | "js" | "ts" | "cs" | "go"; signal: AbortSignal }) {
  const input = promptSchema.parse({ message, mode, codeExtension });
  const files = attachments.map(({ file }) => file);
  if (input.message.trim()) {
    if (input.mode === "link") {
      try {
        const url = new URL(input.message.trim());
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error();
      } catch { throw new Error("Paste one complete public http or https URL, or choose Text."); }
    }
    const name = input.mode === "code" ? `pasted-code.${input.codeExtension}` : input.mode === "link" ? "public-link.txt" : "pasted-text.txt";
    files.unshift(new File([input.message], name, { type: "text/plain" }));
  }
  if (!files.length) throw new Error("Add text or a supported file to begin.");
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!codeExtensionSet.has(extension) && !documentExtensionSet.has(extension)) {
      throw new Error(`${file.name} is not a supported document or source file.`);
    }
  }

  const results: Array<{ name: string; id: string; count: number }> = [];
  const failures: string[] = [];
  let webUnavailable = false;
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const kind = codeExtensionSet.has(extension) ? "code" : "document";
    const body = new FormData();
    body.set("file", file);
    body.set("title", file.name.replace(/\.[^.]+$/, ""));
    body.set("course", "Workspace");
    body.set("section", "Inbox");
    body.set("kind", kind);
    body.set("language", "auto");
    try {
      const response = await fetch("/api/submissions", { method: "POST", body, signal });
      const value: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(value));
      const parsed = uploadResponseSchema.safeParse(value);
      if (!parsed.success) throw new Error("SourceLens returned an unreadable upload response.");
      results.push({ name: file.name, id: parsed.data.submission.id, count: parsed.data.results.length });
      if (input.mode === "link" && file.name === "public-link.txt") {
        try {
          const searched = await searchWebSources(parsed.data.submission.id);
          results[results.length - 1].count += searched.results.length;
        } catch { webUnavailable = true; }
      }
    } catch (cause) {
      if (signal.aborted) throw cause;
      failures.push(`${file.name}: ${cause instanceof Error ? cause.message : "upload failed"}`);
    }
  }

  if (!results.length) throw new Error(failures.join(" "));
  const report = results.map(({ name, id, count }) => `${name}: ${count} comparison ${count === 1 ? "result" : "results"} ready for review.\n/submissions/${encodeURIComponent(id)}/evidence`).join("\n\n");
  const notes = [
    ...(failures.length ? [`Some items were not uploaded: ${failures.join(" ")}`] : []),
    ...(webUnavailable ? ["The link was saved, but public web search is unavailable."] : []),
  ];
  return notes.length ? `${report}\n\n${notes.join(" ")}` : report;
}
