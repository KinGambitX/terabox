import Link from "next/link";
import { BrandButton } from "@/components/ui/brand-button";
import { SourceLensLogo } from "@/components/brand/sourcelens-logo";
import { LandingHero } from "@/features/marketing/components/landing-hero";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex h-[72px] w-full max-w-[1280px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          aria-label="SourceLens home"
          className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
        >
          <SourceLensLogo size={27} />
        </Link>
        <BrandButton asChild size="sm" className="h-9 px-4 text-xs font-medium">
          <Link href="/workspace">Open workspace</Link>
        </BrandButton>
      </header>
      <LandingHero />
    </main>
  );
}
