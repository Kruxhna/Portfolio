"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

// ============================================================================
// MINECRAFT DRAGON FIREBALL & ENDER DRAGON CUSTOM CURSOR
// Zero-latency tracking, pixel-perfect hotspot alignment, and snappy state transitions.
// ============================================================================

export type CursorState = "default" | "pointer" | "link" | "magnetic" | "invert" | "view" | "drag" | "scrub" | "scrub-y" | "text" | "none";

interface CursorOverride {
  state: CursorState;
}

// Imperative hook for backward compatibility & manual overrides
let globalCursorOverride: CursorOverride | null = null;
const overrideListeners = new Set<(override: CursorOverride | null) => void>();

export function useCursor() {
  const set = useCallback((state: CursorState) => {
    globalCursorOverride = { state };
    overrideListeners.forEach((fn) => fn(globalCursorOverride));
  }, []);

  const reset = useCallback(() => {
    globalCursorOverride = null;
    overrideListeners.forEach((fn) => fn(null));
  }, []);

  return { set, reset };
}

// Chevron apex hotspot in 48x48 display coordinates (from 96x96 source: 16/2=8, 4/2=2)
const HOTSPOT_X = 8;
const HOTSPOT_Y = 2;
const CURSOR_SIZE = 48;

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isWindowVisible, setIsWindowVisible] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const reducedMotion = useReducedMotion();

  // Pointer position motion values
  const rawMouseX = useMotionValue(-100);
  const rawMouseY = useMotionValue(-100);

  // Snappy zero-latency spring (stiffness: 800, damping: 40, mass: 0.2)
  const springConfig = { stiffness: 800, damping: 40, mass: 0.2 };
  const smoothX = useSpring(rawMouseX, springConfig);
  const smoothY = useSpring(rawMouseY, springConfig);

  // Transform coordinates so the chevron apex hotspot precisely touches (clientX, clientY)
  const cursorX = useTransform(reducedMotion ? rawMouseX : smoothX, (x) => x - HOTSPOT_X);
  const cursorY = useTransform(reducedMotion ? rawMouseY : smoothY, (y) => y - HOTSPOT_Y);

  // Detect touch / fine pointer capabilities
  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(pointer: coarse)");
    const updateTouch = () => setIsTouchDevice(mq.matches);
    updateTouch();
    mq.addEventListener("change", updateTouch);

    if (!mq.matches) {
      document.documentElement.classList.add("has-custom-cursor");
    }

    return () => {
      mq.removeEventListener("change", updateTouch);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  // Listen for imperative cursor overrides
  useEffect(() => {
    const handleOverride = (override: CursorOverride | null) => {
      if (override) {
        setIsHovered(override.state === "pointer" || override.state === "link" || override.state === "view");
      }
    };
    overrideListeners.add(handleOverride);
    return () => {
      overrideListeners.delete(handleOverride);
    };
  }, []);

  // Pointer & Window Tracking
  useEffect(() => {
    if (isTouchDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      rawMouseX.set(e.clientX);
      rawMouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
      if (!isWindowVisible) setIsWindowVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    // Interactive target detection via event delegation
    const interactiveSelector =
      'a, button, [role="button"], input, select, textarea, label, [data-cursor="pointer"], [data-cursor="link"], [data-cursor="view"]';

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest(interactiveSelector)) {
        setIsHovered(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related || !related.closest(interactiveSelector)) {
        setIsHovered(false);
      }
    };

    const handleWindowLeave = () => setIsWindowVisible(false);
    const handleWindowEnter = () => setIsWindowVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.addEventListener("mouseleave", handleWindowLeave);
    document.addEventListener("mouseenter", handleWindowEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("mouseleave", handleWindowLeave);
      document.removeEventListener("mouseenter", handleWindowEnter);
    };
  }, [isTouchDevice, isVisible, isWindowVisible, rawMouseX, rawMouseY]);

  if (!mounted || isTouchDevice) {
    return null;
  }

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[999999] select-none"
      style={{
        x: cursorX,
        y: cursorY,
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        opacity: isVisible && isWindowVisible ? 1 : 0,
        transformOrigin: `${HOTSPOT_X}px ${HOTSPOT_Y}px`,
      }}
      animate={{
        scale: isClicked ? 0.9 : 1,
        rotate: isClicked ? -6 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 900,
        damping: 35,
        mass: 0.15,
      }}
    >
      <AnimatePresence mode="wait">
        {isHovered ? (
          <motion.img
            key="ender-dragon"
            src="/cursors/ender-dragon.png"
            alt=""
            width={CURSOR_SIZE}
            height={CURSOR_SIZE}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0_10px_rgba(217,70,239,0.45)]"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />
        ) : (
          <motion.img
            key="dragon-fireball"
            src="/cursors/dragon-fireball.png"
            alt=""
            width={CURSOR_SIZE}
            height={CURSOR_SIZE}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0_10px_rgba(217,70,239,0.45)]"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CustomCursor;
