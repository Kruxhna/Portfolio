"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  Code2,
  Cpu,
  Binary,
  Layers,
  Sparkles,
  Award,
  Terminal,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { DSA_STATS } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { CodolioIcon } from "@/components/ui/Icons";

export function DSAShowcaseSection() {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  return (
    <section id="stats" className="relative py-20 sm:py-28">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          <span>02 // ALGORITHMIC RIGOR</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
              Problem Solving &amp; DSA
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[#A1A1AA]">
              Data structures, computational complexity, and competitive programming verified on Codolio.
            </p>
          </div>

          {/* Direct Codolio Live Profile Badge */}
          <a
            href={DSA_STATS.codolioProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/10 px-4 py-2.5 font-mono text-xs font-semibold text-[#FAFAFA] backdrop-blur-md transition-all duration-200 hover:border-[#38BDF8] hover:bg-[#38BDF8]/20 hover:shadow-lg hover:shadow-[#38BDF8]/10"
          >
            <CodolioIcon className="h-4 w-4 text-[#38BDF8]" />
            <span>View Codolio Live Profile</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#38BDF8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* 2. BENTO-GRID CYBER-ENGINEERING DASHBOARD */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* CARD 1: MASTER STATS CARD (Span 7) */}
        <SpotlightCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-[#27272A] bg-[#111115]/90">
          <div>
            {/* Top Telemetry Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-[#38BDF8]">
                  <Code2 className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
                  Codolio Aggregated Tracker
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>45-DAY STREAK</span>
              </div>
            </div>

            {/* Master Counter */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
              <div>
                <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-[#FAFAFA]">
                  {DSA_STATS.totalSolved}
                </span>
                <span className="ml-2 font-mono text-sm text-[#71717A]">Problems Solved</span>
              </div>

              <span className="font-mono text-xs text-[#38BDF8] bg-[#38BDF8]/10 border border-[#38BDF8]/20 rounded-full px-3 py-1 self-start sm:self-auto">
                Verified Multi-Platform
              </span>
            </div>

            {/* Segmented Combined Progress Bar */}
            <div className="mt-6 flex h-3 w-full overflow-hidden rounded-full bg-[#18181b] p-0.5 border border-[#27272A]">
              <div
                style={{ width: `${DSA_STATS.breakdown[0].percentage}%` }}
                className="h-full rounded-l-full bg-emerald-500 transition-all duration-500"
                title={`Easy: ${DSA_STATS.breakdown[0].count}`}
              />
              <div
                style={{ width: `${DSA_STATS.breakdown[1].percentage}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Medium: ${DSA_STATS.breakdown[1].count}`}
              />
              <div
                style={{ width: `${DSA_STATS.breakdown[2].percentage}%` }}
                className="h-full rounded-r-full bg-rose-500 transition-all duration-500"
                title={`Hard: ${DSA_STATS.breakdown[2].count}`}
              />
            </div>

            {/* Difficulty Breakdown Bars & Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {DSA_STATS.breakdown.map((b) => (
                <div
                  key={b.level}
                  className="rounded-xl border border-[#27272A] bg-[#09090b]/80 p-3.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A]">
                    <span>{b.level.toUpperCase()}</span>
                    <span className={b.textCol}>{b.percentage}%</span>
                  </div>
                  <div className={`mt-1 font-mono text-xl sm:text-2xl font-bold ${b.textCol}`}>
                    {b.count}
                  </div>
                  {/* Miniature individual progress fill */}
                  <div className="mt-2.5 h-1 w-full rounded-full bg-[#18181b]">
                    <div
                      style={{ width: `${b.percentage * 2}%` }}
                      className={`h-full rounded-full ${b.barBg}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtext info */}
          <div className="mt-6 pt-4 border-t border-[#27272A]/70 flex items-center justify-between font-mono text-[11px] text-[#71717A]">
            <span>LeetCode • GfG • CodeChef Synced</span>
            <span className="text-[#FAFAFA]">Zero TLE Mindset</span>
          </div>
        </SpotlightCard>

        {/* CARD 2: TOPIC DISTRIBUTION TAGS (Span 5) */}
        <SpotlightCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border-[#27272A] bg-[#111115]/90">
          <div>
            <div className="flex items-center gap-2 border-b border-[#27272A] pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-emerald-400">
                <Binary className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
                Topic Distribution
              </span>
            </div>

            <p className="mt-4 text-xs text-[#A1A1AA] leading-relaxed">
              Core mathematical abstractions and data structures frequently implemented from scratch:
            </p>

            {/* Interactive Topic Pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {DSA_STATS.topics.map((t) => (
                <button
                  key={t.name}
                  onClick={() =>
                    setActiveTopic(activeTopic === t.name ? null : t.name)
                  }
                  className={`group flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs transition-all duration-200 text-left ${
                    activeTopic === t.name
                      ? "border-[#38BDF8] bg-[#38BDF8]/15 text-white shadow-md shadow-[#38BDF8]/10"
                      : "border-[#27272A] bg-[#09090b]/90 text-[#A1A1AA] hover:border-[#38BDF8]/40 hover:text-white hover:bg-[#18181b]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                  <span className="font-medium text-[#FAFAFA]">{t.name}</span>
                  <span className="text-[10px] text-[#71717A] group-hover:text-emerald-400 transition-colors">
                    [{t.count}]
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Topic Details Callout */}
            {activeTopic && (
              <div className="mt-4 rounded-xl border border-[#38BDF8]/30 bg-[#09090b] p-3 text-xs font-mono text-[#A1A1AA] animate-in fade-in">
                <span className="text-[#38BDF8] font-bold">{activeTopic}: </span>
                {
                  DSA_STATS.topics.find((t) => t.name === activeTopic)?.complexity
                }
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#27272A]/70 text-[11px] font-mono text-[#71717A]">
            <span>Click any topic pill to inspect algorithmic paradigm</span>
          </div>
        </SpotlightCard>

        {/* CARD 3: MULTI-PLATFORM BADGE STRIP (Span 6) */}
        <SpotlightCard className="lg:col-span-6 p-6 sm:p-7 border-[#27272A] bg-[#111115]/90">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-amber-400">
                <Award className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
                Multi-Platform Synced Hub
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#71717A]">Codolio Aggregated</span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {DSA_STATS.platforms.map((p) => (
              <div
                key={p.name}
                className="rounded-xl border border-[#27272A] bg-[#09090b]/80 p-4 transition-all hover:border-[#38BDF8]/40 hover:bg-[#18181b]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#FAFAFA]">
                    {p.name}
                  </span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: p.badgeColor }}
                  />
                </div>
                <div className="mt-2 font-mono text-base font-extrabold text-[#FAFAFA]">
                  {p.solved}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-[#10B981]">
                  {p.metric}
                </div>
                <div className="mt-2 text-[10px] font-mono text-[#71717A]">
                  {p.handle}
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* CARD 4: ENGINEERING PHILOSOPHY CALLOUT (Span 6) */}
        <SpotlightCard className="lg:col-span-6 p-6 sm:p-7 border-[#27272A] bg-[#111115]/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#27272A] pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-[#6366F1]">
                <Cpu className="h-4 w-4" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
                Algorithmic Philosophy
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-[#27272A] bg-[#09090b] p-4.5 font-mono text-xs sm:text-[13px] leading-relaxed text-[#FAFAFA]">
              <span className="text-[#38BDF8] font-bold">&quot;</span>
              {DSA_STATS.philosophy}
              <span className="text-[#38BDF8] font-bold">&quot;</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-[#27272A]/70 text-[11px] font-mono text-[#71717A]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> O(N) Space Bounds
            </span>
            <span>•</span>
            <span className="text-[#38BDF8]">Vectorized Operations</span>
            <span>•</span>
            <span className="text-[#FAFAFA]">Cache Locality</span>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
