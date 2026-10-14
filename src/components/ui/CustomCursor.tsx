"use client";

import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from "react";

export type CursorState =
  | "default"
  | "link"
  | "magnetic"
  | "invert"
  | "view"
  | "drag"
  | "scrub"
  | "scrub-y"
  | "text"
  | "none";

interface CursorOverride {
  state: CursorState;
  label?: string;
  variant?: string;
}

// Global store for imperative useCursor hook
let globalCursorOverride: CursorOverride | null = null;
const overrideListeners = new Set<(override: CursorOverride | null) => void>();

export function useCursor() {
  const set = useCallback((state: CursorState, label?: string, variant?: string) => {
    globalCursorOverride = { state, label, variant };
    overrideListeners.forEach((fn) => fn(globalCursorOverride));
  }, []);

  const reset = useCallback(() => {
    globalCursorOverride = null;
    overrideListeners.forEach((fn) => fn(null));
  }, []);

  return { set, reset };
}

// Exponential damping helper: cur += (target - cur) * (1 - Math.exp(-speed * dt))
function damp(current: number, target: number, speed: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

function subscribePointer(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getPointerSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getServerPointerSnapshot(): boolean {
  return false;
}

export function CustomCursor() {
  const isFinePointer = useSyncExternalStore(
    subscribePointer,
    getPointerSnapshot,
    getServerPointerSnapshot
  );

  const [activeState, setActiveState] = useState<CursorState>("default");
  const [activeLabel, setActiveLabel] = useState<string>("");
  const [isPressed, setIsPressed] = useState(false);
  const [pressPulse, setPressPulse] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // DOM Refs
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // Position & Physics state
  const targetPtr = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const tagPos = useRef({ x: -100, y: -100 });
  const tagOffset = useRef({ x: 16, y: 14 });

  // Magnetic element tracking
  const magneticElRef = useRef<HTMLElement | null>(null);
  const magneticRectRef = useRef<DOMRect | null>(null);
  const magneticShift = useRef({ x: 0, y: 0 });
  const leavingMagneticEl = useRef<HTMLElement | null>(null);
  const leavingShift = useRef({ x: 0, y: 0 });

  // State refs for RAF loop
  const stateRef = useRef<CursorState>("default");
  const isPressedRef = useRef(false);
  const pressPulseRef = useRef(false);
  const isReducedMotionRef = useRef(false);
  const hasMovedRef = useRef(false);
  const rafIdRef = useRef<number>(0);
  const isLoopRunningRef = useRef(false);
  const lastTimeRef = useRef<number>(0);

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = activeState;
  }, [activeState]);

  useEffect(() => {
    isPressedRef.current = isPressed;
  }, [isPressed]);

  useEffect(() => {
    pressPulseRef.current = pressPulse;
  }, [pressPulse]);

  // Fine Pointer class & reduced motion sync
  useEffect(() => {
    if (!isFinePointer) return;

    document.documentElement.classList.add("has-custom-cursor");

    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotionRef.current = reducedMotionMq.matches;

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotionRef.current = e.matches;
    };
    reducedMotionMq.addEventListener("change", onReducedMotionChange);

    return () => {
      reducedMotionMq.removeEventListener("change", onReducedMotionChange);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [isFinePointer]);

  // Main Cursor Logic & Event Handlers
  useEffect(() => {
    if (!isFinePointer) return;

    // Helper: start loop if not currently ticking
    const startLoop = () => {
      if (isLoopRunningRef.current) return;
      isLoopRunningRef.current = true;
      lastTimeRef.current = performance.now();
      rafIdRef.current = requestAnimationFrame(tick);
    };

    // RAF loop
    const tick = (now: number) => {
      if (document.hidden) {
        isLoopRunningRef.current = false;
        return;
      }

      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.05);
      lastTimeRef.current = now;

      const currentState = stateRef.current;
      const isReduced = isReducedMotionRef.current;

      // Speeds: dot 40, ring 16, capsule 12, tag 10
      const isCapsule =
        currentState === "view" ||
        currentState === "drag" ||
        currentState === "scrub" ||
        currentState === "scrub-y";

      const dotSpeed = isReduced ? 1000 : 40;
      const ringSpeed = isReduced ? 1000 : isCapsule ? 12 : 16;
      const tagSpeed = isReduced ? 1000 : 10;

      // Calculate Ring target (with magnetic pull if applicable)
      let targetRingX = targetPtr.current.x;
      let targetRingY = targetPtr.current.y;

      if (currentState === "magnetic" && magneticElRef.current && magneticRectRef.current && !isReduced) {
        const r = magneticRectRef.current;
        const elCenterX = r.left + r.width / 2;
        const elCenterY = r.top + r.height / 2;

        const diffX = elCenterX - targetPtr.current.x;
        const diffY = elCenterY - targetPtr.current.y;
        const dist = Math.hypot(diffX, diffY);

        // Ring center pulled 25% toward element center (max 10px)
        const pull = dist > 0 ? Math.min(10, dist * 0.25) / dist : 0;
        targetRingX = targetPtr.current.x + diffX * pull;
        targetRingY = targetPtr.current.y + diffY * pull;

        // Element translates toward pointer up to 6px
        const toPtrX = targetPtr.current.x - elCenterX;
        const toPtrY = targetPtr.current.y - elCenterY;
        const pDist = Math.hypot(toPtrX, toPtrY);
        const elemRatio = pDist > 0 ? Math.min(6, pDist * 0.15) / pDist : 0;
        const targetElemX = toPtrX * elemRatio;
        const targetElemY = toPtrY * elemRatio;

        magneticShift.current.x = damp(magneticShift.current.x, targetElemX, 16, dt);
        magneticShift.current.y = damp(magneticShift.current.y, targetElemY, 16, dt);
        magneticElRef.current.style.transform = `translate3d(${magneticShift.current.x.toFixed(2)}px, ${magneticShift.current.y.toFixed(2)}px, 0)`;
      } else if (magneticElRef.current) {
        // Reset when magnetic state is lost
        magneticShift.current.x = damp(magneticShift.current.x, 0, 20, dt);
        magneticShift.current.y = damp(magneticShift.current.y, 0, 20, dt);
        if (Math.abs(magneticShift.current.x) < 0.05 && Math.abs(magneticShift.current.y) < 0.05) {
          magneticElRef.current.style.transform = "";
          magneticElRef.current = null;
        } else {
          magneticElRef.current.style.transform = `translate3d(${magneticShift.current.x.toFixed(2)}px, ${magneticShift.current.y.toFixed(2)}px, 0)`;
        }
      }

      // Smoothly reset any recently departed magnetic element
      if (leavingMagneticEl.current) {
        leavingShift.current.x = damp(leavingShift.current.x, 0, 20, dt);
        leavingShift.current.y = damp(leavingShift.current.y, 0, 20, dt);
        if (Math.abs(leavingShift.current.x) < 0.05 && Math.abs(leavingShift.current.y) < 0.05) {
          leavingMagneticEl.current.style.transform = "";
          leavingMagneticEl.current = null;
        } else {
          leavingMagneticEl.current.style.transform = `translate3d(${leavingShift.current.x.toFixed(2)}px, ${leavingShift.current.y.toFixed(2)}px, 0)`;
        }
      }

      // Ease dot position
      dotPos.current.x = damp(dotPos.current.x, targetPtr.current.x, dotSpeed, dt);
      dotPos.current.y = damp(dotPos.current.y, targetPtr.current.y, dotSpeed, dt);

      // Ease ring position
      ringPos.current.x = damp(ringPos.current.x, targetRingX, ringSpeed, dt);
      ringPos.current.y = damp(ringPos.current.y, targetRingY, ringSpeed, dt);

      // Ease tag position
      tagPos.current.x = damp(tagPos.current.x, targetPtr.current.x, tagSpeed, dt);
      tagPos.current.y = damp(tagPos.current.y, targetPtr.current.y, tagSpeed, dt);

      // Render transform on Ring
      if (ringRef.current) {
        const ringScale =
          currentState === "drag" && isPressedRef.current
            ? "scale(0.92)"
            : pressPulseRef.current
            ? "scale(0.85)"
            : "scale(1)";

        ringRef.current.style.transform = `translate3d(${ringPos.current.x.toFixed(1)}px, ${ringPos.current.y.toFixed(1)}px, 0) translate(-50%, -50%) ${ringScale}`;
      }

      // Render transform on Dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x.toFixed(1)}px, ${dotPos.current.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      }

      // Render transform on Tag
      if (tagRef.current) {
        tagRef.current.style.transform = `translate3d(${(tagPos.current.x + tagOffset.current.x).toFixed(1)}px, ${(tagPos.current.y + tagOffset.current.y).toFixed(1)}px, 0)`;
      }

      // Settle check
      const maxDiff = Math.max(
        Math.abs(dotPos.current.x - targetPtr.current.x),
        Math.abs(dotPos.current.y - targetPtr.current.y),
        Math.abs(ringPos.current.x - targetRingX),
        Math.abs(ringPos.current.y - targetRingY),
        Math.abs(tagPos.current.x - targetPtr.current.x),
        Math.abs(tagPos.current.y - targetPtr.current.y)
      );

      const isMagneticMoving =
        (magneticElRef.current && (Math.abs(magneticShift.current.x) > 0.05 || Math.abs(magneticShift.current.y) > 0.05)) ||
        leavingMagneticEl.current !== null;

      if (maxDiff < 0.08 && !isMagneticMoving && !pressPulseRef.current) {
        isLoopRunningRef.current = false;
        return; // Settle and stop loop
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    // Resolve state from hovered element or text selection
    const resolveState = (target: HTMLElement | null) => {
      if (globalCursorOverride) {
        setActiveState(globalCursorOverride.state);
        setActiveLabel(globalCursorOverride.label || "");
        return;
      }

      // Check text selection in progress
      if (window.getSelection() && !window.getSelection()?.isCollapsed && isPressedRef.current) {
        setActiveState("text");
        setActiveLabel("");
        return;
      }

      if (!target) {
        setActiveState("default");
        setActiveLabel("");
        return;
      }

      // 1. Explicit data-cursor
      const cursorNode = target.closest("[data-cursor]") as HTMLElement | null;
      if (cursorNode) {
        const declared = cursorNode.getAttribute("data-cursor") as CursorState;
        const declaredLabel = cursorNode.getAttribute("data-cursor-label") || "";

        setActiveState(declared);
        setActiveLabel(declaredLabel);

        if (declared === "magnetic") {
          if (magneticElRef.current !== cursorNode) {
            if (magneticElRef.current) {
              leavingMagneticEl.current = magneticElRef.current;
              leavingShift.current = { ...magneticShift.current };
            }
            magneticElRef.current = cursorNode;
            magneticRectRef.current = cursorNode.getBoundingClientRect();
            magneticShift.current = { x: 0, y: 0 };
          }
        } else if (magneticElRef.current) {
          leavingMagneticEl.current = magneticElRef.current;
          leavingShift.current = { ...magneticShift.current };
          magneticElRef.current = null;
        }

        return;
      }

      // If left a magnetic element without entering another
      if (magneticElRef.current) {
        leavingMagneticEl.current = magneticElRef.current;
        leavingShift.current = { ...magneticShift.current };
        magneticElRef.current = null;
      }

      // 2. Automatic Text state
      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        setActiveState("text");
        setActiveLabel("");
        return;
      }

      // 3. Automatic Link state
      if (target.closest("a, button, [role='button'], summary, label")) {
        setActiveState("link");
        setActiveLabel("");
        return;
      }

      // 4. Default
      setActiveState("default");
      setActiveLabel("");
    };

    // Pointer move listener
    const onPointerMove = (e: PointerEvent) => {
      targetPtr.current.x = e.clientX;
      targetPtr.current.y = e.clientY;

      if (!hasMovedRef.current) {
        hasMovedRef.current = true;
        dotPos.current.x = e.clientX;
        dotPos.current.y = e.clientY;
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
        tagPos.current.x = e.clientX;
        tagPos.current.y = e.clientY;
      }

      setIsVisible(true);

      // Check tag flipping near edges (flip left if near right edge; flip up if near bottom edge)
      tagOffset.current.x = e.clientX > window.innerWidth - 120 ? -70 : 16;
      tagOffset.current.y = e.clientY > window.innerHeight - 80 ? -24 : 14;

      startLoop();
    };

    // Pointer over & out delegation
    const onPointerOver = (e: PointerEvent) => {
      resolveState(e.target as HTMLElement | null);
      startLoop();
    };

    const onPointerOut = (e: PointerEvent) => {
      // If moving out of a target, re-evaluate to next target
      resolveState(e.relatedTarget as HTMLElement | null);
      startLoop();
    };

    // Pointer down & up for pressed feedback
    let pressTimer: ReturnType<typeof setTimeout> | null = null;

    const onPointerDown = () => {
      setIsPressed(true);
      setPressPulse(true);
      if (pressTimer) clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        setPressPulse(false);
      }, 120);
      startLoop();
    };

    const onPointerUp = () => {
      setIsPressed(false);
      startLoop();
    };

    // Window exit & enter
    const onPointerLeaveDoc = (e: PointerEvent) => {
      if (!e.relatedTarget && (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        setIsVisible(false);
      }
    };

    const onPointerEnterDoc = () => {
      setIsVisible(true);
      startLoop();
    };

    // Scroll hit test re-check (throttled once per frame)
    let scrollScheduled = false;
    const onScroll = () => {
      if (magneticElRef.current) {
        magneticRectRef.current = magneticElRef.current.getBoundingClientRect();
      }

      if (!scrollScheduled) {
        scrollScheduled = true;
        requestAnimationFrame(() => {
          scrollScheduled = false;
          if (hasMovedRef.current) {
            const el = document.elementFromPoint(
              targetPtr.current.x,
              targetPtr.current.y
            ) as HTMLElement | null;
            resolveState(el);
            startLoop();
          }
        });
      }
    };

    // Selection change check
    const onSelectionChange = () => {
      if (window.getSelection() && !window.getSelection()?.isCollapsed) {
        setActiveState("text");
      }
    };

    // Hook override subscriber
    const onOverride = () => {
      resolveState(document.elementFromPoint(targetPtr.current.x, targetPtr.current.y) as HTMLElement | null);
      startLoop();
    };
    overrideListeners.add(onOverride);

    // Attach listeners
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("pointerout", onPointerOut, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeaveDoc, { passive: true });
    document.documentElement.addEventListener("pointerenter", onPointerEnterDoc, { passive: true });
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (pressTimer) clearTimeout(pressTimer);
      overrideListeners.delete(onOverride);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.documentElement.removeEventListener("pointerleave", onPointerLeaveDoc);
      document.documentElement.removeEventListener("pointerenter", onPointerEnterDoc);
      document.removeEventListener("selectionchange", onSelectionChange);
    };
  }, [isFinePointer]);

  if (!isFinePointer) return null;

  // Determine Capsule properties
  const isView = activeState === "view";
  const isDrag = activeState === "drag";
  const isScrub = activeState === "scrub";
  const isScrubY = activeState === "scrub-y";
  const isCapsule = isView || isDrag || isScrub || isScrubY;

  const isLink = activeState === "link" || activeState === "magnetic";
  const isInvert = activeState === "invert";
  const isHidden = !isVisible || !hasMovedRef.current || activeState === "text" || activeState === "none";

  // Label text for capsule
  let capsuleLabel = "";
  if (isView) capsuleLabel = activeLabel || "view ↗";
  else if (isDrag) capsuleLabel = isPressed ? "dragging" : "drag · click";
  else if (isScrub) capsuleLabel = "← drag →";
  else if (isScrubY) capsuleLabel = "↑ drag ↓";

  // Tag label (only when an explicit label is present on a non-capsule element)
  const showTagLabel = Boolean(activeLabel) && !isCapsule && !isHidden;

  return (
    <div
      id="unified-cursor"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        contain: "layout paint style",
        opacity: isHidden ? 0 : 1,
        transition: "opacity 150ms ease",
      }}
    >
      {/* ── 1. RING / CAPSULE (mix-blend-mode at root level) ─────────────── */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 will-change-transform flex items-center justify-center select-none"
        style={{
          // Size & Shape
          width: isCapsule ? "auto" : isInvert || isLink ? "44px" : "28px",
          height: isCapsule ? "auto" : isInvert || isLink ? "44px" : "28px",
          borderRadius: isDrag || (isView && capsuleLabel.startsWith("*")) ? "9999px" : isCapsule ? "4px" : "50%",
          padding: isDrag || (isView && capsuleLabel.startsWith("*")) ? "5px 12px" : isCapsule ? "6px 10px" : "0px",

          // Colors & Borders
          backgroundColor: isDrag
            ? "#C3181E"
            : isView && capsuleLabel.startsWith("*")
            ? "rgba(10, 8, 7, 0.95)"
            : isCapsule
            ? "rgba(10, 8, 7, 0.94)"
            : isInvert
            ? "#ECC3AB"
            : isLink
            ? "#ECC3AB"
            : "transparent",

          border: isDrag
            ? "1px solid transparent"
            : isView && capsuleLabel.startsWith("*")
            ? "1px solid rgba(228, 107, 94, 0.5)"
            : isCapsule
            ? "1px solid rgba(221, 112, 116, 0.25)"
            : isLink || isInvert
            ? "1px solid transparent"
            : "1px solid rgba(221, 112, 116, 0.4)",

          // Mix Blend Mode: difference for wordmark and links; normal for capsule and default
          mixBlendMode: isInvert || isLink ? "difference" : "normal",

          // Sharp transitions: isolated properties only (never scaling ring border)
          transition:
            "width 200ms cubic-bezier(0.22, 1, 0.36, 1), height 200ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 200ms cubic-bezier(0.22, 1, 0.36, 1), background-color 200ms cubic-bezier(0.22, 1, 0.36, 1), border-color 200ms cubic-bezier(0.22, 1, 0.36, 1), padding 200ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Drag Capsule Content (Crimson Accent Variant) */}
        {isDrag && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#ECC3AB] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ECC3AB]" />
            <span>{capsuleLabel}</span>
          </div>
        )}

        {/* View / Scrub Capsule Content (Monochrome / Italic Variant) */}
        {(isView || isScrub || isScrubY) && (
          <span
            className={`font-mono text-[11px] whitespace-nowrap ${
              capsuleLabel.startsWith("*")
                ? "italic text-[#ECC3AB] font-normal tracking-wide"
                : "uppercase tracking-[0.12em] text-[#E8A791]"
            }`}
          >
            {capsuleLabel}
          </span>
        )}
      </div>

      {/* ── 2. CENTER DOT ─────────────────────────────────────────────────── */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 will-change-transform rounded-full"
        style={{
          width: isInvert ? "4px" : "3px",
          height: isInvert ? "4px" : "3px",
          backgroundColor: isInvert ? "#000000" : "#E46B5E",
          opacity: isCapsule || isLink ? 0 : 1,
          transition: "opacity 150ms ease, width 150ms ease, height 150ms ease",
        }}
      />

      {/* ── 3. FLOATING TAG LABEL (Non-blended, flat and legible) ─────────── */}
      {showTagLabel && (
        <div
          ref={tagRef}
          className="pointer-events-none fixed top-0 left-0 will-change-transform font-mono text-[10px] uppercase tracking-[0.12em] text-[#DD7074] whitespace-nowrap select-none"
          style={{
            transition: "opacity 150ms ease",
          }}
        >
          {activeLabel}
        </div>
      )}
    </div>
  );
}
