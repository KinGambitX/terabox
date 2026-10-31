"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck } from "lucide-react";

export default function CtaBanner({ onOpenDemoModal }: { onOpenDemoModal: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 },
      colors: ["#6366f1", "#06b6d4", "#ec4899", "#10b981"],
    });

    setSubmitted(true);
    setTimeout(() => {
      onOpenDemoModal();
    }, 1200);
  };

  return (
    <section className="relative py-28 bg-[#06070a] overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="absolute inset-0 bg-radial-pattern pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl p-8 sm:p-14 lg:p-16 border border-white/15 bg-gradient-to-b from-white/[0.05] to-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden text-center flex flex-col items-center">
          
          {/* Subtle top edge glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-cyan-300 mb-6 border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START DEPLOYING IN 60 SECONDS</span>
          </div>

          {/* Main CTA Heading */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-3xl">
            Build the Future of Autonomous Intelligence Today.
          </h2>

          <p className="mt-6 text-zinc-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Join thousands of visionary AI engineers scaling mission-critical autonomous agents, low-latency multimodal pipelines, and edge-native models.
          </p>

          {/* Email Subscription / Signup Input */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md"
          >
            {submitted ? (
              <div className="w-full py-3.5 px-6 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Access Granted! Redirecting to setup...</span>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email address..."
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  <span>Claim Key</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>

          {/* Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="text-zinc-600">•</span>
            <span>$50 Free Inference Credits</span>
            <span className="text-zinc-600">•</span>
            <span>Instant API Provisioning</span>
          </div>

        </div>
      </div>
    </section>
  );
}
