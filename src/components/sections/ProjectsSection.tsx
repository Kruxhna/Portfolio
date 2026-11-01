"use client";

import React, { useState } from "react";
import {
  AeroMeshTwoTierSandbox,
  GlassboxTwoTierSandbox,
  GateLearnStackedDeckSandbox,
} from "@/components/ui/ProjectMicroSandboxes";
import { ExternalLinkPill } from "@/components/ui/ExternalLinkPill";

type CategoryFilter =
  | "all"
  | "distributed llm"
  | "forensics"
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
  githubUrl: string;
}

export function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const filterTabs: { id: CategoryFilter; label: string }[] = [
    { id: "all", label: "[ all ]" },
    { id: "distributed llm", label: "[ distributed llm ]" },
    { id: "forensics", label: "[ forensics & security ]" },
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
      githubUrl: "https://github.com/Kruxhna/AeroMESH",
    },
    {
      id: "glassbox",
      num: "02",
      categoryTag: "DIGITAL FORENSICS & SECURITY · 2026",
      categoryFilter: "forensics",
      title: "Project Glassbox",
      subtitle: "Python forensic triage engine to parse, filter, and score evidence leads from multi-gigabyte UFDR mobile dumps.",
      problem:
        "Digital forensics investigators drown in 50GB+ Cellebrite UFDR mobile extractions; manual artifact extraction across thousands of SQLite databases, chat timelines, and deleted WAL files takes days and risks evidence contamination.",
      fix:
        "Engineered an automated Python forensic triage pipeline that ingests UFDR archives, parses fragmented SQLite/PList schemas, correlates spatiotemporal timeline artifacts, and scores suspicious evidence leads using deterministic regex & heuristic anomaly detection.",
      stats: [
        { value: "50GB+", label: "dump capacity" },
        { value: "<4.2m", label: "triage latency" },
        { value: "UFDR", label: "parser schema" },
        { value: "100%", label: "chain of custody" },
      ],
      stack: ["Python", "SQLite", "UFDR", "Forensics", "FastAPI", "Pandas"],
      githubUrl: "https://github.com/Kruxhna/glassbox",
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
      githubUrl: "https://github.com/Kruxhna/gate-learn-mobile",
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
      case "glassbox":
        return <GlassboxTwoTierSandbox />;
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
          <h2 className="text-7xl sm:text-8xl md:text-[9rem] font-black tracking-tighter leading-none text-[#F5EEF0] mb-6 sm:mb-8 select-none lowercase">
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
                      ? "text-[#9E0B2E] font-bold"
                      : "text-[#A68E94] hover:text-[#F5EEF0]"
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
              className="pt-10 pb-16 border-t border-[#A68E94]/20 first:border-t-0 first:pt-4"
            >
              {/* 12-Column Asymmetrical Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* ── Left Column (lg:col-span-5): Narrative, Stats, Tech, Pills ── */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                  <div>
                    {/* Meta Bar inside Left Column (Aligned Horizontally with Right Window Top) */}
                    <div className="flex items-center justify-between text-xs font-mono mb-4">
                      <span className="text-xs font-mono text-[#C93B5B] font-bold">
                        {project.num}
                      </span>
                      <span className="text-xs font-mono uppercase tracking-widest text-[#A68E94]">
                        {project.categoryTag}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="text-4xl sm:text-5xl md:text-6xl font-sans font-medium tracking-[-0.035em] leading-[1.12] text-[#F5EEF0]">
                      {project.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-base sm:text-lg text-[#A68E94] font-normal mt-3 leading-snug">
                      {project.subtitle}
                    </p>

                    {/* THE PROBLEM Block */}
                    <div className="mt-8">
                      <div className="text-[11px] font-mono uppercase tracking-widest text-[#A68E94] mb-2 font-semibold">
                        THE PROBLEM
                      </div>
                      <p className="text-sm sm:text-[15px] text-[#F5EEF0]/90 leading-relaxed font-sans">
                        {project.problem}
                      </p>
                    </div>

                    {/* the fix ↓ Block */}
                    <div className="mt-6">
                      <div className="text-xs font-mono text-[#C93B5B] mb-2 font-semibold">
                        the fix ↓
                      </div>
                      <p className="text-sm sm:text-[15px] text-[#F5EEF0] leading-relaxed font-sans">
                        {project.fix}
                      </p>
                    </div>

                    {/* Framed 4-Column Stat Strip */}
                    <div className="grid grid-cols-4 gap-4 py-5 my-8 border-y border-[#A68E94]/20">
                      {project.stats.map((s, idx) => (
                        <div key={idx}>
                          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5EEF0] font-mono leading-none">
                            {s.value}
                          </div>
                          <div className="text-[11px] font-mono text-[#C93B5B] mt-1.5 lowercase leading-tight">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Borderless Inline Monospace Tech Stack */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-mono text-[#A68E94] mb-8">
                      {project.stack.map((tech) => (
                        <span key={tech}>{tech}</span>
                      ))}
                    </div>

                    {/* Capsule Pill Action Row: Only GitHub Link */}
                    <div className="flex flex-wrap items-center gap-3">
                      <ExternalLinkPill
                        href={project.githubUrl}
                        variant="primary"
                        size="sm"
                        data-cursor="view"
                        data-cursor-label="*open ↗*"
                      >
                        GitHub
                      </ExternalLinkPill>
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
      </div>
    </section>
  );
}

export default ProjectsSection;
