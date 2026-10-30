"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import { useGlobalTsunamiMode } from "@/lib/tsunamiStore";

export interface ScrollSectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  indexTag?: string;
  label?: string;
  showDivider?: boolean;
  distortionScale?: number;
  waveAngle?: number;
  overflowVisible?: boolean;
  as?: "div" | "section";
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function ScrollSectionTransition({
  children,
  id,
  className = "",
  indexTag,
  label,
  showDivider = true,
  waveAngle = 115,
  overflowVisible = false,
  as = "div",
}: ScrollSectionTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [tsunamiMode] = useGlobalTsunamiMode();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const crestGlowRef = useRef<HTMLDivElement | null>(null);
  const hairlineRef = useRef<HTMLDivElement | null>(null);

  const physicsRef = useRef({
    scrollVelocity: 0,
    smoothedVelocity: 0,
    smoothedProgress: 0,
    appearProgress: 0,
    time: 0,
    isIntersecting: true,
    hasSettledEntrance: false,
  });

  useLenis(
    useCallback((lenis: Lenis) => {
      physicsRef.current.scrollVelocity = lenis.velocity || 0;
    }, [])
  );

  useEffect(() => {
    if (tsunamiMode === "appear") {
      physicsRef.current.appearProgress = 0;
    }
  }, [tsunamiMode]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        physicsRef.current.isIntersecting = entry.isIntersecting;
      },
      { rootMargin: "200px 0px 200px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

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

      if (document.documentElement.classList.contains("reduced-motion")) {
        if (contentRef.current) {
          contentRef.current.style.transform = "none";
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

      const rect = wrapper.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      const rawEntry = (vh - rect.top) / (vh * 0.65);
      const clampedEntry = Math.max(0, Math.min(1, rawEntry));

      const lerpFactor = 1 - Math.exp(-10 * dt);
      state.smoothedVelocity += (state.scrollVelocity - state.smoothedVelocity) * lerpFactor;
      state.smoothedProgress += (clampedEntry - state.smoothedProgress) * lerpFactor;
      state.scrollVelocity *= 0.9;

      // 1. Hairline Divider Draw-In
      if (hairlineRef.current) {
        const lineScale = smoothstep(0.02, 0.55, state.smoothedProgress);
        hairlineRef.current.style.transform = `scaleX(${lineScale.toFixed(3)})`;
      }

      // 2. Ambient Specular Wave Crest Glow (Visual animation behind text without shaking DOM)
      if (crestGlowRef.current) {
        let waveCenter = 1 - state.smoothedProgress;
        let glowOpacity = Math.sin(state.smoothedProgress * Math.PI) * 0.35;

        if (tsunamiMode === "appear") {
          state.appearProgress = Math.min(1, state.appearProgress + dt * 0.75);
          waveCenter = state.appearProgress;
          glowOpacity = Math.sin(state.appearProgress * Math.PI) * 0.45;
        } else if (tsunamiMode === "sequence") {
          waveCenter = (state.time * 0.22) % 1.0;
          glowOpacity = Math.sin(waveCenter * Math.PI) * 0.28;
        }

        crestGlowRef.current.style.opacity = glowOpacity.toFixed(3);
        crestGlowRef.current.style.transform = `translate3d(0, ${(waveCenter * 100).toFixed(1)}%, 0) rotate(${
          waveAngle - 90
        }deg)`;
      }

      // 3. One-Time Smooth Section Entrance (Locks to transform: none once entered for 100% stable reading & sticky support)
      if (!state.hasSettledEntrance) {
        const entranceLift = (1 - smoothstep(0.0, 0.85, state.smoothedProgress)) * 24;
        const entranceOpacity = smoothstep(0.0, 0.5, state.smoothedProgress);

        if (entranceLift < 0.25 && entranceOpacity > 0.99) {
          content.style.transform = "none";
          content.style.opacity = "1";
          content.style.willChange = "auto";
          state.hasSettledEntrance = true;
        } else {
          content.style.opacity = Math.max(0.2, entranceOpacity).toFixed(3);
          content.style.transform = `translate3d(0, ${entranceLift.toFixed(2)}px, 0)`;
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [shouldReduceMotion, tsunamiMode, waveAngle]);

  const ContainerTag = as as any;

  return (
    <ContainerTag
      id={id}
      ref={wrapperRef}
      className={`relative w-full ${
        overflowVisible ? "overflow-visible" : "overflow-x-clip"
      } ${className}`}
    >
      {/* 1. Ambient Specular Wave Crest Glow (Never distorts text) */}
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
                "linear-gradient(180deg, rgba(109, 0, 26, 0) 0%, rgba(158, 11, 46, 0.14) 45%, rgba(232, 153, 172, 0.18) 52%, rgba(109, 0, 26, 0) 100%)",
              filter: "blur(32px)",
            }}
          />
        </div>
      )}

      {/* 2. Section Connector & Liquid Hairline Divider */}
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

      {/* 3. Crisp, Unwarped Section Content */}
      <div ref={contentRef} className="relative z-10 w-full">
        {children}
      </div>
    </ContainerTag>
  );
}

export default ScrollSectionTransition;
