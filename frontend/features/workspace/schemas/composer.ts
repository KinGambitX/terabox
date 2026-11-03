import { z } from "zod";
import type { ReviewMode } from "../types/workspace";

export const MAX_TEXT_CHARACTERS = 50_000;
export const MAX_FILES_PER_RUN = 10;

const acceptedExtensions = new Set([
  "pdf", "docx", "txt", "md", "py", "java", "c", "cpp", "js", "ts", "cs", "go",
]);

const composerInputSchema = z.object({
  mode: z.enum(["text", "code", "file"]),
  compare: z.boolean(),
  text: z.string().max(MAX_TEXT_CHARACTERS),
  comparisonText: z.string().max(MAX_TEXT_CHARACTERS),
  code: z.string().max(MAX_TEXT_CHARACTERS),
  comparisonCode: z.string().max(MAX_TEXT_CHARACTERS),
  files: z.array(z.object({ name: z.string().min(1), size: z.number().int().nonnegative() })).max(MAX_FILES_PER_RUN),
  comparisonFiles: z.array(z.object({ name: z.string().min(1), size: z.number().int().nonnegative() })).max(MAX_FILES_PER_RUN),
});

export function validateComposerInput(input: {
  mode: ReviewMode;
  compare: boolean;
  text: string;
  comparisonText: string;
  code: string;
  comparisonCode: string;
  files: readonly File[];
  comparisonFiles: readonly File[];
}, maxUploadMb: number) {
  const parsed = composerInputSchema.safeParse({
    ...input,
    files: input.files.map(({ name, size }) => ({ name, size })),
    comparisonFiles: input.comparisonFiles.map(({ name, size }) => ({ name, size })),
  });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Check the information and try again.";

  const value = parsed.data;
  if (value.mode === "text" && !value.text.trim()) return "Enter text to review.";
  if (value.mode === "code" && !value.code.trim()) return "Add source code to review.";
  if (value.mode === "file" && value.files.length === 0) return "Choose at least one supported file.";
  if (value.compare && value.mode === "text" && !value.comparisonText.trim()) return "Add the second text to compare.";
  if (value.compare && value.mode === "code" && !value.comparisonCode.trim()) return "Add the second code sample to compare.";
  if (value.compare && value.mode === "file" && value.comparisonFiles.length === 0) return "Choose at least one file for the second source.";

  if (value.mode === "file") {
    const allFiles = [...input.files, ...(value.compare ? input.comparisonFiles : [])];
    for (const file of allFiles) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!acceptedExtensions.has(extension)) return `${file.name} is not a supported document or source file.`;
      if (file.size > maxUploadMb * 1024 * 1024) return `${file.name} is over the ${maxUploadMb} MB file limit.`;
    }
  }
  return null;
}

export function validateFileSelection(files: readonly File[], existingCount: number, maxUploadMb: number) {
  if (existingCount + files.length > MAX_FILES_PER_RUN) {
    return `Choose up to ${MAX_FILES_PER_RUN} files for each source.`;
  }
  for (const file of files) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!acceptedExtensions.has(extension)) return `${file.name} is not a supported document or source file.`;
    if (file.size > maxUploadMb * 1024 * 1024) return `${file.name} is over the ${maxUploadMb} MB file limit.`;
  }
  return null;
}
