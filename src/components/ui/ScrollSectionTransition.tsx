"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// ============================================================================
// TYPES
// ============================================================================

export interface ScrollSectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  indexTag?: string;
  label?: string;
  showDivider?: boolean;
  delay?: number;
  as?: "div" | "section";
}

// ============================================================================
// SCROLL SECTION TRANSITION WRAPPER
// Uses mathematical easing cubic-bezier(0.16, 1, 0.3, 1) from the blueprint
// ============================================================================

export function ScrollSectionTransition({
  children,
  id,
  className = "",
  indexTag,
  label,
  showDivider = true,
  delay = 0,
  as = "div",
}: ScrollSectionTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const MotionTag = as === "section" ? motion.section : motion.div;

  // If user prefers reduced motion, render clean static container
  if (shouldReduceMotion) {
    const StaticTag = as;
    return (
      <StaticTag id={id} className={`relative w-full ${className}`}>
        {showDivider && indexTag && (
          <div className="w-full mb-10 pt-6">
            <div className="w-full h-px bg-[rgba(221,112,116,0.16)]" />
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-[#A68E94] pt-3">
              <span className="flex items-center gap-2">
                <span className="text-[#9E0B2E] font-semibold">{indexTag}</span>
                {label && <span className="text-[#F5EEF0]/80">{label}</span>}
              </span>
              <span className="text-[#A68E94]/50 tracking-wider">SYSTEM://SECTION</span>
            </div>
          </div>
        )}
        {children}
      </StaticTag>
    );
  }

  return (
    <MotionTag
      id={id}
      initial={{
        opacity: 0,
        y: 36,
        scale: 0.985,
        filter: "blur(6px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, amount: 0.08, margin: "-40px 0px -60px 0px" }}
      transition={{
        duration: 0.85,
        delay,
        ease: [0.16, 1, 0.3, 1], // Exact smooth bezier from blueprint
      }}
      className={`relative w-full will-change-[transform,opacity,filter] ${className}`}
    >
      {/* ── AMBIENT SECTION CONNECTOR & HAIRLINE DIVIDER ── */}
      {showDivider && indexTag && (
        <div className="w-full mb-8 sm:mb-12 pt-8 select-none">
          {/* Animated 1px Hairline Gradient Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-px origin-left bg-gradient-to-r from-[rgba(195,24,30,0.45)] via-[rgba(236,195,171,0.3)] to-[rgba(221,112,116,0.12)]"
          />

          {/* Monospace Metadata Row */}
          <div className="flex items-center justify-between font-mono text-[10.5px] sm:text-[11px] uppercase tracking-widest text-[#A68E94] pt-3 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9E0B2E]" />
              <span className="font-bold text-[#9E0B2E]">{indexTag}</span>
              {label && (
                <>
                  <span className="text-[#A68E94]/40">//</span>
                  <span className="text-[#F5EEF0] font-medium tracking-wider">{label}</span>
                </>
              )}
            </div>

            <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-[#A68E94]/60">
              COORDINATES · ACTIVE
            </span>
          </div>
        </div>
      )}

      {/* ── SECTION CONTENT ── */}
      {children}
    </MotionTag>
  );
}
