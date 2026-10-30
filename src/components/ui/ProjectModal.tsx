"use client";

import React, { useEffect } from "react";
import { X, Activity, CheckCircle2, Layers } from "lucide-react";
import { GithubIcon } from "@/components/ui/Icons";
import { Project } from "@/data/portfolioData";
import { Badge } from "@/components/ui/Badge";
import { ExternalLinkPill } from "@/components/ui/ExternalLinkPill";

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
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[rgba(221,112,116,0.22)] bg-[#000000] p-6 sm:p-8 shadow-2xl shadow-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg border border-[#6D001A] bg-[#240009]/85 p-1.5 text-[#F5EEF0] transition-colors hover:border-[#9E0B2E] hover:bg-[#3B000E] hover:text-[#F5EEF0] cursor-pointer"
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

        <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-[#F5EEF0]">
          {project.title}
        </h2>
        <p className="mt-1 text-sm sm:text-base font-medium text-[#C93B5B]">
          {project.tagline}
        </p>

        {/* Summary */}
        <p className="mt-4 text-sm leading-relaxed text-[#F5EEF0]/85">
          {project.summary}
        </p>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {project.metrics.map((m, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#140408] p-3"
            >
              <div className="font-mono text-[10px] uppercase text-[#A68E94]">
                {m.label}
              </div>
              <div className="mt-1 font-mono text-lg font-bold text-[#F5EEF0]">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Blueprint */}
        <div className="mt-6 rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#000000] p-5">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C93B5B] uppercase tracking-wider mb-3">
            <Layers className="h-4 w-4" />
            <span>Architecture & Data Flow</span>
          </div>
          <div className="space-y-2">
            {project.architecture.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#F5EEF0]/85">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#140408] border border-[rgba(221,112,116,0.18)] font-mono text-[11px] text-[#C93B5B]">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Engineering Highlights */}
        <div className="mt-6">
          <div className="text-xs font-mono text-[#A68E94] uppercase tracking-wider mb-3">
            Engineering Highlights
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-[#F5EEF0]/85">
            {project.highlights.map((h, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C93B5B]" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stack Tags */}
        <div className="mt-6">
          <div className="text-xs font-mono text-[#A68E94] uppercase tracking-wider mb-2">
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
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[rgba(221,112,116,0.18)] pt-5">
          {project.githubUrl && (
            <ExternalLinkPill
              href={project.githubUrl}
              variant="secondary"
              size="sm"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Source Repository</span>
            </ExternalLinkPill>
          )}

          {project.demoUrl && (
            <ExternalLinkPill
              href={project.demoUrl}
              variant="primary"
              size="sm"
              onClick={onClose}
              showArrow={false}
            >
              <Activity className="h-4 w-4" />
              <span>Inspect in Lab Playground</span>
            </ExternalLinkPill>
          )}
        </div>
      </div>
    </div>
  );
}
