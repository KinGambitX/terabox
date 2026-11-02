"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { IconArrowUpRight, IconFileText } from "@tabler/icons-react";
import ChatComposer from "./chat-composer";
import type { ChatAttachment, ChatRequest, ChatResponse, ChatTurn } from "./types";

export type AiChatBlockProps = {
  onSend: (request: ChatRequest & { mode: "text" | "code" | "link"; codeExtension: "py" | "java" | "c" | "cpp" | "js" | "ts" | "cs" | "go" }) => Promise<ChatResponse>;
  initialMessages?: readonly ChatTurn[];
  title?: string;
  description?: string;
  assistantName?: string;
  userName?: string;
  attachmentOptions?: readonly { id: string; label: string; accept: string; multiple?: boolean }[];
  maxAttachments?: number;
  maxFileSizeBytes?: number;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  fullScreen?: boolean;
};

const sourceFiles = [
  { id: "documents", label: "Documents and text", accept: ".pdf,.docx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document", multiple: true },
  { id: "code", label: "Source code", accept: ".py,.java,.c,.cpp,.js,.ts,.cs,.go", multiple: true },
] as const;
type CodeExtension = "py" | "java" | "c" | "cpp" | "js" | "ts" | "cs" | "go";

function MessageText({ children }: { children: string }) {
  const pieces = children.split(/(\/submissions\/[^\s)]+)/g);
  return <>{pieces.map((piece, index) => piece.startsWith("/submissions/")
    ? <Link key={`${piece}-${index}`} href={piece} className="inline-flex items-center gap-1 text-review underline decoration-review/35 underline-offset-4 hover:text-review">Open evidence<IconArrowUpRight size={13} aria-hidden="true" /></Link>
    : <span key={`${piece}-${index}`}>{piece}</span>)}</>;
}

export default function AiChatBlock({
  onSend, title = "Start a review", description = "Add text, source code, or a file. SourceLens compares it with your saved submissions.",
  assistantName = "SourceLens", maxAttachments = 10, maxFileSizeBytes = 20 * 1024 * 1024,
  placeholder = "Paste text, code, or a public URL…", emptyMessage = "Your review will appear here.", className = "", fullScreen = true,
}: AiChatBlockProps) {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"text" | "code" | "link">("text");
  const [codeExtension, setCodeExtension] = useState<CodeExtension>("py");
  const reduceMotion = useReducedMotion();

  async function send(message: string, attachments: ChatAttachment[]) {
    const prompt = message.trim();
    const summary = [prompt, ...attachments.map((file) => `Attached: ${file.name}`)].filter(Boolean).join("\n");
    const userTurn: ChatTurn = { id: crypto.randomUUID(), role: "user", content: summary, attachments };
    setMessages((current) => [...current, userTurn]);
    setBusy(true);
    setError("");
    try {
      const response = await onSend({ message: prompt, attachments, mode, codeExtension, signal: new AbortController().signal });
      let content = "";
      if (typeof response === "string") content = response;
      else for await (const chunk of response) {
        if (typeof chunk === "string") content += chunk;
        else if (Array.isArray(chunk)) content += chunk.map(String).join("");
        else if (chunk && typeof chunk === "object") {
          const part = chunk as { text?: unknown; content?: unknown; delta?: unknown };
          content += String(part.delta ?? part.content ?? part.text ?? "");
        }
      }
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", content, status: "complete" }]);
    } catch (cause) {
      const messageText = cause instanceof Error ? cause.message : "The review could not be completed. Try again.";
      setError(messageText);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={`flex min-h-0 flex-col bg-canvas text-ink ${fullScreen ? "h-dvh overflow-hidden" : "h-full"} ${className}`}>
      <header className="flex min-h-14 items-center justify-between border-b border-divider px-4 sm:px-6">
        <div><h1 className="m-0 text-sm font-semibold tracking-tight">Review conversation</h1><p className="m-0 mt-0.5 text-[11px] text-muted-text">Compare against saved work and public sources</p></div>
        <span className="hidden rounded-full border border-divider bg-surface px-3 py-1.5 text-[11px] text-muted-text sm:inline">Human review stays in control</span>
      </header>
      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-4 sm:px-8">
          {messages.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-divider bg-surface text-review"><IconFileText size={22} stroke={1.6} aria-hidden="true" /></div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-text">{description}</p>
            <p className="mt-7 text-xs text-subtle">PDF, DOCX, text, source code and public URLs</p>
          </div> : <div className="flex flex-col gap-6 py-8" aria-live="polite">
            {messages.map((turn) => <motion.article key={turn.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduceMotion ? 0.06 : 0.16 }} className={`max-w-[90%] rounded-2xl border px-4 py-3 text-sm leading-6 sm:max-w-[78%] ${turn.role === "user" ? "ml-auto border-divider bg-surface" : "border-divider/70 bg-transparent"}`}>
              <p className="m-0 whitespace-pre-wrap break-words"><MessageText>{turn.content}</MessageText></p>
              {turn.attachments?.length ? <ul className="mb-0 mt-2 flex flex-wrap gap-1.5" aria-label="Attached files">{turn.attachments.map((file) => <li key={file.id} className="rounded-md bg-surface-raised px-2 py-1 text-[11px] text-muted-text">{file.name}</li>)}</ul> : null}
            </motion.article>)}
            {busy && <p className="m-0 flex items-center gap-2 text-xs text-muted-text" role="status">Reviewing your submission <span className="inline-flex gap-1" aria-hidden="true">{[0, 1, 2].map((index) => <motion.span key={index} className="size-1 rounded-full bg-review" animate={reduceMotion ? { opacity: 1 } : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: reduceMotion ? 0 : Infinity, delay: index * 0.14 }} />)}</span></p>}
          </div>}
        </div>
        <div className="border-t border-divider bg-canvas px-4 pb-5 pt-4 sm:px-8 sm:pb-7">
          <div className="mx-auto w-full max-w-4xl">
            <label className="mb-2 flex w-fit items-center gap-2 text-xs text-muted-text">Paste as
              <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)} className="min-h-9 rounded-lg border border-divider bg-surface px-2.5 text-ink focus-visible:outline-2 focus-visible:outline-review">
                <option value="text">Text</option><option value="code">Source code</option><option value="link">Public URL</option>
              </select>
            </label>
            {mode === "code" && <label className="mb-2 ml-2 inline-flex items-center gap-2 text-xs text-muted-text">Language
              <select value={codeExtension} onChange={(event) => setCodeExtension(event.target.value as CodeExtension)} className="min-h-9 rounded-lg border border-divider bg-surface px-2.5 text-ink focus-visible:outline-2 focus-visible:outline-review">
                <option value="py">Python</option><option value="java">Java</option><option value="c">C</option><option value="cpp">C++</option><option value="js">JavaScript</option><option value="ts">TypeScript</option><option value="cs">C#</option><option value="go">Go</option>
              </select>
            </label>}
            {error && <p className="mb-2 text-xs text-danger" role="alert">{error}</p>}
            <ChatComposer actions={sourceFiles} maxAttachments={maxAttachments} maxFileSizeBytes={maxFileSizeBytes} placeholder={placeholder} busy={busy} onSubmit={send} onAttachmentError={setError} />
            <p className="mb-0 mt-3 text-center text-[11px] text-subtle">{assistantName} provides comparison evidence, not misconduct decisions. {emptyMessage}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
