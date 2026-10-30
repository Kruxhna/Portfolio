"use client";

import React from "react";
import { Tsunami, type TsunamiProps } from "@/components/ui/Tsunami";
import { useGlobalTsunamiMode } from "@/lib/tsunamiStore";

// ============================================================================
// TSUNAMI BACKGROUND COMPONENT
// Reverse-Engineered from https://www.framer.com/marketplace/components/tsunami/
// High-performance WebGL liquid wave distortion engine with CAESAR plain colors
// Replaces the legacy FRONT.png / BACK.png image transitions across the entire site
// ============================================================================

export interface PixelMatrixBackgroundProps extends Partial<TsunamiProps> {
  className?: string;
  frontImagePath?: string; // Legacy API compatibility
  backImagePath?: string;  // Legacy API compatibility
  scrollMode?: string;     // Legacy API compatibility
}

export function PixelMatrixBackground({
  className = "",
  ...props
}: PixelMatrixBackgroundProps) {
  const [mode] = useGlobalTsunamiMode();

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#000000] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Reverse-Engineered Tsunami Wave Distortion with Liquid Chrome & CAESAR Colors */}
      <Tsunami
        className="absolute inset-0 w-full h-full"
        mode={mode}
        scrollControlled={mode === "scroll"}
        interactive={true}
        angle={115}
        distortion={0.65}
        waveWidth={0.28}
        disturbance={0.38}
        dispersion={0.35}
        reflection={0.35}
        shadow={0.22}
        velocityMultiplier={2.2}
        ambientSpeed={0.012}
        colors={{
          bg: "#000000",
          fg: "#0A0204",
          accent: "#6D001A",
          highlight: "#9E0B2E",
        }}
        {...props}
      />

      {/* 2. Luxury Atmospheric Contrast Vignette (Preserves WCAG text readability) */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 40%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </div>
  );
}

// Named alias
export const TsunamiBackground = PixelMatrixBackground;
export default PixelMatrixBackground;
