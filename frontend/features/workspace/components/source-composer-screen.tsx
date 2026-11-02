"use client";

import AiChatBlock from "@/components/ai-chat-block/ai-chat-block";
import { WorkspaceShell } from "./workspace-shell";
import { submitComposerInput } from "../api/source-composer-client";

export function SourceComposerScreen({ maxUploadMb }: { maxUploadMb: number }) {
  return <WorkspaceShell active="overview" appearance="dark">
    <section className="h-[calc(100dvh-9rem)] min-h-[30rem] max-[800px]:h-[calc(100dvh-8rem)] max-[800px]:min-h-[24rem]">
      <AiChatBlock
        onSend={submitComposerInput}
        maxFileSizeBytes={maxUploadMb * 1024 * 1024}
        maxAttachments={10}
        title="What should we review?"
        description="Paste text or code, add a document or source file, or enter a public URL to find comparison evidence."
        emptyMessage="Submissions are compared with saved work in your workspace."
        fullScreen={false}
      />
    </section>
  </WorkspaceShell>;
}
