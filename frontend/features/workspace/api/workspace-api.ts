import {
  resultListSchema,
  resultSchema,
  submissionListSchema,
  uploadResponseSchema,
  type ExternalCheck,
  type SimilarityResult,
  type SubmissionRecord,
} from "@/lib/review-schemas";
import type { CodeLanguage, ReviewMode } from "../types/workspace";

export type WorkspaceReviewInput = {
  mode: ReviewMode;
  compare: boolean;
  text: string;
  comparisonText: string;
  code: string;
  comparisonCode: string;
  language: CodeLanguage;
  comparisonLanguage: CodeLanguage;
  files: readonly File[];
  comparisonFiles: readonly File[];
};

export type WorkspaceReviewResponse = {
  submission: SubmissionRecord;
  submissions: SubmissionRecord[];
  results: SimilarityResult[];
  externalChecks: ExternalCheck[];
};

async function responseBody(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

function errorFrom(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const value = body as { error?: unknown; detail?: unknown };
    if (typeof value.error === "string") return value.error;
    if (typeof value.detail === "string") return value.detail;
  }
  return fallback;
}

export async function getSubmissions(): Promise<SubmissionRecord[]> {
  const response = await fetch("/api/submissions", { cache: "no-store" });
  const body = await responseBody(response);
  if (!response.ok) throw new Error(errorFrom(body, "Could not load submissions."));
  const parsed = submissionListSchema.safeParse(body);
  if (!parsed.success) throw new Error("The analysis service returned invalid submission data.");
  return parsed.data.items;
}

export async function getResults(): Promise<SimilarityResult[]> {
  const response = await fetch("/api/results", { cache: "no-store" });
  const body = await responseBody(response);
  if (!response.ok) throw new Error(errorFrom(body, "Could not load review results."));
  const parsed = resultListSchema.safeParse(body);
  if (!parsed.success) throw new Error("The analysis service returned invalid result data.");
  return parsed.data.items;
}

async function uploadFile(file: File): Promise<{ submission: SubmissionRecord; results: SimilarityResult[]; externalChecks: ExternalCheck[] }> {
  const form = new FormData();
  form.append("file", file, file.name);

  const response = await fetch("/api/submissions", { method: "POST", body: form, cache: "no-store" });
  const body = await responseBody(response);
  if (!response.ok) throw new Error(errorFrom(body, `Could not submit ${file.name}.`));
  const parsed = uploadResponseSchema.safeParse(body);
  if (!parsed.success) throw new Error("The analysis service returned an invalid submission response.");
  const results = parsed.data.results.map((item) => {
    const result = resultSchema.safeParse(item);
    if (!result.success) {
      const field = result.error.issues[0]?.path.join(".");
      throw new Error(`The analysis service returned invalid similarity evidence${field ? ` (${field})` : ""}.`);
    }
    return result.data;
  });
  return {
    submission: parsed.data.submission,
    results,
    externalChecks: (parsed.data.external_checks ?? []).map((check) => ({
      ...check,
      submission_id: parsed.data.submission.id,
      submission_filename: parsed.data.submission.filename,
    })),
  };
}

function filesFor(input: WorkspaceReviewInput, comparison: boolean) {
  if (input.mode === "text") {
    const value = comparison ? input.comparisonText : input.text;
    return [new File([value], comparison ? "comparison-source.txt" : "submission.txt", { type: "text/plain" })];
  }
  if (input.mode === "code") {
    const codeLanguage = comparison ? input.comparisonLanguage : input.language;
    const extension = codeLanguage === "csharp" ? "cs" : codeLanguage === "javascript" ? "js" : codeLanguage === "typescript" ? "ts" : codeLanguage;
    const value = comparison ? input.comparisonCode : input.code;
    return [new File([value], comparison ? `comparison-source.${extension}` : `submission.${extension}`, { type: "text/plain" })];
  }
  return comparison ? [...input.comparisonFiles] : [...input.files];
}

export async function runWorkspaceReview(input: WorkspaceReviewInput): Promise<WorkspaceReviewResponse> {
  const submissions: SubmissionRecord[] = [];
  const results = new Map<string, SimilarityResult>();
  const externalChecks: ExternalCheck[] = [];
  const groups = [filesFor(input, false), ...(input.compare ? [filesFor(input, true)] : [])];

  for (const group of groups) {
    for (const file of group) {
      const uploaded = await uploadFile(file);
      submissions.push(uploaded.submission);
      for (const result of uploaded.results) results.set(result.id, result);
      externalChecks.push(...uploaded.externalChecks);
    }
  }

  const submission = submissions.at(-1);
  if (!submission) throw new Error("Choose an input before starting a review.");
  return { submission, submissions, results: [...results.values()].sort((a, b) => b.score - a.score), externalChecks };
}

export async function updateResultReview(resultId: string, status: SimilarityResult["review_status"], note: string | null = null) {
  const response = await fetch(`/api/results/${encodeURIComponent(resultId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, note }),
    cache: "no-store",
  });
  const body = await responseBody(response);
  if (!response.ok) throw new Error(errorFrom(body, "Could not save the review status."));
  const parsed = resultSchema.safeParse(body);
  if (!parsed.success) throw new Error("The analysis service returned invalid review data.");
  return parsed.data;
}
