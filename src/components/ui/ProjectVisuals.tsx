"use client";

import React from "react";
import { Network, Radio, GitFork, Smartphone, Activity } from "lucide-react";

interface ProjectVisualProps {
  type: "network-mesh" | "spectrogram" | "dag-pipeline" | "mobile-ui" | string;
}

export function ProjectVisual({ type }: ProjectVisualProps) {
  switch (type) {
    case "network-mesh":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#070504] p-4 font-mono text-xs select-none">
          {/* Subtle grid lines */}
          <div className="absolute inset-0 bg-grid-lines opacity-20 pointer-events-none" />

          {/* Top telemetry bar */}
          <div className="flex items-center justify-between text-[10px] text-[#DD7074] pb-2 border-b border-[rgba(221,112,116,0.18)]">
            <span className="flex items-center gap-1.5 text-[#E46B5E]">
              <Network className="h-3 w-3 animate-pulse" />
              RPC TENSOR PARALLELISM TOPOLOGY
            </span>
            <span className="text-[#ECC3AB]">IPC LATENCY: 1.4ms</span>
          </div>

          {/* Mesh Nodes Diagram */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center items-center">
            {/* Master Node */}
            <div className="rounded-lg border border-[rgba(228,107,94,0.35)] bg-[#0A0807] p-2">
              <div className="text-[10px] text-[#E46B5E] font-bold">NODE 01 (HOST)</div>
              <div className="mt-1 text-[9px] text-[#ECC3AB]/85">Layers 0–15</div>
              <div className="mt-1 rounded bg-[#14100D] px-1 py-0.5 text-[8.5px] text-[#DD7074]">
                RTX 4070 (12GB)
              </div>
            </div>

            {/* Zero-Copy Ring Buffer Interconnect */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] text-[#E46B5E] font-bold animate-pulse">
                ⇄ RING BUFFER
              </span>
              <div className="my-1 h-0.5 w-full bg-gradient-to-r from-[#E46B5E] via-[#ECC3AB] to-[#E46B5E]" />
              <span className="text-[8px] text-[#DD7074]">Zero-Copy Shm</span>
            </div>

            {/* Worker Node */}
            <div className="rounded-lg border border-[rgba(221,112,116,0.22)] bg-[#0A0807] p-2">
              <div className="text-[10px] text-[#ECC3AB] font-bold">NODE 02 (PEER)</div>
              <div className="mt-1 text-[9px] text-[#ECC3AB]/85">Layers 16–31</div>
              <div className="mt-1 rounded bg-[#14100D] px-1 py-0.5 text-[8.5px] text-[#DD7074]">
                RTX 3060 (12GB)
              </div>
            </div>
          </div>

          {/* Kernel telemetry pill */}
          <div className="mt-3 flex items-center justify-between rounded-md bg-[#0A0807] px-2.5 py-1 text-[9px] text-[#DD7074] border border-[rgba(221,112,116,0.18)]">
            <span>Kernel: Q4_K_M Dynamic Quant</span>
            <span className="text-[#E46B5E]">Tailscale Mesh / 10Gbps LAN</span>
          </div>
        </div>
      );

    case "spectrogram":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#070504] p-4 font-mono text-xs select-none">
          <div className="flex items-center justify-between text-[10px] text-[#DD7074] pb-2 border-b border-[rgba(221,112,116,0.18)]">
            <span className="flex items-center gap-1.5 text-[#E46B5E]">
              <Radio className="h-3 w-3 animate-pulse" />
              RF SPECTRUM INTERCEPT HEATMAP
            </span>
            <span className="text-[#ECC3AB]">2048 FFT BINS</span>
          </div>

          {/* Simulated Spectrogram Heatmap Waterfall with 4-Step Warm Palette */}
          <div className="mt-2.5 h-16 w-full rounded-lg overflow-hidden border border-[rgba(221,112,116,0.18)] bg-black flex items-center justify-between px-1 gap-1">
            {[45, 80, 20, 95, 60, 30, 75, 90, 40, 85, 25, 92, 65, 35, 78].map((h, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end">
                <div
                  style={{ height: `${h}%` }}
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    h > 75
                      ? "bg-[#ECC3AB] shadow-sm shadow-[#ECC3AB]/30"
                      : h > 50
                      ? "bg-[#E46B5E]"
                      : "bg-[#C3181E]"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Dwell Scheduler Trajectory Overlay */}
          <div className="mt-2.5 flex items-center justify-between text-[9px] text-[#ECC3AB]/85">
            <span className="flex items-center gap-1 text-[#E46B5E]">
              <Activity className="h-3 w-3" />
              Agile Radar Hopping Intercepted
            </span>
            <span className="font-mono text-[#ECC3AB]">Dwell Time: -42%</span>
          </div>
        </div>
      );

    case "dag-pipeline":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#070504] p-4 font-mono text-xs select-none">
          <div className="flex items-center justify-between text-[10px] text-[#DD7074] pb-2 border-b border-[rgba(221,112,116,0.18)]">
            <span className="flex items-center gap-1.5 text-[#E46B5E]">
              <GitFork className="h-3 w-3" />
              ZERO-LEAKAGE SCIKIT-LEARN DAG
            </span>
            <span className="text-[#ECC3AB]">5-FOLD NESTED CV</span>
          </div>

          {/* Directed Acyclic Graph Node Chain */}
          <div className="mt-3 flex items-center justify-between gap-1 text-center">
            <div className="rounded-md border border-[rgba(221,112,116,0.22)] bg-[#0A0807] px-2 py-1 text-[9px] text-[#ECC3AB]">
              Raw Features
            </div>
            <span className="text-[10px] text-[#DD7074]/60">→</span>
            <div className="rounded-md border border-[rgba(228,107,94,0.35)] bg-[#0A0807] px-2 py-1 text-[9px] text-[#E46B5E]">
              Impute / Scale
            </div>
            <span className="text-[10px] text-[#DD7074]/60">→</span>
            <div className="rounded-md border border-[rgba(221,112,116,0.25)] bg-[#0A0807] px-2 py-1 text-[9px] text-[#ECC3AB]">
              Nested CV
            </div>
            <span className="text-[10px] text-[#DD7074]/60">→</span>
            <div className="rounded-md border border-[rgba(228,107,94,0.5)] bg-[#0A0807] px-2 py-1 text-[9px] text-[#E46B5E]">
              XGBoost / Ens
            </div>
          </div>

          {/* Feature Importance & Residual Tracking HUD */}
          <div className="mt-3 rounded-lg border border-[rgba(221,112,116,0.18)] bg-[#0A0807] p-2 text-[9px] space-y-1">
            <div className="flex justify-between text-[#DD7074]">
              <span>SHAP Feature Weight</span>
              <span className="text-[#E46B5E]">Residual Error: ±0.038</span>
            </div>
            <div className="h-1.5 w-full bg-[#14100D] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#E46B5E] to-[#ECC3AB] w-[88%]" />
            </div>
          </div>
        </div>
      );

    case "mobile-ui":
      return (
        <div className="relative h-44 w-full overflow-hidden rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#070504] p-4 font-mono text-xs select-none">
          <div className="flex items-center justify-between text-[10px] text-[#DD7074] pb-2 border-b border-[rgba(221,112,116,0.18)]">
            <span className="flex items-center gap-1.5 text-[#E46B5E]">
              <Smartphone className="h-3 w-3" />
              ADAPTIVE SPACING REPETITION CLIENT
            </span>
            <span className="text-[#ECC3AB]">🔥 18-DAY STREAK</span>
          </div>

          {/* Spaced-Repetition Interactive Flashcard Preview */}
          <div className="mt-2.5 rounded-lg border border-[rgba(221,112,116,0.18)] bg-[#0A0807] p-2.5">
            <div className="flex items-center justify-between text-[9px] text-[#DD7074]">
              <span>ALGORITHMS // THEORETICAL CS</span>
              <span className="rounded bg-[#14100D] px-1 text-[#E46B5E]">SM-2 ALGO</span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-[#ECC3AB]">
              Master Theorem Case 2: T(n) = aT(n/b) + f(n)
            </div>
            <div className="mt-2 flex gap-1.5 text-[8.5px]">
              <span className="rounded bg-[#14100D] border border-[rgba(221,112,116,0.18)] px-2 py-0.5 text-[#DD7074]">
                Hard (1d)
              </span>
              <span className="rounded bg-[#4E0104]/85 border border-[#9A142C] px-2 py-0.5 text-[#E8A791]">
                Good (3d)
              </span>
              <span className="rounded bg-[#C3181E]/20 border border-[#E44847]/40 px-2 py-0.5 text-[#ECC3AB]">
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
