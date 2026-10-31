"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { X, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

export default function ContactModal({ isOpen, onClose, initialPlan }: ContactModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workload, setWorkload] = useState("Production Autonomous Agents");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
      colors: ["#6366f1", "#06b6d4", "#a855f7"],
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg glass-card rounded-3xl border border-white/15 p-6 sm:p-8 bg-[#0a0c16]/95 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/20 rounded-full blur-[60px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">API Keys Provisioned!</h3>
            <p className="text-xs text-zinc-400 max-w-xs">
              Check your inbox for onboarding credentials and temporary JWT keys. Redirecting to console...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                {initialPlan ? `Plan: ${initialPlan}` : "Instant Provisioning"}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              Get Started with Synapse
            </h3>
            <p className="text-xs text-zinc-400 mt-1 mb-6">
              Claim $50 in free compute credits with instant sub-15ms edge routing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ada@company.ai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Primary Workload</label>
                <select
                  value={workload}
                  onChange={(e) => setWorkload(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e111d] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                >
                  <option value="Production Autonomous Agents">Autonomous Multi-Agent Systems</option>
                  <option value="High Frequency Low Latency">Sub-15ms Real-Time Inference</option>
                  <option value="Multimodal Vision & Audio">Multimodal Vision & Audio Streaming</option>
                  <option value="Enterprise VPC Migration">Enterprise On-Premise VPC Cluster</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:opacity-95"
                >
                  <span>Generate Free API Key</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero data retention guarantee • SOC2 Type II</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
