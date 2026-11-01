"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
} from "framer-motion";

/**
 * Editorial "K" Page-Refresh Preloader & Shutter Reveal (egorz.com-inspired)
 *
 * 4-Stage Sequence:
 * Stage 1 (0.0s – 1.1s):
 *   - Stark off-white/silver (#EFF1F5) full-screen curtain with hairline grid.
 *   - Centered geometric "K" tilted at -8deg drawing stroke in (0 -> 1).
 *   - Bottom-left monospace telemetry with pulsing crimson dot.
 *   - Bottom-right monospace counter (000 -> 100) using cubic-bezier curve.
 *
 * Stage 2 (1.15s – 1.45s):
 *   - Telemetry and counter slide down and fade out.
 *   - "K" wireframe fills with Crimson (#ef4444) to Cosmic Violet (#8E96FF) gradient.
 *   - Spring compression: scale 1.0 -> 0.55 (stiffness: 400, damping: 28).
 *
 * Stage 3 (1.45s – 2.1s):
 *   - Shutter curtain translates upward: y: "-100%" with 2px crimson trailing bottom border.
 *   - Cleanly unveils dark cosmic void & hero section underneath.
 *
 * Stage 4 (2.1s+):
 *   - Body scroll unlocked.
 *   - Window event dispatched: `k-preloader-complete`.
 *   - Component unmounts cleanly from DOM (returns null).
 */
