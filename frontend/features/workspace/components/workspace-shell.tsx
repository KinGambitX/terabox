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

function Brand() {
  return (
    <Link className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-workspace-info" href="/" aria-label="SourceLens home">
      <SourceLensLogo size={36} showWordmark className={tw("brand")} />
    </Link>
  );
}

export function WorkspaceShell({
  active,
  children,
}: {
  active: WorkspaceSection;
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={tw("workspace-stage")}>
      <a className={tw("skip-link")} href="#main-content">Skip to content</a>
      <div className={tw("workspace")}>
        <aside className={tw("sidebar")}>
          <Brand />
          <button
            className={`${tw("mobile-menu-toggle")} cursor-pointer`}
            aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-navigation"
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            {mobileNavOpen ? <IconX size={19} /> : <IconMenu2 size={19} />}
          </button>
          <p className={tw("nav-label")}>Workspace</p>
          <nav className={tw("side-nav")} aria-label="Main navigation">
            {navigation.map(({ id, label, href, icon: Icon }) => (
              <Link className={tw(id === active ? "nav-item active" : "nav-item")} href={href} key={id} aria-current={id === active ? "page" : undefined}>
                <Icon size={18} stroke={1.8} />{label}
              </Link>
            ))}
          </nav>
          <div className={tw("sidebar-bottom")}>
            <div className={tw("privacy-note")}><IconShieldCheck size={18} stroke={1.8} /><span><strong>Private by default</strong><small>Submissions stay in your workspace.</small></span></div>
          </div>
        </aside>
        {mobileNavOpen && (
          <nav className={tw("mobile-nav-panel")} id="mobile-navigation" aria-label="Mobile navigation">
            {navigation.map(({ id, label, href, icon: Icon }) => (
              <Link href={href} key={id} onClick={() => setMobileNavOpen(false)} aria-current={id === active ? "page" : undefined}>
                <Icon size={18} />{label}
              </Link>
            ))}
          </nav>
        )}
        <main className={tw("main-column")}>
          <header className={tw("topbar")}>
            <BrandButton asChild tone="ink" size="sm" className="h-9 gap-2 px-3.5 text-[11px]">
              <Link href="/submissions/new"><IconFileText size={15} aria-hidden="true" />New submission</Link>
            </BrandButton>
          </header>
          <div className={tw("content-sheet")} id="main-content" tabIndex={-1}>
            {children}
            <footer className={tw("page-footer")}><span>SourceLens</span><span>Similarity evidence for human review.</span>{process.env.NODE_ENV !== "production" && <Link href="/design-system">Design system</Link>}</footer>
          </div>
        </main>
      </div>
    </div>
  );
}
