import { z } from "zod";

export const documentExtensions = ["pdf", "docx", "txt"] as const;
export const codeExtensions = ["py", "java", "c", "cpp", "js", "ts", "cs", "go"] as const;
export const supportedExtensions = [...documentExtensions, ...codeExtensions] as const;

export const submissionFieldsSchema = z.object({
  title: z.string().trim().min(1, "Enter a title.").max(160, "Keep the title under 160 characters."),
  course: z.string().trim().min(1, "Choose a course."),
  section: z.string().trim().min(1, "Enter a section."),
  notes: z.string().trim().max(4000, "Keep notes under 4,000 characters.").optional().default(""),
  kind: z.enum(["document", "code", "text", "link"]),
  language: z.enum(["auto", "python", "java", "c", "cpp", "javascript", "typescript", "c_sharp", "go"]).default("auto"),
});

export const submissionSchema = z.object({
  id: z.string(),
  filename: z.string(),
  content_type: z.enum(["document", "code"]),
  language: z.string().nullable().optional(),
  created_at: z.string(),
  text_length: z.number().optional(),
});

export const uploadResponseSchema = z.object({
  submission: submissionSchema,
  results: z.array(z.unknown()),
  metadataSaved: z.boolean().optional(),
});

export const submissionListSchema = z.object({ items: z.array(submissionSchema) });
export const deleteSubmissionResponseSchema = z.object({ deleted: z.string() });

const passageSchema = z.object({
  submission_excerpt: z.string().optional(),
  source_excerpt: z.string().optional(),
  score: z.number().optional(),
}).passthrough();

const tokenBlockSchema = z.object({
  submission_token_start: z.number(),
  source_token_start: z.number(),
  token_count: z.number(),
});

export const evidenceSchema = z.object({
  method: z.string().optional(),
  model: z.string().optional(),
  score: z.number().optional(),
  language: z.string().optional(),
  title: z.string().optional(),
  url: z.string().url().optional(),
  provider: z.string().optional(),
  retrieved_at: z.string().optional(),
  submission_excerpt: z.string().optional(),
  source_excerpt: z.string().optional(),
  matched_passages: z.array(passageSchema).optional(),
  matched_token_blocks: z.array(tokenBlockSchema).optional(),
}).passthrough();

export const resultSchema = z.object({
  id: z.string(),
  submission_id: z.string(),
  source_id: z.string(),
  source_type: z.enum(["internal", "web"]),
  method: z.string(),
  score: z.number().min(0).max(1),
  evidence: evidenceSchema,
  review_status: z.enum(["pending", "reviewed", "relevant", "dismissed"]),
  review_note: z.string().nullable().optional(),
  explanation: z.string().nullable().optional(),
  explanation_model: z.string().nullable().optional(),
  created_at: z.string(),
});

export const resultListSchema = z.object({ items: z.array(resultSchema) });
export const analysisResponseSchema = z.object({ submission_id: z.string(), results: z.array(resultSchema) });
export const webSearchResponseSchema = z.object({ submission_id: z.string(), results: z.array(resultSchema) });
export const explanationResponseSchema = z.object({ result_id: z.string(), model: z.string(), generated: z.boolean(), text: z.string() });
export const agentRequestSchema = z.object({ submission_id: z.string().trim().min(1).max(80), message: z.string().trim().min(1).max(6000) });
export const agentResponseSchema = z.object({
  submission_id: z.string(),
  model: z.string(),
  report: z.object({ summary: z.string(), evidence_ids: z.array(z.string()), suggested_next_steps: z.array(z.string()), human_review_required: z.boolean() }),
  tools_invoked: z.array(z.string()),
  usage: z.object({ requests: z.number().int().nonnegative(), tool_calls: z.number().int().nonnegative() }),
});
export const vectorSearchRequestSchema = z.object({ text: z.string().trim().min(1).max(10000), limit: z.number().int().min(1).max(100).default(10) });
export const vectorSearchResponseSchema = z.object({
  model: z.string(),
  items: z.array(z.object({ vector_id: z.string(), payload: z.record(z.string(), z.unknown()), score: z.number().min(-1).max(1) })),
});
export const healthResponseSchema = z.object({ status: z.string(), service: z.string() });
export const readinessResponseSchema = z.object({ status: z.string(), database: z.string(), vector_store: z.string() });
export const reviewUpdateSchema = z.object({
  status: z.enum(["pending", "reviewed", "relevant", "dismissed"]),
  note: z.string().max(4000).nullable(),
});

export const reportInputSchema = z.object({
  submissionId: z.string().min(1).max(120),
  title: z.string().min(1).max(240),
  course: z.string().max(240),
  kind: z.enum(["document", "code"]),
  language: z.string().max(80).nullable(),
  scores: z.array(z.object({ method: z.string().max(120), score: z.number().min(0).max(1), source: z.string().max(500) })).max(100),
  reviewerStatus: z.enum(["pending", "reviewed", "relevant", "dismissed"]),
  reviewerNote: z.string().max(4000).nullable(),
  isExampleData: z.boolean(),
});

export const uploadToastSchema = z.object({ count: z.number().int().positive(), note: z.string().max(300).optional() });

export type SubmissionKind = z.infer<typeof submissionFieldsSchema>["kind"];
export type SubmissionRecord = z.infer<typeof submissionSchema>;
export type SimilarityResult = z.infer<typeof resultSchema>;
export type ReviewStatus = z.infer<typeof reviewUpdateSchema>["status"];
