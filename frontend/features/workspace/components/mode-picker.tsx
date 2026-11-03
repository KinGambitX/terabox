"use client";

import { useRef } from "react";
import type { ReviewMode } from "../types/workspace";

const modes: ReviewMode[] = ["text", "code", "file"];

export function ModePicker({ value, onChange }: { value: ReviewMode; onChange: (mode: ReviewMode) => void }) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  function moveFocus(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + direction + modes.length) % modes.length;
    buttons.current[next]?.focus();
    onChange(modes[next]);
  }

  return (
    <div role="tablist" aria-label="Input type" className="flex gap-7 border-b border-workspace-line">
      {modes.map((mode, index) => {
        const selected = value === mode;
        return (
          <button
            key={mode}
            id={`workspace-tab-${mode}`}
            ref={(element) => { buttons.current[index] = element; }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls="workspace-composer-panel"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(mode)}
            onKeyDown={(event) => moveFocus(event, index)}
            className={`-mb-px min-h-10 cursor-pointer border-b-2 px-0.5 text-sm capitalize outline-2 outline-transparent outline-offset-2 transition-colors duration-150 ease-out focus-visible:outline-workspace-focus motion-reduce:transition-none ${selected ? "border-workspace-action font-medium text-workspace-ink" : "border-transparent font-normal text-workspace-muted-strong hover:text-workspace-ink"}`}
          >
            {mode}
          </button>
        );
      })}
    </div>
  );
}
