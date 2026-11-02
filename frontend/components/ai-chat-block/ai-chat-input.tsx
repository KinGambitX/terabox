"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconArrowUp, IconPaperclip, IconX } from "@tabler/icons-react";
import type { AttachmentOption, ChatAttachment } from "./types";
import { BrandButton } from "@/components/ui/brand-button";
import "./chat-composer.css";

export type AiChatInputAction = AttachmentOption & { hint?: string };
export type AiChatInputAttachment = ChatAttachment;
export type AiChatInputGlow = { color?: string; duration?: number; intensity?: number };
export type AiChatInputProps = {
  actions?: readonly AiChatInputAction[];
  disabled?: boolean;
  busy?: boolean;
  maxAttachments?: number;
  maxFileSizeBytes?: number;
  showVoice?: boolean;
  placeholder?: string;
  accentColor?: string;
  onSubmit: (message: string, attachments: AiChatInputAttachment[]) => void;
  onStop?: () => void;
  onListeningChange?: (listening: boolean) => void;
  onAttachmentError?: (message: string) => void;
  className?: string;
  label?: string;
  maxLength?: number;
};

function fileKind(file: File): ChatAttachment["kind"] {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

export function AiChatInput({
  actions = [], disabled, busy, maxAttachments = 10, maxFileSizeBytes,
  placeholder = "Message SourceLens…", onSubmit, onStop, onAttachmentError,
  className = "", label = "Message SourceLens", maxLength = 6000,
}: AiChatInputProps) {
  const picker = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const reduceMotion = useReducedMotion();
  const accept = actions.map((item) => item.accept).filter(Boolean).join(",");

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const available = Math.max(0, maxAttachments - attachments.length);
    if (selected.length > available) onAttachmentError?.(`Add up to ${maxAttachments} files.`);
    const valid = selected.slice(0, available).filter((file) => {
      if (!file.size) { onAttachmentError?.(`${file.name} is empty.`); return false; }
      if (maxFileSizeBytes && file.size > maxFileSizeBytes) {
        onAttachmentError?.(`${file.name} exceeds the ${Math.round(maxFileSizeBytes / 1048576)} MB limit.`);
        return false;
      }
      return true;
    });
    setAttachments((current) => [...current, ...valid.map((file) => ({
      id: crypto.randomUUID(), name: file.name, kind: fileKind(file), size: file.size, file,
    }))]);
  }

  function submit() {
    const message = value.trim();
    if (disabled || busy) return;
    if (!message && attachments.length === 0) {
      picker.current?.focus();
      onAttachmentError?.("Type a message or attach a file to begin.");
      return;
    }
    onSubmit(message, attachments);
    setValue("");
    setAttachments([]);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className={`source-composer-frame rounded-2xl border border-divider bg-surface p-3 shadow-sm sm:p-4 ${className}`}>
      {attachments.length > 0 && <ul className="mb-3 flex flex-wrap gap-2" aria-label="Attached files">
        <AnimatePresence initial={false}>{attachments.map((item) => <motion.li key={item.id} initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(4px)" }} animate={{ opacity: 1, transform: "translateY(0)" }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(-4px)" }} transition={{ duration: reduceMotion ? 0.06 : 0.16 }} className="flex max-w-full items-center gap-2 rounded-lg border border-divider bg-surface-raised px-2.5 py-1.5 text-xs text-copy">
          <span className="max-w-52 truncate">{item.name}</span>
          <button type="button" aria-label={`Remove ${item.name}`} onClick={() => setAttachments((current) => current.filter((file) => file.id !== item.id))} className="grid size-7 shrink-0 place-items-center rounded-md text-muted-text hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-review"><IconX size={14} aria-hidden="true" /></button>
        </motion.li>)}</AnimatePresence>
      </ul>}
      <label className="sr-only" htmlFor="source-lens-prompt">{label}</label>
      <textarea id="source-lens-prompt" value={value} maxLength={maxLength} rows={3} disabled={disabled || busy} onChange={(event) => setValue(event.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} className="min-h-24 w-full resize-y bg-transparent px-1 py-2 text-sm leading-6 text-ink outline-none placeholder:text-subtle disabled:opacity-55" />
      <div className="mt-2 flex items-center justify-between border-t border-divider pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-text">
          <button type="button" onClick={() => picker.current?.click()} disabled={disabled || busy} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-3 transition-colors duration-150 hover:bg-surface-hover active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-review disabled:opacity-50"><IconPaperclip size={16} aria-hidden="true" /> Add files</button>
          <span className="hidden sm:inline">Text, source files, PDF, or DOCX</span>
        </div>
        <BrandButton type="button" onClick={busy ? onStop : submit} disabled={disabled || busy || (!value.trim() && attachments.length === 0)} className="h-10 gap-2 px-4 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-review">
          {busy ? "Comparing…" : <>Review <IconArrowUp size={15} aria-hidden="true" /></>}
        </BrandButton>
      </div>
      <input id="source-lens-files" ref={picker} type="file" multiple accept={accept || undefined} className="sr-only" onChange={chooseFiles} />
    </div>
  );
}

export default AiChatInput;
