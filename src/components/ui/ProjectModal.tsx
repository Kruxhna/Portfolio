"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Activity, CheckCircle2, Layers } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { Project } from "@/data/portfolioData";
import { Badge } from "@/components/ui/Badge";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[rgba(206,164,145,0.18)] bg-[#0A0807] p-6 sm:p-8 shadow-2xl shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#120E0B] p-1.5 text-[#DEC1B4] transition-colors hover:border-[#AD6A4C] hover:text-[#AD6A4C] cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Details */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant="accent">{project.category}</Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            {project.year}
          </Badge>
          <Badge
            variant={project.status === "In Active Research" ? "accent" : "default"}
            className="text-[11px]"
          >
            {project.status}
          </Badge>
        </div>

        <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#DEC1B4]">
          {project.title}
        </h2>
        <p className="mt-1 text-sm sm:text-base font-medium text-[#AD6A4C]">
          {project.tagline}
        </p>

        {/* Summary */}
        <p className="mt-4 text-sm leading-relaxed text-[#EEDED7]">
          {project.summary}
        </p>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[rgba(206,164,145,0.14)] bg-[#14100D] p-3"
            >
              <div className="font-mono text-[10px] uppercase text-[rgba(222,193,180,0.55)]">
                {m.label}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-[#DEC1B4]">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Blueprint */}
        <div className="mt-6 rounded-xl border border-[rgba(206,164,145,0.14)] bg-[#070504] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#AD6A4C] uppercase tracking-wider mb-3">
            <Layers className="h-4 w-4" />
            <span>Architecture & Data Flow</span>
          </div>
          <div className="space-y-2">
            {project.architecture.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#EEDED7]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#14100D] border border-[rgba(206,164,145,0.14)] font-mono text-[11px] text-[#AD6A4C]">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Engineering Highlights */}
        <div className="mt-6">
          <div className="text-xs font-mono text-[rgba(222,193,180,0.55)] uppercase tracking-wider mb-3">
            Engineering Highlights
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#EEDED7]">
            {project.highlights.map((h, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#AD6A4C]" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stack Tags */}
        <div className="mt-6">
          <div className="text-xs font-mono text-[rgba(222,193,180,0.55)] uppercase tracking-wider mb-2">
            Technologies & Frameworks
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="mono" size="sm">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[rgba(206,164,145,0.14)] pt-5">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-[rgba(206,164,145,0.18)] bg-[#120E0B] px-4 py-2 text-xs sm:text-sm font-medium text-[#DEC1B4] transition-colors hover:border-[#AD6A4C] hover:text-[#AD6A4C]"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Source Repository</span>
              <ExternalLink className="h-3.5 w-3.5 text-[rgba(222,193,180,0.55)]" />
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-[rgba(173,106,76,0.4)] bg-[rgba(173,106,76,0.15)] px-4 py-2 text-xs sm:text-sm font-medium text-[#AD6A4C] transition-colors hover:bg-[rgba(173,106,76,0.25)]"
            >
              <Activity className="h-4 w-4" />
              <span>Inspect in Lab Playground</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
