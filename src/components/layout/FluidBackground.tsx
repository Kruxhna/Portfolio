"use client";

import React, { useEffect, useRef, useState } from "react";
import { createFluidReveal, FluidRevealOptions } from "@/lib/fluidReveal";

export interface FluidBackgroundProps {
  frontImagePath?: string;
  backImagePath?: string;
  className?: string;
  options?: Partial<FluidRevealOptions>;
}

export const DEFAULT_FLUID_ASSETS = {
  front: "/Images/FRONT.png",
  back: "/Images/BACK.png",
} as const;

export function FluidBackground({
  frontImagePath = DEFAULT_FLUID_ASSETS.front,
  backImagePath = DEFAULT_FLUID_ASSETS.back,
  className = "",
  options = {},
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const controller = createFluidReveal(canvas, {
      frontImagePath,
      backImagePath,
      ...options,
      onFirstFrameReady: () => {
        setIsReady(true);
        options.onFirstFrameReady?.();
      },
    });

    return () => {
      controller?.destroy();
    };
  }, [frontImagePath, backImagePath, options]);

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#000000] ${className}`}
      aria-hidden="true"
    >
      {/* 1. SSR & No-JS Fallback Image (instant visual with zero layout shift) */}
      <img
        src={frontImagePath}
        alt=""
        fetchPriority="high"
        decoding="async"
        className="w-full h-full object-cover select-none pointer-events-none"
      />

      {/* 2. WebGL2 Fluid Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ease-out select-none pointer-events-none ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 3. Readability Flat Tint Overlay (Maintains WCAG AA contrast) */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundColor: "rgba(0, 0, 0, var(--bg-dim, 0.55))",
        }}
      />
    </div>
  );
}
