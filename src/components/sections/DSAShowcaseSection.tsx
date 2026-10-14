"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Flame } from "lucide-react";
import { DSA_DATA } from "@/data/dsaData";

// Ease-out cubic for smooth count-up
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function DSAShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [selectedParadigm, setSelectedParadigm] = useState<string>("All Paradigms");

  // Paradigms with counts and complexity bounds
  const paradigmData: { [key: string]: { count: string; bound: string } } = {
    "All Paradigms": {
      count: "350+",
      bound: "strictly bounded O(N), O(log N) & O(1) auxiliary space",
    },
    "Dynamic Programming": {
      count: "65+",
      bound: "optimal bound: O(N) / O(N·K) time with space compression",
    },
    "Graphs & Trees": {
      count: "80+",
      bound: "optimal bound: O(V + E) BFS/DFS · O(E log V) Dijkstra",
    },
    "Binary Search": {
      count: "45+",
      bound: "optimal bound: strictly O(log N) on monotonic search space",
    },
    "Heaps & Sliding Window": {
      count: "50+",
      bound: "optimal bound: O(N log K) min/max-heap · O(N) monotonic deque",
    },
    "Divide & Conquer": {
      count: "30+",
      bound: "optimal bound: O(N log N) merge count with Akra-Bazzi recurrence",
    },
    "Bit Manipulation": {
      count: "35+",
      bound: "optimal bound: O(1) word-level parallel bitwise operations",
    },
  };

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver for entrance animation and count-up trigger
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (isReducedMotion) {
      setHasEntered(true);
      const initial: { [key: string]: number } = {};
      DSA_DATA.stats.forEach((s) => {
        initial[s.id] = s.value;
      });
      setCounts(initial);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();

          const startTime = performance.now();
          const duration = 900;

          const animateCounts = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = easeOutCubic(progress);

            const next: { [key: string]: number } = {};
            DSA_DATA.stats.forEach((s) => {
              next[s.id] = Math.round(s.value * eased);
            });
            setCounts(next);

            if (progress < 1) {
              requestAnimationFrame(animateCounts);
            } else {
              const finalCounts: { [key: string]: number } = {};
              DSA_DATA.stats.forEach((s) => {
                finalCounts[s.id] = s.value;
              });
              setCounts(finalCounts);
            }
          };

          requestAnimationFrame(animateCounts);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isReducedMotion]);

  const getEntranceStyle = (index: number): React.CSSProperties => {
    if (isReducedMotion) {
      return { opacity: 1, transform: "none" };
    }
    return {
      opacity: hasEntered ? 1 : 0,
      transform: hasEntered ? "translateY(0)" : "translateY(16px)",
      transition: `opacity 650ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms, transform 650ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms`,
    };
  };

  return (
    <section
      ref={sectionRef}
      id="dsa"
      aria-labelledby="dsa-title"
      className="relative z-10 w-full bg-transparent py-14 sm:py-20 md:py-24 select-none"
    >
      {/* Full-Width Container Aligned with Navbar and Featured Work (max-w-[1720px]) */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* 12-Column Asymmetric Grid with Equal Height Columns (items-stretch) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* ================================================================= */}
          {/* LEFT COLUMN: TOP NARRATIVE + BOTTOM PARADIGMS & TELEMETRY         */}
          {/* ================================================================= */}
          <div
            className="lg:col-span-5 flex flex-col justify-between h-full select-text"
            style={getEntranceStyle(0)}
          >
            {/* ── Top Group: Editorial Header & Narrative ──────────────────── */}
            <div>
              {/* 1. Eyebrow */}
              <p className="font-mono text-xs uppercase tracking-widest text-[#CEA491]/65 mb-4">
                {DSA_DATA.eyebrow}
              </p>

              {/* 2. Display Title */}
              <h2
                id="dsa-title"
                className="text-6xl sm:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.94] text-[#DEC1B4] mb-6"
              >
                {DSA_DATA.title}
              </h2>

              {/* 3. Body Copy */}
              <p className="text-base sm:text-lg text-[#DEC1B4]/80 leading-relaxed max-w-md font-sans">
                {DSA_DATA.statement}
              </p>

              {/* 4. Technical Spec Strip */}
              <p className="font-mono text-xs text-[#CEA491]/55 mt-6 pt-5 border-t border-[#CEA491]/18">
                {DSA_DATA.tagline}
              </p>

              {/* 5. External Profile Link Row */}
              <div className="mt-6 flex flex-wrap items-center font-mono text-xs">
                <a
                  href={DSA_DATA.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="magnetic"
                  data-cursor-label="*open ↗*"
                  className="text-[#FDFCFB] hover:text-[#AD6A4C] transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
                >
                  <span>{DSA_DATA.profileLinkText}</span>
                </a>
                <span className="text-[#CEA491]/50 ml-2">
                  / {DSA_DATA.lastSyncedDate}
                </span>
              </div>
            </div>

            {/* ── Bottom Group: Fills Bottom-Left (Flush with Right Column) ── */}
            <div className="border-t border-[#CEA491]/18 pt-7 mt-8">
              {/* Header Row */}
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="uppercase tracking-widest text-[#CEA491]/60 font-semibold">
                  PARADIGMS MASTERED
                </span>
                <span className="text-[#AD6A4C] text-[10px] tracking-wide">
                  [ click to filter submissions ]
                </span>
              </div>

              {/* Interactive Paradigm Pills */}
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.keys(paradigmData).map((pName) => {
                  const isSel = selectedParadigm === pName;
                  const item = paradigmData[pName];
                  return (
                    <button
                      key={pName}
                      onClick={() => setSelectedParadigm(pName)}
                      data-cursor="magnetic"
                      className={`text-xs font-mono px-3 py-1.5 rounded transition-all cursor-pointer ${
                        isSel
                          ? "bg-[#AD6A4C]/20 border border-[#AD6A4C] text-[#FDFCFB] font-semibold"
                          : "bg-[#0A0807]/85 border border-[#CEA491]/20 text-[#DEC1B4] hover:border-[#AD6A4C]/50"
                      }`}
                    >
                      {pName === "All Paradigms" ? "[ All Paradigms ]" : `${pName} [${item.count}]`}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Complexity Bound Subtitle */}
              <div className="mt-3 text-[11px] font-mono text-[#AD6A4C] flex items-center gap-1.5 min-h-[20px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C] shrink-0" />
                <span className="truncate">{paradigmData[selectedParadigm].bound}</span>
              </div>

              {/* Compact Complexity & Consistency Telemetry Strip */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-[#CEA491]/15">
                <div>
                  <div className="text-[10px] font-mono text-[#CEA491]/55 uppercase tracking-wider">
                    primary lang
                  </div>
                  <div className="mt-1 text-xs font-mono text-[#FDFCFB] font-bold">
                    Python 3 / C++
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#CEA491]/55 uppercase tracking-wider">
                    avg runtime
                  </div>
                  <div className="mt-1 text-xs font-mono text-[#AD6A4C] font-bold">
                    94.2%ile
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#CEA491]/55 uppercase tracking-wider">
                    memory bound
                  </div>
                  <div className="mt-1 text-xs font-mono text-[#DEC1B4] font-bold">
                    O(1) – O(N)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: STATS + PLATFORMS + RECENT SUBMISSIONS               */}
          {/* ================================================================= */}
          <div
            className="lg:col-span-7 flex flex-col justify-between h-full select-text"
            style={getEntranceStyle(1)}
          >
            {/* ── BLOCK A: 5-Metric Stat Strip (Aligned with algorithmic rigor) ─ */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pb-8 border-b border-[#CEA491]/18">
              {DSA_DATA.stats.map((stat) => (
                <div key={stat.id} className="flex flex-col">
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#DEC1B4] font-mono leading-none tabular-nums">
                    <span>
                      {counts[stat.id] !== undefined
                        ? counts[stat.id]
                        : stat.value}
                      {stat.suffix || ""}
                    </span>
                  </div>
                  <div className="mt-1.5 text-xs font-mono text-[#AD6A4C] lowercase tracking-normal">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* ── BLOCK B: 3-Column Platform Breakdown ───────────────────────── */}
            <div className="py-8 border-b border-[#CEA491]/18">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:divide-x sm:divide-[#CEA491]/18">
                {DSA_DATA.platforms.map((platform, idx) => (
                  <div
                    key={platform.id}
                    className={`flex flex-col justify-between ${
                      idx === 0
                        ? "sm:pr-6 pb-6 sm:pb-0"
                        : idx === 1
                        ? "sm:px-6 py-6 sm:py-0"
                        : "sm:pl-6 pt-6 sm:pt-0"
                    }`}
                  >
                    <div>
                      {/* Name + Status Indicator */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm text-[#DEC1B4] font-semibold lowercase">
                          {platform.name}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-xs lowercase">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: platform.isActive
                                ? "#AD6A4C"
                                : "rgba(206, 164, 145, 0.4)",
                            }}
                          />
                          <span
                            style={{
                              color: platform.isActive
                                ? "#AD6A4C"
                                : "rgba(206, 164, 145, 0.6)",
                            }}
                          >
                            {platform.isActive ? "active" : "synced"}
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="mt-3 font-mono text-xs text-[#CEA491]/75 lowercase leading-relaxed">
                        <div className="text-[#FDFCFB] font-bold">{platform.solved}</div>
                        <div className="mt-0.5">{platform.metric}</div>
                        <div className="mt-0.5 text-[#AD6A4C]">{platform.handle}</div>
                      </div>
                    </div>

                    {/* Action link */}
                    <div className="mt-5 pt-3 border-t border-[#CEA491]/10">
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="magnetic"
                        data-cursor-label="*open ↗*"
                        className="font-mono text-xs text-[#DEC1B4] hover:text-[#AD6A4C] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>profile</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── BLOCK C: RECENT SUBMISSIONS Table (Bottom-Aligned with Left) ─ */}
            <div className="pt-8">
              {/* Header row */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-[#CEA491]/60 font-semibold">
                  RECENT SUBMISSIONS
                </span>
                <a
                  href={DSA_DATA.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="magnetic"
                  data-cursor-label="*open ↗*"
                  className="font-mono text-xs text-[#DEC1B4] hover:text-[#AD6A4C] transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>view all ↗</span>
                </a>
              </div>

              {/* Submissions List Table */}
              <div className="w-full divide-y divide-[#CEA491]/15 border-t border-b border-[#CEA491]/15 mt-4">
                  {DSA_DATA.submissions.map((sub) => {
                    const isMatch =
                      selectedParadigm === "All Paradigms" ||
                      sub.paradigm.toLowerCase() === selectedParadigm.toLowerCase();

                    const diffColor =
                      sub.difficulty === "easy"
                        ? "text-[#AD6A4C]"
                        : sub.difficulty === "med"
                        ? "text-[#DEC1B4]"
                        : "text-[#FDFCFB] font-bold";

                    return (
                      <div
                        key={sub.id}
                        className={`py-3.5 px-3 -mx-3 rounded transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          isMatch
                            ? selectedParadigm !== "All Paradigms"
                              ? "bg-[#AD6A4C]/15 border-l-2 border-[#AD6A4C] pl-2.5"
                              : "hover:bg-[#AD6A4C]/[0.05]"
                            : "opacity-35 hover:opacity-70"
                        }`}
                      >
                        {/* Problem Name & Mobile Meta */}
                        <div className="flex-1 min-w-0 pr-4">
                          <a
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="magnetic"
                            className="font-mono text-xs sm:text-[13px] text-[#EEDED7] hover:text-[#AD6A4C] transition-colors truncate block"
                          >
                            {sub.problem}
                          </a>
                          {/* Mobile-only tag */}
                          <div className="sm:hidden mt-1 flex items-center gap-2 text-[10px] font-mono text-[#CEA491]/60">
                            <span className="text-[#AD6A4C]">{sub.paradigm}</span>
                            <span>·</span>
                            <span className={diffColor}>{sub.difficulty}</span>
                            <span>·</span>
                            <span>{sub.platform}</span>
                            <span>·</span>
                            <span>{sub.timeAgo}</span>
                          </div>
                        </div>

                        {/* Desktop Paradigm Tag */}
                        <div className="hidden sm:block text-xs font-mono text-[#CEA491]/65 w-44 truncate">
                          {sub.paradigm}
                        </div>

                        {/* Desktop Difficulty */}
                        <div className="hidden sm:block text-xs font-mono w-14 text-center">
                          <span className={diffColor}>{sub.difficulty}</span>
                        </div>

                        {/* Desktop Platform & Time */}
                        <div className="hidden sm:flex items-center justify-end gap-2 text-xs font-mono text-[#CEA491]/70 w-32 text-right">
                          <span>{sub.platform}</span>
                          <span>·</span>
                          <span className="text-[#FDFCFB]/80">{sub.timeAgo}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
