import type { ReviewStatus } from "../schemas/workspace";

export type Review = {
  id: string;
  submissionId: string;
  resultId: string | null;
  title: string;
  course: string;
  submittedAt: string;
  kind: "Document" | "Source code";
  score: number | null;
  matches: number;
  status: ReviewStatus;
};
