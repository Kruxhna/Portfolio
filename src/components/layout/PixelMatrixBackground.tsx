"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

export type PixelMatrixScrollMode = "cycle" | "page" | "hero-dsa";

export interface PixelMatrixBackgroundProps {
  frontImagePath?: string;
  backImagePath?: string;
  tileSize?: number;
  jaggedness?: number;
  stragglerChance?: number;
  lerpEase?: number;
  scrollMode?: PixelMatrixScrollMode;
  className?: string;
}

export const DEFAULT_PIXEL_ASSETS = {
  front: "/Images/FRONT.png",
  back: "/Images/BACK.png",
} as const;

// Warm Obsidian & Terracotta Theme Palette
const THEME = {
  amberSoft: "rgb(229, 152, 102)", // Muted Amber (#E59866)
  gridStroke: "rgba(217, 119, 87, 0.08)", // Blueprint hairline grid
};

// 1D pseudo-random hash generator
function pseudoNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// 2D tile pseudo-random hash generator
function tileNoise2D(col: number, row: number): number {
  const x = Math.sin(col * 93.141 + row * 357.269) * 24634.63;
  return x - Math.floor(x);
}

// Calculate cover crop dimensions for canvas drawing (equivalent to object-fit: cover)
function getCoverCrop(
  imgWidth: number,
  imgHeight: number,
  canvasWidth: number,
  canvasHeight: number
) {
  if (imgWidth <= 0 || imgHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return { sx: 0, sy: 0, sWidth: 1, sHeight: 1 };
  }

  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let sWidth = imgWidth;
  let sHeight = imgHeight;
  let sx = 0;
  let sy = 0;

  if (canvasRatio > imgRatio) {
    sHeight = imgWidth / canvasRatio;
    sy = (imgHeight - sHeight) / 2;
  } else {
    sWidth = imgHeight * canvasRatio;
    sx = (imgWidth - sWidth) / 2;
  }

  return {
    sx: Math.max(0, sx),
    sy: Math.max(0, sy),
    sWidth: Math.max(1, sWidth),
    sHeight: Math.max(1, sHeight),
  };
}

// ============================================================================
// PIXEL MATRIX BACKGROUND COMPONENT
// Crisp, 100% Solid Digital Voxel Dissolve (Zero Opacity / Fade Blending)
// ============================================================================

