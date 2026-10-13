"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Check, ArrowUp, ArrowUpRight, Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon, CodolioIcon } from "@/components/ui/Icons";
import { PERSONAL_INFO } from "@/data/portfolioData";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeString, setTimeString] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTimeString(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2200);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-20 border-t border-[#27272A]/80 bg-[#09090b] py-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-[#111115]/95 px-4 py-3 text-xs font-mono text-[#FAFAFA] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <Check className="h-4 w-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Top Tier: Brand, Navigation, and Quick Contact Actions */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 pb-12">
          {/* Brand & Identity Column */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Glowing Monogram Logo Anchor */}
              <button
                onClick={scrollToTop}
                title="Scroll to top"
                data-cursor="magnetic"
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#27272A] bg-[#141418] font-mono text-sm font-bold text-[#FAFAFA] transition-all hover:border-[#38BDF8]/60 hover:shadow-lg hover:shadow-[#38BDF8]/20"
              >
                <span>K</span>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-[#09090b]" />
              </button>

              <div>
                <span className="font-bold text-base tracking-tight text-[#FAFAFA]">
                  {PERSONAL_INFO.name}
                </span>
                <span className="ml-2 font-mono text-[11px] text-[#71717A]">
                  // AI & ML
                </span>
              </div>
            </div>

            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#A1A1AA]">
              Systems-level machine learning and high-performance computing undergraduate at the University of Mumbai (2024–2028). Specializing in distributed inference, CUDA, and algorithmic rigor.
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-[#71717A]">
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#10B981] font-medium">Open to AI/ML Roles & Internships</span>
            </div>
          </div>

          {/* Monospace Navigation Column */}
          <div className="md:col-span-3 flex flex-col gap-3 font-mono">
            <span className="text-xs uppercase tracking-wider text-[#71717A]">
              Navigation
            </span>
            <div className="flex flex-col gap-2 text-xs text-[#A1A1AA]">
              <Link href="#about" data-cursor="magnetic" className="hover:text-[#FAFAFA] transition-colors">
                01. About
              </Link>
              <Link href="#stats" data-cursor="magnetic" className="hover:text-[#FAFAFA] transition-colors">
                02. DSA / Stats
              </Link>
              <Link href="#projects" data-cursor="magnetic" className="hover:text-[#FAFAFA] transition-colors">
                03. AI Projects
              </Link>
              <Link href="#arsenal" data-cursor="magnetic" className="hover:text-[#FAFAFA] transition-colors">
                04. Arsenal
              </Link>
              <Link href="#contact" data-cursor="magnetic" className="hover:text-[#FAFAFA] transition-colors">
                05. Contact
              </Link>
            </div>
          </div>

          {/* Contact Actions Column */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#71717A]">
              Direct Contact
            </span>

            {/* "Copy Email" Action Button */}
            <button
              onClick={handleCopyEmail}
              data-cursor="magnetic"
              className="group flex items-center justify-between rounded-xl border border-[#27272A] bg-[#141418] px-3.5 py-2.5 text-xs font-mono text-[#A1A1AA] transition-all hover:border-[#10B981]/50 hover:bg-[#18181b] hover:text-[#FAFAFA]"
            >
              <span className="truncate">{PERSONAL_INFO.email}</span>
              <div className="flex shrink-0 items-center gap-1.5 ml-2">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#10B981]" />
                    <span className="text-[11px] text-[#10B981] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#71717A] group-hover:text-[#10B981]" />
                    <span className="text-[11px] text-[#71717A] group-hover:text-[#FAFAFA]">Copy</span>
                  </>
                )}
              </div>
            </button>

            {/* Direct Links Strip (LinkedIn, GitHub, Codolio) */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
              <a
                href="https://www.linkedin.com/in/krushna-nole/"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnetic"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#27272A] bg-[#141418] py-2 text-[#A1A1AA] transition-all hover:border-[#0A66C2]/60 hover:text-[#FAFAFA] hover:bg-[#18181b]"
                title="LinkedIn Profile"
              >
                <LinkedinIcon className="h-3.5 w-3.5 text-[#0A66C2]" />
                <span className="text-[11px]">LinkedIn</span>
              </a>

              <a
                href="https://github.com/Kruxhna"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnetic"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#27272A] bg-[#141418] py-2 text-[#A1A1AA] transition-all hover:border-[#38BDF8]/60 hover:text-[#FAFAFA] hover:bg-[#18181b]"
                title="GitHub Profile"
              >
                <GithubIcon className="h-3.5 w-3.5 text-[#38BDF8]" />
                <span className="text-[11px]">GitHub</span>
              </a>

              <a
                href="https://codolio.com/profile/Kruxhna/problemSolving"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnetic"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#27272A] bg-[#141418] py-2 text-[#A1A1AA] transition-all hover:border-[#F59E0B]/60 hover:text-[#FAFAFA] hover:bg-[#18181b]"
                title="Codolio DSA Profile"
              >
                <CodolioIcon className="h-3.5 w-3.5 text-[#F59E0B]" />
                <span className="text-[11px]">Codolio</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Colophon & Live Local Time Indicator */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#27272A]/60 pt-8 sm:flex-row text-xs font-mono text-[#71717A]">
          {/* Left: Exact Copyright & Attribution */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <p className="text-[#A1A1AA]">
              © 2025 KRUSHNA. Designed with precision.
            </p>
          </div>

          {/* Right: Live Local Time Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#27272A] bg-[#141418] px-3.5 py-1 text-[#A1A1AA]">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>
                {timeString ? `${timeString} ` : ""}IST (UTC +5:30) • Available for opportunities
              </span>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              data-cursor="magnetic"
              className="flex items-center gap-1 rounded-lg border border-[#27272A] bg-[#141418] px-2.5 py-1 text-[11px] text-[#71717A] hover:border-[#38BDF8]/40 hover:text-[#FAFAFA] transition-colors"
              title="Back to top"
            >
              <span>Top</span>
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
