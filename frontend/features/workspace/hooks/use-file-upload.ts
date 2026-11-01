"use client";

import { useCallback, useRef, useState } from "react";
import { uploadResponseSchema } from "../schemas/workspace";
import type { SubmissionKind } from "../schemas/workspace";

export type UploadFileItem = {
  key: string;
  file: File;
  kind: SubmissionKind;
  status: "ready" | "uploading" | "error";
  progress: number;
  error: string | null;
  retryable: boolean;
  uploaded: boolean;
  submissionId: string | null;
};

type UploadFields = { title: string; course: string; section: string; notes: string; language: string };
type UploadOutcome = { file: UploadFileItem; submissionId: string | null; error: string | null };

const docs = new Set(["pdf", "docx", "txt"]);
const code = new Set(["py", "java", "c", "cpp", "js", "ts", "cs", "go"]);

function makeKey(file: File, serial: number) {
  return `${file.name.toLowerCase()}:${file.size}:${file.lastModified}:${serial}`;
}

function readServerError(body: unknown) {
  if (typeof body === "object" && body !== null) {
    const record = body as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (typeof record.detail === "string") return record.detail;
  }
  return "Upload failed. Check the file and try again.";
}

export function useFileUpload(maxUploadMb: number) {
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const serial = useRef(0);
  const requests = useRef(new Map<string, XMLHttpRequest>());
  const maxBytes = maxUploadMb * 1024 * 1024;

  const addFiles = useCallback((added: File[], kind: SubmissionKind) => {
    setFiles((existing) => {
      const fingerprints = new Set(existing.map(({ file }) => `${file.name.toLowerCase()}:${file.size}:${file.lastModified}`));
      const next = added.map((file) => {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        const fingerprint = `${file.name.toLowerCase()}:${file.size}:${file.lastModified}`;
        const isDuplicate = fingerprints.has(fingerprint);
        fingerprints.add(fingerprint);
        const accepted = kind === "document" ? docs.has(extension) : kind === "code" ? code.has(extension) : extension === "txt";
        const error = isDuplicate
          ? `${file.name} is already in this submission.`
          : file.size === 0
            ? `${file.name} is empty. Choose a file with content.`
            : file.size > maxBytes
              ? `${file.name} exceeds the ${maxUploadMb} MB limit.`
              : !accepted
                ? `${file.name} is not supported for the selected tab.`
                : null;
        serial.current += 1;
        return { key: makeKey(file, serial.current), file, kind, status: error ? "error" as const : "ready" as const, progress: 0, error, retryable: false, uploaded: false, submissionId: null };
      });
      return [...existing, ...next];
    });
  }, [maxBytes, maxUploadMb]);

  const removeFile = useCallback((key: string) => {
    requests.current.get(key)?.abort();
    requests.current.delete(key);
    setFiles((current) => current.filter((item) => item.key !== key));
  }, []);

  const setProgress = useCallback((key: string, progress: number) => {
    setFiles((current) => current.map((item) => item.key === key ? { ...item, progress } : item));
  }, []);

  const sendFile = useCallback((item: UploadFileItem, fields: UploadFields, displayName: string): Promise<UploadOutcome> => new Promise((resolve) => {
    const form = new FormData();
    const extension = item.file.name.includes(".") ? item.file.name.slice(item.file.name.lastIndexOf(".")) : "";
    const uploadName = `${displayName}${extension}`;
    form.append("file", new File([item.file], uploadName, { type: item.file.type, lastModified: item.file.lastModified }));
    form.append("title", fields.title);
    form.append("course", fields.course);
    form.append("section", fields.section);
    form.append("notes", fields.notes);
    form.append("kind", item.kind);
    form.append("language", fields.language);

    const xhr = new XMLHttpRequest();
    requests.current.set(item.key, xhr);
    setFiles((current) => current.map((file) => file.key === item.key ? { ...file, status: "uploading", error: null, progress: 0 } : file));
    xhr.open("POST", "/api/submissions");
    xhr.timeout = 90_000;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(item.key, Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => {
      requests.current.delete(item.key);
      const error = "Could not reach the analysis service. Check your connection and retry.";
      setFiles((current) => current.map((file) => file.key === item.key ? { ...file, status: "error", error, retryable: true } : file));
      resolve({ file: item, submissionId: null, error });
    };
    xhr.ontimeout = () => {
      requests.current.delete(item.key);
      const error = "The upload took too long. Retry when the analysis service is available.";
      setFiles((current) => current.map((file) => file.key === item.key ? { ...file, status: "error", error, retryable: true } : file));
      resolve({ file: item, submissionId: null, error });
    };
    xhr.onabort = () => {
      requests.current.delete(item.key);
      resolve({ file: item, submissionId: null, error: "Upload cancelled." });
    };
    xhr.onload = () => {
      requests.current.delete(item.key);
      let body: unknown;
      try { body = JSON.parse(xhr.responseText); } catch { body = null; }
      const parsed = uploadResponseSchema.safeParse(body);
      if (xhr.status < 200 || xhr.status >= 300 || !parsed.success) {
        const error = readServerError(body);
        setFiles((current) => current.map((file) => file.key === item.key ? { ...file, status: "error", error, retryable: xhr.status >= 500 } : file));
        resolve({ file: item, submissionId: null, error });
        return;
      }
      setFiles((current) => current.map((file) => file.key === item.key ? { ...file, status: "ready", progress: 100, uploaded: true, submissionId: parsed.data.submission.id, error: null, retryable: false } : file));
      resolve({ file: item, submissionId: parsed.data.submission.id, error: null });
    };
    xhr.send(form);
  }), [setProgress]);

  const uploadFiles = useCallback(async (fields: UploadFields, extraFiles: Array<{ file: File; kind: SubmissionKind }> = []): Promise<UploadOutcome[]> => {
    const selected = files.filter((item) => ((item.status === "ready" && !item.error) || (item.status === "error" && item.retryable)) && !item.uploaded);
    const synthetic = extraFiles.map(({ file, kind }) => ({ key: makeKey(file, ++serial.current), file, kind, status: "ready" as const, progress: 0, error: null, retryable: false, uploaded: false, submissionId: null }));
    const batch = [...selected, ...synthetic];
    const outcomes: UploadOutcome[] = [];
    for (const [index, item] of batch.entries()) {
      const base = fields.title.trim().replace(/[\\/:*?"<>|]+/g, "-").slice(0, 120) || "submission";
      const name = batch.length > 1 ? `${base}-${index + 1}` : base;
      outcomes.push(await sendFile(item, fields, name));
    }
    return outcomes;
  }, [files, sendFile]);

  const validFileCount = files.filter((item) => item.status === "ready" && !item.error).length;
  const retryableCount = files.filter((item) => item.status === "error" && item.retryable).length;
  const erroredFiles = files.filter((item) => item.status === "error").length;
  const hasValidationErrors = files.some((item) => item.status === "error" && !item.retryable);
  const isUploading = files.some((item) => item.status === "uploading");

  return { files, addFiles, removeFile, uploadFiles, validFileCount, retryableCount, erroredFiles, hasValidationErrors, isUploading };
}
