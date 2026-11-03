import type { SimilarityResult, SubmissionRecord } from "@/lib/review-schemas";
import type { HeroMode } from "./hero-modes";

export function sampleWorkspaceFromMode(mode: HeroMode): {
  submission: SubmissionRecord;
  submissions: SubmissionRecord[];
  results: SimilarityResult[];
} {
  const submission: SubmissionRecord = {
    id: `sample-${mode.id}`,
    filename: mode.title,
    content_type: mode.id === "code" ? "code" : "document",
    language: mode.id === "code" ? "python" : null,
    created_at: "2026-10-26T10:41:00.000Z",
    text_length: mode.submitted.length,
  };

  const sourceSubmissions: SubmissionRecord[] = mode.sources.map((source, index) => ({
    id: `sample-source-${mode.id}-${index}`,
    filename: source.title,
    content_type: mode.id === "code" ? "code" : "document",
    language: mode.id === "code" ? "python" : null,
    created_at: "2026-10-20T09:00:00.000Z",
    text_length: mode.matched.length,
  }));

  const results: SimilarityResult[] = mode.sources.map((source, index) => {
    const score = Number.parseInt(source.score, 10) / 100;
    const isWeb = source.detail.toLowerCase().includes("public") || mode.id === "web";
    return {
      id: `sample-result-${mode.id}-${index}`,
      submission_id: submission.id,
      source_id: sourceSubmissions[index].id,
      source_type: isWeb ? "web" : "internal",
      method:
        mode.id === "code"
          ? "code_token"
          : mode.matchType.toLowerCase().includes("semantic")
            ? "embedding"
            : "tfidf",
      score,
      evidence: {
        method: mode.matchType,
        title: source.title,
        url: isWeb ? "https://example.edu/research-methods-guide" : undefined,
        provider: isWeb ? "sample-search" : undefined,
        retrieved_at: isWeb ? "2026-10-26T10:40:00.000Z" : undefined,
        submission_excerpt: mode.submitted,
        source_excerpt: mode.matched,
        matched_passages: [
          {
            submission_excerpt: mode.submitted,
            source_excerpt: mode.matched,
            score,
          },
        ],
      },
      review_status: index === 0 ? "pending" : "reviewed",
      review_note: null,
      explanation: null,
      explanation_model: null,
      created_at: "2026-10-26T10:41:00.000Z",
    };
  });

  return {
    submission,
    submissions: [submission, ...sourceSubmissions],
    results,
  };
}
