"use client";

import React, { useState } from "react";
import { BookOpen, ArrowUpRight, X, Clock, Calendar, Tag } from "lucide-react";
import { RESEARCH_ARTICLES, ResearchArticle } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";

export function ResearchSection() {
  const [selectedArticle, setSelectedArticle] = useState<ResearchArticle | null>(null);

  return (
    <section id="research" className="relative py-20 sm:py-28">
      {/* Section Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#38BDF8]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
          <span>Research Logs & Technical Notes</span>
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
              Engineering Notes & Analysis
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[#A1A1AA]">
              Deep dives on spatial-temporal neural networks, video inference optimization, and empirical MLOps practices.
            </p>
          </div>
        </div>
      </div>

      {/* Articles Editorial Row List */}
      <div className="mt-8 space-y-4">
        {RESEARCH_ARTICLES.map((article) => (
          <SpotlightCard
            key={article.id}
            className="group cursor-pointer p-6 transition-all hover:border-[#38BDF8]/40"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717A]">
                  <span className="font-mono">{article.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                  <span>•</span>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-[#18181b] border border-[#27272A] px-1.5 py-0.2 font-mono text-[10px] text-[#A1A1AA]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & Abstract */}
                <h3 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-[#FAFAFA] group-hover:text-[#38BDF8] transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#A1A1AA]">
                  {article.abstract}
                </p>
              </div>

              {/* Read button link */}
              <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                <span className="hidden sm:inline text-xs font-mono text-[#71717A] group-hover:text-[#38BDF8]">
                  Read Note
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272A] bg-[#18181b] text-[#A1A1AA] transition-transform group-hover:scale-110 group-hover:text-[#FAFAFA] group-hover:border-[#38BDF8]/40">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#27272A] bg-[#111115] p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-5 top-5 rounded-lg border border-[#27272A] bg-[#18181b] p-1.5 text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 text-xs font-mono text-[#71717A]">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#FAFAFA]">
              {selectedArticle.title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedArticle.tags.map((t) => (
                <Badge key={t} variant="cyan" size="sm">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-6 border-t border-[#27272A] pt-6 font-mono text-xs sm:text-sm text-[#A1A1AA] leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </div>

            <div className="mt-8 border-t border-[#27272A] pt-4 flex justify-between items-center text-xs text-[#71717A]">
              <span>KRUSHNA // RESEARCH ARCHIVE</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-lg border border-[#27272A] px-3 py-1 text-[#FAFAFA] hover:bg-[#18181b]"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
