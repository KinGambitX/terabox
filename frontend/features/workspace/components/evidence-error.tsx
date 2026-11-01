"use client";

import { useRouter } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function EvidenceError({ message }: { message: string }) {
  const router = useRouter();
  return <div className="rounded-lg border border-workspace-danger/30 bg-workspace-paper p-5" role="alert"><h1 className="m-0 text-[15px] font-semibold text-workspace-ink">Evidence could not be loaded</h1><p className="mb-4 mt-2 text-[11px] leading-relaxed text-workspace-muted">{message}</p><Button type="button" variant="outline" className="h-9 cursor-pointer gap-2 rounded-md border-workspace-border px-3 text-[11px]" onClick={() => router.refresh()}><IconRefresh size={14} aria-hidden="true" />Try again</Button></div>;
}
