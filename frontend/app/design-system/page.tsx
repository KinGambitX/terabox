import Link from "next/link";
import { BrandButton } from "@/components/ui/brand-button";
import { Button } from "@/components/ui/button";
import { SourceLensLogo } from "@/components/brand/sourcelens-logo";

const palette = [
  { name: "Canvas", value: "#0A0A0A", color: "bg-[#0a0a0a]" },
  { name: "Surface", value: "#111111", color: "bg-[#111111]" },
  { name: "Raised", value: "#171717", color: "bg-[#171717]" },
  { name: "Divider", value: "#262626", color: "bg-[#262626]" },
  { name: "Primary text", value: "#F5F5F5", color: "bg-[#f5f5f5]" },
  { name: "Muted text", value: "#A3A3A3", color: "bg-[#a3a3a3]" },
  { name: "Source blue", value: "#38BDF8", color: "bg-sky-400" },
  { name: "Code orange", value: "#FB923C", color: "bg-orange-400" },
  { name: "Semantic violet", value: "#A78BFA", color: "bg-violet-400" },
  { name: "Reviewed green", value: "#4ADE80", color: "bg-green-400" },
  { name: "Needs review", value: "#FBBF24", color: "bg-amber-400" },
  { name: "High overlap", value: "#FB7185", color: "bg-rose-400" },
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-divider">
        <div className="mx-auto flex h-[68px] max-w-[1120px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-ink">
            <SourceLensLogo size={25} />
          </Link>
          <Link href="/" className="text-sm text-muted-text transition-colors hover:text-ink">Home</Link>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <div className="max-w-[680px] border-b border-divider pb-9">
          <p className="mb-4 text-xs text-muted-text">FOUNDATIONS · 2026</p>
          <h1 className="text-3xl font-medium tracking-[-0.045em] sm:text-4xl">SourceLens design system</h1>
          <p className="mt-4 max-w-[58ch] text-[15px] leading-7 text-muted-text">
            A dark, quiet interface: near-black canvas, charcoal surfaces, precise type, and color reserved for meaningful signals.
          </p>
        </div>

        <section className="border-b border-divider py-9" aria-labelledby="color-title">
          <h2 id="color-title" className="mb-5 text-lg font-medium tracking-[-0.02em]">Color</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {palette.map((color) => (
              <article key={color.name} className="overflow-hidden rounded-lg border border-divider bg-surface-raised">
                <div className={`h-16 border-b border-divider ${color.color}`} />
                <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-xs text-copy">{color.name}</span>
                  <code className="font-mono text-[10px] text-muted-text">{color.value}</code>
                </div>
              </article>
            ))}
          </div>
            <p className="mt-4 text-sm leading-6 text-muted-text">Color marks source types and review states. Primary actions use a white capsule with a subtle radial texture and dark text.</p>
        </section>

        <section className="grid gap-9 border-b border-divider py-9 sm:grid-cols-2" aria-label="Typography and logo">
          <div>
            <h2 className="mb-5 text-lg font-medium tracking-[-0.02em]">Typography</h2>
            <div className="space-y-4 rounded-lg border border-divider bg-surface-raised p-5">
              <div><p className="text-xs text-muted-text">Display · Inter</p><p className="mt-1 text-2xl font-medium tracking-[-0.04em]">Review the evidence</p></div>
              <div className="border-t border-divider pt-4"><p className="text-xs text-muted-text">Interface · Inter</p><p className="mt-1 text-sm leading-6 text-copy">Similarity is a signal for human review, not a verdict.</p></div>
              <code className="block border-t border-divider pt-4 font-mono text-xs text-muted-text">SL-2408 · page 02 · lines 14–18</code>
            </div>
          </div>
          <div>
            <h2 className="mb-5 text-lg font-medium tracking-[-0.02em]">Logo</h2>
            <div className="flex min-h-[186px] items-center gap-3 rounded-lg border border-divider bg-surface-raised p-6">
              <SourceLensLogo size={42} />
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-text">Sift is the SourceLens mascot: a small source page with a curious lens. Use the same mark on the site, workspace, and app icon.</p>
          </div>
        </section>

        <section className="border-b border-divider py-9" aria-labelledby="controls-title">
          <h2 id="controls-title" className="mb-5 text-lg font-medium tracking-[-0.02em]">Controls and surfaces</h2>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-divider bg-surface-raised p-5">
            <BrandButton className="h-10 px-5 text-sm">Open workspace</BrandButton>
            <Button variant="outline" className="h-10 rounded-full px-5 text-sm">Secondary action</Button>
            <span className="rounded-full border border-divider px-3 py-1.5 text-xs text-muted-text">Quiet metadata</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-text">Panels stay flat. Thin borders and tonal steps separate sections; shadows are reserved for things that float.</p>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 pt-6 text-xs text-muted-text">
          <span>SourceLens · Evidence for fair, informed review</span>
          <Link href="/workspace" className="hover:text-ink">Workspace</Link>
        </footer>
      </div>
    </main>
  );
}
