"use client";

import React, { useEffect, useRef, useId, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import { useGlobalTsunamiMode } from "@/lib/tsunamiStore";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ScrollSectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  indexTag?: string;
  label?: string;
  showDivider?: boolean;
  /** Maximum SVG liquid displacement scale in px (default: 22) */
  distortionScale?: number;
  /** Wave angle in degrees matching WebGL Tsunami background (default: 115) */
  waveAngle?: number;
  /** Keep overflow visible (used for HeroScattered letters) */
  overflowVisible?: boolean;
  as?: "div" | "section";
}

// Smoothstep helper: maps x in [edge0, edge1] -> [0, 1]
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ============================================================================
// TSUNAMI LIQUID-WAVE SECTION & DOM CONTENT ENGINE
// Synchronizes live HTML text, cards, and sections with the WebGL Tsunami wave
// using CAESAR theme colors (#000000, #240009, #6D001A, #9E0B2E, #C93B5B, #E899AC)
// ============================================================================

export function ScrollSectionTransition({
  children,
  id,
  className = "",
  indexTag,
  label,
  showDivider = true,
  distortionScale = 22,
  waveAngle = 115,
  overflowVisible = false,
  as = "div",
}: ScrollSectionTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [tsunamiMode] = useGlobalTsunamiMode();
  const rawId = useId();
  const filterId = `tsunami-wave-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // DOM & SVG Refs (Direct mutation in RAF for 120fps zero-rerender performance)
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const crestGlowRef = useRef<HTMLDivElement | null>(null);
  const hairlineRef = useRef<HTMLDivElement | null>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null);

  // Physics State Refs
  const physicsRef = useRef({
    scrollVelocity: 0,
    smoothedVelocity: 0,
    sectionProgress: 0.5,
    smoothedProgress: 0.5,
    appearProgress: 0,
    time: 0,
    isIntersecting: true,
    filterActive: false,
  });

  // Track Lenis smooth scroll velocity & position
  useLenis(
    useCallback((lenis: Lenis) => {
      physicsRef.current.scrollVelocity = lenis.velocity || 0;
    }, [])
  );

  // Reset appear sweep when user clicks "Appear" in TsunamiControllerPill
  useEffect(() => {
    if (tsunamiMode === "appear") {
      physicsRef.current.appearProgress = 0;
    }
  }, [tsunamiMode]);

  // IntersectionObserver to pause off-screen calculations
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        physicsRef.current.isIntersecting = entry.isIntersecting;
      },
      { rootMargin: "250px 0px 250px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Main 120fps Tsunami Wave Physics & DOM Distortion Loop
  useEffect(() => {
    if (shouldReduceMotion) return;

    let rafId: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      const state = physicsRef.current;
      if (document.hidden || !state.isIntersecting) {
        lastTime = now;
        return;
      }

      // Check if user toggled MOTION: REDUCED in Navbar
      if (document.documentElement.classList.contains("reduced-motion")) {
        if (contentRef.current) {
          contentRef.current.style.transform = "none";
          contentRef.current.style.filter = "none";
          contentRef.current.style.opacity = "1";
        }
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      state.time += dt;

      const wrapper = wrapperRef.current;
      const content = contentRef.current;
      if (!wrapper || !content) return;

      // 1. Measure section position relative to viewport
      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // entryRatio: 0 when top of section is at bottom of screen, 1 when it reaches top
      const rawEntry = (vh - rect.top) / (vh + Math.min(rect.height, vh * 0.8));
      const clampedEntry = Math.max(0, Math.min(1, rawEntry));

      // exitRatio: rises from 0 -> 1 as bottom of section leaves the top of viewport
      const rawExit = rect.bottom < vh * 0.35 ? 1 - Math.max(0, rect.bottom / (vh * 0.35)) : 0;

      // 2. Smooth velocity & progress damping (exponential lerp)
      const lerpFactor = 1 - Math.exp(-10 * dt);
      state.smoothedVelocity += (state.scrollVelocity - state.smoothedVelocity) * lerpFactor;
      state.smoothedProgress += (clampedEntry - state.smoothedProgress) * lerpFactor;
      // Decay raw velocity naturally if native scroll is used without Lenis ticks
      state.scrollVelocity *= 0.9;

      const absVel = Math.abs(state.smoothedVelocity);
      const normVel = Math.min(absVel / 32, 1.5); // 0.0 (idle) -> 1.5 (fast scroll)

      // 3. Compute Tsunami Gaussian Wave Mask based on active mode
      const waveWidth = 0.26;
      let waveCenter = state.smoothedProgress;

      if (tsunamiMode === "appear") {
        state.appearProgress = Math.min(1, state.appearProgress + dt * 0.75);
        waveCenter = state.appearProgress;
      } else if (tsunamiMode === "sequence") {
        waveCenter = (state.time * 0.28) % 1.0;
      }

      // Gaussian bell curve peaking when the wave crest crosses the section entry boundary
      const distToEntryCrest = state.smoothedProgress - 0.22;
      const entryWaveMask =
        tsunamiMode === "appear"
          ? Math.sin(state.appearProgress * Math.PI)
          : tsunamiMode === "sequence"
          ? Math.sin(waveCenter * Math.PI) * 0.55
          : Math.exp(-(distToEntryCrest * distToEntryCrest) / (waveWidth * waveWidth * 0.45)) *
            (1 - smoothstep(0.45, 0.72, state.smoothedProgress));

      // Combine entry wave, exit wave, and active scroll-velocity wave
      const velocityWave = Math.min(1, normVel * 0.85);
      const totalWaveIntensity = Math.min(
        1.25,
        entryWaveMask * 0.9 + rawExit * 0.65 + velocityWave * 0.75
      );

      // 4. Update Hairline Divider Draw-In
      if (hairlineRef.current) {
        const lineScale = smoothstep(0.02, 0.38, state.smoothedProgress);
        hairlineRef.current.style.transform = `scaleX(${lineScale.toFixed(3)})`;
      }

      // 5. Update CAESAR Specular Wave Crest Sweep Overlay
      if (crestGlowRef.current) {
        const sweepY =
          tsunamiMode === "sequence"
            ? waveCenter * 100
            : tsunamiMode === "appear"
            ? state.appearProgress * 100
            : (1 - state.smoothedProgress) * 100;
        const glowOpacity = Math.min(0.65, totalWaveIntensity * 0.48);

        crestGlowRef.current.style.opacity = glowOpacity.toFixed(3);
        crestGlowRef.current.style.transform = `translate3d(0, ${sweepY.toFixed(1)}%, 0) rotate(${
          waveAngle - 90
        }deg)`;
      }

      // 6. Apply or Cleanly Detach DOM Transform & SVG Liquid Displacement
      // When the section has entered and scroll velocity is near 0, detach filter/transform
      // so text is 100% subpixel-crisp and sticky/fixed children behave natively.
      const entranceLift = (1 - smoothstep(0.0, 0.42, state.smoothedProgress)) * 38;
      const isSettled =
        totalWaveIntensity < 0.018 &&
        entranceLift < 0.4 &&
        tsunamiMode === "scroll";

      if (isSettled) {
        if (state.filterActive) {
          content.style.transform = "none";
          content.style.filter = "none";
          content.style.opacity = "1";
          content.style.removeProperty("--tsunami-chroma-x");
          content.style.removeProperty("--tsunami-chroma-y");
          content.classList.remove("tsunami-dispersing");
          state.filterActive = false;
        }
        return;
      }

      state.filterActive = true;

      // Liquid 3D wave lift, velocity skew, and subtle scale undulation
      const velSkewY = Math.max(-2.2, Math.min(2.2, state.smoothedVelocity * 0.055));
      const waveSkewX =
        Math.sin(state.smoothedProgress * Math.PI * 2 + state.time * 2.2) *
        totalWaveIntensity *
        0.65;
      const waveScaleY = 1 + Math.abs(state.smoothedVelocity) * 0.0008;
      const entranceOpacity = smoothstep(0.0, 0.24, state.smoothedProgress);

      content.style.opacity = Math.max(0.15, entranceOpacity).toFixed(3);
      content.style.transform = `translate3d(0, ${entranceLift.toFixed(
        2
      )}px, 0) skewY(${velSkewY.toFixed(2)}deg) skewX(${waveSkewX.toFixed(
        2
      )}deg) scaleY(${waveScaleY.toFixed(4)})`;

      // Update SVG feTurbulence & feDisplacementMap attributes
      const dispScale = totalWaveIntensity * distortionScale;
      if (displacementRef.current && turbulenceRef.current) {
        if (dispScale > 0.6) {
          const freqX = 0.008 + totalWaveIntensity * 0.006;
          const freqY = 0.018 + normVel * 0.012;
          turbulenceRef.current.setAttribute(
            "baseFrequency",
            `${freqX.toFixed(4)} ${freqY.toFixed(4)}`
          );
          displacementRef.current.setAttribute("scale", dispScale.toFixed(2));
          content.style.filter = `url(#${filterId})`;
        } else {
          content.style.filter = "none";
        }
      }

      // Update Chromatic Dispersion CSS variables for live text & headings
      const rad = (waveAngle * Math.PI) / 180;
      const chromaMag = Math.min(6.5, totalWaveIntensity * 4.2);
      const chromaX = (-Math.sin(rad) * chromaMag).toFixed(2);
      const chromaY = (Math.cos(rad) * chromaMag).toFixed(2);

      if (chromaMag > 0.35) {
        content.style.setProperty("--tsunami-chroma-x", `${chromaX}px`);
        content.style.setProperty("--tsunami-chroma-y", `${chromaY}px`);
        content.classList.add("tsunami-dispersing");
      } else {
        content.classList.remove("tsunami-dispersing");
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shouldReduceMotion, tsunamiMode, distortionScale, waveAngle, filterId]);

  const ContainerTag = as;

  return (
    <ContainerTag
      id={id}
      ref={wrapperRef as React.RefObject<any>}
      className={`relative w-full ${
        overflowVisible ? "overflow-visible" : "overflow-x-clip"
      } ${className}`}
    >
      {/* ── 1. DEDICATED SVG TSUNAMI LIQUID DISPLACEMENT FILTER ── */}
      {!shouldReduceMotion && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        >
          <defs>
            <filter
              id={filterId}
              x="-8%"
              y="-8%"
              width="116%"
              height="116%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0.01 0.02"
                numOctaves={2}
                seed={14}
                result="tsunamiNoise"
              />
              <feDisplacementMap
                ref={displacementRef}
                in="SourceGraphic"
                in2="tsunamiNoise"
                scale={0}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* ── 2. CAESAR SPECULAR WAVE CREST SWEEP GLOW ── */}
      {!shouldReduceMotion && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        >
          <div
            ref={crestGlowRef}
            className="pointer-events-none absolute -inset-x-24 top-0 h-44 opacity-0 will-change-transform"
            style={{
              background:
                "linear-gradient(180deg, rgba(109, 0, 26, 0) 0%, rgba(158, 11, 46, 0.16) 45%, rgba(232, 153, 172, 0.22) 52%, rgba(109, 0, 26, 0) 100%)",
              filter: "blur(28px)",
            }}
          />
        </div>
      )}

      {/* ── 3. SECTION CONNECTOR & LIQUID HAIRLINE DIVIDER ── */}
      {showDivider && indexTag && (
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-10 lg:px-12 pt-8 mb-4 select-none relative z-10">
          <div className="relative h-px w-full bg-[#261015]/70 overflow-hidden">
            <div
              ref={hairlineRef}
              className="h-full w-full origin-left bg-gradient-to-r from-[#6D001A] via-[#C93B5B] to-[#E899AC] will-change-transform"
              style={{ transform: shouldReduceMotion ? "scaleX(1)" : "scaleX(0)" }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[10.5px] sm:text-[11px] uppercase tracking-widest text-[#A68E94] pt-3">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9E0B2E] animate-pulse" />
              <span className="font-bold text-[#C93B5B]">{indexTag}</span>
              {label && (
                <>
                  <span className="text-[#6E565C]">//</span>
                  <span className="text-[#F5EEF0]/90 font-medium tracking-wider">
                    {label}
                  </span>
                </>
              )}
            </div>

            <span className="hidden sm:inline font-mono text-[10px] tracking-widest text-[#6E565C]">
              TSUNAMI://WAVE-SYNC
            </span>
          </div>
        </div>
      )}

      {/* ── 4. WAVE-DISTORTED & CHROMATIC-DISPERSED CONTENT ── */}
      <div
        ref={contentRef}
        className="tsunami-section-content relative z-10 w-full will-change-[transform,opacity]"
      >
        {children}
      </div>
    </ContainerTag>
  );
}

export default ScrollSectionTransition;
