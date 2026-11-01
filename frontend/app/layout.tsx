import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${inter.variable} ${geistMono.variable} h-full overflow-x-clip antialiased [scrollbar-color:var(--muted)_var(--canvas)]`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-background font-sans text-foreground selection:bg-workspace-info selection:text-white">{children}</body>
    </html>
  );
}
