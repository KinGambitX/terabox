"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, Play, Terminal, Zap, ShieldCheck, Gauge, Cpu } from "lucide-react";

interface HeroProps {
  onOpenDemoModal: () => void;
  onOpenVideoModal: () => void;
}

export default function Hero({ onOpenDemoModal, onOpenVideoModal }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaGroupRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: 0.1 }
      )
        .fromTo(
          headingRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.4"
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.5"
        )
        .fromTo(
          ctaGroupRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          metricsRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const metrics = [
    { label: "Median TTFT Latency", value: "14.2ms", icon: Zap, highlight: "text-amber-400" },
    { label: "Tokens Per Second", value: "185 tok/s", icon: Gauge, highlight: "text-cyan-400" },
    { label: "Uptime Availability", value: "99.999%", icon: Cpu, highlight: "text-emerald-400" },
    { label: "Enterprise Retention", value: "0% Logged", icon: ShieldCheck, highlight: "text-violet-400" },
  ];

  const brandLogos = [
    { name: "NEURAFLOW", icon: "⬡" },
    { name: "SYNTHETIC", icon: "❖" },
    { name: "DATASPHERE", icon: "◈" },
    { name: "PULSE LOGIC", icon: "◎" },
    { name: "VECTOR LABS", icon: "▲" },
    { name: "KINETIX CLOUD", icon: "✦" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-center items-center overflow-hidden bg-grid-pattern"
    >
      {/* Background ambient lighting glows */}
      <div className="glow-blur-purple top-10 -left-20 opacity-40 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="glow-blur-cyan top-32 -right-20 opacity-30 animate-pulse" style={{ animationDuration: "10s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Decorative radial border halo */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 border-b border-indigo-500/10 rounded-full blur-[1px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Release Pill Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border-white/10 text-xs text-zinc-300 mb-8 hover:border-cyan-500/40 hover:bg-white/[0.08] transition-all cursor-pointer group shadow-inner"
          onClick={onOpenDemoModal}
        >
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-cyan-300 font-medium">v3.5 REASONING ENGINE</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300 group-hover:text-white transition-colors">
            Autonomous Multimodal Intelligence is Live
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 transition-transform group-hover:translate-x-1" />
        </div>

        {/* Main Hero Headline */}
        <h1
          ref={headingRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl"
        >
          The Autonomous AI Engine Built for{" "}
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Exponential Builders
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-6 text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl leading-relaxed font-normal"
        >
          Deploy multi-agent autonomous reasoning, real-time multimodal synthesis,
          and sub-15ms edge inference with a single unified SDK. Zero retention,
          military-grade encryption, and infinite scalability.
        </p>

        {/* CTA Button Group */}
        <div
          ref={ctaGroupRef}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={onOpenDemoModal}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>Start Deploying Free</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <button
            onClick={onOpenVideoModal}
            className="w-full sm:w-auto px-6 py-4 rounded-xl glass-card text-zinc-200 hover:text-white font-medium text-sm border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2.5 group"
          >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <Play className="w-3 h-3 text-cyan-400 fill-cyan-400 ml-0.5" />
            </div>
            <span>Watch Demo Keynote (1:45)</span>
          </button>
        </div>

        {/* Interactive Quick CLI Install Pill */}
        <div className="mt-8 flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-white/5 font-mono text-xs text-zinc-400">
          <Terminal className="w-3.5 h-3.5 text-violet-400" />
          <span>npm i @synapse-ai/core</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-sans text-[11px] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Ready for Next.js 16 & React 19
          </span>
        </div>

        {/* Metrics Grid Banner */}
        <div
          ref={metricsRef}
          className="mt-16 w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-4xl"
        >
          {metrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="glass-card p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center text-center relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-1.5 text-zinc-400 mb-1 text-xs">
                  <Icon className={`w-3.5 h-3.5 ${item.highlight}`} />
                  <span className="font-mono text-[11px]">{item.label}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand Logos Strip */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full flex flex-col items-center">
          <p className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-6">
            Trusted by autonomous AI engineering teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 hover:opacity-90 transition-opacity">
            {brandLogos.map((brand, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-zinc-400 font-mono text-sm tracking-wider hover:text-white transition-colors cursor-default"
              >
                <span className="text-violet-400 text-base">{brand.icon}</span>
                <span>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
