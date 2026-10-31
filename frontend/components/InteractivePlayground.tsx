"use client";

import { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Bot,
  Code2,
  BrainCircuit,
  Eye,
  Sliders,
} from "lucide-react";

type Modality = "code" | "agent" | "vision";

interface DemoPreset {
  title: string;
  prompt: string;
  modality: Modality;
  reasoning: string[];
  output: string;
}

const PRESETS: DemoPreset[] = [
  {
    title: "High-Frequency Arbitrage Agent",
    prompt: "Construct an autonomous WebGL orderbook visualizer with real-time WebSocket state reconciliation.",
    modality: "code",
    reasoning: [
      "Parsed system prompt: WebGL orderbook visualizer with WebSocket diff sync.",
      "Evaluating GPU buffer allocation: Instanced vertex array for 100k depth points.",
      "Generating lock-free ring buffer for 0.4ms packet latency.",
      "Synthesizing production TypeScript canvas controller.",
    ],
    output: `import { createOrderbookEngine } from "@synapse-ai/streaming";

export class OrderbookVisualizer {
  private gl: WebGL2RenderingContext;
  private ringBuffer = new SharedArrayBuffer(1024 * 1024 * 4);
  private depthPoints = new Float32Array(100_000);

  constructor(canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl2", { powerPreference: "high-performance" })!;
    this.initShaders();
  }

  public subscribeToStream(wsUrl: string) {
    const stream = createOrderbookEngine({ endpoint: wsUrl, compression: "zstd" });
    stream.on("diff", (delta) => {
      // Zero-copy binary mutation directly to GPU VBO
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, delta.binaryPayload);
      this.requestFrame();
    });
  }
}`,
  },
  {
    title: "Autonomous Research & Fact Extraction",
    prompt: "Investigate sub-15ms speculative decoding algorithms across distributed transformer nodes.",
    modality: "agent",
    reasoning: [
      "Accessing multi-hop academic index: arXiv cs.LG & MLSys 2025/2026.",
      "Cross-referencing Medusa, Lookahead, and Speculative Drafting benchmarks.",
      "Synthesizing empirical trade-offs: Memory bandwidth vs acceptance rate.",
      "Structuring conclusive architecture recommendation.",
    ],
    output: `### Executive Analysis: Distributed Speculative Decoding (DSD)

1. **Core Bottleneck Identified**:
   Memory bandwidth limitations during autoregressive token sampling limit batch scalability to ~48 tokens/s per node.

2. **Benchmark Comparison**:
   • Standard Autoregressive: 38.4 ms/tok | Acceptance Rate: N/A
   • Speculative Tree Drafting (k=5): 13.2 ms/tok | Acceptance: 76.4%
   • Synapse Neural Speculator (v3.5): 6.8 ms/tok | Acceptance: 91.2%

3. **Key Finding**:
   By co-locating the 1.2B draft model within SRAM cache alongside KV-quantized attention weights, draft acceptance improves by 19.3% with zero network serialization overhead.`,
  },
  {
    title: "Multimodal Scene Deconstruction",
    prompt: "Analyze complex robotic perception telemetry and produce semantic spatial coordinates.",
    modality: "vision",
    reasoning: [
      "Ingesting 4K stereo RGB-D sensor feed + LiDAR point cloud.",
      "Executing zero-shot 3D bounding mesh prediction for 14 dynamic agents.",
      "Calculating trajectory collision probabilities over 5.0-second horizon.",
      "Emitting deterministic robotic actuation primitives.",
    ],
    output: `{
  "frame_id": "seq_98124_telemetry",
  "spatial_coordinates": [
    {
      "entity": "autonomous_forklift_04",
      "bbox_3d": { "x": 14.82, "y": -2.31, "z": 0.0, "w": 2.4, "h": 2.1, "d": 3.8 },
      "velocity_vector": [1.42, 0.05, 0.0],
      "time_to_collision_sec": null,
      "status": "nominal"
    },
    {
      "entity": "human_operator_hazard",
      "bbox_3d": { "x": 5.14, "y": 0.88, "z": 0.0, "w": 0.6, "h": 1.75, "d": 0.5 },
      "velocity_vector": [-0.62, 0.12, 0.0],
      "time_to_collision_sec": 3.48,
      "status": "critical_warning_override"
    }
  ],
  "actuator_action": "APPLY_BRAKE_DECELERATION_GRADE_2"
}`,
  },
];