export function PixelMatrixBackground({
  frontImagePath = DEFAULT_PIXEL_ASSETS.front,
  backImagePath = DEFAULT_PIXEL_ASSETS.back,
  tileSize = 48,
  jaggedness = 0.32,
  stragglerChance = 0.15,
  lerpEase = 0.12,
  scrollMode = "cycle",
  className = "",
}: PixelMatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imagesReady, setImagesReady] = useState(false);

  // HTML5 Image references
  const frontImgRef = useRef<HTMLImageElement | null>(null);
  const backImgRef = useRef<HTMLImageElement | null>(null);

  // Scroll tracking state (smooth lerped scroll position in pixels)
  const targetScrollYRef = useRef<number>(0);
  const currentScrollYRef = useRef<number>(0);

  // ---------------------------------------------------------------------------
  // 1. IMAGE PRELOADING WITH CACHE SUPPORT
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const front = new Image();
    const back = new Image();
    let loaded = 0;

    const onImageLoaded = () => {
      loaded++;
      if (loaded === 2 && active) {
        frontImgRef.current = front;
        backImgRef.current = back;
        setImagesReady(true);
      }
    };

    front.onload = onImageLoaded;
    front.onerror = onImageLoaded;
    back.onload = onImageLoaded;
    back.onerror = onImageLoaded;

    front.src = frontImagePath;
    back.src = backImagePath;

    if (front.complete) onImageLoaded();
    if (back.complete) onImageLoaded();

    return () => {
      active = false;
    };
  }, [frontImagePath, backImagePath]);

  // ---------------------------------------------------------------------------
  // 2. SCROLL TRACKING (Lenis Inertial + Native Fallback)
  // ---------------------------------------------------------------------------
  const handleScroll = useCallback((scroll: number) => {
    targetScrollYRef.current = Math.max(0, scroll);
  }, []);

  useLenis(
    useCallback(
      (lenis: Lenis) => {
        handleScroll(lenis.scroll);
      },
      [handleScroll]
    )
  );

  useEffect(() => {
    const handleNative = () => {
      handleScroll(window.scrollY);
    };
    handleNative();
    window.addEventListener("scroll", handleNative, { passive: true });
    return () => window.removeEventListener("scroll", handleNative);
  }, [handleScroll]);

  // ---------------------------------------------------------------------------
  // 3. CANVAS RENDER LOOP & CRISP VOXEL ENGINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!imagesReady) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
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
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Precompute Column Skyline Offsets (Multi-harmonic equalizer wave)
    let precomputedCols: number[] = [];
    const rebuildColumnOffsets = (totalCols: number) => {
      precomputedCols = new Array(totalCols);
      for (let c = 0; c < totalCols; c++) {
        const u = c / totalCols;
        const wave1 = Math.sin(u * Math.PI * 3.4 + 0.4) * 0.55;
        const wave2 = Math.sin(u * Math.PI * 8.6 - 1.2) * 0.25;
        const noise = pseudoNoise(c * 17.3 + 5.1) * 0.35;
        precomputedCols[c] = (wave1 + wave2 + noise) * jaggedness;
      }
    };

    // Main 60-120fps Animation Loop
    const renderLoop = () => {
      const frontImg = frontImgRef.current;
      const backImg = backImgRef.current;

      if (
        !frontImg ||
        !backImg ||
        !frontImg.complete ||
        !backImg.complete ||
        frontImg.naturalWidth <= 0 ||
        backImg.naturalWidth <= 0
      ) {
        animationFrameId = requestAnimationFrame(renderLoop);
        return;
      }

      // 1. Smooth Scroll Inertial LERP
      const targetScroll = targetScrollYRef.current;
      currentScrollYRef.current += (targetScroll - currentScrollYRef.current) * lerpEase;
      const scrollY = currentScrollYRef.current;

      // 2. Compute Transition Phase & Images based on scrollMode
      let wipeProgress = 0;
      let baseImg = backImg;
      let overlayImg = frontImg;

      if (scrollMode === "cycle") {
        // Multi-phase section cycling: sweeps between FRONT and BACK across sections
        const cycleLength = Math.max(900, height * 1.6);
        const rawCycle = scrollY / cycleLength;
        const cycleIndex = Math.floor(rawCycle);
        const cycleFraction = rawCycle - cycleIndex;

        // Dwell / wipe intervals:
        // 0.0 - 0.20: hold on current image
        // 0.20 - 0.80: active crisp voxel sweep (0 -> 1)
        // 0.80 - 1.00: hold on revealed image
        if (cycleFraction < 0.20) {
          wipeProgress = 0;
        } else if (cycleFraction > 0.80) {
          wipeProgress = 1;
        } else {
          wipeProgress = (cycleFraction - 0.20) / 0.60;
        }

        const isEvenCycle = cycleIndex % 2 === 0;
        baseImg = isEvenCycle ? backImg : frontImg;
        overlayImg = isEvenCycle ? frontImg : backImg;
      } else if (scrollMode === "hero-dsa") {
        // Completes transition over hero exit (~0px to 1200px)
        const threshold = Math.max(1, height * 1.2);
        wipeProgress = Math.max(0, Math.min(1, scrollY / threshold));
        baseImg = backImg;
        overlayImg = frontImg;
      } else {
        // Full page single continuous sweep
        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        wipeProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
        baseImg = backImg;
        overlayImg = frontImg;
      }

      const cols = Math.ceil(width / tileSize);
      const rows = Math.ceil(height / tileSize);

      if (precomputedCols.length !== cols) {
        rebuildColumnOffsets(cols);
      }

      // 3. Base Layer: Draw solid baseImg fitted with cover crop (ALWAYS 100% OPAQUE)
      const baseCrop = getCoverCrop(
        baseImg.naturalWidth,
        baseImg.naturalHeight,
        width,
        height
      );

      ctx.globalAlpha = 1.0;
      ctx.drawImage(
        baseImg,
        baseCrop.sx,
        baseCrop.sy,
        baseCrop.sWidth,
        baseCrop.sHeight,
        0,
        0,
        width,
        height
      );

      // 4. Overlay Voxel Layer: Draw solid overlayImg tiles where delta > 0 (100% SOLID)
      // When delta <= 0, tile is completely omitted, exposing baseImg cleanly with zero fade
      if (wipeProgress < 1.0) {
        const overlayCrop = getCoverCrop(
          overlayImg.naturalWidth,
          overlayImg.naturalHeight,
          width,
          height
        );

        const sweepRange = 1.0 + jaggedness * 1.2 + 0.10;
        const wipePosition = wipeProgress * sweepRange - 0.05;

        for (let r = 0; r < rows; r++) {
          // Wipe upward from bottom to top as user scrolls down
          const rowNorm = (rows - 1 - r) / rows;

          for (let c = 0; c < cols; c++) {
            const colOffset = precomputedCols[c] || 0;
            const tileThreshold = rowNorm + colOffset;

            // Subtle pseudo-random jitter
            const noise = tileNoise2D(c, r);
            const isStraggler = noise < stragglerChance;
            const stragglerOffset = isStraggler
              ? (noise - stragglerChance * 0.5) * 0.18
              : 0;

            const delta = tileThreshold + stragglerOffset - wipePosition;

            // If delta <= 0, the tile is completely dissolved -> baseImg shows cleanly!
            if (delta <= 0) continue;

            const dx = c * tileSize;
            const dy = r * tileSize;
            const dw = Math.min(tileSize, width - dx);
            const dh = Math.min(tileSize, height - dy);

            // Compute source coordinates from overlayImg
            const u = dx / width;
            const v = dy / height;
            const uw = dw / width;
            const vh = dh / height;

            let sx = overlayCrop.sx + u * overlayCrop.sWidth;
            let sy = overlayCrop.sy + v * overlayCrop.sHeight;
            let sw = uw * overlayCrop.sWidth;
            let sh = vh * overlayCrop.sHeight;

            sx = Math.max(0, Math.min(overlayImg.naturalWidth - 1, sx));
            sy = Math.max(0, Math.min(overlayImg.naturalHeight - 1, sy));
            sw = Math.max(1, Math.min(sw, overlayImg.naturalWidth - sx));
            sh = Math.max(1, Math.min(sh, overlayImg.naturalHeight - sy));

            // Draw 100% SOLID voxel tile (strictly no alpha fading)
            ctx.globalAlpha = 1.0;
            ctx.drawImage(overlayImg, sx, sy, sw, sh, dx, dy, dw, dh);

            if (delta < 0.08) {
              // Active wavefront cutting edge: crisp amber/terracotta outline
              ctx.strokeStyle = THEME.amberSoft;
              ctx.lineWidth = 1;
              ctx.strokeRect(dx + 0.5, dy + 0.5, dw - 1, dh - 1);
            } else {
              // Blueprint hairline grid stroke
              ctx.strokeStyle = THEME.gridStroke;
              ctx.lineWidth = 1;
              ctx.strokeRect(dx + 0.5, dy + 0.5, dw - 1, dh - 1);
            }
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [imagesReady, tileSize, jaggedness, stragglerChance, lerpEase, scrollMode]);

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#0A0807] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Instant SSR / No-JS fallback image (prevents layout shift) */}
      {!imagesReady && (
        <img
          src={frontImagePath}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      )}

      {/* 2. Crisp Pixelated Matrix Voxel Image Transition Canvas (zero opacity transition) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
      />

      {/* 3. Readability Flat Tint Overlay (Maintains WCAG AA contrast for text) */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundColor: "rgba(10, 8, 7, var(--bg-dim, 0.22))",
        }}
      />
    </div>
  );
}

export default PixelMatrixBackground;
