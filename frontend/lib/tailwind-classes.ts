const styles: Record<string, string> = {
  "workspace-stage": "min-h-svh w-full bg-workspace-paper",
  workspace: "relative grid min-h-svh w-full grid-cols-[232px_minmax(0,1fr)] overflow-clip bg-workspace-paper scheme-light max-[1100px]:grid-cols-[205px_minmax(0,1fr)] max-[800px]:grid-cols-1",
  sidebar: "sticky top-0 flex min-h-full flex-col border-r border-workspace-border bg-workspace-paper px-3.5 pt-5 pb-3 max-[800px]:relative max-[800px]:h-[58px] max-[800px]:min-h-0 max-[800px]:flex-row max-[800px]:items-center max-[800px]:justify-between max-[800px]:border-r-0 max-[800px]:border-b max-[800px]:py-0",
  brand: "inline-flex w-fit items-center gap-2 px-2 text-workspace-ink max-[800px]:px-0",
  "skip-link": "fixed -top-20 left-2 z-30 rounded-md bg-workspace-action px-3 py-2 text-xs text-white focus-visible:top-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-workspace-info",
  "mobile-menu-toggle": "hidden h-10 w-10 place-items-center rounded-md bg-transparent text-workspace-copy hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-info max-[800px]:grid",
  "nav-label": "mt-6 mb-2 px-2 text-[10px] text-workspace-muted max-[800px]:hidden",
  "side-nav": "grid gap-1 max-[800px]:hidden",
  "nav-item": "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[12px] text-workspace-copy transition-colors hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-info [&_svg]:text-workspace-muted",
  "nav-item active": "flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md bg-workspace-action px-2.5 text-[12px] font-medium text-white [&_svg]:text-white",
  "sidebar-bottom": "mt-auto grid gap-3 max-[800px]:hidden",
  "privacy-note": "flex gap-2.5 border-t border-workspace-border px-2 py-3 text-workspace-info [&_span]:grid [&_span]:gap-1 [&_strong]:text-[10px] [&_strong]:font-semibold [&_strong]:text-workspace-ink [&_small]:max-w-[160px] [&_small]:text-[10px] [&_small]:leading-[1.45] [&_small]:text-workspace-muted",
  "mobile-nav-panel": "absolute top-[58px] right-3 left-3 z-20 grid gap-1 rounded-b-xl border border-workspace-border bg-workspace-paper p-3 shadow-lg min-[801px]:hidden [&_a]:flex [&_a]:min-h-11 [&_a]:cursor-pointer [&_a]:items-center [&_a]:gap-2.5 [&_a]:rounded-md [&_a]:px-2.5 [&_a]:text-[12px] [&_a]:text-workspace-copy",
  "main-column": "min-w-0 bg-workspace-paper",
  topbar: "flex h-[56px] items-center justify-between border-b border-workspace-border px-7 text-workspace-muted max-[800px]:h-[48px] max-[800px]:px-4 max-[560px]:px-3",
  "content-sheet": "min-h-[calc(100svh-80px)] scroll-mt-16 px-7 pt-5 pb-5 max-[1100px]:px-5 max-[800px]:min-h-0 max-[800px]:px-4 max-[800px]:pt-4 max-[560px]:px-3",
  "page-heading": "flex items-end justify-between gap-4 max-[560px]:items-start max-[560px]:flex-col max-[560px]:gap-3 [&_h1]:mb-1 [&_h1]:font-heading [&_h1]:text-[22px] [&_h1]:leading-tight [&_h1]:font-semibold [&_h1]:tracking-[-.6px] max-[560px]:[&_h1]:text-[20px]",
  eyebrow: "mb-1 text-[10px] text-workspace-muted",
  "page-subtitle": "m-0 text-[12px] text-workspace-copy",
  "hero-panel": "relative mb-5 grid min-h-[164px] grid-cols-[minmax(0,1fr)_42%] overflow-clip rounded-xl border border-workspace-border bg-workspace-soft max-[650px]:grid-cols-1",
  "hero-copy": "relative z-10 flex flex-col items-start justify-center p-5 sm:p-6 [&_h2]:max-w-[460px] [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:tracking-[-.5px] [&_h2]:text-workspace-ink [&_p]:mt-2 [&_p]:max-w-[440px] [&_p]:text-[12px] [&_p]:leading-relaxed [&_p]:text-workspace-copy",
  "hero-photo": "relative min-h-[164px] min-w-0 bg-cover bg-center [clip-path:inset(0_round_0_0.75rem_0.75rem_0)] [mask-image:linear-gradient(90deg,transparent_0%,black_24%,black_100%)] max-[650px]:hidden",
  "text-link": "inline-flex items-center gap-1 text-[11px] font-medium text-workspace-info hover:underline hover:underline-offset-2 focus-visible:outline-2 focus-visible:outline-workspace-info",
  "page-footer": "mt-5 flex items-center gap-4 border-t border-workspace-border pt-3 text-[12px] text-workspace-copy max-[560px]:flex-wrap max-[560px]:gap-x-3 max-[560px]:gap-y-2 [&_span:first-child]:font-medium [&_a]:ml-auto [&_a]:text-workspace-copy max-[560px]:[&_span:nth-child(2)]:order-3 max-[560px]:[&_span:nth-child(2)]:w-full",
  "drawer-backdrop": "fixed inset-0 z-30 flex justify-end overscroll-contain bg-workspace-ink/45",
  "review-drawer": "flex h-dvh w-full max-w-[470px] flex-col overflow-y-auto overscroll-contain border-l border-workspace-border bg-workspace-paper shadow-[-12px_0_40px_rgb(23_23_23_/_10%)]",
  "drawer-header": "border-b border-workspace-border px-5 pt-5 pb-4 [&>div]:flex [&>div]:items-center [&>div]:justify-between [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:font-heading [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:tracking-[-.4px] [&_h2]:text-workspace-ink [&_p]:m-0 [&_p]:text-[11px] [&_p]:text-workspace-muted",
  "drawer-id": "font-mono text-[10px] text-workspace-muted",
  "drawer-close": "relative grid h-9 w-9 place-items-center rounded-md border border-workspace-border bg-workspace-paper text-workspace-muted hover:bg-workspace-hover focus-visible:outline-2 focus-visible:outline-workspace-info",
  "drawer-score": "border-b border-workspace-border px-5 pt-4 pb-4 [&>div]:mb-2.5 [&>div]:flex [&>div]:items-baseline [&>div]:justify-between [&>div>span]:text-[11px] [&>div>span]:text-workspace-muted [&>div>strong]:text-[24px] [&>div>strong]:font-medium [&>div>strong]:tabular-nums [&>div>strong]:text-workspace-danger [&>p]:mt-3 [&>p]:mb-0 [&>p]:text-[10px] [&>p]:leading-relaxed [&>p]:text-workspace-copy",
  "evidence-section": "grid content-start gap-2.5 px-5 py-4 [&>h3]:mb-px [&>h3]:flex [&>h3]:justify-between [&>h3]:text-[12px] [&>h3]:font-semibold [&>h3]:text-workspace-ink [&>h3>span]:text-[10px] [&>h3>span]:font-normal [&>h3>span]:text-workspace-muted",
  "evidence-card": "rounded-lg border border-workspace-border bg-workspace-paper p-3 [&_h4]:mt-2.5 [&_h4]:mb-1 [&_h4]:text-[10px] [&_h4]:font-semibold [&_h4]:text-workspace-ink [&_p]:mb-2 [&_p]:border-l-2 [&_p]:border-workspace-info [&_p]:pl-2 [&_p]:text-[10px] [&_p]:leading-relaxed [&_p]:text-workspace-copy [&_.text-link]:text-[10px]",
  "evidence-meta": "flex items-center gap-1.5 text-[10px] text-workspace-muted [&_strong]:font-medium [&_strong]:text-workspace-ink [&_span]:ml-auto [&_span]:text-[9px] [&_span]:text-workspace-info",
  "drawer-footer": "mt-auto flex justify-end gap-2 border-t border-workspace-border px-5 py-3",
};

export function tw(...names: string[]) {
  return names.flatMap((name) => {
    if (styles[name]) return [styles[name]];
    return name.split(/\s+/).map((token) => styles[token] ?? token);
  }).join(" ");
}
