"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowUpRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    category: "Architecture",
    question: "How does Synapse achieve 14ms Time-To-First-Token (TTFT) latency?",
    answer:
      "We utilize proprietary Distributed Speculative Drafting (DSD) combined with direct NVLink-interconnected H100 clusters deployed across 35+ global edge points of presence. By caching speculative attention trees in high-speed SRAM, we bypass traditional autoregressive memory bus bottlenecks, achieving over 3x the speed of standard cloud APIs.",
  },
  {
    category: "Security",
    question: "Is prompt or completion data ever retained or used for model training?",
    answer:
      "Never. All inference runs inside isolated hardware secure enclaves (AWS Nitro Enclaves & AMD SEV-SNP). We provide an absolute zero-retention guarantee verified by independent SOC2 Type II and HIPAA auditors. Inputs exist solely in ephemeral volatile memory for the duration of token generation and are cryptographically scrubbed immediately upon stream termination.",
  },
  {
    category: "Migration",
    question: "Can we migrate our existing OpenAI or Anthropic codebase with zero rewrite?",
    answer:
      "Yes. Synapse provides 100% drop-in API compatibility with the OpenAI and Anthropic REST specifications. Simply update your baseURL to `https://api.synapse.ai/v1` and supply your `SYNAPSE_API_KEY`. You can keep your existing SDK wrappers, structured output schemas, and tool calling definitions intact.",
  },
  {
    category: "Autonomous Agents",
    question: "How does the autonomous agent orchestrator handle runtime failures?",
    answer:
      "Synapse's Directed Acyclic Graph (DAG) executor features native speculative rollback checkpoints. If a sub-agent encounters a failed API request, rate limit, or invalid JSON output, the orchestrator automatically spawns an auto-remediation node to rectify the syntax and retry without failing the overarching pipeline.",
  },
  {
    category: "Deployment",
    question: "Can we run Synapse self-hosted or inside our own air-gapped VPC?",
    answer:
      "Enterprise customers can deploy Synapse directly into their own AWS, GCP, Azure VPC, or bare-metal Kubernetes clusters using our verified Helm charts. We provide full air-gapped operation with local weights, eliminating all external telemetry dependencies.",
  },
  {
    category: "Custom Models",
    question: "Does Synapse support custom LoRA adapters and proprietary fine-tuning?",
    answer:
      "Yes. You can upload custom LoRA adapter weights or initiate full RLHF fine-tuning jobs through our CLI. Our dynamic adapter routing loads individual tenant weights with zero cold-start delay onto shared base models in less than 4 milliseconds.",
  },
];

export default function FaqSection({ onOpenDemoModal }: { onOpenDemoModal: () => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-28 bg-[#07080d] overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-cyan-400 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Answered Architecture
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            Everything you need to know about the engine, privacy enclaves, and enterprise SLAs.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5 shrink-0 hidden sm:inline-block">
                      {item.category}
                    </span>
                    <span className="font-semibold text-white text-sm sm:text-base">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Callout Banner */}
        <div className="mt-12 text-center p-6 rounded-2xl glass-card border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-white text-sm">Have specific compliance or custom SLA needs?</h4>
            <p className="text-xs text-zinc-400">Our machine learning infrastructure team is available for deep architectural deep-dives.</p>
          </div>
          <button
            onClick={onOpenDemoModal}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs flex items-center gap-2 border border-white/10 transition-colors shrink-0"
          >
            <span>Speak with an Engineer</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

      </div>
    </section>
  );
}
