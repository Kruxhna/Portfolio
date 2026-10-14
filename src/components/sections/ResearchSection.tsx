"use client";

import React, { useState } from "react";
import { ArrowUpRight, X, Clock } from "lucide-react";
import { RESEARCH_ARTICLES, ResearchArticle } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";

export function ResearchSection() {
  const [selectedArticle, setSelectedArticle] = useState<ResearchArticle | null>(null);

  return (
    <section id="research" className="relative py-20 sm:py-28">
      {/* Section Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#AD6A4C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C]" />
          <span>Research Logs &amp; Technical Notes</span>
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#DEC1B4] sm:text-4xl">
              Engineering Notes &amp; Analysis
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[rgba(222,193,180,0.65)]">
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
            className="group cursor-pointer p-6 transition-all border-[rgba(206,164,145,0.14)] bg-[#0A0807] hover:border-[rgba(173,106,76,0.45)]"
            onClick={() => setSelectedArticle(article)}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[rgba(222,193,180,0.55)]">
                  <span className="font-mono">{article.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-[#AD6A4C]" />
                    {article.readTime}
                  </span>
                  <span>•</span>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-[#14100D] border border-[rgba(206,164,145,0.14)] px-1.5 py-0.5 font-mono text-[10px] text-[#DEC1B4]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Title & Abstract */}
                <h3 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-[#DEC1B4] group-hover:text-[#AD6A4C] transition-colors">
                  {article.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#EEDED7]">
                  {article.abstract}
                </p>
              </div>

              {/* Read button link */}
              <div className="flex shrink-0 items-center gap-2 self-start md:self-center">
                <span className="hidden sm:inline text-xs font-mono text-[rgba(222,193,180,0.55)] group-hover:text-[#AD6A4C]">
                  Read Note
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#14100D] text-[#DEC1B4] transition-transform group-hover:scale-110 group-hover:text-[#AD6A4C] group-hover:border-[#AD6A4C]">
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
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[rgba(206,164,145,0.18)] bg-[#0A0807] p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-5 top-5 rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#14100D] p-1.5 text-[#DEC1B4] transition-colors hover:text-[#AD6A4C] hover:border-[#AD6A4C] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 text-xs font-mono text-[rgba(222,193,180,0.55)]">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#DEC1B4]">
              {selectedArticle.title}
            </h2>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {selectedArticle.tags.map((t) => (
                <Badge key={t} variant="accent" size="sm">
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-6 border-t border-[rgba(206,164,145,0.14)] pt-6 font-mono text-xs sm:text-sm text-[#EEDED7] leading-relaxed whitespace-pre-line">
              {selectedArticle.content}
            </div>

            <div className="mt-8 border-t border-[rgba(206,164,145,0.14)] pt-4 flex justify-between items-center text-xs text-[rgba(222,193,180,0.55)]">
              <span>KRUSHNA // RESEARCH ARCHIVE</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#14100D] px-3 py-1 text-[#DEC1B4] hover:text-[#AD6A4C] hover:border-[#AD6A4C] cursor-pointer"
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
