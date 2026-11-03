"use client";

export function ComparisonToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-workspace-copy">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 cursor-pointer rounded-sm accent-workspace-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-focus"
      />
      <span>Compare with another source</span>
    </label>
  );
}
