"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type FormEvent } from "react";
import { IconCode, IconFileText, IconLink, IconTrash, IconUpload } from "@tabler/icons-react";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { submissionFieldsSchema } from "../schemas/workspace";
import { searchWebSources } from "../api/workspace-client";
import { useFileUpload } from "../hooks/use-file-upload";
import type { SubmissionKind } from "../schemas/workspace";

type Tab = "document" | "code" | "paste";
type PasteKind = "text" | "link";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "document", label: "Document" },
  { id: "code", label: "Source code" },
  { id: "paste", label: "Paste text / link" },
];
const documentAccept = ".pdf,.docx,.txt";
const codeAccept = ".py,.java,.c,.cpp,.js,.ts,.cs,.go";
const courseOptions = ["Research Methods", "Data Structures", "Environmental Studies", "Database Systems"];

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getAccept(tab: Tab, pasteKind: PasteKind) {
  return tab === "document" ? documentAccept : tab === "code" ? codeAccept : pasteKind === "link" ? ".txt" : ".txt";
}

export function SubmissionForm({ maxUploadMb, initialTab = "document", initialPasteKind = "text" }: { maxUploadMb: number; initialTab?: Tab; initialPasteKind?: PasteKind }) {
  const router = useRouter();
  const picker = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [pasteKind, setPasteKind] = useState<PasteKind>(initialPasteKind);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [notes, setNotes] = useState("");
  const [language, setLanguage] = useState("auto");
  const [draft, setDraft] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const files = useFileUpload(maxUploadMb);
  const isPaste = tab === "paste";
  const pasteValue = isPaste ? draft.trim() : "";
  const pasteUrlValid = pasteKind !== "link" || (() => {
    try { const parsed = new URL(pasteValue); return parsed.protocol === "https:" || parsed.protocol === "http:"; } catch { return false; }
  })();
  const hasPasteFile = isPaste && pasteValue.length > 0 && pasteUrlValid;
  const hasValidFile = files.validFileCount > 0 || files.retryableCount > 0 || hasPasteFile;
  const canSubmit = Boolean(title.trim() && course && section.trim() && hasValidFile && !busy);
  const accept = getAccept(tab, pasteKind);

  function addFileList(list: FileList | File[]) {
    const currentKind: SubmissionKind = tab === "paste" ? pasteKind : tab;
    files.addFiles(Array.from(list), currentKind);
    setError("");
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFileList(event.dataTransfer.files);
  }

  function handleTabKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const current = tabs.findIndex((item) => item.id === tab);
    const next = (current + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    setTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const kind: SubmissionKind = isPaste ? pasteKind : tab;
    const parsed = submissionFieldsSchema.safeParse({ title, course, section, notes, kind, language });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the submission details.");
      return;
    }
    if (isPaste && !pasteUrlValid) {
      setError("Enter a complete public URL beginning with https://, or switch to Paste text.");
      return;
    }
    if (!hasValidFile) {
      setError("Add at least one supported file or paste text before submitting.");
      return;
    }

    setBusy(true);
    const extraFiles = hasPasteFile
      ? [{ file: new File([pasteValue], `${title.trim()}.txt`, { type: "text/plain" }), kind }]
      : [];
    const outcomes = await files.uploadFiles({ title, course, section, notes, language }, extraFiles);
    const successful = outcomes.filter((outcome) => outcome.submissionId);
    const failed = outcomes.some((outcome) => outcome.error);
    if (failed || files.hasValidationErrors) {
      setError("Some files need attention. Remove invalid rows or retry the failed uploads.");
      setBusy(false);
      return;
    }
    if (!successful.length) {
      setError("Choose at least one file that is ready to upload.");
      setBusy(false);
      return;
    }

    let searchNote = "";
    if (isPaste && pasteKind === "link") {
      const results = await Promise.all(successful.map(({ submissionId }) => submissionId ? searchWebSources(submissionId).then(() => true).catch(() => false) : Promise.resolve(false)));
      if (results.some((available) => !available)) searchNote = "A web search was unavailable; the submission is still saved.";
    }
    try { sessionStorage.setItem("sourcelens-upload-toast", JSON.stringify({ count: successful.length, note: searchNote })); } catch { /* The route still succeeds if browser storage is unavailable. */ }
    router.push("/workspace#reviews");
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} aria-busy={busy}>
      <div className="grid gap-2">
        <label className="text-[12px] font-medium text-workspace-ink" htmlFor="submission-title">Title</label>
        <input id="submission-title" name="title" autoComplete="off" maxLength={160} required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Research methods — literature review…" className="h-11 rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-ink outline-none placeholder:text-workspace-muted focus-visible:outline-2 focus-visible:outline-workspace-info" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2"><label className="text-[12px] font-medium text-workspace-ink" htmlFor="submission-course">Course</label><select id="submission-course" name="course" required value={course} onChange={(event) => setCourse(event.target.value)} className="h-11 cursor-pointer rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-copy outline-none focus-visible:outline-2 focus-visible:outline-workspace-info"><option value="">Select a course</option>{courseOptions.map((item) => <option key={item} value={item}>{item} (example)</option>)}</select></div>
        <div className="grid gap-2"><label className="text-[12px] font-medium text-workspace-ink" htmlFor="submission-section">Section</label><input id="submission-section" name="section" autoComplete="off" required value={section} onChange={(event) => setSection(event.target.value)} placeholder="e.g. Section B…" className="h-11 rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-ink outline-none placeholder:text-workspace-muted focus-visible:outline-2 focus-visible:outline-workspace-info" /></div>
      </div>

      <div className="grid gap-2"><label className="text-[12px] font-medium text-workspace-ink" htmlFor="submission-notes">Notes <span className="font-normal text-workspace-muted">(optional)</span></label><textarea id="submission-notes" name="notes" autoComplete="off" maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Add context for the reviewer…" className="min-h-20 resize-y rounded-lg border border-workspace-border bg-workspace-paper px-3 py-2.5 text-[12px] leading-relaxed text-workspace-ink outline-none placeholder:text-workspace-muted focus-visible:outline-2 focus-visible:outline-workspace-info" /></div>

      <div className="grid gap-4">
        <div role="tablist" aria-label="Submission type" onKeyDown={handleTabKey} className="flex flex-wrap gap-1 border-b border-workspace-border">
          {tabs.map((item, index) => <button key={item.id} ref={(element) => { tabRefs.current[index] = element; }} role="tab" type="button" aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} className={`min-h-10 cursor-pointer border-b-2 px-3 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-workspace-info ${tab === item.id ? "border-workspace-action text-workspace-ink" : "border-transparent text-workspace-muted hover:text-workspace-copy"}`}>{item.label}</button>)}
        </div>

        <div role="tabpanel" aria-label={tabs.find((item) => item.id === tab)?.label} className="grid gap-4">
          {tab === "code" && <div className="grid max-w-[300px] gap-2"><label className="text-[12px] font-medium text-workspace-ink" htmlFor="submission-language">Language</label><select id="submission-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="h-10 cursor-pointer rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[11px] text-workspace-copy outline-none focus-visible:outline-2 focus-visible:outline-workspace-info"><option value="auto">Auto-detect from file extension</option><option value="python">Python</option><option value="java">Java</option><option value="c">C</option><option value="cpp">C++</option><option value="javascript">JavaScript</option><option value="typescript">TypeScript</option><option value="c_sharp">C#</option><option value="go">Go</option></select></div>}

          {isPaste && <div className="grid gap-3"><div role="group" aria-label="Paste input type" className="flex flex-wrap gap-2"><button type="button" aria-pressed={pasteKind === "text"} onClick={() => setPasteKind("text")} className={`min-h-9 cursor-pointer rounded-md px-3 text-[11px] focus-visible:outline-2 focus-visible:outline-workspace-info ${pasteKind === "text" ? "bg-workspace-action text-white" : "border border-workspace-border text-workspace-copy hover:bg-workspace-hover"}`}>Text</button><button type="button" aria-pressed={pasteKind === "link"} onClick={() => setPasteKind("link")} className={`min-h-9 cursor-pointer rounded-md px-3 text-[11px] focus-visible:outline-2 focus-visible:outline-workspace-info ${pasteKind === "link" ? "bg-workspace-action text-white" : "border border-workspace-border text-workspace-copy hover:bg-workspace-hover"}`}><IconLink size={14} className="mr-1 inline" aria-hidden="true" />Public link</button></div>
            {pasteKind === "text" ? <div className="grid gap-2"><label className="text-[12px] font-medium text-workspace-ink" htmlFor="paste-content">Text to review</label><textarea id="paste-content" value={draft} onChange={(event) => setDraft(event.target.value)} spellCheck className="min-h-[220px] resize-y rounded-lg border border-workspace-border bg-workspace-paper p-3.5 text-[12px] leading-6 text-workspace-ink outline-none placeholder:text-workspace-muted focus-visible:outline-2 focus-visible:outline-workspace-info" placeholder="Paste text to compare…" /></div> : <div className="grid gap-2"><label className="text-[12px] font-medium text-workspace-ink" htmlFor="paste-link">Public web page URL</label><input id="paste-link" type="url" inputMode="url" autoComplete="url" required value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="https://example.edu/article…" className="h-11 rounded-lg border border-workspace-border bg-workspace-paper px-3 text-[12px] text-workspace-ink outline-none placeholder:text-workspace-muted focus-visible:outline-2 focus-visible:outline-workspace-info" /><p className="m-0 text-[10px] text-workspace-muted">Web search runs only when the backend’s external search integration is enabled.</p></div>}
          </div>}

          <input ref={picker} className="sr-only" type="file" multiple accept={accept} aria-label="Choose submission files" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.currentTarget.files) addFileList(event.currentTarget.files); event.currentTarget.value = ""; }} />
          <div className="grid gap-2">
            <button type="button" onClick={() => picker.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={handleDrop} className={`flex min-h-[136px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-5 py-6 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-info ${dragging ? "border-workspace-info bg-workspace-info-soft" : "border-workspace-border bg-workspace-soft hover:bg-workspace-hover"}`} aria-describedby="accepted-file-types">
              <IconUpload size={21} className="text-workspace-muted" aria-hidden="true" />
              <span className="text-[12px] font-medium text-workspace-ink">Drop files here or browse</span>
              <span className="text-[10px] text-workspace-muted">Enter or Space opens the file picker</span>
            </button>
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="m-0 text-[10px] text-workspace-muted" id="accepted-file-types">{tab === "document" ? "Documents: .pdf, .docx, .txt" : tab === "code" ? "Code: .py, .java, .c, .cpp, .js, .ts, .cs, .go · ZIP is not supported" : "Optional .txt files, or paste text / a public link above"} · Max {maxUploadMb} MB per file</p><Button type="button" variant="outline" className="h-9 cursor-pointer rounded-md border-workspace-border px-3 text-[11px] text-workspace-copy hover:bg-workspace-hover" onClick={() => picker.current?.click()}>Browse files</Button></div>
          </div>
        </div>
      </div>

      {hasPasteFile && <p className="m-0 text-[10px] text-workspace-muted" role="status">Paste ready · {pasteKind === "link" ? "Public link" : "Text"} · {formatBytes(new Blob([pasteValue]).size)} will be submitted as a text document.</p>}
      {files.files.length > 0 && <section aria-labelledby="selected-files-title"><h2 id="selected-files-title" className="mb-2 text-[12px] font-semibold text-workspace-ink">Files in this submission</h2><ul className="m-0 list-none divide-y divide-workspace-border border-y border-workspace-border p-0">{files.files.map((item) => { const extension = item.file.name.split(".").pop()?.toLowerCase() ?? ""; const isCode = ["py", "java", "c", "cpp", "js", "ts", "cs", "go"].includes(extension); const TypeIcon = isCode ? IconCode : IconFileText; return <li key={item.key} className="flex flex-wrap items-center gap-3 py-3"><TypeIcon size={17} className="shrink-0 text-workspace-muted" aria-hidden="true" /><div className="min-w-0 flex-1"><p className="m-0 truncate text-[11px] font-medium text-workspace-ink">{item.file.name}</p><p className="m-0 mt-1 text-[10px] text-workspace-muted">{formatBytes(item.file.size)} · {item.kind === "code" ? "Source code" : item.kind === "link" ? "Web link" : "Document"}{item.uploaded ? " · Uploaded" : ""}</p>{item.status === "uploading" && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-workspace-soft" role="progressbar" aria-label={`Uploading ${item.file.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}><div className="h-full origin-left bg-workspace-info transition-transform duration-100" style={{ transform: `scaleX(${item.progress / 100})` }} /></div>}{item.error && <p className="m-0 mt-1 text-[10px] text-workspace-danger" role="alert">{item.error}</p>}</div><span className={`text-[10px] font-medium ${item.status === "error" ? "text-workspace-danger" : item.status === "uploading" ? "text-workspace-info" : "text-workspace-success"}`}>{item.status === "error" ? "Error" : item.status === "uploading" ? "Uploading" : "Ready"}</span><button type="button" onClick={() => files.removeFile(item.key)} disabled={item.status === "uploading"} className="grid h-9 w-9 cursor-pointer place-items-center rounded-md text-workspace-muted hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-info disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Remove ${item.file.name}`}><IconTrash size={15} aria-hidden="true" /></button></li>; })}</ul></section>}

      <p className="m-0 rounded-md bg-workspace-info-soft px-3 py-2.5 text-[10px] leading-relaxed text-workspace-info">The analysis API stores the upload filename and detected type/language. Course, Section, and Notes aren’t saved by the current backend.</p>
      {error && <p className="m-0 text-[11px] text-workspace-danger" role="alert" aria-live="polite">{error}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-workspace-border pt-4">
        <p className="m-0 max-w-[500px] text-[10px] leading-relaxed text-workspace-muted">Files are private by default. Similarity is a review signal, not a verdict.</p>
        <div className="flex items-center gap-2"><Button asChild variant="outline" className="h-10 cursor-pointer rounded-md border-workspace-border px-4 text-[11px] text-workspace-copy hover:bg-workspace-hover"><Link href="/workspace">Cancel</Link></Button><BrandButton type="submit" tone="ink" disabled={!canSubmit} className="h-10 cursor-pointer gap-2 px-4 text-[11px] disabled:cursor-not-allowed" aria-disabled={!canSubmit}>{busy ? "Uploading…" : files.retryableCount && files.validFileCount === 0 ? "Retry uploads" : "Submit for review"}</BrandButton></div>
      </div>
    </form>
  );
}
