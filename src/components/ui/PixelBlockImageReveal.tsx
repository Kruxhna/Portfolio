"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export interface PixelBlockImageRevealProps {
  /** Target image source URL */
  src?: string;
  /** Image alternative text */
  alt?: string;
  /** Intrinsic width for zero-CLS calculation */
  width?: number;
  /** Intrinsic height for zero-CLS calculation */
  height?: number;
  /** Outer container className */
  className?: string;
  /** Inner image className */
  imageClassName?: string;
  /** Number of grid columns (default: 8) */
  columns?: number;
  /** Number of grid rows (default: 10) */
  rows?: number;
  /** Solid initial cover color (default: #030308) */
  coverColor?: string;
  /** Animation duration per individual block cell in seconds (default: 0.38) */
  duration?: number;
  /** Whether animation triggers only once or re-triggers on scroll away & back (default: false) */
  once?: boolean;
  /** Image loading strategy (default: "eager") */
  loading?: "eager" | "lazy";
  /** Optional custom children to reveal instead of standard img */
  children?: React.ReactNode;
}

interface CellData {
  id: string;
  row: number;
  col: number;
  delay: number;
  grayColor: string;
}

/**
 * Deterministic pseudo-random jitter in range [0, 1) based on cell coordinates.
 * Guaranteed to match identically between SSR and client renders (zero hydration mismatch).
 */
function getDeterministicJitter(r: number, c: number): number {
  const val = Math.sin((r + 1) * 12.9898 + (c + 1) * 78.233) * 43758.5453;
  return val - Math.floor(val);
}

export function PixelBlockImageReveal({
  src,
  alt = "",
  width,
  height,
  className = "",
  imageClassName = "w-full h-auto object-contain",
  columns = 8,
  rows = 10,
  coverColor = "#030308",
  duration = 0.38,
  once = false,
  loading = "eager",
  children,
}: PixelBlockImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll trigger via Framer Motion useInView with 30% viewport intersection threshold
  const isInView = useInView(containerRef, {
    amount: 0.3,
    once,
  });

  // Track animation replay cycles for clean DOM re-mount on bidirectional scroll
  const [cycle, setCycle] = useState(0);
  const prevInView = useRef(isInView);

  useEffect(() => {
    if (isInView && !prevInView.current) {
      setCycle((c) => c + 1);
    }
    prevInView.current = isInView;
  }, [isInView]);

  // Compute 8x10 (or custom) grid cells with deterministic Tetris-like row stagger & jitter
  const cells = useMemo<CellData[]>(() => {
    const list: CellData[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const jitter = getDeterministicJitter(r, c);
        // Prompt formula: delay = (rowIndex * 0.045) + (columnJitter * 0.06)
        const delay = r * 0.045 + jitter * 0.06;
        // Step 1 gray shade: randomly/deterministically assigned Light Gray (#C8C6C1) or Medium Gray (#8C8C8C)
        const grayColor = jitter > 0.5 ? "#C8C6C1" : "#8C8C8C";

        list.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          delay,
          grayColor,
        });
      }
    }
    return list;
  }, [rows, columns]);

  // Zero-CLS aspect ratio if dimensions provided
  const aspectRatioStyle =
    width && height ? { aspectRatio: `${width} / ${height}` } : undefined;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={aspectRatioStyle}
    >
      <style>{`
        @keyframes pixelBlockWave {
          0% {
            background-color: var(--cell-cover, #030308);
            opacity: 1;
          }
          30% {
            background-color: var(--cell-gray, #8C8C8C);
            opacity: 1;
          }
          65% {
            background-color: #0A0A0A;
            opacity: 1;
          }
          100% {
            background-color: transparent;
            opacity: 0;
          }
        }
      `}</style>

      {/* ── 1. Target photograph / content underneath ── */}
      {children ? (
        children
      ) : src ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
          className={imageClassName}
          draggable={false}
        />
      ) : null}

      {/* ── 2. Stepped Monochromatic Pixel-Block Grid Overlay (80 cells) ── */}
      {!shouldReduceMotion && (
        <div
          key={`pixel-grid-${cycle}`}
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          }}
        >
          {cells.map((cell) => {
            const isRunning = isInView;
            return (
              <div
                key={cell.id}
                className="w-full h-full origin-center"
                style={{
                  ["--cell-cover" as string]: coverColor,
                  ["--cell-gray" as string]: cell.grayColor,
                  backgroundColor: isRunning ? undefined : coverColor,
                  opacity: isRunning ? undefined : 1,
                  // Stepped keyframe animation using step-end timing
                  animation: isRunning
                    ? `pixelBlockWave ${duration}s step-end ${cell.delay.toFixed(3)}s both`
                    : "none",
                  // 2% scale overlap eliminates any sub-pixel rendering seams across displays
                  transform: "scale(1.02)",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PixelBlockImageReveal;
