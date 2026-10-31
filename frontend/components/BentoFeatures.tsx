"use client";

import { useState, useRef } from "react";
import {
  Cpu,
  Globe2,
  Lock,
  Workflow,
  Sparkles,
  Layers,
  Zap,
  Shield,
  Terminal,
  Activity,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

function SpotlightCard({ children, className = "" }: BentoCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => setOpacity(1);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl glass-card p-6 sm:p-8 ${className}`}
    >
      {/* Radial Hover Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

export default function BentoFeatures() {
  const [activeEdgeTab, setActiveEdgeTab] = useState(0);

  const edgeRegions = [
    { city: "San Francisco (SFO-1)", ping: "3.8ms", status: "Optimal", load: "24%" },
    { city: "Frankfurt (FRA-3)", ping: "8.4ms", status: "Optimal", load: "38%" },
    { city: "Tokyo (NRT-2)", ping: "11.2ms", status: "Optimal", load: "19%" },
    { city: "Singapore (SIN-1)", ping: "14.6ms", status: "Optimal", load: "42%" },
  ];

  return (
    <section id="features" className="relative py-28 bg-[#06070a] overflow-hidden">
      {/* Glow backgrounds */}
      <div className="glow-blur-emerald top-1/3 -right-20 opacity-20" />
      <div className="glow-blur-purple bottom-10 -left-20 opacity-25" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-violet-400 mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>CORE ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Engineered for Autonomous Supremacy
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Every layer of the Synapse platform is purpose-built to deliver instantaneous reasoning, extreme fault tolerance, and uncompromised privacy.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Large (2 Columns on lg) - Autonomous Agent DAG Orchestrator */}
          <SpotlightCard className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                  <Workflow className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Self-Healing Execution
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Autonomous Directed Acyclic Graph (DAG) Engine
              </h3>
              <p className="text-zinc-400 text-sm max-w-xl">
                Break complex multi-hour objectives into deterministic execution sub-graphs with automatic speculative parallelization, tool self-healing, and rollback checkpoints.
              </p>

              {/* Visual DAG Interactive Flowchart */}
              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-3 pb-2 border-b border-white/5">
                  <span>ORCHESTRATOR GRAPH TRACE: #DAG-9140</span>
                  <span className="text-cyan-400">Total Latency: 18.4ms</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-zinc-500 uppercase">Step 01: Intake</div>
                    <div className="text-white font-medium mt-1">Semantic Decomposition</div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Resolved (1.2ms)
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-violet-950/30 border border-violet-500/30">
                    <div className="text-[10px] text-violet-400 uppercase">Step 02: Parallel Dispatch</div>
                    <div className="text-white font-medium mt-1">Multi-Tool Sandbox</div>
                    <div className="text-[10px] text-cyan-400 mt-1 flex items-center gap-1">
                      <Activity className="w-3 h-3 animate-spin" /> 4 Sub-agents running
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <div className="text-[10px] text-zinc-500 uppercase">Step 03: Verification</div>
                    <div className="text-white font-medium mt-1">Zero-Loss Synthesis</div>
                    <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                      Pending consensus
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">Speculative Accuracy: 99.8%</span>
              <a href="#playground" className="text-cyan-400 hover:underline flex items-center gap-1">
                Explore DAG specs &rarr;
              </a>
            </div>
          </SpotlightCard>

          {/* Card 2: Sub-15ms Global Edge Distribution */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <Globe2 className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
                  35+ Edge PoPs
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Sub-15ms Global Edge
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                Direct NVLink-interconnected GPU clusters deployed worldwide for instantaneous first-token latency.
              </p>

              {/* Edge Telemetry Selector */}
              <div className="space-y-2 font-mono text-xs">
                {edgeRegions.map((region, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveEdgeTab(idx)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between ${
                      activeEdgeTab === idx
                        ? "bg-white/10 border border-cyan-500/30 text-white"
                        : "bg-white/[0.02] text-zinc-400 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-[11px]">{region.city}</span>
                    <span className="text-cyan-400 font-bold">{region.ping}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono flex justify-between">
              <span>Anycast Smart Routing</span>
              <span className="text-emerald-400">0% Packet Loss</span>
            </div>
          </SpotlightCard>

          {/* Card 3: Zero-Knowledge Privacy Vault */}
          <SpotlightCard className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  SOC2 Type II
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Zero-Knowledge Privacy Vault
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                Customer prompts and generated weights never touch persistent disks. Hardware Secure Enclaves (Nitro Enclaves & Intel SGX).
              </p>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Data Retention:</span>
                  <span className="text-emerald-400 font-bold">0 Seconds</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Model Training on Prompts:</span>
                  <span className="text-emerald-400 font-bold">Strictly Prohibited</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Hardware Encryption:</span>
                  <span className="text-cyan-400">AES-256-GCM / HSM</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono">
              HIPAA, GDPR & ISO 27001 Certified
            </div>
          </SpotlightCard>

          {/* Card 4 (2 Columns on lg): Native Multimodal Streaming Engine */}
          <SpotlightCard className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Real-Time Bi-Directional
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Ultra-Low Latency Multimodal Streaming
              </h3>
              <p className="text-zinc-400 text-sm max-w-xl">
                Stream tokenized video frames, voice waveforms, and high-dimension vector embeddings over a single WebSocket connection with sub-50ms conversational turnaround.
              </p>

              {/* Audio / Video Stream visualizer */}
              <div className="mt-5 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    LIVE DUPLEX STREAM: 48kHz WAV + 60FPS RGB-D
                  </span>
                  <span className="text-amber-400">Bitrate: 1.8 Mbps</span>
                </div>
                
                {/* Simulated Audio Bars */}
                <div className="flex items-end justify-between h-14 gap-1 pt-2">
                  {[40, 65, 30, 85, 95, 45, 60, 100, 75, 50, 90, 65, 30, 85, 40, 70, 95, 60, 35, 80, 55, 90, 45, 75, 100, 60, 40, 85, 50, 65].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-violet-600 via-cyan-400 to-emerald-300 rounded-t-sm transition-all duration-300 hover:opacity-100 opacity-80"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span>WebRTC & WebSocket Full Support</span>
              <span className="text-cyan-400">Zero Audio Glitch Buffer</span>
            </div>
          </SpotlightCard>

        </div>

      </div>
    </section>
  );
}
