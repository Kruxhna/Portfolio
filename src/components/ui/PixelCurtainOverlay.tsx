"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type PixelCurtainMode = "dissolve" | "reveal" | "between-sections";

export interface PixelCurtainConfig {
  /** Size of each square voxel tile in pixels (default: 52) */
  tileSize?: number;
  /** Amplitude of the jagged skyline column waves (default: 0.35) */
  jaggedness?: number;
  /** Probability of floating outlier / detached straggler voxels (default: 0.18) */
  stragglerChance?: number;
  /** Inertial momentum smoothing weight for scroll scrubbing (default: 0.08) */
  lerpEase?: number;
  /** Alpha of the faint technical blueprint grid line on active tiles (default: 0.07) */
  gridLineAlpha?: number;
  /** Chance of a dissolving edge tile glowing warm terracotta / amber (default: 0.22) */
  amberHighlightChance?: number;
  /** Scroll position (in px) where the dissolve wipe starts (default: 0) */
  scrollStart?: number;
  /** Scroll position (in px) where the dissolve wipe finishes (default: 750) */
  scrollEnd?: number;
  /** Target element ID to automatically tie the transition boundary to (e.g. "what-i-do") */
  targetSectionId?: string;
  /** Transition mode: "dissolve" (starts solid, dissolves away), "reveal" (materializes), or "between-sections" */
  mode?: PixelCurtainMode;
  /** Direction of the wipe: "up" dissolves bottom-to-top, "down" top-to-bottom */
  direction?: "up" | "down";
  /** Optional container class name */
  className?: string;
  /** Display cybernetic telemetry label in the corner */
  showTelemetry?: boolean;
}

const DEFAULT_CONFIG: Required<Omit<PixelCurtainConfig, "targetSectionId">> & {
  targetSectionId: string | undefined;
} = {
  tileSize: 52,
  jaggedness: 0.35,
  stragglerChance: 0.18,
  lerpEase: 0.08,
  gridLineAlpha: 0.07,
  amberHighlightChance: 0.22,
  scrollStart: 0,
  scrollEnd: 750,
  targetSectionId: undefined,
  mode: "dissolve",
  direction: "up",
  className: "fixed inset-0 pointer-events-none z-20",
  showTelemetry: false,
};

// Warm Obsidian, Terracotta & Amber Palette Tokens
const THEME = {
  curtainBase: "#12100E", // Warm Obsidian / Matte Charcoal
  curtainUmber: "#1C1714", // Deep Umber variance
  amberGlow: "rgb(217, 119, 87)", // Warm Terracotta (#D97757)
  amberSoft: "rgb(229, 152, 102)", // Muted Amber (#E59866)
  gridStroke: "rgba(217, 119, 87, 0.07)", // Blueprint hairline grid
};

// Fast deterministic 1D pseudo-random hash generator
function pseudoNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// 2D tile pseudo-random hash generator
function tileNoise2D(col: number, row: number): number {
  const x = Math.sin(col * 93.141 + row * 357.269) * 24634.63;
  return x - Math.floor(x);
}

// ============================================================================
// PIXEL CURTAIN OVERLAY COMPONENT
// ============================================================================

