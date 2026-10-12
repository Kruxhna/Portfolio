"use client";

import React from "react";
import { Cpu, Server, Activity, Network, Radio, GitFork, Smartphone, Layers } from "lucide-react";

interface ProjectVisualProps {
  type: "network-mesh" | "spectrogram" | "dag-pipeline" | "mobile-ui" | string;
}

export function ProjectVisual({ type }: ProjectVisualProps) {
  switch (type) {
    case "network-mesh":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#09090b] p-4 font-mono text-xs select-none">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-grid-lines opacity-20 pointer-events-none" />

          {/* Top telemetry bar */}
          <div className="flex items-center justify-between text-[10px] text-[#71717A] pb-2 border-b border-[#27272A]/60">
            <span className="flex items-center gap-1.5 text-[#38BDF8]">
              <Network className="h-3 w-3 animate-pulse" />
              RPC TENSOR PARALLELISM TOPOLOGY
            </span>
            <span className="text-emerald-400">IPC LATENCY: 1.4ms</span>
          </div>

          {/* Mesh Nodes Diagram */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center items-center">
            {/* Master Node */}
            <div className="rounded-lg border border-[#38BDF8]/40 bg-[#111115] p-2">
              <div className="text-[10px] text-[#38BDF8] font-bold">NODE 01 (HOST)</div>
              <div className="mt-1 text-[9px] text-[#A1A1AA]">Layers 0–15</div>
              <div className="mt-1 rounded bg-[#18181b] px-1 py-0.5 text-[8.5px] text-[#71717A]">
                RTX 4070 (12GB)
              </div>
            </div>

            {/* Zero-Copy Ring Buffer Interconnect */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] text-emerald-400 font-bold animate-pulse">
                ⇄ RING BUFFER
              </span>
              <div className="my-1 h-0.5 w-full bg-gradient-to-r from-[#38BDF8] via-emerald-400 to-[#6366F1]" />
              <span className="text-[8px] text-[#71717A]">Zero-Copy Shm</span>
            </div>

            {/* Worker Node */}
            <div className="rounded-lg border border-[#6366F1]/40 bg-[#111115] p-2">
              <div className="text-[10px] text-[#6366F1] font-bold">NODE 02 (PEER)</div>
              <div className="mt-1 text-[9px] text-[#A1A1AA]">Layers 16–31</div>
              <div className="mt-1 rounded bg-[#18181b] px-1 py-0.5 text-[8.5px] text-[#71717A]">
                RTX 3060 (12GB)
              </div>
            </div>
          </div>

          {/* Kernel telemetry pill */}
          <div className="mt-3 flex items-center justify-between rounded-md bg-[#111115] px-2.5 py-1 text-[9px] text-[#71717A] border border-[#27272A]/70">
            <span>Kernel: Q4_K_M Dynamic Quant</span>
            <span className="text-[#38BDF8]">Tailscale Mesh / 10Gbps LAN</span>
          </div>
        </div>
      );

    case "spectrogram":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#09090b] p-4 font-mono text-xs select-none">
          <div className="flex items-center justify-between text-[10px] text-[#71717A] pb-2 border-b border-[#27272A]/60">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Radio className="h-3 w-3 animate-pulse" />
              RF SPECTRUM INTERCEPT HEATMAP
            </span>
            <span className="text-[#38BDF8]">2048 FFT BINS</span>
          </div>

          {/* Simulated Spectrogram Heatmap Waterfall */}
          <div className="mt-2.5 h-16 w-full rounded-lg overflow-hidden border border-[#27272A]/70 bg-black flex items-center justify-between px-1 gap-1">
            {[45, 80, 20, 95, 60, 30, 75, 90, 40, 85, 25, 92, 65, 35, 78].map((h, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end">
                <div
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    h > 75
                      ? "bg-rose-500 shadow-sm shadow-rose-500"
                      : h > 50
                      ? "bg-amber-400"
                      : "bg-[#10B981]/60"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Dwell Scheduler Trajectory Overlay */}
          <div className="mt-2.5 flex items-center justify-between text-[9px] text-[#A1A1AA]">
            <span className="flex items-center gap-1 text-emerald-400">
              <Activity className="h-3 w-3" />
              Agile Radar Hopping Intercepted
            </span>
            <span className="font-mono text-[#FAFAFA]">Dwell Time: -42%</span>
          </div>
        </div>
      );

    case "dag-pipeline":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#09090b] p-4 font-mono text-xs select-none">
          <div className="flex items-center justify-between text-[10px] text-[#71717A] pb-2 border-b border-[#27272A]/60">
            <span className="flex items-center gap-1.5 text-amber-400">
              <GitFork className="h-3 w-3" />
              ZERO-LEAKAGE SCIKIT-LEARN DAG
            </span>
            <span className="text-[#FAFAFA]">5-FOLD NESTED CV</span>
          </div>

          {/* Directed Acyclic Graph Node Chain */}
          <div className="mt-3 flex items-center justify-between gap-1 text-center">
            <div className="rounded-md border border-[#27272A] bg-[#111115] px-2 py-1 text-[9px] text-[#A1A1AA]">
              Raw Features
            </div>
            <span className="text-[10px] text-[#71717A]">→</span>
            <div className="rounded-md border border-amber-500/30 bg-[#111115] px-2 py-1 text-[9px] text-amber-400">
              Impute / Scale
            </div>
            <span className="text-[10px] text-[#71717A]">→</span>
            <div className="rounded-md border border-[#38BDF8]/30 bg-[#111115] px-2 py-1 text-[9px] text-[#38BDF8]">
              Nested CV
            </div>
            <span className="text-[10px] text-[#71717A]">→</span>
            <div className="rounded-md border border-emerald-500/30 bg-[#111115] px-2 py-1 text-[9px] text-emerald-400">
              XGBoost / Ens
            </div>
          </div>

          {/* Feature Importance & Residual Tracking HUD */}
          <div className="mt-3 rounded-lg border border-[#27272A]/70 bg-[#111115] p-2 text-[9px] space-y-1">
            <div className="flex justify-between text-[#71717A]">
              <span>SHAP Feature Weight</span>
              <span className="text-emerald-400">Residual Error: ±0.038</span>
            </div>
            <div className="h-1.5 w-full bg-[#18181b] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-[#38BDF8] w-[88%]" />
            </div>
          </div>
        </div>
      );

    case "mobile-ui":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[#27272A] bg-[#09090b] p-4 font-mono text-xs select-none">
          <div className="flex items-center justify-between text-[10px] text-[#71717A] pb-2 border-b border-[#27272A]/60">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Smartphone className="h-3 w-3" />
              ADAPTIVE SPACING REPETITION CLIENT
            </span>
            <span className="text-emerald-400">🔥 18-DAY STREAK</span>
          </div>

          {/* Spaced-Repetition Interactive Flashcard Preview */}
          <div className="mt-2.5 rounded-lg border border-[#27272A] bg-[#111115] p-2.5">
            <div className="flex items-center justify-between text-[9px] text-[#71717A]">
              <span>ALGORITHMS // THEORETICAL CS</span>
              <span className="rounded bg-[#18181b] px-1 text-indigo-400">SM-2 ALGO</span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-[#FAFAFA]">
              Master Theorem Case 2: T(n) = aT(n/b) + f(n)
            </div>
            <div className="mt-2 flex gap-1.5 text-[8.5px]">
              <span className="rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-rose-400">
                Hard (1d)
              </span>
              <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-amber-400">
                Good (3d)
              </span>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400">
                Easy (7d)
              </span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
