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
      <div className="rounded-xl border border-[#CEA491]/18 bg-[#0A0807]/90 backdrop-blur-md overflow-hidden shadow-2xl select-none font-mono">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-[#CEA491]/18 px-4 py-3 bg-[#120D0A]/90 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#AD6A4C]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#BF866D]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#CEA491]/50" />
            </div>
            <span className="text-[#DEC1B4] text-[11px] font-semibold tracking-wide">
              rpc-server.exe — Mesh Topology Monitor
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span className={`h-1.5 w-1.5 rounded-full ${isSpillover ? "bg-red-500 animate-ping" : "bg-[#AD6A4C] animate-pulse"}`} />
            <span className={isSpillover ? "text-red-400 font-bold" : "text-[#CEA491]/70"}>
              {isSpillover ? "VRAM OVERFLOW" : "NODE_01: SYNCED · 0-COPY SHM"}
            </span>
          </div>
        </div>

        {/* Visual Canvas */}
        <div className="p-5 sm:p-6 space-y-5 bg-[#0A0807]/60">
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
            <div className="rounded-xl border border-[#CEA491]/20 bg-[#120D0A]/80 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#FDFCFB] font-bold">NODE 01 (HOST)</span>
                <span className="text-[10px] text-[#AD6A4C] font-semibold">RTX 4070 · 12GB</span>
              </div>
              <div className="text-[11px] text-[#DEC1B4]/70 mb-3">
                Layers 0..{Math.round(31 * (1 - splitRatio / 100))} · Primary Loader
              </div>

              {/* VRAM Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[#CEA491]/65 mb-1.5">
                  <span>VRAM Consumption</span>
                  <span className={isNode1Spill ? "text-red-400 font-bold" : "text-[#FDFCFB]"}>
                    {node1VRAM}GB / 12GB
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#000000] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isNode1Spill
                        ? "bg-red-500 shadow-sm shadow-red-500/50"
                        : "bg-gradient-to-r from-[#AD6A4C] to-[#DEC1B4]"
                    }`}
                    style={{ width: `${Math.min(100, (node1VRAM / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Node 2 */}
            <div className="rounded-xl border border-[#CEA491]/20 bg-[#120D0A]/80 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#FDFCFB] font-bold">NODE 02 (PEER)</span>
                <span className="text-[10px] text-[#DEC1B4] font-semibold">RTX 3060 · 12GB</span>
              </div>
              <div className="text-[11px] text-[#DEC1B4]/70 mb-3">
                Layers {Math.round(31 * (1 - splitRatio / 100)) + 1}..31 · RPC Sockets
              </div>

              {/* VRAM Bar */}
              <div>
                <div className="flex justify-between text-[10px] text-[#CEA491]/65 mb-1.5">
                  <span>VRAM Consumption</span>
                  <span className={isNode2Spill ? "text-red-400 font-bold" : "text-[#FDFCFB]"}>
                    {node2VRAM}GB / 12GB
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#000000] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isNode2Spill
                        ? "bg-red-500 shadow-sm shadow-red-500/50"
                        : "bg-gradient-to-r from-[#DEC1B4] to-[#BF866D]"
                    }`}
                    style={{ width: `${Math.min(100, (node2VRAM / 12) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interconnect Telemetry Strip */}
          <div className="flex items-center justify-between rounded-lg border border-[#CEA491]/14 bg-[#000000] px-4 py-2.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-[#AD6A4C] font-bold">⇄ IPC RING:</span>
              <span className="text-[#FDFCFB]">{ipcLatency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#CEA491]/60">THROUGHPUT:</span>
              <span className="text-[#AD6A4C] font-bold">{tokSpeed} tok/s</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[#CEA491]/60">QUANT:</span>
              <span className="text-[#DEC1B4]">{quantPreset}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Interactive Control Strip */}
      <div className="mt-5 pt-3 border-t border-[#CEA491]/12 space-y-3 font-mono">
        {/* Layer Split Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#CEA491]/70">
            <span className="uppercase text-[10px] tracking-wider">GPU Offload Ratio:</span>
            <span className="text-[#FDFCFB] font-bold">{splitRatio}% to Node 2 ({100 - splitRatio}% on Host)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={splitRatio}
            onChange={(e) => setSplitRatio(Number(e.target.value))}
            data-cursor="magnetic"
            className="w-full h-1.5 bg-[#14100D] rounded-lg appearance-none cursor-pointer accent-[#AD6A4C]"
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
                  ? "bg-[#AD6A4C] text-[#000000] font-bold shadow-xs shadow-[#AD6A4C]/30"
                  : "bg-[#0A0807]/80 border border-[#CEA491]/20 text-[#DEC1B4]/75 hover:border-[#AD6A4C]/50 hover:text-[#FDFCFB]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#AD6A4C] mt-3">
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
      <div className="rounded-xl border border-[#CEA491]/18 bg-[#0A0807]/90 backdrop-blur-md overflow-hidden shadow-2xl select-none font-mono">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-[#CEA491]/18 px-4 py-3 bg-[#120D0A]/90 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#AD6A4C]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#BF866D]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#CEA491]/50" />
            </div>
            <span className="text-[#DEC1B4] text-[11px] font-semibold tracking-wide">
              NIRIKSHAN ESM — 2048-Bin RF Waterfall
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#CEA491]/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C] animate-pulse" />
            <span>2,048 FFT BINS · AGILITY SCANNER</span>
          </div>
        </div>

        {/* Visual 3x3 Spectrogram Matrix */}
        <div className="p-5 sm:p-6 bg-[#0A0807]/60">
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
                      ? "border-[#AD6A4C] bg-[#14100D] shadow-md shadow-[#AD6A4C]/20"
                      : "border-[#CEA491]/14 bg-[#0E0B09]/80 hover:border-[#CEA491]/30"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className={isLocked ? "text-[#AD6A4C] font-bold" : "text-[#CEA491]/65"}>
                      {chan.freq}
                    </span>
                    <span className="text-[9px] text-[#DEC1B4]/60">{chan.band}</span>
                  </div>

                  {/* Signal Mini Waveform */}
                  <div className="h-8 flex items-end gap-0.5 mb-1.5">
                    {[35, 60, 45, isLocked ? 95 : 50, 75, 40].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`flex-1 rounded-t-xs transition-all duration-300 ${
                          isLocked
                            ? "bg-[#AD6A4C]"
                            : "bg-[#CEA491]/25"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-[#DEC1B4]/70 truncate">{chan.type}</span>
                    {isLocked && (
                      <span className="text-[#AD6A4C] font-bold tracking-wider">[ LOCK ]</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Emitter Intercept Status Bar */}
          <div className="mt-4 flex items-center justify-between rounded-lg border border-[#CEA491]/14 bg-[#000000] px-4 py-2.5 text-[11px]">
            <div>
              <span className="text-[#CEA491]/60">POI (PROBABILITY):</span>{" "}
              <span className="text-[#FDFCFB] font-bold">
                {activeMode === "raster" ? "61.2% (Blindspots)" : "98.4% [OPTIMAL]"}
              </span>
            </div>
            <div>
              <span className="text-[#CEA491]/60">DWELL REDUCTION:</span>{" "}
              <span className="text-[#AD6A4C] font-bold">-42% Latency</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[#CEA491]/60">TARGET:</span>{" "}
              <span className="text-[#DEC1B4] font-bold">{channels[lockedChannel].freq}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Interactive Control Strip */}
      <div className="mt-5 pt-3 border-t border-[#CEA491]/12 space-y-3 font-mono">
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
                  ? "bg-[#AD6A4C] text-[#000000] font-bold shadow-xs shadow-[#AD6A4C]/30"
                  : "bg-[#0A0807]/80 border border-[#CEA491]/20 text-[#DEC1B4]/75 hover:border-[#AD6A4C]/50 hover:text-[#FDFCFB]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#AD6A4C] mt-3">
          2048 FFT bins running in browser. click to inject a frequency hop and watch it lock on
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// 3. Modular ML Benchmarker Two-Tier Sandbox (Residuals + 6 Circular Swatches)
// ============================================================================
export function MLBenchmarkerTwoTierSandbox() {
  const [selectedModel, setSelectedModel] = useState<string>("XGBoost");

  const models: Record<string, { r2: string; res: string; leak: string; color: string; shap: number[] }> = {
    XGBoost: { r2: "0.942", res: "±0.038", leak: "0.00%", color: "#AD6A4C", shap: [92, 78, 64, 45] },
    LightGBM: { r2: "0.931", res: "±0.042", leak: "0.00%", color: "#BF866D", shap: [88, 82, 58, 51] },
    CatBoost: { r2: "0.938", res: "±0.039", leak: "0.00%", color: "#DEC1B4", shap: [90, 79, 61, 48] },
    RandomForest: { r2: "0.922", res: "±0.049", leak: "0.00%", color: "#CEA491", shap: [84, 75, 61, 48] },
    ElasticNet: { r2: "0.865", res: "±0.089", leak: "0.00%", color: "#EEDED7", shap: [70, 65, 42, 38] },
    "Leaky Baseline": { r2: "0.989 [LEAKY]", res: "±0.142 (OOD)", leak: "18.4% [FAIL]", color: "#EF4444", shap: [99, 32, 18, 12] },
  };

  const current = models[selectedModel];

  return (
    <div className="w-full">
      {/* Tier 1: Dark Application Window */}
      <div className="rounded-xl border border-[#CEA491]/18 bg-[#0A0807]/90 backdrop-blur-md overflow-hidden shadow-2xl select-none font-mono">
        {/* Titlebar */}
        <div className="flex items-center justify-between border-b border-[#CEA491]/18 px-4 py-3 bg-[#120D0A]/90 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#AD6A4C]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#BF866D]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#CEA491]/50" />
            </div>
            <span className="text-[#DEC1B4] text-[11px] font-semibold tracking-wide">
              mlbench-diagnostics — 5-Fold Nested Cross-Validation
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                selectedModel === "Leaky Baseline" ? "bg-red-500 animate-ping" : "bg-[#AD6A4C]"
              }`}
            />
            <span className={selectedModel === "Leaky Baseline" ? "text-red-400 font-bold" : "text-[#CEA491]/70"}>
              LEAKAGE: {current.leak}
            </span>
          </div>
        </div>

        {/* Visual Canvas: Residual Curve + SHAP Bars */}
        <div className="p-5 sm:p-6 space-y-5 bg-[#0A0807]/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Score & Residual Bell Curve */}
            <div className="rounded-xl border border-[#CEA491]/18 bg-[#120D0A]/80 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#CEA491]/65 text-[10px] uppercase">R² Cross-Val Score:</span>
                  <span className="text-[10px] text-[#AD6A4C]">{current.res} variance</span>
                </div>
                <div
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: current.color }}
                >
                  {current.r2}
                </div>
              </div>

              {/* Residual Distribution Curve SVG */}
              <div className="mt-4 pt-3 border-t border-[#CEA491]/12">
                <div className="flex justify-between text-[9px] text-[#CEA491]/55 mb-1">
                  <span>-3σ</span>
                  <span>Residual Error Distribution</span>
                  <span>+3σ</span>
                </div>
                <svg viewBox="0 0 160 40" className="w-full h-10 overflow-visible">
                  <path
                    d={
                      selectedModel === "Leaky Baseline"
                        ? "M 10 38 Q 40 38 70 30 Q 90 5 110 30 Q 130 38 150 38"
                        : "M 10 38 Q 50 38 70 20 Q 80 5 90 20 Q 110 38 150 38"
                    }
                    fill="none"
                    stroke={current.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                  <line x1="80" y1="5" x2="80" y2="38" stroke="rgba(206,164,145,0.25)" strokeDasharray="2,2" />
                </svg>
              </div>
            </div>

            {/* Right: SHAP Feature Importance Bars */}
            <div className="rounded-xl border border-[#CEA491]/18 bg-[#120D0A]/80 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] text-[#CEA491]/70 mb-1">
                <span>SHAP FEATURE WEIGHTS</span>
                <span className="text-[#DEC1B4]">Top 4 Predictors</span>
              </div>

              {[
                { label: "spectral_centroid", val: current.shap[0] },
                { label: "tensor_ipc_latency", val: current.shap[1] },
                { label: "ring_buffer_shm", val: current.shap[2] },
                { label: "dwell_time_delta", val: current.shap[3] },
              ].map((f) => (
                <div key={f.label} className="space-y-0.5">
                  <div className="flex justify-between text-[9.5px] text-[#DEC1B4]/80">
                    <span className="truncate">{f.label}</span>
                    <span className="font-bold" style={{ color: current.color }}>
                      {f.val}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#000000] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${f.val}%`, backgroundColor: current.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tier 2: Bottom Control Strip (6 Circular Swatches like Video) */}
      <div className="mt-5 pt-3 border-t border-[#CEA491]/12 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] uppercase text-[#CEA491]/60 mr-1">ESTIMATOR SWATCHES:</span>
            {Object.keys(models).map((name) => {
              const isSel = selectedModel === name;
              const color = models[name].color;
              return (
                <button
                  key={name}
                  onClick={() => setSelectedModel(name)}
                  data-cursor="magnetic"
                  title={name}
                  className={`group relative flex h-7 w-7 items-center justify-center rounded-full transition-all cursor-pointer ${
                    isSel ? "ring-2 ring-offset-2 ring-offset-[#000000] ring-[#AD6A4C] scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSel && <Check className="h-3.5 w-3.5 text-[#000000]" />}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#CEA491]/75">
            estimator: <span className="text-[#FDFCFB] font-bold">{selectedModel.toLowerCase()}/fold-3</span>
          </div>
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#AD6A4C] mt-3">
          pick an estimator swatch. it recalculates fold residuals and SHAP weights on the fly
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
          className="absolute inset-x-4 sm:inset-x-6 top-6 bottom-0 rounded-2xl border border-[#CEA491]/15 bg-[#070504] shadow-xl pointer-events-none transform translate-y-4 scale-[0.92] opacity-40 transition-all duration-300"
        />

        {/* Card 2 (Middle) */}
        <div
          className="absolute inset-x-2 sm:inset-x-3 top-3 bottom-3 rounded-2xl border border-[#CEA491]/20 bg-[#0C0908] shadow-xl pointer-events-none transform translate-y-2 scale-[0.96] opacity-70 transition-all duration-300"
        />

        {/* Card 1 (Top Active Card) */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          data-cursor="magnetic"
          className="relative z-20 w-full rounded-2xl border border-[#CEA491]/28 bg-[#0A0807] p-6 sm:p-7 shadow-2xl transition-all duration-300 hover:border-[#AD6A4C]/60 cursor-pointer"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between text-xs mb-3 border-b border-[#CEA491]/14 pb-2.5">
            <span className="text-[10px] font-bold text-[#AD6A4C] uppercase tracking-wider">
              {topCard.topic}
            </span>
            <span className="rounded-full bg-[#14100D] border border-[#AD6A4C]/40 px-2.5 py-0.5 text-[9.5px] text-[#DEC1B4]">
              {topCard.badge}
            </span>
          </div>

          {/* Card Content */}
          <div className="space-y-2 min-h-[115px]">
            <h4 className="text-sm sm:text-base font-bold text-[#FDFCFB]">{topCard.title}</h4>
            <div className="text-xs font-semibold text-[#AD6A4C]">{topCard.formula}</div>
            <p className="text-xs sm:text-[13px] text-[#EEDED7]/85 leading-relaxed pt-1 font-sans">
              {isFlipped ? topCard.solution : topCard.prompt}
            </p>
          </div>

          {/* Card Footer: Sync & Action */}
          <div className="mt-5 pt-3 border-t border-[#CEA491]/12 flex items-center justify-between text-[10px] text-[#CEA491]/65">
            <span>{isFlipped ? "SOLUTION REVEALED" : "CLICK CARD TO FLIP PROOF"}</span>
            <span className="text-[#DEC1B4]">SQLite sync: {syncDelta}ms</span>
          </div>
        </div>
      </div>

      {/* Tier 2: Interactive Deck Controller & Rating Pills */}
      <div className="mt-5 pt-3 border-t border-[#CEA491]/12 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Deal next card button */}
          <button
            onClick={handleNextCard}
            data-cursor="magnetic"
            className="rounded-full bg-[#AD6A4C] text-[#000000] font-bold px-4 py-1.5 text-xs inline-flex items-center gap-1.5 hover:bg-[#BF866D] transition-all cursor-pointer"
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
                className="rounded-full bg-[#0A0807]/80 border border-[#CEA491]/20 px-2.5 py-1 text-[#DEC1B4]/70 hover:border-[#AD6A4C]/50 hover:text-[#FDFCFB] transition-all cursor-pointer"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Egorz-Style Italic Cheeky Caption */}
        <p className="text-xs font-mono italic text-[#AD6A4C] mt-3">
          4 of the core CS/DA decks, picked at random. click to deal the next one
        </p>
      </div>
    </div>
  );
}
