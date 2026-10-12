"use client";

import React, { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const posRef = useRef({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    // Only enable on fine pointer devices (desktop / trackpad / mouse)
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!hasMoved) {
        setHasMoved(true);
        posRef.current = { x: e.clientX, y: e.clientY };
        setPosition({ x: e.clientX, y: e.clientY });
      }
      setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("a") ||
          target.closest("button") ||
          target.closest(".interactive-letter") ||
          target.closest(".interactive-hover"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    // Smooth lerp animation loop for buttery fluid inertia
    let animationFrameId: number;
    const lerp = () => {
      const dx = targetRef.current.x - posRef.current.x;
      const dy = targetRef.current.y - posRef.current.y;
      posRef.current.x += dx * 0.22;
      posRef.current.y += dy * 0.22;

      setPosition({ x: posRef.current.x, y: posRef.current.y });
      animationFrameId = requestAnimationFrame(lerp);
    };

    animationFrameId = requestAnimationFrame(lerp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasMoved]);

  // NEVER render unless user has moved mouse inside window (eliminates stray center dot)
  if (!hasMoved || !isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-opacity duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Outer Hollow Circle Cursor */}
      <div
        className={`relative flex items-center justify-center rounded-full border border-white/60 transition-all duration-200 ease-out ${
          isHovered
            ? "h-11 w-11 scale-125 border-white bg-white/10"
            : isClicking
            ? "h-7 w-7 scale-90 border-white/80 bg-white/20"
            : "h-8 w-8"
        }`}
      >
        {/* Center Solid White Dot */}
        <span
          className={`rounded-full bg-white transition-all duration-150 ${
            isHovered ? "h-1 w-1 opacity-80" : "h-1.5 w-1.5"
          }`}
        />
      </div>
    </div>
  );
}
