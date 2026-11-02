"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";
import { SourceLensLogo } from "@/components/brand/sourcelens-logo";
import { BrandButton } from "@/components/ui/brand-button";
import { tw } from "@/lib/tailwind-classes";
import {
  IconBook2,
  IconFileText,
  IconLayoutDashboard,
  IconMenu2,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";

const navigation = [
  { id: "overview", label: "Overview", href: "/workspace", icon: IconLayoutDashboard },
  { id: "submissions", label: "Submissions", href: "/workspace/submissions", icon: IconFileText },
  { id: "sources", label: "Source library", href: "/workspace/sources", icon: IconBook2 },
] as const;

export type WorkspaceSection = (typeof navigation)[number]["id"];

function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-workspace-info" href="/" aria-label="SourceLens home">
      <SourceLensLogo size={36} showWordmark className={tw(dark ? "brand-dark" : "brand")} />
    </Link>
  );
}

export function WorkspaceShell({
  active,
  children,
  appearance = "light",
}: {
  active: WorkspaceSection;
  children: ReactNode;
  appearance?: "light" | "dark";
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dark = appearance === "dark";

  return (
    <div className={tw(dark ? "workspace-stage-dark" : "workspace-stage")}>
      <a className={tw("skip-link")} href="#main-content">Skip to content</a>
      <div className={tw(dark ? "workspace-dark" : "workspace")}>
        <aside className={tw(dark ? "sidebar-dark" : "sidebar")}>
          <Brand dark={dark} />
          <button
            className={`${tw(dark ? "mobile-menu-toggle-dark" : "mobile-menu-toggle")} cursor-pointer active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50`}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <IconX size={19} /> : <IconMenu2 size={19} />}
          </button>
          <p className={tw(dark ? "nav-label-dark" : "nav-label")}>Workspace</p>
          <nav className={tw("side-nav")} aria-label="Main navigation">
            {navigation.map(({ id, label, href, icon: Icon }) => (
              <Link className={tw(dark ? (id === active ? "nav-item-dark active-dark" : "nav-item-dark") : (id === active ? "nav-item active" : "nav-item"))} href={href} key={id} aria-current={id === active ? "page" : undefined}>
                <Icon size={18} stroke={1.8} />{label}
              </Link>
            ))}
          </nav>
          <div className={tw("sidebar-bottom")}>
            <div className={tw(dark ? "privacy-note-dark" : "privacy-note")}><IconShieldCheck size={18} stroke={1.8} /><span><strong>Private by default</strong><small>Submissions stay in your workspace.</small></span></div>
          </div>
        </aside>
        {mobileNavOpen && (
          <nav className={tw(dark ? "mobile-nav-panel-dark" : "mobile-nav-panel")} id="mobile-navigation" aria-label="Mobile navigation">
            {navigation.map(({ id, label, href, icon: Icon }) => (
              <Link href={href} key={id} onClick={() => setMobileNavOpen(false)} aria-current={id === active ? "page" : undefined}>
                <Icon size={18} />{label}
              </Link>
            ))}
          </nav>
        )}
        <main className={tw(dark ? "main-column-dark" : "main-column")}>
          <header className={tw(dark ? "topbar-dark" : "topbar")}>
            <BrandButton asChild tone={dark ? "radial" : "ink"} size="sm" className="h-9 gap-2 px-3.5 text-[11px]">
              <Link href="/submissions/new"><IconFileText size={15} aria-hidden="true" />New submission</Link>
            </BrandButton>
          </header>
          <div className={tw(dark ? "content-sheet-dark" : "content-sheet")} id="main-content" tabIndex={-1}>
            {children}
            <footer className={tw(dark ? "page-footer-dark" : "page-footer")}><span>SourceLens</span><span>Similarity evidence for human review.</span>{process.env.NODE_ENV !== "production" && <Link href="/design-system">Design system</Link>}</footer>
          </div>
        </main>
      </div>
    </div>
  );
}