export default function InteractivePlayground() {
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"output" | "reasoning">("output");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState(PRESETS[0].output);
  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(PRESETS[0].prompt);
  const [tokensGenerated, setTokensGenerated] = useState(418);
  const [currentLatency, setCurrentLatency] = useState(13.8);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const runSimulation = (presetIndex: number, promptText?: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsGenerating(true);
    setStreamedText("");
    setTokensGenerated(0);

    const fullText = PRESETS[presetIndex].output;
    let charIndex = 0;
    const chunkSize = 6;

    const interval = setInterval(() => {
      charIndex += chunkSize;
      if (charIndex >= fullText.length) {
        setStreamedText(fullText);
        setTokensGenerated(Math.round(fullText.length / 3.8));
        setIsGenerating(false);
        clearInterval(interval);
      } else {
        setStreamedText(fullText.slice(0, charIndex));
        setTokensGenerated(Math.round(charIndex / 3.8));
      }
    }, 20);
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPreset(index);
    setCustomPrompt(PRESETS[index].prompt);
    runSimulation(index);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="playground" className="relative py-24 bg-[#07080d] overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-cyan-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>LIVE INTERACTIVE INFERENCE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Test the Engine in Real-Time
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            Witness autonomous reasoning, zero-latency code generation, and multi-step reasoning traces directly in your browser.
          </p>
        </div>

        {/* Playground Container Window */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-[#090b14]/90 backdrop-blur-xl">
          
          {/* Top Window Bar */}
          <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400 pl-3 border-l border-white/10">
                <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
                <span>synapse-runtime://session-gpu-cluster-09</span>
              </div>
            </div>

            {/* Live Telemetry Tickers */}
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>TTFT: <strong className="text-white">{currentLatency}ms</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tokens: <strong className="text-white">{tokensGenerated}</strong></span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Streaming 185 tok/s</span>
              </div>
            </div>
          </div>

          {/* Main Playground Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            
            {/* Left Control Panel: Presets & Prompt Input */}
            <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-black/20">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Select Workload Pipeline</span>
                </div>

                {/* Preset Selector Buttons */}
                <div className="flex flex-col gap-2 mb-6">
                  {PRESETS.map((preset, index) => {
                    const isSelected = selectedPreset === index;
                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectPreset(index)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                          isSelected
                            ? "bg-violet-950/40 border-violet-500/50 text-white shadow-lg shadow-violet-950/50"
                            : "bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div
                          className={`mt-0.5 p-1.5 rounded-lg ${
                            isSelected
                              ? "bg-violet-600 text-white"
                              : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          {preset.modality === "code" && <Code2 className="w-3.5 h-3.5" />}
                          {preset.modality === "agent" && <Bot className="w-3.5 h-3.5" />}
                          {preset.modality === "vision" && <Eye className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white mb-0.5">{preset.title}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1">
                            {preset.prompt}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Prompt Customization Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>Prompt Payload:</span>
                    <span className="text-[10px] text-zinc-500">Edit or synthesize</span>
                  </label>
                  <textarea
                    rows={3}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono resize-none"
                    placeholder="Enter system prompt instruction..."
                  />
                </div>
              </div>

              {/* Execution Action Button */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                <button
                  onClick={() => runSimulation(selectedPreset, customPrompt)}
                  disabled={isGenerating}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Tokens...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Run Inference Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Execution Output: Streamed Result */}
            <div className="lg:col-span-7 flex flex-col bg-[#05060b]">
              
              {/* Output Tab Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 border-b border-white/10 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("output")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      activeTab === "output"
                        ? "bg-white/10 text-white font-medium"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Code2 className="w-3 h-3 text-cyan-400" />
                    <span>Streamed Output</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("reasoning")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 ${
                      activeTab === "reasoning"
                        ? "bg-white/10 text-white font-medium"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <BrainCircuit className="w-3 h-3 text-violet-400" />
                    <span>Chain of Thought ({PRESETS[selectedPreset].reasoning.length})</span>
                  </button>
                </div>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors font-mono"
                  title="Copy output"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Terminal Screen Body */}
              <div className="p-4 sm:p-6 font-mono text-xs text-zinc-300 leading-relaxed overflow-y-auto max-h-[460px] min-h-[360px]">
                {activeTab === "output" ? (
                  <pre className="whitespace-pre-wrap font-mono text-emerald-300/90 selection:bg-emerald-500/20">
                    {streamedText}
                    {isGenerating && (
                      <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle" />
                    )}
                  </pre>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="text-xs text-zinc-400 font-mono mb-2">
                      // Internal reasoning & execution graph
                    </div>
                    {PRESETS[selectedPreset].reasoning.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 text-zinc-300 font-mono text-xs"
                      >
                        <span className="text-violet-400 font-bold">0{idx + 1}.</span>
                        <div className="flex-1">
                          <p>{step}</p>
                          <span className="text-[10px] text-zinc-500 mt-0.5 block">
                            verified in 1.4ms • 0-loss gradient
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="px-6 py-2.5 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Model: Synapse-Ultra-3.5-Turbo</span>
                <span>Context Window: 2,048,000 tokens</span>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
