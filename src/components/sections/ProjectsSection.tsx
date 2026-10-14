"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
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

  return (
    <section id="projects" className="relative py-20 sm:py-28">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#AD6A4C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C]" />
          <span>03 // FEATURED WORK</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#DEC1B4] sm:text-4xl">
              Machine Learning &amp; Systems Projects
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[rgba(222,193,180,0.65)]">
              Distributed inference engines, adaptive signal processing, and production-grade algorithmic pipelines with measurable benchmarks.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-[rgba(206,164,145,0.14)] bg-[#0A0807] p-1 backdrop-blur-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                data-cursor="link"
                className={`rounded-lg px-3 py-1 text-xs font-mono transition-colors ${
                  activeFilter === cat
                    ? "bg-[#14100D] text-[#DEC1B4] border border-[rgba(173,106,76,0.35)] shadow-sm"
                    : "text-[rgba(222,193,180,0.55)] hover:text-[#DEC1B4]"
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
              className="group flex flex-col justify-between border-[rgba(206,164,145,0.14)] bg-[#0A0807] p-6 sm:p-7 transition-all duration-300 hover:border-[rgba(173,106,76,0.55)] hover:shadow-[0_8px_30px_rgba(173,106,76,0.08)]"
            >
              <div>
                {/* TOP: Category Pill & Status */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <Badge variant="accent">
                    {project.category}
                  </Badge>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-[rgba(222,193,180,0.55)]">
                    <span>{project.year}</span>
                    <span>•</span>
                    <span className="text-[#AD6A4C]">{project.status}</span>
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
                    className="group/link flex items-center gap-1.5 text-xl sm:text-2xl font-bold tracking-tight text-[#DEC1B4] transition-colors hover:text-[#AD6A4C]"
                  >
                    <span>{project.title}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-[rgba(222,193,180,0.55)] transition-transform group-hover/link:text-[#AD6A4C] group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>

                {/* Tagline */}
                <p className="mt-1 font-mono text-xs text-[#AD6A4C]">
                  {project.tagline}
                </p>

                {/* PROBLEM STATEMENT & SOLUTION: Concise Engineering Bullet Points */}
                <div className="mt-4 space-y-2">
                  {project.highlights.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-[#EEDED7] leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#AD6A4C]" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>

                {/* KEY METRICS HUD STRIP */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {project.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-[rgba(206,164,145,0.14)] bg-[#14100D] p-2 text-center"
                    >
                      <div className="font-mono text-[9px] text-[rgba(222,193,180,0.55)] uppercase truncate">
                        {metric.label}
                      </div>
                      <div className="mt-0.5 font-mono text-xs font-bold text-[#DEC1B4] truncate">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD FOOTER: Tech Stack Pills & Action Links */}
              <div className="mt-6 border-t border-[rgba(206,164,145,0.14)] pt-4 flex flex-col gap-4">
                {/* Itemized Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      data-cursor="link"
                      className="rounded-md border border-[rgba(206,164,145,0.18)] bg-[#120E0B] px-2 py-0.5 font-mono text-[10px] text-[#DEC1B4] transition-colors hover:border-[#AD6A4C] hover:text-[#EEDED7]"
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
                    className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-[#DEC1B4] transition-colors hover:text-[#AD6A4C] hover:underline cursor-pointer"
                  >
                    <span>Blueprint &amp; Architecture</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#AD6A4C]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <a
                      href={project.demoUrl || "#lab"}
                      data-cursor="magnetic"
                      className="inline-flex items-center gap-1 rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#120E0B] px-3 py-1.5 font-mono text-xs text-[#DEC1B4] transition-all hover:border-[#AD6A4C] hover:text-[#AD6A4C]"
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="h-3 w-3 text-[rgba(222,193,180,0.55)]" />
                    </a>

                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="magnetic"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#120E0B] px-3 py-1.5 font-mono text-xs font-semibold text-[#DEC1B4] transition-all hover:border-[#AD6A4C] hover:text-[#AD6A4C]"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                      <span>GitHub Repo</span>
                      <ArrowUpRight className="h-3 w-3 text-[rgba(222,193,180,0.55)]" />
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
