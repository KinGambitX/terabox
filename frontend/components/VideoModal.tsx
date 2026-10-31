"use client";

import { X, Play, Volume2, Maximize2, Cpu } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl glass-card rounded-3xl border border-white/20 bg-[#090b14] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>SYNAPSE ENGINE V3.5 ARCHITECTURE SHOWREEL</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Canvas / Simulation */}
        <div className="relative aspect-video w-full bg-gradient-to-tr from-black via-[#0d1020] to-[#080911] flex flex-col items-center justify-center overflow-hidden">
          {/* Animated matrix / visual mesh */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
          <div className="absolute w-72 h-72 bg-violet-600/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-4 group cursor-pointer hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-cyan-300 fill-cyan-300 ml-1" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">
              Autonomous Speculative Inference in 14ms
            </h4>
            <p className="text-xs text-zinc-400 max-w-sm mb-4">
              Watch Senior ML Engineers demonstrate multi-agent speculative execution across 35 edge regions.
            </p>
            <span className="font-mono text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-400">
              Duration: 01:45 • 4K 60FPS
            </span>
          </div>

          {/* Bottom video controls simulation */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-3">
              <span className="text-cyan-400">00:42 / 01:45</span>
              <div className="w-32 sm:w-64 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div className="w-2/5 h-full bg-cyan-400" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
              <Maximize2 className="w-4 h-4 text-zinc-400 hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
