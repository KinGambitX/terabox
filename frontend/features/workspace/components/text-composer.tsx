"use client";

import { MAX_TEXT_CHARACTERS } from "../schemas/composer";
import { ComparisonToggle } from "./comparison-toggle";

function TextField({
  id, label, value, onChange, placeholder,
}: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  const helpId = `${id}-help`;
  return (
    <div className="grid gap-2.5">
      <label htmlFor={id} className="text-sm font-medium text-workspace-ink">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_TEXT_CHARACTERS}
        rows={7}
        spellCheck
        aria-describedby={helpId}
        className="min-h-52 w-full resize-y rounded-md border border-workspace-line bg-workspace-paper px-4 py-4 text-sm leading-[22px] text-workspace-ink outline-2 outline-transparent outline-offset-[-2px] placeholder:text-workspace-muted-strong focus-visible:border-workspace-action focus-visible:outline-workspace-focus"
        placeholder={placeholder}
      />
      <p id={helpId} className="m-0 flex justify-between gap-3 text-xs text-workspace-muted-strong">
        <span>Paste the text you want to review.</span>
        <span className="shrink-0 tabular-nums">{value.length.toLocaleString()} / {MAX_TEXT_CHARACTERS.toLocaleString()}</span>
      </p>
    </div>
  );
}

export function TextComposer({
  value, onChange, comparisonValue, onComparisonChange, compare, onCompareChange,
}: {
  value: string; onChange: (value: string) => void; comparisonValue: string;
  onComparisonChange: (value: string) => void; compare: boolean; onCompareChange: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-6">
      <TextField id="review-text" label="Text to review" value={value} onChange={onChange} placeholder="Paste your text here…" />
      <ComparisonToggle checked={compare} onChange={onCompareChange} />
      {compare && <TextField id="comparison-text" label="Comparison source" value={comparisonValue} onChange={onComparisonChange} placeholder="Paste the source to compare…" />}
    </div>
  );
}
