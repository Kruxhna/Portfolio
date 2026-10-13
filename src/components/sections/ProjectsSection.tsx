"use client";

import React, { useState } from "react";
import { ArrowUpRight, ExternalLink, CheckCircle2, Layers, Cpu } from "lucide-react";
import { PROJECTS, Project } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { ProjectVisual } from "@/components/ui/ProjectVisuals";
import { GithubIcon } from "@/components/ui/Icons";

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const categories = [
    "All",
    "Distributed LLM Systems",
    "Signal Processing & AI",
    "MLOps & Classical ML",
    "Full-Stack & Mobile",
  ];

  const filteredProjects =
    activeFilter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeFilter);

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case "Distributed LLM Systems":
        return "cyan";
      case "Signal Processing & AI":
        return "emerald";
      case "MLOps & Classical ML":
        return "default";
      case "Full-Stack & Mobile":
        return "indigo";
      default:
        return "default";
    }
  };

  return (
    <section id="projects" className="relative py-20 sm:py-28">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
          <span>03 // FEATURED WORK</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
              Machine Learning &amp; Systems Projects
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[#A1A1AA]">
              Distributed inference engines, adaptive signal processing, and production-grade algorithmic pipelines with measurable benchmarks.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-[#27272A] bg-[#111115]/60 p-1 backdrop-blur-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                data-cursor="link"
                className={`rounded-lg px-3 py-1 text-xs font-mono transition-colors ${
                  activeFilter === cat
                    ? "bg-[#18181b] text-[#FAFAFA] border border-[#27272A] shadow-sm"
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. PROJECTS GRID */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredProjects.map((project) => {
          return (
            <SpotlightCard
              key={project.id}
              className="group flex flex-col justify-between border-[#27272A] bg-[#111115]/85 p-6 sm:p-7 transition-all duration-300 hover:border-[#38BDF8]/40"
            >
              <div>
                {/* TOP: Category Pill & Status */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge variant={getCategoryBadgeVariant(project.category)}>
                    {project.category}
                  </Badge>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-[#71717A]">
                    <span>{project.year}</span>
                    <span>•</span>
                    <span className="text-[#38BDF8]">{project.status}</span>
                  </div>
                </div>

                {/* THUMBNAIL / INTERACTIVE VISUAL */}
                <div
                  className="mb-5 cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                  data-cursor="view"
                  data-cursor-label="view ↗"
                >
                  <ProjectVisual type={project.visualType} />
                </div>

                {/* TITLE WITH EXTERNAL INDICATOR */}
                <div className="flex items-start justify-between gap-3">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="magnetic"
                    className="group/link flex items-center gap-1.5 text-xl sm:text-2xl font-bold tracking-tight text-[#FAFAFA] transition-colors hover:text-[#38BDF8]"
                  >
                    <span>{project.title}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[#71717A] transition-transform group-hover/link:text-[#38BDF8] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>

                {/* Tagline */}
                <p className="mt-1 font-mono text-xs text-[#38BDF8]">
                  {project.tagline}
                </p>

                {/* PROBLEM STATEMENT & SOLUTION: Concise Engineering Bullet Points */}
                <div className="mt-4 space-y-2">
                  {project.highlights.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[#A1A1AA] leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#38BDF8]/80" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* KEY METRICS HUD STRIP */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {project.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[#27272A]/70 bg-[#09090b]/60 p-2 text-center"
                    >
                      <div className="font-mono text-[9px] text-[#71717A] uppercase truncate">
                        {metric.label}
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-bold text-[#FAFAFA] truncate">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD FOOTER: Tech Stack Pills & Action Links */}
              <div className="mt-6 border-t border-[#27272A]/70 pt-4 flex flex-col gap-4">
                {/* Itemized Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      data-cursor="link"
                      className="rounded-md border border-[#27272A] bg-[#18181b] px-2 py-0.5 font-mono text-[10px] text-[#A1A1AA] transition-colors hover:border-[#38BDF8]/30 hover:text-white"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Actions: Live Demo ↗ and GitHub Repo ↗ */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setSelectedProject(project)}
                    data-cursor="magnetic"
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#38BDF8] transition-colors hover:text-white hover:underline"
                  >
                    <span>Blueprint &amp; Architecture</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={project.demoUrl || "#lab"}
                      data-cursor="magnetic"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#27272A] bg-[#18181b] px-3 py-1.5 font-mono text-xs text-[#A1A1AA] transition-all hover:border-[#38BDF8]/40 hover:text-white"
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="h-3 w-3 text-[#71717A]" />
                    </a>

                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="magnetic"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#27272A] bg-[#18181b] px-3 py-1.5 font-mono text-xs font-semibold text-[#FAFAFA] transition-all hover:border-[#38BDF8]/50 hover:bg-[#18181b]/80"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub Repo</span>
                      <ArrowUpRight className="h-3 w-3 text-[#71717A]" />
                    </a>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>

      {/* Detailed Technical Blueprint Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
