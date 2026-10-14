"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  AeroMeshTwoTierSandbox,
  SmartScanTwoTierSandbox,
  GateLearnStackedDeckSandbox,
} from "@/components/ui/ProjectMicroSandboxes";

type CategoryFilter =
  | "all"
  | "distributed llm"
  | "signal processing"
  | "full-stack";

interface ProjectEditorialItem {
  id: string;
  num: string;
  categoryTag: string;
  categoryFilter: CategoryFilter;
  title: string;
  subtitle: string;
  problem: string;
  fix: string;
  stats: { value: string; label: string }[];
  stack: string[];
  primaryPill: { label: string; href: string };
  secondaryPills: { label: string; href: string }[];
}

export function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const filterTabs: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "[ all ]" },
    { id: "distributed llm", label: "[ distributed llm ]" },
    { id: "signal processing", label: "[ signal processing ]" },
    { id: "full-stack", label: "[ full-stack ]" },
  ];

  const projects: ProjectEditorialItem[] = [
    {
      id: "aeromesh",
      num: "01",
      categoryTag: "DISTRIBUTED LLM SYSTEMS · 2026",
      categoryFilter: "distributed llm",
      title: "AeroMESH",
      subtitle: "Run 30B–70B parameter LLMs across consumer GPUs over local RPC sockets.",
      problem:
        "Running 30B–70B parameter models locally hits a hard VRAM wall on single consumer GPUs, and standard TCP socket serialization chokes token generation across nodes.",
      fix:
        "AeroMESH splits GGUF model layers across local GPUs (RTX 4070 + RTX 3060) via C++/Rust RPC daemons and Tailscale routing, using zero-copy shared-memory ring buffers and dynamic CUDA quantization.",
      stats: [
        { value: "<1.8ms", label: "ipc overhead" },
        { value: "Q4_K_M", label: "quantization" },
        { value: "48%", label: "vram saved / node" },
        { value: "v0.4.0", label: "latest release" },
      ],
      stack: ["C++", "CUDA", "llama.cpp", "GGUF", "RPC Sockets", "Tailscale"],
      primaryPill: {
        label: "aeromesh.kruxhna.dev",
        href: "https://github.com/Kruxhna/AeroMESH",
      },
      secondaryPills: [
        {
          label: "download rpc-server.exe",
          href: "https://github.com/Kruxhna/AeroMESH/releases",
        },
        {
          label: "source",
          href: "https://github.com/Kruxhna/AeroMESH",
        },
      ],
    },
    {
      id: "smart-scan-ew",
      num: "02",
      categoryTag: "SIGNAL PROCESSING & AI · 2026",
      categoryFilter: "signal processing",
      title: "Smart Scan EW",
      subtitle: "Adaptive RF radar spectrum intercept and priority dwell scheduling.",
      problem:
        "Sequential radar receivers spend too long sweeping quiet frequency bands and miss agile frequency-hopping emitters in dense electronic warfare environments.",
      fix:
        "Combines heuristic search with priority-queue dwell scheduling to lock receiver time onto high-density emitter bands, backed by synthetic RF pulse generators and 2048-bin FFT clustering.",
      stats: [
        { value: "98.4%", label: "intercept prob." },
        { value: "-42%", label: "dwell latency" },
        { value: "2048", label: "fft channels" },
        { value: "SIH26", label: "drdo problem id" },
      ],
      stack: ["Python", "PyTorch", "NumPy", "SciPy", "FastAPI", "Docker"],
      primaryPill: {
        label: "nirikshan.kruxhna.dev",
        href: "https://github.com/Kruxhna/smart-scan-ew",
      },
      secondaryPills: [
        {
          label: "source",
          href: "https://github.com/Kruxhna/smart-scan-ew",
        },
      ],
    },
    {
      id: "gate-learn",
      num: "03",
      categoryTag: "FULL-STACK & MOBILE · 2026",
      categoryFilter: "full-stack",
      title: "Adaptive GATE Engine",
      subtitle: "Spaced-repetition CS & DA theory engine with an offline-first mobile client.",
      problem:
        "Generic flashcard apps treat algorithmic recurrences and Theory of Computation proofs the same as vocabulary words, and lose state when offline.",
      fix:
        "Pairs a customized SM-2 spaced-repetition dispatch engine for GATE CS & DA with an offline-first React Native client, local SQLite sync (< 24ms delta), and a FastAPI analytics backend.",
      stats: [
        { value: "SM-2", label: "repetition alg." },
        { value: "<24ms", label: "sqlite sync delta" },
        { value: "2", label: "gate papers (cs/da)" },
        { value: "100%", label: "offline capable" },
      ],
      stack: ["React Native", "TypeScript", "Tailwind CSS", "FastAPI", "SQLite", "Figma"],
      primaryPill: {
        label: "gate.kruxhna.dev",
        href: "https://github.com/Kruxhna/gate-learn-mobile",
      },
      secondaryPills: [
        {
          label: "source",
          href: "https://github.com/Kruxhna/gate-learn-mobile",
        },
      ],
    },
  ];

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === "all") return true;
    return p.categoryFilter === activeFilter;
  });

  const renderSandbox = (id: string) => {
    switch (id) {
      case "aeromesh":
        return <AeroMeshTwoTierSandbox />;
      case "smart-scan-ew":
        return <SmartScanTwoTierSandbox />;
      case "gate-learn":
        return <GateLearnStackedDeckSandbox />;
      default:
        return null;
    }
  };

  return (
    <section
      id="work"
      className="relative z-10 w-full bg-transparent py-12 sm:py-16 md:py-20"
    >
      {/* Anchor for backward-compatible #projects navigation */}
      <span id="projects" className="absolute -top-28 pointer-events-none" />

      {/* Full-width Container Matching Navbar Alignment (max-w-[1720px]) */}
      <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-12">
        {/* 1. GIANT SECTION HEADER (Exact Egorz.com Title "i made") */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-7xl sm:text-8xl md:text-[9rem] font-black tracking-tighter leading-none text-[#FDFCFB] mb-6 sm:mb-8 select-none lowercase">
            i made
          </h2>

          {/* Minimal Monospace Category Filter Strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 font-mono text-xs uppercase tracking-wider">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  data-cursor="magnetic"
                  className={`transition-colors cursor-pointer ${
                    isActive
                      ? "text-[#AD6A4C] font-bold"
                      : "text-[#CEA491]/60 hover:text-[#EEDED7]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. FULL-WIDTH EDITORIAL PROJECT ROWS */}
        <div>
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="pt-10 pb-16 border-t border-[#CEA491]/18 first:border-t-0 first:pt-4"
            >
              {/* 12-Column Asymmetrical Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* ── Left Column (lg:col-span-5): Narrative, Stats, Tech, Pills ── */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    {/* Meta Bar inside Left Column (Aligned Horizontally with Right Window Top) */}
                    <div className="flex items-center justify-between text-xs font-mono mb-4">
                      <span className="text-xs font-mono text-[#AD6A4C] font-bold">
                        {project.num}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-widest text-[#CEA491]/60">
                        {project.categoryTag}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#FDFCFB] leading-[1.02]">
                      {project.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-[#DEC1B4] font-normal mt-3 leading-snug">
                      {project.subtitle}
                    </p>

                    {/* THE PROBLEM Block */}
                    <div className="mt-8">
                      <div className="text-[11px] font-mono uppercase tracking-widest text-[#CEA491]/50 mb-2">
                        THE PROBLEM
                      </div>
                      <p className="text-sm sm:text-[15px] text-[#DEC1B4]/80 leading-relaxed font-sans">
                        {project.problem}
                      </p>
                    </div>

                    {/* the fix ↓ Block */}
                    <div className="mt-6">
                      <div className="text-xs font-mono text-[#AD6A4C] mb-2 font-semibold">
                        the fix ↓
                      </div>
                      <p className="text-sm sm:text-[15px] text-[#EEDED7]/90 leading-relaxed font-sans">
                        {project.fix}
                      </p>
                    </div>

                    {/* Framed 4-Column Stat Strip (Exact Video Layout: Number on Top, Label Below) */}
                    <div className="grid grid-cols-4 gap-4 py-5 my-8 border-y border-[#CEA491]/18">
                      {project.stats.map((s, idx) => (
                        <div key={idx}>
                          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FDFCFB] font-mono leading-none">
                            {s.value}
                          </div>
                          <div className="text-[11px] font-mono text-[#CEA491]/55 mt-1.5 lowercase leading-tight">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Borderless Inline Monospace Tech Stack */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-mono text-[#CEA491]/65 mb-8">
                      {project.stack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>

                    {/* Capsule Pill Action Row + Floating *open ↗* Cursor Follower */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Primary Solid Capsule Pill */}
                      <a
                        href={project.primaryPill.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="view"
                        data-cursor-label="*open ↗*"
                        className="group rounded-full bg-[#AD6A4C] px-5 py-2.5 text-xs font-mono font-medium text-[#000000] inline-flex items-center gap-2 hover:bg-[#BF866D] transition-all cursor-pointer shadow-md shadow-[#AD6A4C]/20"
                      >
                        <span>{project.primaryPill.label}</span>
                        {/* Slot Machine Diagonal Arrow Animation */}
                        <span className="relative inline-block overflow-hidden h-3 w-3 shrink-0">
                          <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-full group-hover:-translate-y-full" />
                          <ArrowUpRight className="absolute inset-0 h-3 w-3 transition-transform duration-300 -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0" />
                        </span>
                      </a>

                      {/* Secondary Ghost Pills */}
                      {project.secondaryPills.map((pill, pIdx) => (
                        <a
                          key={pIdx}
                          href={pill.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="view"
                          data-cursor-label="*open ↗*"
                          className="group rounded-full bg-[#0A0807]/60 border border-[#CEA491]/22 px-5 py-2.5 text-xs font-mono text-[#EEDED7] inline-flex items-center gap-2 hover:border-[#AD6A4C]/60 hover:bg-[#AD6A4C]/10 transition-all cursor-pointer"
                        >
                          <span>{pill.label}</span>
                          {/* Slot Machine Diagonal Arrow Animation */}
                          <span className="relative inline-block overflow-hidden h-3 w-3 shrink-0">
                            <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-full group-hover:-translate-y-full text-[#DEC1B4]" />
                            <ArrowUpRight className="absolute inset-0 h-3 w-3 transition-transform duration-300 -translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 text-[#AD6A4C]" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Right Column (lg:col-span-7): Two-Tier Sandbox ── */}
                <div className="lg:col-span-7">
                  {renderSandbox(project.id)}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 3. "ALSO MADE" COMPACT ARCHIVE SECTION (Video 00:10–00:12) */}
        <div className="mt-16 pt-10 border-t border-[#CEA491]/18">
          <div className="text-xs font-mono uppercase tracking-widest text-[#CEA491]/55 mb-6">
            ALSO MADE
          </div>

          <div className="divide-y divide-[#CEA491]/18 border-b border-[#CEA491]/18">
            {/* Archive Row 1 */}
            <a
              href="https://github.com/Kruxhna"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              data-cursor-label="*open ↗*"
              className="group py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-[#AD6A4C]/[0.04] transition-colors px-2 rounded-lg cursor-pointer block"
            >
              <div className="md:col-span-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-[#FDFCFB] group-hover:text-[#AD6A4C] transition-colors">
                  Project Glassbox
                </span>
                <span className="relative inline-block overflow-hidden h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#AD6A4C]" />
                </span>
              </div>
              <div className="md:col-span-6 text-sm text-[#DEC1B4]/80 leading-relaxed font-sans">
                Python forensic triage engine to parse, filter, and score evidence leads from multi-gigabyte UFDR mobile dumps.
              </div>
              <div className="md:col-span-2 md:text-right font-mono text-xs uppercase tracking-wider text-[#CEA491]/60">
                FORENSIC ENGINE
              </div>
            </a>

            {/* Archive Row 2 */}
            <a
              href="https://github.com/Kruxhna"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              data-cursor-label="*open ↗*"
              className="group py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline hover:bg-[#AD6A4C]/[0.04] transition-colors px-2 rounded-lg cursor-pointer block"
            >
              <div className="md:col-span-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-[#FDFCFB] group-hover:text-[#AD6A4C] transition-colors">
                  Multi-Agent Research Suite
                </span>
                <span className="relative inline-block overflow-hidden h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#AD6A4C]" />
                </span>
              </div>
              <div className="md:col-span-6 text-sm text-[#DEC1B4]/80 leading-relaxed font-sans">
                Autonomous tool-calling agent workflows and evaluation harness built for the Google &amp; Kaggle 5-Day AI Agents Intensive.
              </div>
              <div className="md:col-span-2 md:text-right font-mono text-xs uppercase tracking-wider text-[#CEA491]/60">
                AGENTIC AI
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
