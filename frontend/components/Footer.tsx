"use client";

import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#040508] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <a href="#" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-500 to-cyan-400 p-[1px]">
                  <div className="w-full h-full bg-[#090b12] rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>
                <span className="font-extrabold tracking-tight text-lg text-white font-mono">
                  SYNAPSE AI
                </span>
              </a>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed mb-6">
                The autonomous multimodal intelligence runtime and edge inference network engineered for exponential teams. Sub-15ms latency, SOC2 Type II enclaves, and zero data retention.
              </p>
            </div>

            {/* Live Operational Status Widget */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono text-zinc-400 w-fit">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>All 35 Edge PoPs Operational (99.999%)</span>
            </div>
          </div>

          {/* Column 1: Products */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Intelligence
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><a href="#playground" className="hover:text-white transition-colors">Ultra 3.5 Engine</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Autonomous DAGs</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Multimodal Audio & Vision</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Edge Routing Mesh</a></li>
              <li><a href="#benchmarks" className="hover:text-white transition-colors">Speculative Decoder</a></li>
            </ul>
          </div>

          {/* Column 2: Developers */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Developers
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><a href="#sdk" className="hover:text-white transition-colors">TypeScript SDK</a></li>
              <li><a href="#sdk" className="hover:text-white transition-colors">Python SDK</a></li>
              <li><a href="#sdk" className="hover:text-white transition-colors">Rust Crate</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">OpenAI Drop-in Guide</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Rate Limits & Quotas</a></li>
            </ul>
          </div>

          {/* Column 3: Trust & Company */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">
              Compliance & Safety
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li><span className="text-emerald-400">SOC2 Type II Report</span></li>
              <li><span className="text-zinc-400">HIPAA & BAA Agreement</span></li>
              <li><span className="text-zinc-400">Zero Retention Audit</span></li>
              <li><span className="text-zinc-400">Privacy Enclaves</span></li>
              <li><span className="text-zinc-400">Responsible AI Charter</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Socials and Legal */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            &copy; 2026 Synapse Systems, Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors" aria-label="GitHub">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45c-.89 0-1.61.72-1.61 1.61 0 .89.72 1.61 1.61 1.61.89 0 1.61-.72 1.61-1.61 0-.89-.72-1.61-1.61-1.61Z" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
