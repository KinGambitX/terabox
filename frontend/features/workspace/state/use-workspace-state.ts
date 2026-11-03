"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runWorkspaceReview } from "../api/workspace-api";
import { validateComposerInput, validateFileSelection } from "../schemas/composer";
import type { CodeLanguage, FileItem, ReviewMode, WorkspaceView } from "../types/workspace";

function toItems(files: readonly File[]): FileItem[] {
  return files.map((file) => ({ id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file }));
}

export function useWorkspaceState(maxUploadMb: number) {
  const [view, setView] = useState<WorkspaceView>("detect");
  const [mode, setMode] = useState<ReviewMode>("text");
  const [text, setText] = useState("");
  const [comparisonText, setComparisonText] = useState("");
  const [code, setCode] = useState("");
  const [comparisonCode, setComparisonCode] = useState("");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [comparisonLanguage, setComparisonLanguage] = useState<CodeLanguage>("python");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [comparisonFiles, setComparisonFiles] = useState<FileItem[]>([]);
  const [compare, setCompare] = useState(false);
  const [fileError, setFileError] = useState("");
  const [runError, setRunError] = useState("");
  const [notice, setNotice] = useState("");
  const queryClient = useQueryClient();
  const reviewMutation = useMutation({
    mutationFn: runWorkspaceReview,
    onSuccess: async (response) => {
      setNotice(response.results.length
        ? `Review complete. ${response.results.length} result${response.results.length === 1 ? "" : "s"} returned for human review.`
        : "Review complete. No comparable submissions were found.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", "submissions"] }),
        queryClient.invalidateQueries({ queryKey: ["workspace", "results"] }),
        queryClient.invalidateQueries({ queryKey: ["workspace", "reports"] }),
      ]);
    },
    onError: (error) => setRunError(error instanceof Error ? error.message : "The review could not be completed."),
  });

  const selectMode = useCallback((next: ReviewMode) => {
    setMode(next);
    setRunError("");
    setNotice("");
  }, []);

  const addFiles = useCallback((incoming: readonly File[], secondSource = false) => {
    const current = secondSource ? comparisonFiles : files;
    const error = validateFileSelection(incoming, current.length, maxUploadMb);
    setFileError(error ?? "");
    if (error) return;
    const additions = toItems(incoming);
    if (secondSource) setComparisonFiles((items) => [...items, ...additions]);
    else setFiles((items) => [...items, ...additions]);
    setRunError("");
  }, [comparisonFiles, files, maxUploadMb]);

  const removeFileByIndex = useCallback((index: number, secondSource = false) => {
    if (secondSource) setComparisonFiles((items) => items.filter((_, itemIndex) => itemIndex !== index));
    else setFiles((items) => items.filter((_, itemIndex) => itemIndex !== index));
    setFileError("");
  }, []);

  const runReview = useCallback(() => {
    const error = fileError || validateComposerInput({
      mode,
      compare,
      text,
      comparisonText,
      code,
      comparisonCode,
      files: files.map((item) => item.file),
      comparisonFiles: comparisonFiles.map((item) => item.file),
    }, maxUploadMb);
    if (error) {
      setRunError(error);
      setNotice("");
      return;
    }

    setRunError("");
    setNotice("");
    reviewMutation.mutate({
      mode,
      compare,
      text,
      comparisonText,
      code,
      comparisonCode,
      language,
      comparisonLanguage,
      files: files.map((item) => item.file),
      comparisonFiles: comparisonFiles.map((item) => item.file),
    });
  }, [code, compare, comparisonCode, comparisonFiles, comparisonLanguage, comparisonText, fileError, files, language, maxUploadMb, mode, reviewMutation, text]);

  return {
    view, setView, mode, selectMode, text, setText, comparisonText, setComparisonText,
    code, setCode, comparisonCode, setComparisonCode, language, setLanguage,
    comparisonLanguage, setComparisonLanguage, files: files.map((item) => item.file),
    comparisonFiles: comparisonFiles.map((item) => item.file), addFiles, removeFileByIndex,
    compare, setCompare: (value: boolean) => { setCompare(value); setRunError(""); },
    fileError, runError, notice, running: reviewMutation.isPending, runReview,
    reviewSubmission: reviewMutation.data?.submission ?? null,
    reviewResults: reviewMutation.data?.results ?? [],
    reviewExternalChecks: reviewMutation.data?.externalChecks ?? [],
  };
}
