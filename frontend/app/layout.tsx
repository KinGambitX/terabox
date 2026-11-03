import type { Metadata } from "next";
import { Geist_Mono, Inter, Newsreader } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SourceLens — Review similarity with evidence",
  description: "Compare documents and source code, inspect similarity evidence, and keep the human reviewer in control.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} ${newsreader.variable} h-full overflow-x-clip antialiased [scrollbar-color:var(--workspace-action)_var(--workspace-ground)]`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-background font-sans text-foreground selection:bg-workspace-highlight selection:text-workspace-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
