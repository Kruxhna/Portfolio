"use client";

import React, { useState } from "react";
import {
  GraduationCap,
  Cpu,
  Layers,
  ArrowUpRight,
  Terminal,
  Calendar,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";
import { ABOUT_JOURNEY, ACADEMIC_CREDENTIALS } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { GithubIcon } from "@/components/ui/Icons";

export function ExperienceSection() {
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number>(0);

  return (
    <section id="timeline" className="relative py-20 sm:py-28">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#10B981]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>05 // TRAJECTORY &amp; ETHOS</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
              About Me &amp; Journey
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[#A1A1AA]">
              Systems-level machine learning engineer with rigorous theoretical foundations in algorithms and automata theory.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 font-mono text-xs text-emerald-400">
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
          spotlightColor="rgba(16, 185, 129, 0.12)"
          className="lg:col-span-5 p-6 sm:p-7 border-[#27272A] bg-[#111115]/90 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-emerald-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
                  Academic Credentials
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                Active B.E. Scholar
              </Badge>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <span className="text-xs font-mono text-[#71717A] uppercase">Degree &amp; Program</span>
                <h3 className="mt-0.5 text-lg font-bold text-[#FAFAFA]">
                  {ACADEMIC_CREDENTIALS.degree}
                </h3>
                <p className="mt-0.5 text-xs text-[#38BDF8] font-mono">
                  {ACADEMIC_CREDENTIALS.specialization}
                </p>
              </div>

              <div className="pt-2 border-t border-[#27272A]/70">
                <span className="text-xs font-mono text-[#71717A] uppercase">Institution</span>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#FAFAFA]">
                    {ACADEMIC_CREDENTIALS.university}
                  </span>
                  <span className="font-mono text-xs text-[#A1A1AA]">
                    {ACADEMIC_CREDENTIALS.batch}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#27272A]/70 font-mono text-[11px] text-[#71717A] flex items-center justify-between">
            <span>Specialization: AI, ML &amp; Systems</span>
            <span className="text-emerald-400">4-Year Degree Track</span>
          </div>
        </SpotlightCard>

        {/* Card 2: Systems Focus & Engineering Passions (Span 7) */}
        <SpotlightCard
          spotlightColor="rgba(56, 189, 248, 0.12)"
          className="lg:col-span-7 p-6 sm:p-7 border-[#27272A] bg-[#111115]/90 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-[#38BDF8]">
                  <Cpu className="h-4 w-4" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
                  Systems Focus &amp; Core Passions
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#38BDF8]">HPC + Theory</span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
                  // Focus: Systems-Level Machine Learning
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  {ABOUT_JOURNEY.focus}
                </p>
              </div>

              <div className="pt-2 border-t border-[#27272A]/60">
                <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  // Passion: Distributed Scale &amp; GATE Preparation
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                  {ABOUT_JOURNEY.passion}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#27272A]/70 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#71717A]">
            <span className="text-white font-medium">Core Targets:</span>
            <span className="rounded bg-[#18181b] border border-[#27272A] px-2 py-0.5 text-emerald-400">
              GATE Data Science &amp; AI (DA)
            </span>
            <span className="rounded bg-[#18181b] border border-[#27272A] px-2 py-0.5 text-[#38BDF8]">
              GATE Computer Science (CS)
            </span>
          </div>
        </SpotlightCard>
      </div>

      {/* 3. INTERACTIVE TIMELINE & MILESTONE CARDS */}
      <div className="mt-12">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#71717A] mb-6">
          <Calendar className="h-4 w-4 text-[#38BDF8]" />
          <span>Interactive Milestones &amp; Evolution</span>
        </div>

        <div className="space-y-6">
          {ABOUT_JOURNEY.milestones.map((milestone, idx) => {
            const isActive = activeMilestoneIndex === idx;
            return (
              <SpotlightCard
                key={idx}
                className={`p-6 sm:p-8 border transition-all duration-300 ${
                  isActive
                    ? "border-[#38BDF8]/40 bg-[#111115]/95 shadow-xl shadow-black/80"
                    : "border-[#27272A] bg-[#111115]/80 hover:border-[#38BDF8]/30"
                }`}
                onClick={() => setActiveMilestoneIndex(idx)}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    {/* Milestone Top Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-[#27272A] bg-[#09090b] px-3 py-1 font-mono text-xs font-bold text-[#FAFAFA]">
                        {milestone.period}
                      </span>

                      <Badge
                        variant={
                          milestone.status === "Active Focus"
                            ? "cyan"
                            : milestone.status === "Completed"
                            ? "emerald"
                            : "default"
                        }
                        size="sm"
                      >
                        {milestone.tag}
                      </Badge>
                    </div>

                    {/* Milestone Title */}
                    <h3 className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-[#FAFAFA]">
                      {milestone.title}
                    </h3>

                    {/* Milestone Engineering Bullets */}
                    <div className="mt-4 space-y-2.5">
                      {milestone.bullets.map((bullet, bIdx) => (
                        <div
                          key={bIdx}
                          className="flex items-start gap-2.5 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>

                    {/* Milestone Action Links */}
                    {milestone.links && milestone.links.length > 0 && (
                      <div className="mt-5 flex flex-wrap items-center gap-2 pt-2 border-t border-[#27272A]/60">
                        {milestone.links.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#27272A] bg-[#18181b] px-3 py-1 font-mono text-xs text-[#FAFAFA] transition-colors hover:border-[#38BDF8]/50 hover:text-[#38BDF8]"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="h-3 w-3 text-[#71717A]" />
                          </a>
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
