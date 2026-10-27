"use client";

import React, { useState, useCallback, useRef } from "react";
import { ArrowUp } from "lucide-react";
import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";

// ============================================================================
// SECTION MAPPINGS FOR TELEMETRY READOUT
// ============================================================================

const SECTIONS = [
  { id: "hero", tag: "00", name: "INTRO" },
  { id: "dsa", tag: "01", name: "DSA ARCHITECTURE" },
  { id: "work", tag: "02", name: "FEATURED SYSTEMS" },
  { id: "what-i-do", tag: "03", name: "CAPABILITIES" },
  { id: "activity", tag: "04", name: "GITHUB ARCHIVE" },
  { id: "arsenal", tag: "05", name: "TOOLING & STACK" },
  { id: "about", tag: "06", name: "ABOUT & ETHOS" },
  { id: "contact", tag: "07", name: "TRANSMISSION" },
];

export function ScrollTelemetryHUD() {
  const { scrollTo } = useSmoothScroll();
  const [activeSection, setActiveSection] = useState(SECTIONS[0]);
  const [percentage, setPercentage] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const lastSectionIdRef = useRef(SECTIONS[0].id);

  // SVG Radial Ring Metrics
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((percentage / 100) * circumference);

  // Isolated scroll listener: ONLY ScrollTelemetryHUD updates, no root re-renders
  useLenis(
    useCallback((lenis: Lenis) => {
      const scroll = lenis.scroll;
      const progress = lenis.progress;

      // Update visible toggle only on state change
      const nextVisible = scroll > 240;
      setIsVisible((prev) => (prev !== nextVisible ? nextVisible : prev));

      // Update percentage only when integer value changes
      const nextPct = Math.min(100, Math.max(0, Math.round(progress * 100)));
      setPercentage((prev) => (prev !== nextPct ? nextPct : prev));

      // Detect active section
      const scrollPos = scroll + window.innerHeight * 0.35;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            if (lastSectionIdRef.current !== SECTIONS[i].id) {
              lastSectionIdRef.current = SECTIONS[i].id;
              setActiveSection(SECTIONS[i]);
            }
            break;
          }
        }
      }
    }, [])
  );

  return (
    <div
      aria-hidden="true"
      className={`fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 select-none transition-all duration-300 font-mono ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {/* ── SECTION COORDINATE CHIP ── */}
      <div className="flex items-center gap-2.5 rounded-full border border-[rgba(221,112,116,0.2)] bg-[#0A0807]/85 px-3.5 py-1.5 backdrop-blur-md shadow-xl text-[10.5px] uppercase tracking-wider text-[#ECC3AB]">
        <span className="flex h-1.5 w-1.5 rounded-full bg-[#E02E32] animate-pulse" />
        <span className="text-[#DD7074] font-semibold">[{activeSection.tag}]</span>
        <span className="text-[#ECC3AB] max-w-[140px] truncate">{activeSection.name}</span>
        <span className="text-[#DD7074]/40">·</span>
        <span className="text-[#E69683] font-bold">{percentage}%</span>
      </div>

      {/* ── SMOOTH SCROLL TO TOP CIRCULAR BUTTON ── */}
      <button
        onClick={() => scrollTo(0, { duration: 1.2 })}
        data-cursor="magnetic"
        title="Scroll to top"
        aria-label="Scroll to top"
        className="relative group flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(221,112,116,0.25)] bg-[#0A0807]/90 text-[#ECC3AB] shadow-xl backdrop-blur-md transition-all hover:border-[#E02E32] hover:bg-[#14100D] cursor-pointer"
      >
        {/* Radial SVG Progress Meter */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 transform p-0.5">
          <circle
            cx="17"
            cy="17"
            r={radius}
            stroke="rgba(221, 112, 116, 0.15)"
            strokeWidth="1.8"
            fill="transparent"
          />
          <circle
            cx="17"
            cy="17"
            r={radius}
            stroke="#E02E32"
            strokeWidth="1.8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-[stroke-dashoffset] duration-100 ease-out"
          />
        </svg>

        <ArrowUp className="relative z-10 h-3.5 w-3.5 text-[#ECC3AB] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-[#E02E32]" />
      </button>
    </div>
  );
}
