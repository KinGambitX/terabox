"use client";

import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, CheckCircle2, Building2 } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  metric: string;
  quote: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Elena Rostova",
    role: "Chief Technology Officer",
    company: "HyperScale Robotics",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    metric: "68% Latency Reduction",
    quote:
      "Migrating our autonomous spatial perception pipelines to Synapse decreased our real-time robotics response latency from 45ms to 14ms. In physical robotics, that is the difference between safe navigation and catastrophic collision.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Head of AI Infrastructure",
    company: "Vector Dynamics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    metric: "$64,000 / mo Saved",
    quote:
      "We were burning through six figures monthly on legacy proprietary APIs. Synapse's speculative drafting engine delivered equal or superior reasoning accuracy at less than a third of the blended token cost.",
    rating: 5,
  },
  {
    name: "Dr. Sarah Lindqvist",
    role: "Lead Machine Learning Architect",
    company: "Cerebral Health AI",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    metric: "Zero-Retention Compliance",
    quote:
      "For healthcare environments, compliance is non-negotiable. Synapse's cryptographic guarantee of zero persistent disk logging and isolated Nitro Enclaves allowed us to pass strict HIPAA audits on day one.",
    rating: 5,
  },
  {
    name: "Marcus Vance",
    role: "VP of Engineering",
    company: "Synthetix Financial",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    metric: "99.999% Fault Resilience",
    quote:
      "During global market open spikes, we process over 250,000 queries every minute. Synapse's Anycast edge distribution handled the traffic with zero dropped packets and deterministic response times.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="relative py-28 bg-[#06070a] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-mono text-violet-400 mb-4">
            <Quote className="w-3.5 h-3.5" />
            <span>CUSTOMER VALIDATION</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Loved by Mission-Critical Engineering Teams
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base">
            From high-frequency fintech to autonomous robotics, discover how leaders scale with Synapse.
          </p>
        </div>

        {/* Featured Testimonial Card */}
        <div className="max-w-4xl mx-auto glass-card rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar & Company info */}
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden p-[2px] bg-gradient-to-tr from-violet-500 to-cyan-400 shadow-xl shadow-violet-600/20 mb-3">
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <h4 className="font-bold text-white text-base">{current.name}</h4>
              <p className="text-xs text-zinc-400 max-w-[150px]">{current.role}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                <Building2 className="w-3 h-3" />
                <span>{current.company}</span>
              </div>
            </div>

            {/* Quote Body */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Metric highlight pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold mb-4">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Impact: {current.metric}</span>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <blockquote className="text-base sm:text-xl text-zinc-200 leading-relaxed font-light italic">
                  "{current.quote}"
                </blockquote>
              </div>

              {/* Navigation Arrows */}
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentIndex === i ? "w-6 bg-cyan-400" : "w-2 bg-white/20"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="p-2 rounded-xl glass-card text-zinc-300 hover:text-white border-white/10 hover:border-white/20 transition-colors"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={next}
                    className="p-2 rounded-xl glass-card text-zinc-300 hover:text-white border-white/10 hover:border-white/20 transition-colors"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
