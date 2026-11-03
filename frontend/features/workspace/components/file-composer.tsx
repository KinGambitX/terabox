"use client";

import { useId, useRef, useState } from "react";
import { IconFile, IconTrash, IconUpload } from "@tabler/icons-react";
import { ComparisonToggle } from "./comparison-toggle";

const acceptedFiles = ".pdf,.docx,.txt,.md,.py,.java,.c,.cpp,.js,.ts,.cs,.go";

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function FileDropField({
  id, label, files, onAdd, onRemove, maxUploadMb, error,
}: {
  id: string; label: string; files: readonly File[]; onAdd: (files: readonly File[]) => void;
  onRemove: (index: number) => void; maxUploadMb: number; error: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const helpId = `${id}-help`;

  function readFiles(list: FileList | null) {
    if (!list?.length) return;
    onAdd(Array.from(list));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section aria-labelledby={`${id}-label`} className="grid gap-2.5">
      <h3 id={`${id}-label`} className="m-0 text-sm font-medium text-workspace-ink">{label}</h3>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFiles}
        multiple
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => readFiles(event.currentTarget.files)}
      />
      <button
        type="button"
        aria-label={`Choose ${label.toLowerCase()}`}
        aria-describedby={error ? `${helpId} ${id}-error` : helpId}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); readFiles(event.dataTransfer.files); }}
        className={`flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-5 py-6 text-center text-workspace-copy outline-2 outline-offset-2 outline-transparent transition-colors duration-150 ease-out focus-visible:outline-workspace-focus motion-reduce:transition-none ${dragging ? "border-workspace-action bg-workspace-highlight" : "border-workspace-control bg-workspace-paper hover:bg-workspace-ground"}`}
      >
        <IconUpload size={16} stroke={1.5} aria-hidden="true" />
        <span className="text-sm font-medium">Drop files here or browse</span>
        <span id={helpId} className="text-xs text-workspace-muted-strong">PDF, DOCX, TXT, Markdown, or source code · up to {maxUploadMb} MB per file</span>
      </button>
      {files.length > 0 && (
        <ul aria-label={`${label} selected`} className="m-0 list-none divide-y divide-workspace-line p-0">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className="flex min-h-11 items-center gap-3 py-2">
              <IconFile size={16} stroke={1.5} className="shrink-0 text-workspace-muted-strong" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-workspace-ink">{file.name}</span>
                <span className="mt-0.5 block text-xs text-workspace-muted-strong">{formatBytes(file.size)}</span>
              </span>
              <button type="button" onClick={() => onRemove(index)} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-md text-workspace-muted-strong hover:bg-workspace-ground focus-visible:outline-2 focus-visible:outline-workspace-focus" aria-label={`Remove ${file.name}`}>
                <IconTrash size={16} stroke={1.5} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FileComposer({
  files, onAdd, onRemove, comparisonFiles, onComparisonAdd, onComparisonRemove,
  compare, onCompareChange, maxUploadMb, error,
}: {
  files: readonly File[]; onAdd: (files: readonly File[]) => void; onRemove: (index: number) => void;
  comparisonFiles: readonly File[]; onComparisonAdd: (files: readonly File[]) => void; onComparisonRemove: (index: number) => void;
  compare: boolean; onCompareChange: (value: boolean) => void; maxUploadMb: number; error: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div className="grid gap-4">
      <FileDropField id={`${id}-primary`} label="Files to review" files={files} onAdd={onAdd} onRemove={onRemove} maxUploadMb={maxUploadMb} error={error} />
      {error && <p id={`${id}-primary-error`} className="m-0 text-sm text-workspace-danger" role="alert">{error}</p>}
      <p className="m-0 text-xs text-workspace-muted-strong">Each file is processed as a separate submission.</p>
      <ComparisonToggle checked={compare} onChange={onCompareChange} />
      {compare && <FileDropField id={`${id}-comparison`} label="Comparison source files" files={comparisonFiles} onAdd={onComparisonAdd} onRemove={onComparisonRemove} maxUploadMb={maxUploadMb} error="" />}
    </div>
  );
}
