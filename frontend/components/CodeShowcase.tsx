"use client";

import { useState } from "react";
import { Code2, Terminal, Copy, Check, Sparkles, Cpu, Layers } from "lucide-react";

type CodeLang = "typescript" | "python" | "curl" | "rust";

const CODE_EXAMPLES: Record<CodeLang, { label: string; file: string; code: string }> = {
  typescript: {
    label: "TypeScript / Node",
    file: "agent.ts",
    code: `import { SynapseClient } from "@synapse-ai/core";

// Initialize low-latency client with edge clustering
const client = new SynapseClient({
  apiKey: process.env.SYNAPSE_API_KEY,
  routing: "lowest-latency", // Automatic Anycast routing
});

async function main() {
  // Stream multi-step autonomous reasoning
  const session = await client.agents.create({
    model: "synapse-ultra-3.5",
    tools: ["web_search", "code_sandbox", "vector_memory"],
    temperature: 0.1,
  });

  const stream = await session.executeStream({
    prompt: "Analyze Q3 market volatility and execute hedging calculation",
  });

  for await (const chunk of stream) {
    if (chunk.type === "reasoning_step") {
      console.log("Thought:", chunk.step);
    } else if (chunk.type === "token") {
      process.stdout.write(chunk.text);
    }
  }
}

main();`,
  },
  python: {
    label: "Python",
    file: "pipeline.py",
    code: `import os
from synapse import SynapseClient, AsyncAgent

client = SynapseClient(
    api_key=os.environ["SYNAPSE_API_KEY"],
    cluster="global-edge"
)

async def run_pipeline():
    agent = await client.agents.spawn(
        model="synapse-ultra-3.5",
        memory_retention="zero_persistence",
        concurrency=16
    )

    # Real-time multimodal batch inference
    results = await agent.process_multimodal(
        video_stream="rtsp://cluster/stream_01",
        task="Detect anomalous mechanical vibrations",
        alert_webhook="https://ops.internal/alerts"
    )
    print(f"Confidence score: {results.confidence:.4f}")`,
  },
  curl: {
    label: "cURL",
    file: "request.sh",
    code: `curl -X POST https://api.synapse.ai/v1/chat/completions \\
  -H "Authorization: Bearer $SYNAPSE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "synapse-ultra-3.5",
    "stream": true,
    "temperature": 0.2,
    "messages": [
      {"role": "system", "content": "You are a sub-15ms autonomous reasoning agent."},
      {"role": "user", "content": "Synthesize distributed consensus proof"}
    ]
  }'`,
  },
  rust: {
    label: "Rust",
    file: "src/main.rs",
    code: `use synapse_rs::{SynapseClient, StreamExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = SynapseClient::from_env()?;
    let mut stream = client
        .stream("synapse-ultra-3.5")
        .prompt("Generate high-speed SIMD matrix multiplication")
        .send()
        .await?;

    while let Some(token) = stream.next().await {
        print!("{}", token?.as_str());
    }
    Ok(())
}`,
  },
};

export default function CodeShowcase() {
  const [activeLang, setActiveLang] = useState<CodeLang>("typescript");
  const [copied, setCopied] = useState(false);

  const currentSnippet = CODE_EXAMPLES[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="sdk" className="relative py-28 bg-[#06070a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-cyan-400 mb-4">
            <Code2 className="w-3.5 h-3.5" />
            <span>DEVELOPER FIRST EXPERIENCE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Deploy in Less Than 5 Lines of Code
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            SDKs in TypeScript, Python, Rust, and Go with full type safety, built-in retry mechanics, and zero-overhead streaming.
          </p>
        </div>

        {/* Code Showcase Window */}
        <div className="max-w-5xl mx-auto glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#080911]">
          
          {/* Top Bar with Language Tabs & Copy Button */}
          <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-white/[0.02]">
            
            {/* Language Tabs */}
            <div className="flex items-center gap-1 sm:gap-2">
              {(Object.keys(CODE_EXAMPLES) as CodeLang[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    activeLang === lang
                      ? "bg-violet-600/30 text-white border border-violet-500/40 font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                  }`}
                >
                  {CODE_EXAMPLES[lang].label}
                </button>
              ))}
            </div>

            {/* Right actions: file name and copy button */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-mono text-xs text-zinc-500">
                {currentSnippet.file}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-colors border border-white/5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 sm:p-6 overflow-x-auto font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed bg-[#05060b]">
            <pre className="selection:bg-violet-500/30">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>

          {/* Quick Terminal CLI Bar */}
          <div className="px-6 py-3.5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Quickstart CLI:</span>
              <code className="text-white bg-white/5 px-2 py-1 rounded border border-white/5">
                npx synapse-cli init my-ai-project
              </code>
            </div>
            <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Zero build config • Auto-detects runtime
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
