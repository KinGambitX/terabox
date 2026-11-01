import "server-only";
import { backendRequest, getBackendConfig, getExternalAiEnabled } from "@/lib/backend-api";
import { exampleReviews } from "../data/example-reviews";
import { resultListSchema, submissionListSchema, submissionSchema } from "../schemas/workspace";
import type { SimilarityResult, SubmissionRecord } from "../schemas/workspace";

export type EvidencePageData = {
  submission: SubmissionRecord | null;
  results: SimilarityResult[];
  sourceNames: Record<string, string>;
  isExampleData: boolean;
  allowExternalAi: boolean;
  error: string | null;
};

export async function getEvidencePageData(id: string): Promise<EvidencePageData> {
  const base = { sourceNames: {}, allowExternalAi: getExternalAiEnabled() };
  const sample = exampleReviews.find((review) => review.submissionId === id);
  if (sample) {
    return {
      ...base,
      submission: {
        id: sample.submissionId,
        filename: sample.title,
        content_type: sample.kind === "Source code" ? "code" : "document",
        language: sample.kind === "Source code" ? "python" : null,
        created_at: sample.submittedAt,
        text_length: undefined,
      },
      results: [],
      isExampleData: true,
      error: null,
    };
  }
  if (!getBackendConfig()) return { ...base, submission: null, results: [], isExampleData: false, error: "Analysis service is not configured. Set its server-side URL and key to load evidence." };

  try {
    const [submissionResponse, resultsResponse] = await Promise.all([
      backendRequest(`/api/v1/submissions/${encodeURIComponent(id)}`),
      backendRequest(`/api/v1/results?submission_id=${encodeURIComponent(id)}`),
    ]);
    if (!submissionResponse.ok || !resultsResponse.ok) return { ...base, submission: null, results: [], isExampleData: false, error: "Could not load this submission’s evidence. Try again." };
    const [submissionBody, resultBody] = await Promise.all([submissionResponse.json(), resultsResponse.json()]);
    const parsedSubmission = submissionSchema.safeParse(submissionBody);
    const parsedResults = resultListSchema.safeParse(resultBody);
    if (!parsedSubmission.success || !parsedResults.success) return { ...base, submission: null, results: [], isExampleData: false, error: "The analysis service returned evidence in an unreadable format." };

    const sourceIds = Array.from(new Set(parsedResults.data.items.filter((result) => result.source_type === "internal").map((result) => result.source_id)));
    const sourceNames: Record<string, string> = {};
    if (sourceIds.length) {
      const sourceResponse = await backendRequest("/api/v1/submissions");
      if (sourceResponse.ok) {
        const parsedSources = submissionListSchema.safeParse(await sourceResponse.json());
        if (parsedSources.success) {
          for (const source of parsedSources.data.items) if (sourceIds.includes(source.id)) sourceNames[source.id] = source.filename;
        }
      }
    }
    return { ...base, submission: parsedSubmission.data, results: parsedResults.data.items, sourceNames, isExampleData: false, error: null };
  } catch {
    return { ...base, submission: null, results: [], isExampleData: false, error: "Could not reach the analysis service. Check the connection and try again." };
  }
}
