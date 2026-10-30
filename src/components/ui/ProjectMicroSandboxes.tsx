"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Activity,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  AlertTriangle,
  Play,
  Sliders,
} from "lucide-react";

// ============================================================================
// 1. AeroMESH Two-Tier Sandbox (Iconger-Style Window + Slider & Presets)
// ============================================================================
export function AeroMeshTwoTierSandbox() {
  const [splitRatio, setSplitRatio] = useState<number>(50); // 0% to 100% offload to Node 2
  const [quantPreset, setQuantPreset] = useState<string>("Q4_K_M");
  const [isSimulating, setIsSimulating] = useState(false);
  const [packetTick, setPacketTick] = useState(0);

  // Pulse packets continuously
  useEffect(() => {
    const timer = setInterval(() => {
      setPacketTick((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  // Compute VRAM based on split and quant
  const getQuantMultiplier = () => {
    if (quantPreset === "Q4_K_M") return 0.55;
    if (quantPreset === "Q5_K_S") return 0.68;
    if (quantPreset === "Q8_0") return 0.95;
    if (quantPreset === "FP16") return 1.85; // Spills over!
    return 0.55;
  };

  const baseVRAM = 10.5 * getQuantMultiplier();
  const node1VRAM = +((1 - splitRatio / 100) * baseVRAM).toFixed(1);
  const node2VRAM = +((splitRatio / 100) * baseVRAM).toFixed(1);

  const isNode1Spill = node1VRAM > 11.5;
  const isNode2Spill = node2VRAM > 11.5;
  const isSpillover = isNode1Spill || isNode2Spill;

  const tokSpeed = quantPreset === "FP16" ? 11.4 : quantPreset === "Q8_0" ? 28.2 : 42.6;
  const ipcLatency = isSpillover ? "16.8ms (PCIe Stall)" : "1.38ms";

  const handlePreset = (preset: string) => {
    setQuantPreset(preset);
    if (preset === "Auto-Balance") {
      setSplitRatio(50);
      setQuantPreset("Q4_K_M");
    } else if (preset === "Reset") {
      setSplitRatio(50);
      setQuantPreset("Q4_K_M");
    }
  };

  return (
    <div className="w-full">
      {/* Tier 1: Dark Application Window */}
      <div className="rounded-xl border border-[#A68E94]/20 bg-[#000000]/90 backdrop-blur-md overflow-hidden shadow-2xl select-none font-mono">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-[#A68E94]/20 px-4 py-3 bg-[#0A0204]/90 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6D001A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#C93B5B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#A68E94]/50" />
            </div>
            <span className="text-[#F5EEF0] text-[11px] font-semibold tracking-wide">
              rpc-server.exe — Mesh Topology Monitor
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className={`h-1.5 w-1.5 rounded-full ${isSpillover ? "bg-red-500 animate-ping" : "bg-[#C93B5B] animate-pulse"}`} />
            <span className={isSpillover ? "text-red-400 font-bold" : "text-[#A68E94]"}>
              {isSpillover ? "VRAM OVERFLOW" : "NODE_01: SYNCED · 0-COPY SHM"}
            </span>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="p-5 sm:p-6 space-y-5 bg-[#000000]/60">
          {/* Spillover Warning Banner */}
          {isSpillover && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-950/30 px-3.5 py-2 text-[11px] text-red-200 animate-pulse">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>
                ⚠ VRAM SPILLOVER: Exceeded 12GB ceiling on consumer GPU. Swapping layers to System RAM (+14ms PCIe stall).
              </span>
            </div>
          )}

          {/* Dual Node Split Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Node 1 */}
            <div className="rounded-xl border border-[#A68E94]/20 bg-[#0A0204]/80 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#F5EEF0] font-bold">NODE 01 (HOST)</span>
                <span className="text-[10px] text-[#C93B5B] font-semibold">RTX 4070 · 12GB</span>
              </div>
              <div className="text-[11px] text-[#A68E94]/80 mb-3">
                Layers 0..{Math.round(31 * (1 - splitRatio / 100))} · Primary Loader
              </div>

              {/* VRAM Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[#A68E94] mb-1.5">
                  <span>VRAM Consumption</span>
                  <span className={isNode1Spill ? "text-red-400 font-bold" : "text-[#F5EEF0]"}>
                    {node1VRAM}GB / 12GB
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#000000] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isNode1Spill
                        ? "bg-red-500 shadow-sm shadow-red-500/50"
                        : "bg-gradient-to-r from-[#6D001A] via-[#C93B5B] to-[#F5EEF0]"
                    }`}
                    style={{ width: `${Math.min(100, (node1VRAM / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Node 2 */}
            <div className="rounded-xl border border-[#A68E94]/20 bg-[#0A0204]/80 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#F5EEF0] font-bold">NODE 02 (PEER)</span>
                <span className="text-[10px] text-[#F5EEF0] font-semibold">RTX 3060 · 12GB</span>
              </div>
              <div className="text-[11px] text-[#A68E94]/80 mb-3">
                Layers {Math.round(31 * (1 - splitRatio / 100)) + 1}..31 · RPC Sockets
              </div>

              {/* VRAM Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[#A68E94] mb-1.5">
                  <span>VRAM Consumption</span>
                  <span className={isNode2Spill ? "text-red-400 font-bold" : "text-[#F5EEF0]"}>
                    {node2VRAM}GB / 12GB
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#000000] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isNode2Spill
                        ? "bg-red-500 shadow-sm shadow-red-500/50"
                        : "bg-gradient-to-r from-[#C93B5B] to-[#F5EEF0]"
                    }`}
                    style={{ width: `${Math.min(100, (node2VRAM / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interconnect Telemetry Strip */}
          <div className="flex items-center justify-between rounded-lg border border-[#A68E94]/15 bg-[#000000] px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-[#C93B5B] font-bold">⇄ IPC RING:</span>
              <span className="text-[#F5EEF0]">{ipcLatency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A68E94]">THROUGHPUT:</span>
              <span className="text-[#C93B5B] font-bold">{tokSpeed} tok/s</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#A68E94]">QUANT:</span>
              <span className="text-[#F5EEF0]">{quantPreset}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Interactive Control Strip */}
      <div className="mt-5 pt-3 border-t border-[#A68E94]/15 space-y-3 font-mono">
        {/* Layer Split Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#A68E94]">
            <span className="uppercase text-[10px] tracking-wider">GPU Offload Ratio:</span>
            <span className="text-[#F5EEF0] font-bold">{splitRatio}% to Node 2 ({100 - splitRatio}% on Host)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={splitRatio}
            onChange={(e) => setSplitRatio(Number(e.target.value))}
            data-cursor="magnetic"
            className="w-full h-1.5 bg-[#140408] rounded-lg appearance-none cursor-pointer accent-[#6D001A]"
          />
        </div>

        {/* Quantization Preset Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {["Q4_K_M", "Q5_K_S", "Q8_0", "FP16", "Auto-Balance", "Reset"].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              data-cursor="magnetic"
              className={`rounded-full px-3 py-1 text-[11px] transition-all cursor-pointer ${
                quantPreset === preset
                  ? "bg-[#6D001A] border border-[#9E0B2E]/60 text-[#F5EEF0] font-bold shadow-xs shadow-[#6D001A]/30"
                  : "bg-[#240009]/85 border border-[#6D001A] text-[#F5EEF0] hover:bg-[#3B000E] hover:text-[#F5EEF0] hover:border-[#9E0B2E]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#C93B5B] mt-3">
          same controls as the mesh daemon. go on, slide to FP16 and watch VRAM spill over
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 2. SmartScan EW Two-Tier Sandbox (3x3 RF Spectrogram + Mode Toggle Deck)
// ============================================================================
export function SmartScanTwoTierSandbox() {
  const [activeMode, setActiveMode] = useState<"priority" | "raster" | "hop">("priority");
  const [lockedChannel, setLockedChannel] = useState<number>(4);
  const [isHopping, setIsHopping] = useState<boolean>(false);

  const channels = [
    { freq: "9.20 GHz", band: "X-Band", pwr: 78, type: "CW Pulse" },
    { freq: "9.84 GHz", band: "X-Band", pwr: 94, type: "Agile Monopulse" },
    { freq: "10.45 GHz", band: "X-Band", pwr: 62, type: "Chirp FM" },
    { freq: "11.12 GHz", band: "Ku-Band", pwr: 85, type: "Phase Coded" },
    { freq: "11.95 GHz", band: "Ku-Band", pwr: 98, type: "Hopping Radar" },
    { freq: "12.60 GHz", band: "Ku-Band", pwr: 54, type: "PRI Stagger" },
    { freq: "13.40 GHz", band: "Ku-Band", pwr: 72, type: "Search Radar" },
    { freq: "14.15 GHz", band: "Ku-Band", pwr: 88, type: "Track Gate" },
    { freq: "14.80 GHz", band: "Ku-Band", pwr: 66, type: "Doppler Beam" },
  ];

  const handleModeChange = (mode: "priority" | "raster" | "hop") => {
    setActiveMode(mode);
    if (mode === "hop") {
      setIsHopping(true);
      let step = 0;
      const hopInterval = setInterval(() => {
        step++;
        setLockedChannel(Math.floor(Math.random() * channels.length));
        if (step >= 6) {
          clearInterval(hopInterval);
          setIsHopping(false);
          setActiveMode("priority");
        }
      }, 200);
    }
  };

  return (
    <div className="w-full">
      {/* Tier 1: Dark Application Window */}
      <div className="rounded-xl border border-[#A68E94]/20 bg-[#000000]/90 backdrop-blur-md overflow-hidden shadow-2xl select-none font-mono">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-[#A68E94]/20 px-4 py-3 bg-[#0A0204]/90 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6D001A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#C93B5B]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#A68E94]/50" />
            </div>
            <span className="text-[#F5EEF0] text-[11px] font-semibold tracking-wide">
              NIRIKSHAN ESM — 2048-Bin RF Waterfall
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#A68E94]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C93B5B] animate-pulse" />
            <span>2,048 FFT BINS · AGILITY SCANNER</span>
          </div>
        </div>

        {/* Visual 3x3 Spectrogram Matrix */}
        <div className="p-5 sm:p-6 bg-[#000000]/60">
          <div className="grid grid-cols-3 gap-3">
            {channels.map((chan, idx) => {
              const isLocked = idx === lockedChannel;
              return (
                <div
                  key={idx}
                  onClick={() => setLockedChannel(idx)}
                  data-cursor="magnetic"
                  className={`relative rounded-xl border p-3 transition-all cursor-pointer ${
                    isLocked
                      ? "border-[#C93B5B] bg-[#140408] shadow-md shadow-[#6D001A]/20"
                      : "border-[#A68E94]/20 bg-[#0A0204]/80 hover:border-[#A68E94]/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className={isLocked ? "text-[#C93B5B] font-bold" : "text-[#A68E94]"}>
                      {chan.freq}
                    </span>
                    <span className="text-[9px] text-[#A68E94]">{chan.band}</span>
                  </div>

                  {/* Signal Mini Waveform */}
                  <div className="h-8 flex items-end gap-0.5 mb-1.5">
                    {[35, 60, 45, isLocked ? 95 : 50, 75, 40].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-t-xs transition-all duration-300 ${
                          isLocked
                            ? "bg-[#C93B5B]"
                            : "bg-[#A68E94]/25"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-[#A68E94] truncate">{chan.type}</span>
                    {isLocked && (
                      <span className="text-[#C93B5B] font-bold tracking-wider">[ LOCK ]</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Emitter Intercept Status Bar */}
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#A68E94]/15 bg-[#000000] px-4 py-2.5 text-[11px]">
            <div>
              <span className="text-[#A68E94]">POI (PROBABILITY):</span>{" "}
              <span className="text-[#F5EEF0] font-bold">
                {activeMode === "raster" ? "61.2% (Blindspots)" : "98.4% [OPTIMAL]"}
              </span>
            </div>
            <div>
              <span className="text-[#A68E94]">DWELL REDUCTION:</span>{" "}
              <span className="text-[#C93B5B] font-bold">-42% Latency</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[#A68E94]">TARGET:</span>{" "}
              <span className="text-[#F5EEF0] font-bold">{channels[lockedChannel].freq}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Interactive Control Strip */}
      <div className="mt-5 pt-3 border-t border-[#A68E94]/15 space-y-3 font-mono">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "priority", label: "Priority Dwell" },
            { id: "raster", label: "Sequential Sweep" },
            { id: "hop", label: "Inject Agile Hop 📡" },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id as any)}
              data-cursor="magnetic"
              className={`rounded-full px-4 py-1.5 text-[11px] transition-all cursor-pointer ${
                activeMode === mode.id
                  ? "bg-[#6D001A] border border-[#9E0B2E]/60 text-[#F5EEF0] font-bold shadow-xs shadow-[#6D001A]/30"
                  : "bg-[#240009]/85 border border-[#6D001A] text-[#F5EEF0] hover:bg-[#3B000E] hover:text-[#F5EEF0] hover:border-[#9E0B2E]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#C93B5B] mt-3">
          2048 FFT bins running in browser. click to inject a frequency hop and watch it lock on
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 4. Adaptive GATE Stacked Interactive Card Deck (Video at 00:07)
// ============================================================================
export function GateLearnStackedDeckSandbox() {
  const cards = [
    {
      id: "master-thm",
      topic: "ASYMPTOTIC ANALYSIS // THEORETICAL CS",
      title: "Master Theorem Extended Form",
      formula: "T(n) = 2T(n/2) + n·log(n)",
      prompt: "Why does standard Master Theorem Case 2 fail for driving function f(n) = n·log(n)?",
      solution: "By Akra-Bazzi method with p = log₂(2) = 1: driving function f(n) = n·log(n) grows by polylogarithmic factor h(n) = log(n). Hence exact recurrence evaluates to T(n) = Θ(n·log²(n)).",
      badge: "Good · 4d",
    },
    {
      id: "dfa-pumping",
      topic: "FORMAL LANGUAGES & AUTOMATA",
      title: "DFA Pumping Lemma Contradiction",
      formula: "L = { 0^p 1^p | p ≥ 0 }",
      prompt: "Using the pumping lemma for regular languages, how do you derive the pumping contradiction for string s = 0^p 1^p?",
      solution: "Let s = xyz with |xy| ≤ p and |y| ≥ 1. String y consists solely of 0's (y = 0^k, k ≥ 1). Pumping to x y² z produces 0^(p+k) 1^p ∉ L, establishing non-regularity.",
      badge: "Easy · 9d",
    },
    {
      id: "boyer-moore",
      topic: "ALGORITHMIC INVARIANTS & PROOFS",
      title: "Boyer-Moore Majority Vote Invariant",
      formula: "Strictly O(N) Time · O(1) Auxiliary Space",
      prompt: "What mathematical invariant guarantees the Boyer-Moore voting algorithm correctly identifies majority element > ⌊n/2⌋?",
      solution: "Pairing distinct elements and discarding both preserves the majority identity, since the true majority occurs strictly > n/2 times and cannot be entirely cancelled out.",
      badge: "Hard · 1d",
    },
    {
      id: "eigen-spectral",
      topic: "LINEAR ALGEBRA & DATA SCIENCE",
      title: "Matrix Eigenvalues & Spectral Radius",
      formula: "det(A - λI) = 0 · ρ(A) ≤ ||A||",
      prompt: "Why is spectral radius ρ(A) < 1 the necessary and sufficient condition for iterative matrix powers A^k → 0?",
      solution: "Jordan canonical form decomposes A = P J P⁻¹. Each Jordan block J_i^k contains λ_i^k on the diagonal. Powers decay to zero if and only if |λ_i| < 1 for all eigenvalues.",
      badge: "Good · 4d",
    },
  ];

  const [deck, setDeck] = useState(cards);
  const [isFlipped, setIsFlipped] = useState(false);
  const [syncDelta, setSyncDelta] = useState(18);

  const handleNextCard = () => {
    setIsFlipped(false);
    setDeck((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
    setSyncDelta(Math.floor(14 + Math.random() * 8));
  };

  const topCard = deck[0];

  return (
    <div className="w-full">
      {/* Tier 1: Fanned / Stacked Interactive Card Deck */}
      <div className="relative min-h-[300px] sm:min-h-[320px] flex items-center justify-center font-mono select-none">
        {/* Card 3 (Bottom) */}
        <div
          className="absolute inset-x-4 sm:inset-x-6 top-6 bottom-0 rounded-2xl border border-[#A68E94]/15 bg-[#000000] shadow-xl pointer-events-none transform translate-y-4 scale-[0.92] opacity-40 transition-all duration-300"
        />

        {/* Card 2 (Middle) */}
        <div
          className="absolute inset-x-2 sm:inset-x-3 top-3 bottom-3 rounded-2xl border border-[#A68E94]/20 bg-[#0A0204] shadow-xl pointer-events-none transform translate-y-2 scale-[0.96] opacity-70 transition-all duration-300"
        />

        {/* Card 1 (Top Active Card) */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          data-cursor="magnetic"
          className="relative z-20 w-full rounded-2xl border border-[#A68E94]/28 bg-[#000000] p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:border-[#C93B5B]/60 cursor-pointer"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between text-xs mb-3 border-b border-[#A68E94]/14 pb-2.5">
            <span className="text-[10px] font-bold text-[#C93B5B] uppercase tracking-wider">
              {topCard.topic}
            </span>
            <span className="rounded-full bg-[#140408] border border-[#C93B5B]/40 px-2.5 py-0.5 text-[9.5px] text-[#F5EEF0]">
              {topCard.badge}
            </span>
          </div>

          {/* Card Content */}
          <div className="space-y-2 min-h-[115px]">
            <h4 className="text-sm sm:text-base font-bold text-[#F5EEF0]">{topCard.title}</h4>
            <div className="text-xs font-semibold text-[#C93B5B]">{topCard.formula}</div>
            <p className="text-xs sm:text-[13px] text-[#F5EEF0]/85 leading-relaxed pt-1 font-sans">
              {isFlipped ? topCard.solution : topCard.prompt}
            </p>
          </div>

          {/* Card Footer: Sync & Action */}
          <div className="mt-5 pt-3 border-t border-[#A68E94]/15 flex items-center justify-between text-[10px] text-[#A68E94]/70">
            <span>{isFlipped ? "SOLUTION REVEALED" : "CLICK CARD TO FLIP PROOF"}</span>
            <span className="text-[#F5EEF0]">SQLite sync: {syncDelta}ms</span>
          </div>
        </div>
      </div>

      {/* Tier 2: Interactive Deck Controller & Rating Pills */}
      <div className="mt-5 pt-3 border-t border-[#A68E94]/15 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Deal next card button */}
          <button
            onClick={handleNextCard}
            data-cursor="magnetic"
            className="rounded-full bg-[#6D001A] border border-[#9E0B2E]/60 text-[#F5EEF0] font-bold px-4 py-1.5 text-xs inline-flex items-center gap-1.5 hover:bg-[#9E0B2E] hover:text-[#F5EEF0] hover:border-[#F5EEF0]/80 active:bg-[#6D001A] transition-all cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Deal Next Card</span>
          </button>

          {/* SM-2 Interval Quick Feedback Pills */}
          <div className="flex items-center gap-1.5 text-[10px]">
            {["Again · 10m", "Hard · 1d", "Good · 4d", "Easy · 9d"].map((pill) => (
              <button
                key={pill}
                onClick={handleNextCard}
                data-cursor="magnetic"
                className="rounded-full bg-[#240009]/85 border border-[#6D001A] px-2.5 py-1 text-[#F5EEF0] hover:bg-[#3B000E] hover:text-[#F5EEF0] hover:border-[#9E0B2E] transition-all cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#C93B5B] mt-3">
          4 of the core CS/DA decks, picked at random. click to deal the next one
        </p>
      </div>
    </div>
  );
}
