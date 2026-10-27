"use client";

import React, { createContext, useContext, useCallback } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// ============================================================================
// CONTEXT & TYPES
// ============================================================================

interface SmoothScrollContextType {
  scrollTo: (
    target: string | HTMLElement | number,
    options?: {
      offset?: number;
      duration?: number;
      easing?: (t: number) => number;
      immediate?: boolean;
      onComplete?: () => void;
    }
  ) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

// Blueprint mathematical easing curve: cubic-bezier(0.16, 1, 0.3, 1)
const blueprintEasing = (t: number) => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

// ============================================================================
// INTERNAL DISPATCHER (EXPOSES LENIS SCROLLTO WITHOUT TRIGGERING RE-RENDERS)
// ============================================================================

function SmoothScrollDispatcher({ children }: { children: React.ReactNode }) {
  const lenis = useLenis();

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | number,
      options?: {
        offset?: number;
        duration?: number;
        easing?: (t: number) => number;
        immediate?: boolean;
        onComplete?: () => void;
      }
    ) => {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: options?.offset ?? -75,
          duration: options?.duration ?? 1.2,
          easing: options?.easing ?? blueprintEasing,
          immediate: options?.immediate ?? false,
          onComplete: options?.onComplete,
        });
      } else {
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: options?.immediate ? "auto" : "smooth" });
        } else {
          const el = typeof target === "string" ? document.querySelector(target) : target;
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY + (options?.offset ?? -75);
            window.scrollTo({ top, behavior: options?.immediate ? "auto" : "smooth" });
          }
        }
      }
    },
    [lenis]
  );

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

// ============================================================================
// ROOT SMOOTH SCROLL PROVIDER
// Uses official ReactLenis root provider with zero-rerender architecture
// ============================================================================

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085, // Silky inertial momentum damping
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
      }}
    >
      <SmoothScrollDispatcher>{children}</SmoothScrollDispatcher>
    </ReactLenis>
  );
}
