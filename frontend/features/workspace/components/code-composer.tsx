"use client";

import dynamic from "next/dynamic";
import { MAX_TEXT_CHARACTERS } from "../schemas/composer";
import { codeLanguages, type CodeLanguage } from "../types/workspace";
import { ComparisonToggle } from "./comparison-toggle";

const MonacoCodeEditor = dynamic(
  () => import("./monaco-code-editor").then((module) => module.MonacoCodeEditor),
  {
    ssr: false,
    loading: () => <div className="grid h-[320px] place-items-center rounded-md border border-workspace-line bg-white text-xs text-workspace-muted-strong" aria-live="polite">Loading editor…</div>,
  },
);

const editorLanguages: Record<CodeLanguage, string> = {
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  go: "go",
};

function CodeField({
  id, label, value, onChange, language, onLanguageChange,
}: { id: string; label: string; value: string; onChange: (value: string) => void; language: CodeLanguage; onLanguageChange: (value: CodeLanguage) => void }) {
  const helpId = `${id}-help`;
  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span id={`${id}-label`} className="text-sm font-medium text-workspace-ink">{label}</span>
        <label className="flex min-h-8 items-center gap-2 text-xs text-workspace-copy">
          <span>Language</span>
          <select value={language} onChange={(event) => onLanguageChange(event.target.value as CodeLanguage)} className="h-8 rounded-md border border-workspace-line bg-white px-2.5 text-sm text-workspace-ink outline-2 outline-transparent focus-visible:outline-workspace-focus">
            {codeLanguages.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>
      <div id={id} role="group" aria-labelledby={`${id}-label`} aria-describedby={helpId}>
        <MonacoCodeEditor
          value={value}
          onChange={(nextValue) => { if (nextValue.length <= MAX_TEXT_CHARACTERS) onChange(nextValue); }}
          language={editorLanguages[language]}
          label={label}
        />
      </div>
      <p id={helpId} className="m-0 flex justify-between gap-3 text-xs leading-4 text-workspace-muted-strong">
        <span>Paste or enter code; syntax highlighting follows the selected language.</span>
        <span className="shrink-0 tabular-nums">{value.length.toLocaleString()} / {MAX_TEXT_CHARACTERS.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function CodeComposer({
  value, onChange, language, onLanguageChange, comparisonValue, onComparisonChange,
  comparisonLanguage, onComparisonLanguageChange, compare, onCompareChange,
}: {
  value: string; onChange: (value: string) => void; language: CodeLanguage; onLanguageChange: (value: CodeLanguage) => void;
  comparisonValue: string; onComparisonChange: (value: string) => void; comparisonLanguage: CodeLanguage;
  onComparisonLanguageChange: (value: CodeLanguage) => void; compare: boolean; onCompareChange: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-6">
      <CodeField id="review-code" label="Source code to review" value={value} onChange={onChange} language={language} onLanguageChange={onLanguageChange} />
      <ComparisonToggle checked={compare} onChange={onCompareChange} />
      {compare && <CodeField id="comparison-code" label="Comparison source code" value={comparisonValue} onChange={onComparisonChange} language={comparisonLanguage} onLanguageChange={onComparisonLanguageChange} />}
    </div>
  );
}