export function PixelCurtainOverlay(props: PixelCurtainConfig) {
  const config = { ...DEFAULT_CONFIG, ...props };
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll tracking state
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const isSleepingRef = useRef<boolean>(false);
  const [telemetryProgress, setTelemetryProgress] = useState<number>(0);

  // Compute scroll progress from window or Lenis
  const updateScrollProgress = useCallback(
    (scroll: number) => {
      let start = config.scrollStart;
      let end = config.scrollEnd;

      // If tied to a target element ID, measure its position dynamically
      if (config.targetSectionId) {
        const el = document.getElementById(config.targetSectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + scroll;
          start = Math.max(0, top - window.innerHeight * 0.7);
          end = top + window.innerHeight * 0.3;
        }
      }

      const range = Math.max(1, end - start);
      const rawProgress = Math.max(0, Math.min(1, (scroll - start) / range));

      // Calculate effective wipe threshold according to configured mode
      let effective = rawProgress;
      if (config.mode === "reveal") {
        effective = 1 - rawProgress;
      } else if (config.mode === "between-sections") {
        // Triangle function: 0 -> 1 -> 0 across the boundary
        effective = rawProgress < 0.5 ? rawProgress * 2 : (1 - rawProgress) * 2;
      }

      targetProgressRef.current = effective;
    },
    [config.scrollStart, config.scrollEnd, config.targetSectionId, config.mode]
  );

  // Connect to Lenis if mounted inside SmoothScrollProvider
  useLenis(
    useCallback(
      (lenis: Lenis) => {
        updateScrollProgress(lenis.scroll);
      },
      [updateScrollProgress]
    )
  );

  // Native window scroll fallback
  useEffect(() => {
    const handleNativeScroll = () => {
      updateScrollProgress(window.scrollY);
    };
    handleNativeScroll();
    window.addEventListener("scroll", handleNativeScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleNativeScroll);
  }, [updateScrollProgress]);

  // ---------------------------------------------------------------------------
  // CANVAS RENDER & VOXEL EQUALIZER WAVE SIMULATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animationFrameId: number;

    const handleResize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      isSleepingRef.current = false;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Precompute Column Wave Offsets (Skyline Equalizer effect)
    let precomputedCols: number[] = [];
    const rebuildColumnOffsets = (totalCols: number) => {
      precomputedCols = new Array(totalCols);
      for (let c = 0; c < totalCols; c++) {
        const u = c / totalCols;
        // Multi-frequency harmonic wave resembling a computational load equalizer
        const wave1 = Math.sin(u * Math.PI * 3.4 + 0.4) * 0.55;
        const wave2 = Math.sin(u * Math.PI * 8.6 - 1.2) * 0.25;
        const noise = pseudoNoise(c * 17.3 + 5.1) * 0.35;
        precomputedCols[c] = (wave1 + wave2 + noise) * config.jaggedness;
      }
    };

    let lastLoggedTelemetry = -1;

    // Main RAF Loop
    const renderLoop = () => {
      // 1. Inertial Damped Progress LERP
      const targetP = targetProgressRef.current;
      currentProgressRef.current += (targetP - currentProgressRef.current) * config.lerpEase;
      const progress = currentProgressRef.current;

      // Telemetry update throttling
      if (config.showTelemetry) {
        const pct = Math.round(progress * 100);
        if (pct !== lastLoggedTelemetry) {
          lastLoggedTelemetry = pct;
          setTelemetryProgress(pct);
        }
      }

      // 2. Sleep Optimization: When fully dissolved, bypass draw operations completely
      if (progress >= 0.998 && targetP >= 0.998) {
        if (!isSleepingRef.current) {
          ctx.clearRect(0, 0, width, height);
          isSleepingRef.current = true;
        }
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }
      isSleepingRef.current = false;

      // 3. Clear canvas for fresh alpha blending
      ctx.clearRect(0, 0, width, height);

      const tileSize = config.tileSize;
      const cols = Math.ceil(width / tileSize);
      const rows = Math.ceil(height / tileSize);

      if (precomputedCols.length !== cols) {
        rebuildColumnOffsets(cols);
      }

      // Expanded sweep range so all straggler voxels fully clear the viewport bounds
      const sweepRange = 1.0 + config.jaggedness * 1.35 + 0.28;
      const wipePosition = progress * sweepRange - (config.jaggedness * 0.65 + 0.08);

      // Render Each Voxel Cell
      for (let r = 0; r < rows; r++) {
        const rowNorm = config.direction === "up" ? (rows - 1 - r) / rows : r / rows;

        for (let c = 0; c < cols; c++) {
          const colOffset = precomputedCols[c] || 0;
          const tileThreshold = rowNorm + colOffset;

          // Outlier Straggler Jitter (~18% of tiles float slightly ahead or behind)
          const noise = tileNoise2D(c, r);
          const isStraggler = noise < config.stragglerChance;
          const stragglerOffset = isStraggler ? (noise - config.stragglerChance * 0.5) * 0.24 : 0;

          // Delta distance from active wipe boundary
          const delta = tileThreshold + stragglerOffset - wipePosition;

          // If delta <= 0, voxel is completely dissolved and deallocated
          if (delta <= 0) continue;

          const x = c * tileSize;
          const y = r * tileSize;

          // -----------------------------------------------------------------
          // MULTI-STAGE OPACITY & THERMAL COLOR INTERPOLATION
          // -----------------------------------------------------------------
          if (delta >= 0.14) {
            // A. Solid Curtain State: Warm Obsidian with 1px hairline blueprint grid
            ctx.fillStyle = THEME.curtainBase;
            ctx.fillRect(x, y, tileSize, tileSize);

            // Subtle 1px grid border
            ctx.strokeStyle = THEME.gridStroke;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
          } else {
            // B. Active Dissolve Edge & Amber Shimmer
            const normEdge = delta / 0.14; // 0.0 (near threshold) -> 1.0 (approaching solid)

            // Quantized stepped opacity (0.85 -> 0.52 -> 0.24 -> 0.08)
            let alpha: number;
            if (normEdge > 0.7) {
              alpha = 0.85;
            } else if (normEdge > 0.4) {
              alpha = 0.52;
            } else if (normEdge > 0.15) {
              alpha = 0.24;
            } else {
              alpha = 0.08;
            }

            // Amber / Terracotta Edge Glow (~20% boundary voxels)
            const isAmber = noise > 1.0 - config.amberHighlightChance;
            if (isAmber) {
              // Glowing terracotta boundary tile with slight scale-down (0.92)
              ctx.fillStyle = `rgba(217, 119, 87, ${Math.min(0.65, alpha * 1.6)})`;
              const scale = 0.88 + normEdge * 0.12;
              const inset = (tileSize * (1 - scale)) / 2;
              ctx.fillRect(x + inset, y + inset, tileSize * scale, tileSize * scale);

              // Bright amber highlight border
              ctx.strokeStyle = `rgba(229, 152, 102, ${alpha * 0.85})`;
              ctx.lineWidth = 1;
              ctx.strokeRect(x + inset + 0.5, y + inset + 0.5, tileSize * scale - 1, tileSize * scale - 1);
            } else {
              // Standard dissolving warm obsidian tile
              ctx.fillStyle = `rgba(18, 16, 14, ${alpha})`;
              ctx.fillRect(x, y, tileSize, tileSize);

              ctx.strokeStyle = `rgba(217, 119, 87, ${alpha * config.gridLineAlpha})`;
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    config.tileSize,
    config.jaggedness,
    config.stragglerChance,
    config.lerpEase,
    config.gridLineAlpha,
    config.amberHighlightChance,
    config.direction,
    config.showTelemetry,
  ]);

  return (
    <div
      aria-hidden="true"
      className={`${config.className} select-none overflow-hidden`}
    >
      {/* HTML5 Matrix Voxel Simulation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full block" />

      {/* Optional Cybernetic Telemetry HUD Readout */}
      {config.showTelemetry && (
        <div className="absolute top-20 right-6 z-30 font-mono text-[10px] tracking-widest uppercase text-[#D97757]/90 bg-[#12100E]/85 border border-[#D97757]/25 px-3 py-1.5 backdrop-blur-md rounded-md flex items-center gap-2 shadow-xl">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#D97757] animate-pulse" />
          <span>VOXEL MATRIX // DISSOLVE: {telemetryProgress}%</span>
        </div>
      )}
    </div>
  );
}

export default PixelCurtainOverlay;
