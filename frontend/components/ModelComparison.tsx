"use client";

import { useState } from "react";
import { Trophy, BarChart3, Clock, DollarSign, Brain, Check, TrendingUp } from "lucide-react";

type MetricCategory = "reasoning" | "coding" | "latency" | "pricing";

interface ModelScore {
  name: string;
  provider: string;
  score: number;
  displayValue: string;
  highlight?: boolean;
}

const BENCHMARKS: Record<MetricCategory, { title: string; subtitle: string; unit: string; higherIsBetter: boolean; models: ModelScore[] }> = {
  reasoning: {
    title: "MMLU-Pro Complex Reasoning",
    subtitle: "Evaluating rigorous multi-discipline logical deduction and multi-step math problems.",
    unit: "%",
    higherIsBetter: true,
    models: [
      { name: "Synapse Ultra 3.5", provider: "Synapse Engine", score: 94.6, displayValue: "94.6%", highlight: true },
      { name: "Claude 3.5 Sonnet", provider: "Anthropic", score: 93.1, displayValue: "93.1%" },
      { name: "GPT-4o", provider: "OpenAI", score: 88.7, displayValue: "88.7%" },
      { name: "Gemini 1.5 Pro", provider: "Google DeepMind", score: 85.9, displayValue: "85.9%" },
      { name: "Llama 3.3 70B", provider: "Meta", score: 82.4, displayValue: "82.4%" },
    ],
  },
  coding: {
    title: "HumanEval Code Generation (Pass@1)",
    subtitle: "Real-world algorithmic problem solving, TypeScript syntax, and bug remediation.",
    unit: "%",
    higherIsBetter: true,
    models: [
      { name: "Synapse Ultra 3.5", provider: "Synapse Engine", score: 95.8, displayValue: "95.8%", highlight: true },
      { name: "Claude 3.5 Sonnet", provider: "Anthropic", score: 93.7, displayValue: "93.7%" },
      { name: "GPT-4o", provider: "OpenAI", score: 90.2, displayValue: "90.2%" },
      { name: "Gemini 1.5 Pro", provider: "Google DeepMind", score: 84.1, displayValue: "84.1%" },
      { name: "Llama 3.3 70B", provider: "Meta", score: 81.3, displayValue: "81.3%" },
    ],
  },
  latency: {
    title: "Time-to-First-Token (TTFT)",
    subtitle: "First token streaming latency measured across 10,000 requests globally.",
    unit: "ms",
    higherIsBetter: false,
    models: [
      { name: "Synapse Ultra 3.5", provider: "Synapse Engine", score: 14.2, displayValue: "14.2 ms", highlight: true },
      { name: "Llama 3.3 70B (Groq)", provider: "Groq", score: 18.5, displayValue: "18.5 ms" },
      { name: "Claude 3.5 Sonnet", provider: "Anthropic", score: 48.0, displayValue: "48.0 ms" },
      { name: "GPT-4o", provider: "OpenAI", score: 52.3, displayValue: "52.3 ms" },
      { name: "Gemini 1.5 Pro", provider: "Google DeepMind", score: 64.0, displayValue: "64.0 ms" },
    ],
  },
  pricing: {
    title: "Blended Cost per 1M Tokens",
    subtitle: "Weighted 3:1 input to output token ratio at production scale.",
    unit: "$",
    higherIsBetter: false,
    models: [
      { name: "Synapse Ultra 3.5", provider: "Synapse Engine", score: 0.90, displayValue: "$0.90 / 1M", highlight: true },
      { name: "Llama 3.3 70B", provider: "Open Cloud", score: 1.20, displayValue: "$1.20 / 1M" },
      { name: "GPT-4o", provider: "OpenAI", score: 3.75, displayValue: "$3.75 / 1M" },
      { name: "Claude 3.5 Sonnet", provider: "Anthropic", score: 4.50, displayValue: "$4.50 / 1M" },
      { name: "Gemini 1.5 Pro", provider: "Google DeepMind", score: 3.50, displayValue: "$3.50 / 1M" },
    ],
  },
};

export default function ModelComparison() {
  const [selectedMetric, setSelectedMetric] = useState<MetricCategory>("reasoning");
  const currentBenchmark = BENCHMARKS[selectedMetric];

  return (
    <section id="benchmarks" className="relative py-28 bg-[#07080e] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-cyan-400 mb-4">
            <Trophy className="w-3.5 h-3.5" />
            <span>EMPIRICAL BENCHMARKS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Unrivaled Speed. Uncompromised Depth.
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            Benchmarked across 50,000 automated evaluations and verified against standard academic suites.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedMetric("reasoning")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "reasoning"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "glass-card text-zinc-400 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Reasoning (MMLU-Pro)</span>
          </button>

          <button
            onClick={() => setSelectedMetric("coding")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "coding"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "glass-card text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Coding (HumanEval)</span>
          </button>

          <button
            onClick={() => setSelectedMetric("latency")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "latency"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "glass-card text-zinc-400 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>TTFT Latency</span>
          </button>

          <button
            onClick={() => setSelectedMetric("pricing")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
              selectedMetric === "pricing"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "glass-card text-zinc-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Cost Efficiency</span>
          </button>
        </div>

        {/* Benchmark Visualization Card */}
        <div className="max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="mb-6 pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xl font-bold text-white">{currentBenchmark.title}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{currentBenchmark.subtitle}</p>
            </div>
            <div className="text-xs font-mono text-cyan-400 self-start sm:self-auto bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
              {currentBenchmark.higherIsBetter ? "Higher score is superior ↑" : "Lower score is superior ↓"}
            </div>
          </div>

          {/* Bar comparison rows */}
          <div className="space-y-4">
            {currentBenchmark.models.map((model, idx) => {
              // Calculate percentage width for visual bar
              let barPercentage = 0;
              if (currentBenchmark.higherIsBetter) {
                barPercentage = (model.score / 100) * 100;
              } else {
                // Inverted scaling for latency/price where lower is better
                const minVal = currentBenchmark.models[0].score;
                const maxVal = currentBenchmark.models[currentBenchmark.models.length - 1].score;
                barPercentage = 100 - ((model.score - minVal) / (maxVal - minVal + 0.001)) * 55;
              }

              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${model.highlight ? "text-cyan-300 font-bold" : "text-zinc-300"}`}>
                        {model.name}
                      </span>
                      <span className="text-zinc-500 text-[11px]">({model.provider})</span>
                      {model.highlight && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-400/10 text-cyan-300 text-[10px] border border-cyan-400/20 font-sans">
                          Leader
                        </span>
                      )}
                    </div>
                    <span className={`font-bold ${model.highlight ? "text-white text-sm" : "text-zinc-400"}`}>
                      {model.displayValue}
                    </span>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="h-3 w-full rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        model.highlight
                          ? "bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 shadow-md shadow-cyan-500/30"
                          : "bg-zinc-700/60"
                      }`}
                      style={{ width: `${Math.max(barPercentage, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-zinc-500 font-mono gap-2">
            <span>Independent third-party validation: LMSYS Chatbot Arena</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 100% Deterministic Reproducibility
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}
