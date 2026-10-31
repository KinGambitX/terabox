"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { Check, Zap, Sparkles, ArrowRight, Shield, HelpCircle } from "lucide-react";

interface PricingProps {
  onSelectPlan: (planName: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingProps) {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [sliderTokens, setSliderTokens] = useState(25); // in millions

  const handlePlanClick = (planName: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#06b6d4", "#a855f7", "#10b981"],
    });
    onSelectPlan(planName);
  };

  const plans = [
    {
      name: "Developer",
      tagline: "Ideal for prototyping, hackathons, and personal projects.",
      priceMonthly: 0,
      priceAnnual: 0,
      popular: false,
      features: [
        "1,000,000 tokens included free/mo",
        "Sub-20ms standard edge routing",
        "Community Discord support",
        "2 concurrent agent sessions",
        "TypeScript & Python SDKs",
        "Standard rate limits (60 RPM)",
      ],
      ctaText: "Deploy Free Sandbox",
      ctaVariant: "outline",
    },
    {
      name: "Pro Studio",
      tagline: "For scaling production apps, autonomous agents, and SaaS startups.",
      priceMonthly: 49,
      priceAnnual: 39,
      popular: true,
      features: [
        "25,000,000 tokens included/mo",
        "Sub-15ms priority NVLink edge routing",
        "Unlimited concurrent autonomous agents",
        "Real-time multimodal audio & vision",
        "Zero data retention guarantee (SOC2)",
        "Priority 24/7 Slack & email support",
        "Custom fine-tuned weights support",
        "99.99% availability SLA",
      ],
      ctaText: "Start 14-Day Free Trial",
      ctaVariant: "gradient",
    },
    {
      name: "Enterprise Cluster",
      tagline: "Dedicated VPC, customized hardware enclaves, and mission-critical SLAs.",
      priceMonthly: 499,
      priceAnnual: 399,
      popular: false,
      features: [
        "Unlimited custom token throughput",
        "Dedicated isolated GPU clusters",
        "Sub-10ms custom point-of-presence",
        "Air-gapped on-premise Kubernetes deploy",
        "HIPAA, BAA & SOC2 Type II compliance",
        "Dedicated forward-deployed engineer",
        "Custom model alignment & RLHF tuning",
        "99.999% uptime financial SLA",
      ],
      ctaText: "Book Architecture Review",
      ctaVariant: "outline",
    },
  ];

  // Calculate estimated savings in the interactive slider
  const synapseCost = Math.round(sliderTokens * 0.9);
  const competitorCost = Math.round(sliderTokens * 3.75);
  const totalSavings = competitorCost - synapseCost;

  return (
    <section id="pricing" className="relative py-28 bg-[#07080e] overflow-hidden">
      {/* Glow backgrounds */}
      <div className="glow-blur-purple top-20 left-1/3 opacity-25" />
      <div className="glow-blur-cyan bottom-20 right-1/4 opacity-25" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-cyan-400 mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>TRANSPARENT VALUE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Predictable Pricing. Exponential Scale.
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            No surprise surcharges or opaque token markups. Scale effortlessly from your first request to billions.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl glass-card border border-white/10">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                !annualBilling
                  ? "bg-white/10 text-white font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                annualBilling
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold bg-cyan-400 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = annualBilling ? plan.priceAnnual : plan.priceMonthly;

            return (
              <div
                key={idx}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "glass-card border-violet-500/50 shadow-2xl shadow-violet-950/50 p-8 sm:p-9 scale-100 md:-translate-y-2"
                    : "glass-card border-white/10 p-7 sm:p-8"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-[11px] font-bold tracking-wider uppercase shadow-md shadow-violet-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular Choice</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-400 min-h-[36px]">{plan.tagline}</p>

                  {/* Price display */}
                  <div className="mt-6 mb-6 pb-6 border-b border-white/10 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                      ${price}
                    </span>
                    <span className="text-zinc-400 text-xs font-mono">
                      / month {annualBilling && price > 0 ? "(billed annually)" : ""}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                      Included Capabilities:
                    </div>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action CTA */}
                <button
                  onClick={() => handlePlanClick(plan.name)}
                  className={`w-full py-3.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 group ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive Volume Savings Calculator */}
        <div className="mt-16 max-w-4xl mx-auto glass-card rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl bg-black/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Interactive Cost Efficiency Calculator</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Calculate your projected savings vs legacy hyperscaler LLM APIs.
              </p>
            </div>
            <div className="font-mono text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Est. Monthly Savings: <strong className="text-white text-sm">${totalSavings.toLocaleString()}</strong>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-zinc-400">Monthly Inference Workload:</span>
              <span className="text-cyan-400 font-bold text-sm">{sliderTokens} Million Tokens</span>
            </div>

            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={sliderTokens}
              onChange={(e) => setSliderTokens(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-white/10 rounded-lg"
            />

            <div className="flex justify-between text-[11px] font-mono text-zinc-500">
              <span>5M Tokens / mo</span>
              <span>100M Tokens / mo</span>
              <span>200M Tokens / mo</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
              <span className="text-zinc-400 block text-[11px]">Synapse Ultra 3.5 Engine</span>
              <span className="text-lg font-bold text-cyan-300">${synapseCost.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 block">($0.90 per 1M blended)</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-zinc-400 block text-[11px]">Alternative Proprietary LLM</span>
              <span className="text-lg font-bold text-zinc-400">${competitorCost.toLocaleString()}</span>
              <span className="text-[10px] text-zinc-500 block">($3.75 per 1M blended)</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
