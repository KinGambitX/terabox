"use client";

import Editor from "@monaco-editor/react";

export function MonacoCodeEditor({
  value, onChange, language, label,
}: { value: string; onChange: (value: string) => void; language: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-workspace-line bg-white py-3 transition-[border-color,box-shadow] duration-150 ease-out focus-within:border-workspace-action focus-within:ring-2 focus-within:ring-workspace-highlight motion-reduce:transition-none">
      <Editor
        height="320px"
        language={language}
        value={value}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        loading={<div className="grid h-[320px] place-items-center text-xs text-workspace-muted-strong" aria-live="polite">Loading editor…</div>}
        options={{
          ariaLabel: label,
          automaticLayout: true,
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: 13,
          lineHeight: 21,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "off",
          lineNumbers: "on",
          folding: false,
          glyphMargin: false,
          renderLineHighlight: "gutter",
          lineDecorationsWidth: 8,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          roundedSelection: false,
          padding: { top: 4, bottom: 4 },
          scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
        }}
      />
    </div>
  );
}
