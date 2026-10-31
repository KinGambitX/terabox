import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SYNAPSE AI — Autonomous Multimodal Intelligence & Edge Runtime",
  description:
    "Next-generation autonomous AI reasoning engine. Sub-15ms edge inference, directed acyclic graph (DAG) agent orchestration, hardware secure enclaves, and drop-in SDK compatibility.",
  keywords: [
    "AI product landing page",
    "autonomous agents",
    "edge inference",
    "sub-15ms latency",
    "multimodal AI",
    "speculative decoding",
  ],
  authors: [{ name: "Synapse Systems" }],
  openGraph: {
    title: "SYNAPSE AI — Autonomous Multimodal Intelligence",
    description: "The AI engine built for exponential builders. Sub-15ms latency and zero data retention.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#06070a] text-zinc-100 font-sans selection:bg-indigo-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