export function KPreloader() {
  const reducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [displayCount, setDisplayCount] = useState("000");

  const progress = useMotionValue(0);
  const hasUnlockedScrollRef = useRef(false);

  // Guarantee body scroll lock on mount, restore on unmount
  useEffect(() => {
    setIsMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, []);

  // Safe scroll unlocking helper
  const unlockScroll = () => {
    if (!hasUnlockedScrollRef.current) {
      hasUnlockedScrollRef.current = true;
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("k-preloader-complete"));
    }
  };

  // Main animation sequence controller
  useEffect(() => {
    if (!isMounted) return;

    if (reducedMotion) {
      // Instant graceful skip for reduced motion
      const t = setTimeout(() => {
        unlockScroll();
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(t);
    }

    // Stage 1: Progress counter 000 -> 100 over 1.1s
    const controls = animate(progress, 100, {
      duration: 1.1,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (latest) => {
        const val = Math.min(100, Math.floor(latest));
        setDisplayCount(val.toString().padStart(3, "0"));
      },
      onComplete: () => {
        setDisplayCount("100");
        // Trigger Stage 2: Fill + Spring Compression
        setStage(2);
      },
    });

    // Stage 3: Upward Shutter Curtain Wipe after 1.45s
    const tStage3 = setTimeout(() => {
      setStage(3);
      // Unlock scroll as curtain begins clearing viewport
      const tUnlock = setTimeout(() => {
        unlockScroll();
      }, 350);
      return () => clearTimeout(tUnlock);
    }, 1450);

    return () => {
      controls.stop();
      clearTimeout(tStage3);
    };
  }, [isMounted, reducedMotion, progress]);

  // Don't render anything once unmounted
  if (!isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="k-preloader-curtain"
        initial={{ y: "0%" }}
        animate={
          reducedMotion
            ? { opacity: 0 }
            : { y: stage >= 3 ? "-100%" : "0%" }
        }
        transition={
          reducedMotion
            ? { duration: 0.2 }
            : { duration: 0.65, ease: [0.76, 0, 0.24, 1] }
        }
        onAnimationComplete={() => {
          if (stage >= 3 || reducedMotion) {
            unlockScroll();
            setIsVisible(false);
          }
        }}
        className="fixed inset-0 z-[9999] min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-[#EFF1F5] select-none border-b-2 border-[#ef4444]"
        style={{
          boxShadow: stage >= 3 ? "0 25px 50px -12px rgba(239,68,68,0.25)" : "none",
        }}
        aria-hidden={stage >= 3}
      >
        {/* ── Subtitle Editorial Grid Lines ── */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-4 lg:grid-cols-12 divide-x divide-[#0a0a0d]/[0.06]">
          <div className="h-full" />
          <div className="h-full hidden lg:block" />
          <div className="h-full hidden lg:block" />
          <div className="h-full" />
          <div className="h-full hidden lg:block" />
          <div className="h-full hidden lg:block" />
          <div className="h-full" />
          <div className="h-full hidden lg:block" />
          <div className="h-full hidden lg:block" />
          <div className="h-full hidden lg:block" />
          <div className="h-full hidden lg:block" />
          <div className="h-full" />
        </div>

        {/* ── Top Editorial Header Bar ── */}
        <div className="relative z-10 w-full px-5 sm:px-10 pt-[max(1.25rem,env(safe-area-inset-top))] flex items-center justify-between border-b border-[#0a0a0d]/10 pb-4">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-[#0a0a0d]/70">
            <span className="font-bold text-[#0a0a0d]">KRUSHNA</span>
            <span className="text-[#0a0a0d]/30">//</span>
            <span className="hidden sm:inline">AIML ENGINEER & RESEARCHER</span>
            <span className="sm:hidden">SYS_INIT</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-[#0a0a0d]/60 uppercase">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
            <span>2026 EDITION</span>
          </div>
        </div>

        {/* ── Center: Geometric Wireframe "K" Emblem (tilted at -8deg) ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <motion.div
            initial={{ scale: 1, rotate: -8 }}
            animate={
              stage >= 2
                ? { scale: 0.55, rotate: -8 }
                : { scale: 1, rotate: -8 }
            }
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
            }}
            className="relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44"
          >
            {/* SVG Geometric Emblem */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(10,10,13,0.12)]"
            >
              <defs>
                {/* Crimson to Cosmic Violet Signature Gradient */}
                <linearGradient
                  id="k-preloader-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="45%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#8E96FF" />
                </linearGradient>

                {/* Specular Inner Glint / Highlight */}
                <linearGradient
                  id="k-inner-glint"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Stage 2 Fill Path with Gradient & Glint */}
              <motion.path
                d="M 20 15 L 35 15 L 35 42 L 68 15 L 86 15 L 48 52 L 86 85 L 68 85 L 35 58 L 35 85 L 20 85 Z"
                fill="url(#k-preloader-gradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 2 ? 1 : 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              />

              {/* Specular Inner Top Highlight */}
              {stage >= 2 && (
                <motion.path
                  d="M 20 15 L 35 15 L 35 42 L 68 15 L 86 15 L 48 52 L 86 85 L 68 85 L 35 58 L 35 85 L 20 85 Z"
                  fill="url(#k-inner-glint)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 0.25 }}
                />
              )}

              {/* Wireframe Outline (Solid Obsidian / Charcoal stroke, pathLength: 0 -> 1) */}
              <motion.path
                d="M 20 15 L 35 15 L 35 42 L 68 15 L 86 15 L 48 52 L 86 85 L 68 85 L 35 58 L 35 85 L 20 85 Z"
                fill="transparent"
                stroke="#0a0a0d"
                strokeWidth={1.5}
                strokeLinejoin="miter"
                strokeMiterlimit={4}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reducedMotion ? 0.1 : 1.0,
                  ease: "easeInOut",
                }}
              />
            </svg>

            {/* Glowing Accent Ring during Stage 2 */}
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 0.45, 0], scale: [0.9, 1.35, 1.6] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ef4444] via-[#dc2626] to-[#8E96FF] filter blur-xl pointer-events-none"
              />
            )}
          </motion.div>
        </div>

        {/* ── Bottom Section: Telemetry Label (Left) & Counter (Right) ── */}
        <motion.div
          animate={
            stage >= 2
              ? { opacity: 0, y: 10 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.15, ease: "easeIn" }}
          className="relative z-10 w-full px-5 sm:px-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex items-end justify-between border-t border-[#0a0a0d]/10 pt-4"
        >
          {/* Bottom-Left Telemetry Label */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ef4444]" />
              </span>
              <span className="text-[10px] sm:text-xs font-mono tracking-[0.2em] font-medium text-[#0a0a0d]/70 uppercase">
                [ INITIALIZING KRUSHNA.DEV // SYS_LOAD ]
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.15em] text-[#0a0a0d]/40 uppercase hidden sm:block">
              NEO-BRUTALIST EDITORIAL SHUTTER · 60FPS
            </p>
          </div>

          {/* Bottom-Right Monospace 3-Digit Counter */}
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tighter text-[#0a0a0d] tabular-nums">
              {displayCount}
            </span>
            <span className="text-xs sm:text-sm font-bold text-[#ef4444] tracking-normal mb-1">
              %
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

