"use client";

import React, { useEffect, useRef, useState } from "react";
import { DSA_DATA, formatRelativeTime } from "@/data/dsaData";

// Ease-out cubic for smooth count-up
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function DSAShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [counts, setCounts] = useState<{ [key: string]: number }>({});
  const [isReducedMotion, setIsReducedMotion] = useState(false);

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

    // If reduced motion is requested, show final state immediately
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

          // 900ms count-up with easeOutCubic
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
              // Ensure exact final numbers
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

  // Motion entrance styles helper (80ms stagger, 16px rise)
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
      className="relative w-full bg-[var(--bg)] scroll-mt-24 select-none"
      style={{
        paddingTop: "clamp(64px, 10vw, 128px)",
        paddingBottom: "clamp(64px, 10vw, 128px)",
        paddingLeft: "2.5vw",
        paddingRight: "2.5vw",
      }}
    >
      <div className="mx-auto w-full max-w-[1440px]">
        {/* 12-Column Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: IDENTITY BLOCK (Cols 1-4, Sticky)                     */}
          {/* ================================================================= */}
          <div
            className="lg:col-span-4 lg:sticky lg:top-[104px] flex flex-col items-start select-text"
            style={getEntranceStyle(0)}
          >
            {/* 1. Eyebrow */}
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] mb-3">
              {DSA_DATA.eyebrow}
            </p>

            {/* 2. Title: algorithmic rigor */}
            <h2
              id="dsa-title"
              className="text-[#fafafa] font-normal leading-[0.95] tracking-tighter"
              style={{
                fontFamily: "var(--font-roboto-flex), var(--font-inter), sans-serif",
                fontVariationSettings: '"wght" 850, "wdth" 120',
                fontSize: "clamp(40px, 5vw, 88px)",
              }}
            >
              {DSA_DATA.title}
            </h2>

            {/* 3. Statement */}
            <p className="mt-6 text-[16px] sm:text-[17px] text-[var(--muted)] leading-[1.6] max-w-[36ch]">
              {DSA_DATA.statement}
            </p>

            {/* 4. Tag line */}
            <p className="mt-6 font-mono text-[11px] text-[var(--muted)] tracking-[0.08em] lowercase">
              {DSA_DATA.tagline}
            </p>

            {/* 5. Plain text link + sync metadata */}
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px]">
              <a
                href={DSA_DATA.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-underline text-[#fafafa] hover:text-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#3ecf8e] focus-visible:outline-offset-[3px] inline-flex items-center gap-1"
              >
                {DSA_DATA.profileLinkText}
              </a>
              <span className="text-[var(--line)]" aria-hidden="true">
                /
              </span>
              <span className="text-[var(--muted)]">{DSA_DATA.lastSyncedDate}</span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: STACKED BLOCKS (Cols 6-12)                           */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 lg:col-start-6 flex flex-col select-text">
            {/* ── BLOCK A: STATS ───────────────────────────────────────────── */}
            <div
              className="border-t border-[var(--line)] pt-8 pb-12"
              style={getEntranceStyle(1)}
            >
              <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4">
                {DSA_DATA.stats.map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    <dd
                      className="text-[#fafafa] tracking-tight leading-none tabular-nums font-normal"
                      style={{
                        fontFamily:
                          "var(--font-roboto-flex), var(--font-inter), sans-serif",
                        fontVariationSettings: '"wght" 800, "wdth" 110',
                        fontSize: "clamp(34px, 4vw, 56px)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {/* Fixed min-width prevents layout shift during count-up */}
                      <span className="inline-block tabular-nums">
                        {counts[stat.id] !== undefined
                          ? counts[stat.id]
                          : stat.value}
                        {stat.suffix || ""}
                      </span>
                    </dd>
                    <dt className="mt-2.5 font-mono text-[12px] text-[var(--muted)] lowercase tracking-normal">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>

            {/* ── BLOCK B: PLATFORMS ───────────────────────────────────────── */}
            <div
              className="border-t border-[var(--line)] pt-12 pb-12"
              style={getEntranceStyle(2)}
            >
              <ul className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
                {DSA_DATA.platforms.map((platform, idx) => (
                  <li
                    key={platform.id}
                    className={`flex flex-col justify-between ${
                      idx === 0
                        ? "md:pr-6 pb-6 md:pb-0"
                        : idx === 1
                        ? "md:px-6 py-6 md:py-0"
                        : "md:pl-6 pt-6 md:pt-0"
                    }`}
                  >
                    <div>
                      {/* Name + Status Indicator */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[13px] text-[#fafafa] font-normal lowercase">
                          {platform.name}
                        </span>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] lowercase">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: platform.isActive
                                ? "var(--accent)"
                                : "var(--muted)",
                            }}
                          />
                          <span
                            style={{
                              color: platform.isActive
                                ? "var(--accent)"
                                : "var(--muted)",
                            }}
                          >
                            {platform.isActive ? "active" : "synced"}
                          </span>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="mt-3 font-mono text-[12px] text-[var(--muted)] lowercase leading-relaxed">
                        <div>{platform.solved}</div>
                        <div className="mt-0.5">{platform.metric}</div>
                        <div className="mt-0.5">{platform.handle}</div>
                      </div>
                    </div>

                    {/* Action link */}
                    <div className="mt-5 pt-3">
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link-underline font-mono text-[11px] text-[#fafafa] hover:text-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#3ecf8e] focus-visible:outline-offset-[3px] inline-flex items-center gap-1"
                      >
                        profile ↗
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── BLOCK C: PARADIGMS MASTERED ──────────────────────────────── */}
            <div
              className="border-t border-[var(--line)] pt-12 pb-12"
              style={getEntranceStyle(3)}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                PARADIGMS MASTERED
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {DSA_DATA.paradigms.map((p) => (
                  <li
                    key={p.name}
                    data-cursor="link"
                    className="border border-[var(--line)] rounded-[4px] px-3 py-1.5 font-mono text-[12px] text-[var(--muted)] transition-colors duration-150 hover:border-[#fafafa] hover:text-[#fafafa] cursor-default"
                  >
                    {p.name} [{p.count}]
                  </li>
                ))}
              </ul>
            </div>

            {/* ── BLOCK D: RECENT SUBMISSIONS (LEDGER) ──────────────────────── */}
            <div
              className="border-t border-[var(--line)] pt-12 pb-6"
              style={getEntranceStyle(4)}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  RECENT SUBMISSIONS
                </p>
                <a
                  href={DSA_DATA.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link-underline font-mono text-[11px] lowercase text-[var(--muted)] hover:text-[#fafafa] transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#3ecf8e] focus-visible:outline-offset-[3px]"
                >
                  view all ↗
                </a>
              </div>

              {/* Ledger Table */}
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left font-mono text-[12px]">
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Problem</th>
                      <th scope="col">Difficulty</th>
                      <th scope="col">Platform</th>
                      <th scope="col">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {DSA_DATA.submissions.map((sub) => {
                      // Difficulty opacity differentiation: easy 60%, med 80%, hard 100%
                      const diffOpacity =
                        sub.difficulty === "easy"
                          ? "opacity-60"
                          : sub.difficulty === "med"
                          ? "opacity-80"
                          : "opacity-100 font-medium";

                      return (
                        <tr
                          key={sub.id}
                          className="transition-colors duration-150 hover:bg-white/[0.03] group"
                        >
                          {/* Problem name */}
                          <td className="py-3.5 pr-4 text-[#fafafa] font-normal">
                            <a
                              href={sub.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="nav-link-underline hover:text-white transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#3ecf8e] focus-visible:outline-offset-[3px]"
                            >
                              {sub.problem}
                            </a>
                            {/* Mobile subtitle with platform & time */}
                            <div className="sm:hidden mt-1 text-[11px] text-[var(--muted)] flex items-center gap-2">
                              <span className={diffOpacity}>{sub.difficulty}</span>
                              <span>·</span>
                              <span>{sub.platform}</span>
                              <span>·</span>
                              <span className="tabular-nums">
                                {formatRelativeTime(sub.timestamp)}
                              </span>
                            </div>
                          </td>

                          {/* Difficulty (Hidden on very narrow mobile, visible sm+) */}
                          <td className="hidden sm:table-cell py-3.5 px-4 text-[#fafafa]">
                            <span className={diffOpacity}>{sub.difficulty}</span>
                          </td>

                          {/* Platform (Hidden on mobile, visible sm+) */}
                          <td className="hidden sm:table-cell py-3.5 px-4 text-[var(--muted)]">
                            {sub.platform}
                          </td>

                          {/* Relative Time (Hidden on mobile, visible sm+) */}
                          <td className="hidden sm:table-cell py-3.5 pl-4 text-right text-[var(--muted)] tabular-nums">
                            {formatRelativeTime(sub.timestamp)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
