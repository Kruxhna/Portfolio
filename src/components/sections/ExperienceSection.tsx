"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Cpu,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { ABOUT_JOURNEY, ACADEMIC_CREDENTIALS } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { ExternalLinkPill } from "@/components/ui/ExternalLinkPill";

export function ExperienceSection() {
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);

  return (
    <section id="timeline" className="relative py-20 sm:py-28">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#DD7074]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E02E32] animate-pulse" />
          <span>05 // TRAJECTORY & ETHOS</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#ECC3AB] sm:text-4xl">
              About Me & Journey
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[#E69683]/80">
              Systems-level machine learning engineer with rigorous theoretical foundations in algorithms and automata theory.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-[#9A142C] bg-[#4E0104]/85 px-3 py-1 font-mono text-xs text-[#E8A791]">
            <span>Mumbai University</span>
            <span>•</span>
            <span>Class of 2024–2028</span>
          </div>
        </div>
      </div>

      {/* 2. CORE BIO & ACADEMIC CREDENTIALS BENTO STRIP */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Card 1: Academic Credentials (Span 5) */}
        <SpotlightCard
          className="lg:col-span-5 p-6 sm:p-7 border-[rgba(221,112,116,0.18)] bg-[#0A0807] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[rgba(221,112,116,0.18)] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(221,112,116,0.22)] bg-[#14100D] text-[#E46B5E]">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#DD7074]">
                  Academic Credentials
                </span>
              </div>
              <Badge variant="accent" size="sm">
                Active B.E. Scholar
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <span className="text-xs font-mono text-[#DD7074] uppercase">Degree & Program</span>
                <h3 className="mt-0.5 text-lg font-bold text-[#ECC3AB]">
                  {ACADEMIC_CREDENTIALS.degree}
                </h3>
                <p className="mt-0.5 text-xs text-[#E46B5E] font-mono">
                  {ACADEMIC_CREDENTIALS.specialization}
                </p>
              </div>

              <div className="pt-2 border-t border-[rgba(221,112,116,0.18)]">
                <span className="text-xs font-mono text-[#DD7074] uppercase">Institution</span>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#ECC3AB]">
                    {ACADEMIC_CREDENTIALS.university}
                  </span>
                  <span className="font-mono text-xs text-[#DD7074]">
                    {ACADEMIC_CREDENTIALS.batch}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(221,112,116,0.18)] font-mono text-[11px] text-[#DD7074] flex items-center justify-between">
            <span>Specialization: AI, ML & Systems</span>
            <span className="text-[#E46B5E]">4-Year Degree Track</span>
          </div>
        </SpotlightCard>

        {/* Card 2: Systems Focus & Engineering Passions (Span 7) */}
        <SpotlightCard
          className="lg:col-span-7 p-6 sm:p-7 border-[rgba(221,112,116,0.18)] bg-[#0A0807] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[rgba(221,112,116,0.18)] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(221,112,116,0.22)] bg-[#14100D] text-[#E46B5E]">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#DD7074]">
                  Systems Focus & Core Passions
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#E46B5E]">HPC + Theory</span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-mono text-[#E46B5E] uppercase tracking-wider">
                  // Focus: Systems-Level Machine Learning
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-[#ECC3AB]/85 leading-relaxed">
                  {ABOUT_JOURNEY.focus}
                </p>
              </div>

              <div className="pt-2 border-t border-[rgba(221,112,116,0.18)]">
                <h4 className="text-xs font-mono text-[#E46B5E] uppercase tracking-wider">
                  // Passion: Distributed Scale & GATE Preparation
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-[#ECC3AB]/85 leading-relaxed">
                  {ABOUT_JOURNEY.passion}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(221,112,116,0.18)] flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#DD7074]">
            <span className="text-[#ECC3AB] font-medium">Core Targets:</span>
            <span className="rounded bg-[#14100D] border border-[rgba(221,112,116,0.18)] px-2 py-0.5 text-[#E46B5E]">
              GATE Data Science & AI (DA)
            </span>
            <span className="rounded bg-[#14100D] border border-[rgba(221,112,116,0.18)] px-2 py-0.5 text-[#ECC3AB]">
              GATE Computer Science (CS)
            </span>
          </div>
        </SpotlightCard>
      </div>

      {/* 3. INTERACTIVE TIMELINE & MILESTONE CARDS */}
      <div className="mt-12">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#DD7074] mb-6">
          <Calendar className="h-4 w-4 text-[#E46B5E]" />
          <span>Interactive Milestones & Evolution</span>
        </div>

        <div className="space-y-6">
          {ABOUT_JOURNEY.milestones.map((milestone, idx) => {
            const isActive = activeMilestoneIndex === idx;
            return (
              <SpotlightCard
                key={idx}
                className={`p-6 sm:p-8 border transition-all duration-300 ${
                  isActive
                    ? "border-[rgba(228,107,94,0.55)] bg-[#0A0807] shadow-xl shadow-[0_8px_30px_rgba(228,107,94,0.08)]"
                    : "border-[rgba(221,112,116,0.18)] bg-[#0A0807] hover:border-[rgba(228,107,94,0.4)]"
                }`}
                onClick={() => setActiveMilestoneIndex(idx)}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    {/* Milestone Top Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-[#9A142C] bg-[#4E0104]/85 px-3 py-1 font-mono text-xs font-bold text-[#ECC3AB]">
                        {milestone.period}
                      </span>

                      <Badge
                        variant="accent"
                        size="sm"
                      >
                        {milestone.tag}
                      </Badge>
                    </div>

                    {/* Milestone Title */}
                    <h3 className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-[#ECC3AB]">
                      {milestone.title}
                    </h3>

                    {/* Milestone Engineering Bullets */}
                    <div className="mt-4 space-y-2.5">
                      {milestone.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[#ECC3AB]/85 leading-relaxed"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#E46B5E]" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Milestone Action Links */}
                    {milestone.links && milestone.links.length > 0 && (
                      <div className="mt-5 flex flex-wrap items-center gap-2 pt-2 border-t border-[rgba(221,112,116,0.18)]">
                        {milestone.links.map((link, lIdx) => (
                          <ExternalLinkPill
                            key={lIdx}
                            href={link.href}
                            variant="secondary"
                            size="sm"
                            data-cursor="magnetic"
                          >
                            {link.label}
                          </ExternalLinkPill>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
