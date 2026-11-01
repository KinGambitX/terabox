import "server-only";
import { backendRequest, getBackendConfig } from "@/lib/backend-api";
import { exampleReviews } from "../data/example-reviews";
import { resultListSchema, submissionListSchema } from "../schemas/workspace";
import type { Review } from "../types/review";

export type WorkspaceOverviewData = {
  reviews: Review[];
  isExampleData: boolean;
  error: string | null;
};

function createReviewRows(submissions: ReturnType<typeof submissionListSchema.parse>["items"], resultRows: ReturnType<typeof resultListSchema.parse>["items"]): Review[] {
  const bySubmission = new Map<string, typeof resultRows>();
  for (const result of resultRows) {
    const current = bySubmission.get(result.submission_id) ?? [];
    current.push(result);
    bySubmission.set(result.submission_id, current);
  }

  return submissions.map((submission) => {
    const results = bySubmission.get(submission.id) ?? [];
    const topResult = results[0] ?? null;
    const latestPending = results.find((result) => result.review_status === "pending");
    const score = results.reduce<number | null>((highest, result) => Math.max(highest ?? 0, result.score), null);
    const matches = new Set(results.filter((result) => result.score > 0).map((result) => result.source_id)).size;
    return {
      id: `SL-${submission.id.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
      submissionId: submission.id,
      resultId: topResult?.id ?? null,
      title: submission.filename,
      course: "No course recorded",
      submittedAt: submission.created_at,
      kind: submission.content_type === "code" ? "Source code" : "Document",
      score,
      matches,
      status: (latestPending ?? topResult)?.review_status ?? "pending",
    };
  });
}

export async function getWorkspaceOverviewData(): Promise<WorkspaceOverviewData> {
  if (!getBackendConfig()) return { reviews: exampleReviews, isExampleData: true, error: null };

  try {
    const [submissionResponse, resultResponse] = await Promise.all([
      backendRequest("/api/v1/submissions"),
      backendRequest("/api/v1/results"),
    ]);
    if (!submissionResponse.ok || !resultResponse.ok) {
      return { reviews: exampleReviews, isExampleData: true, error: "Could not load live submissions. Check the analysis service and retry." };
    }
    const [submissionData, resultData] = await Promise.all([submissionResponse.json(), resultResponse.json()]);
    const parsedSubmissions = submissionListSchema.safeParse(submissionData);
    const parsedResults = resultListSchema.safeParse(resultData);
    if (!parsedSubmissions.success || !parsedResults.success) {
      return { reviews: exampleReviews, isExampleData: true, error: "The analysis service returned data the workspace could not read." };
    }
    if (!parsedSubmissions.data.items.length) return { reviews: exampleReviews, isExampleData: true, error: null };
    return {
      reviews: createReviewRows(parsedSubmissions.data.items, parsedResults.data.items),
      isExampleData: false,
      error: null,
    };
  } catch {
    return { reviews: exampleReviews, isExampleData: true, error: "Could not load live submissions. Check the analysis service and retry." };
  }
}
