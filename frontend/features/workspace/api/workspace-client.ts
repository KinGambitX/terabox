import { z } from "zod";
import {
  agentRequestSchema,
  agentResponseSchema,
  analysisResponseSchema,
  deleteSubmissionResponseSchema,
  explanationResponseSchema,
  healthResponseSchema,
  readinessResponseSchema,
  reportInputSchema,
  resultListSchema,
  resultSchema,
  reviewUpdateSchema,
  submissionListSchema,
  submissionSchema,
  vectorSearchRequestSchema,
  vectorSearchResponseSchema,
  webSearchResponseSchema,
} from "../schemas/workspace";

export class WorkspaceApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "WorkspaceApiError";
  }
}

async function requestJson<T>(path: string, schema: z.ZodType<T>, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { cache: "no-store", ...init });
  } catch {
    throw new WorkspaceApiError("Could not reach SourceLens. Check the connection and retry.", 0);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = typeof body === "object" && body !== null && "detail" in body && typeof body.detail === "string" ? body.detail : null;
    const error = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : null;
    throw new WorkspaceApiError(error ?? detail ?? `Request failed (${response.status}).`, response.status);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new WorkspaceApiError("SourceLens returned data in an unreadable format.", 502);
  return parsed.data;
}

function jsonRequest(method: "POST" | "PATCH", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export function listSubmissions(contentType?: "document" | "code") {
  const query = contentType ? `?content_type=${contentType}` : "";
  return requestJson(`/api/submissions${query}`, submissionListSchema);
}

export function getSubmission(id: string) {
  return requestJson(`/api/submissions/${encodeURIComponent(id)}`, submissionSchema);
}

export function removeSubmission(id: string) {
  return requestJson(`/api/submissions/${encodeURIComponent(id)}`, deleteSubmissionResponseSchema, { method: "DELETE" });
}

export function listResults(submissionId?: string) {
  const query = submissionId ? `?submission_id=${encodeURIComponent(submissionId)}` : "";
  return requestJson(`/api/results${query}`, resultListSchema);
}

export function getResult(id: string) {
  return requestJson(`/api/results/${encodeURIComponent(id)}`, resultSchema);
}

export function saveReview(id: string, value: z.infer<typeof reviewUpdateSchema>) {
  return requestJson(`/api/results/${encodeURIComponent(id)}`, resultSchema, jsonRequest("PATCH", value));
}

export function runAnalysis(submissionId: string) {
  return requestJson(`/api/submissions/${encodeURIComponent(submissionId)}/analysis`, analysisResponseSchema, { method: "POST" });
}

export function searchWebSources(submissionId: string) {
  return requestJson(`/api/submissions/${encodeURIComponent(submissionId)}/web-search`, webSearchResponseSchema, { method: "POST" });
}

export function generateExplanation(resultId: string) {
  return requestJson(`/api/results/${encodeURIComponent(resultId)}/explanation`, explanationResponseSchema, { method: "POST" });
}

export function runEvidenceAgent(input: z.infer<typeof agentRequestSchema>) {
  return requestJson("/api/agent/run", agentResponseSchema, jsonRequest("POST", agentRequestSchema.parse(input)));
}

export function searchSemanticIndex(input: z.infer<typeof vectorSearchRequestSchema>) {
  return requestJson("/api/vectors/search", vectorSearchResponseSchema, jsonRequest("POST", vectorSearchRequestSchema.parse(input)));
}

export function checkBackendHealth() {
  return requestJson("/api/healthz", healthResponseSchema);
}

export function checkBackendReadiness() {
  return requestJson("/api/readyz", readinessResponseSchema);
}

export async function generateReport(input: z.infer<typeof reportInputSchema>) {
  const response = await fetch("/api/reports", jsonRequest("POST", reportInputSchema.parse(input)));
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : "The report could not be generated.";
    throw new WorkspaceApiError(error, response.status);
  }
  return response.blob();
}
