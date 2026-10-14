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
    <footer className="relative mt-20 border-t border-[rgba(221,112,116,0.18)] bg-transparent py-14">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#9A142C] bg-[#0A0807]/95 px-4 py-3 text-xs font-mono text-[#ECC3AB] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <span className="flex h-2 w-2 rounded-full bg-[#E02E32] animate-pulse" />
          <Check className="h-4 w-4 text-[#E46B5E]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
        {/* Top Tier: Brand, Navigation, and Quick Contact Actions */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 pb-12">
          {/* Brand & Identity Column */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {/* Monogram Logo Anchor */}
              <button
                onClick={scrollToTop}
                title="Scroll to top"
                data-cursor="magnetic"
                className="group relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#A11E3C] bg-[#5C0105] font-mono text-sm font-bold text-[#ECC3AB] transition-all hover:border-[#E44847]/80 hover:shadow-lg hover:shadow-[#C3181E]/20"
              >
                <span>K</span>
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#E02E32] ring-2 ring-black" />
              </button>

              <div>
                <span className="font-bold text-base tracking-tight text-[#ECC3AB]">
                  {PERSONAL_INFO.name}
                </span>
                <span className="ml-2 font-mono text-[11px] text-[#DD7074]">
                  // AI & ML
                </span>
              </div>
            </div>

            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#ECC3AB]/80">
              Systems-level machine learning and high-performance computing undergraduate at the University of Mumbai (2024–2028). Specializing in distributed inference, CUDA, and algorithmic rigor.
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs font-mono text-[#DD7074]">
              <span className="flex h-2 w-2 rounded-full bg-[#E02E32] animate-pulse" />
              <span className="text-[#E46B5E] font-medium">Open to AI/ML Roles & Internships</span>
            </div>
          </div>

          {/* Monospace Navigation Column */}
          <div className="md:col-span-3 flex flex-col gap-3 font-mono">
            <span className="text-xs uppercase tracking-wider text-[#DD7074]">
              Navigation
            </span>
            <div className="flex flex-col gap-2 text-xs text-[#E69683]">
              <Link href="#about" data-cursor="magnetic" className="hover:text-[#ECC3AB] transition-colors">
                01. About
              </Link>
              <Link href="#dsa" data-cursor="magnetic" className="hover:text-[#ECC3AB] transition-colors">
                02. DSA / Stats
              </Link>
              <Link href="#work" data-cursor="magnetic" className="hover:text-[#ECC3AB] transition-colors">
                03. AI Projects
              </Link>
              <Link href="#arsenal" data-cursor="magnetic" className="hover:text-[#ECC3AB] transition-colors">
                04. Arsenal
              </Link>
              <Link href="#contact" data-cursor="magnetic" className="hover:text-[#ECC3AB] transition-colors">
                05. Contact
              </Link>
            </div>
          </div>

          {/* Contact Actions Column */}
          <div className="md:col-span-4 flex flex-col gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[#DD7074]">
              Direct Contact
            </span>

            {/* "Copy Email" Action Button */}
            <button
              onClick={handleCopyEmail}
              data-cursor="magnetic"
              className="group flex items-center justify-between rounded-xl border border-[#9A142C] bg-[#4E0104]/85 px-3.5 py-2.5 text-xs font-mono text-[#ECC3AB] transition-all hover:bg-[#7B0408] hover:border-[#D94F67]"
            >
              <span className="truncate">{PERSONAL_INFO.email}</span>
              <div className="flex shrink-0 items-center gap-1.5 ml-2">
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#E46B5E]" />
                    <span className="text-[11px] text-[#E46B5E] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-[#DD7074] group-hover:text-[#ECC3AB]" />
                    <span className="text-[11px] text-[#DD7074] group-hover:text-[#ECC3AB]">Copy</span>
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
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#9A142C] bg-[#4E0104]/85 py-2 text-[#E8A791] transition-all hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67]"
                title="LinkedIn Profile"
              >
                <LinkedinIcon className="h-3.5 w-3.5 text-[#E46B5E]" />
                <span className="text-[11px]">LinkedIn</span>
              </a>

              <a
                href="https://github.com/Kruxhna"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnetic"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#9A142C] bg-[#4E0104]/85 py-2 text-[#E8A791] transition-all hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67]"
                title="GitHub Profile"
              >
                <GithubIcon className="h-3.5 w-3.5 text-[#E46B5E]" />
                <span className="text-[11px]">GitHub</span>
              </a>

              <a
                href="https://codolio.com/profile/Kruxhna/problemSolving"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="magnetic"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#9A142C] bg-[#4E0104]/85 py-2 text-[#E8A791] transition-all hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67]"
                title="Codolio DSA Profile"
              >
                <CodolioIcon className="h-3.5 w-3.5 text-[#E46B5E]" />
                <span className="text-[11px]">Codolio</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Colophon & Live Local Time Indicator */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[rgba(221,112,116,0.18)] pt-8 sm:flex-row text-xs font-mono text-[#DD7074]">
          {/* Left: Exact Copyright & Attribution */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <p className="text-[#ECC3AB]/80">
              © 2025 KRUSHNA. Designed with precision.
            </p>
          </div>

          {/* Right: Live Local Time Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-[#9A142C] bg-[#4E0104]/85 px-3.5 py-1 text-[#ECC3AB]">
              <span className="h-2 w-2 rounded-full bg-[#E02E32] animate-pulse" />
              <span>
                {timeString ? `${timeString} ` : ""}IST (UTC +5:30) • Available for opportunities
              </span>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              data-cursor="magnetic"
              className="flex items-center gap-1 rounded-lg border border-[#9A142C] bg-[#4E0104]/85 px-2.5 py-1 text-[11px] text-[#E8A791] hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67] transition-colors"
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
