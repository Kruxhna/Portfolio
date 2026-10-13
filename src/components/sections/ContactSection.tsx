"use client";

import React, { useState } from "react";
import {
  Mail,
  Copy,
  Check,
  Send,
  ArrowUpRight,
  MessageSquare,
  Sparkles,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, CodolioIcon } from "@/components/ui/Icons";
import { PERSONAL_INFO } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";

export function ContactSection() {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setFormSent(true);
      showToast("Transmission dispatched successfully!");
      setTimeout(() => {
        setFormSent(false);
        setFormData({ name: "", email: "", message: "" });
      }, 4000);
    }, 600);
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-[#111115]/95 px-4 py-3 text-xs font-mono text-[#FAFAFA] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
          <Check className="h-4 w-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section Header & Main Statement Call-to-Action */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#10B981]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>05 // INITIATE TRANSMISSION</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold tracking-tight text-[#FAFAFA] sm:text-5xl lg:text-6xl max-w-3xl leading-[1.1]">
            Let&apos;s build something intelligent together.
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
            Whether you&apos;re looking for an AI/ML engineer for high-performance systems, deep learning pipelines, or exploring algorithmic collaborations—my inbox and coordinates are always open.
          </p>
        </div>
      </div>

      {/* Main Contact Grid (4 High-Contrast Action Cards in Bento Style) */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: Email & "Copy Email" Action Card */}
        <SpotlightCard className="flex flex-col justify-between border-[#27272A] bg-[#0c0c0e]/95 p-6 transition-all hover:border-[#10B981]/50 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#71717A]">
                Direct Mail
              </span>
              <span className="flex h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272A] bg-[#141418] text-[#10B981] group-hover:border-[#10B981]/40 transition-colors">
              <Mail className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#FAFAFA]">
              Electronic Mail
            </h3>
            <p className="mt-1 font-mono text-xs text-[#A1A1AA] truncate">
              {PERSONAL_INFO.email}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleCopyEmail}
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 py-2.5 text-xs font-semibold text-[#10B981] transition-all hover:bg-[#10B981] hover:text-black hover:shadow-lg hover:shadow-[#10B981]/20 active:scale-[0.98]"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Email</span>
                </>
              )}
            </button>

            <a
              href={`mailto:${PERSONAL_INFO.email}`}
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#27272A] bg-[#141418] py-2 text-[11px] font-mono text-[#71717A] hover:text-[#FAFAFA] hover:border-[#38BDF8]/40 transition-colors"
            >
              <span>Open Mail Client</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </SpotlightCard>

        {/* CARD 2: LinkedIn Direct Link */}
        <SpotlightCard className="flex flex-col justify-between border-[#27272A] bg-[#0c0c0e]/95 p-6 transition-all hover:border-[#0A66C2]/60 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#71717A]">
                Network
              </span>
              <span className="font-mono text-[10px] text-[#71717A]">Active</span>
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272A] bg-[#141418] text-[#0A66C2] group-hover:border-[#0A66C2]/50 transition-colors">
              <LinkedinIcon className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#FAFAFA]">
              LinkedIn
            </h3>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Connect professionally, review updates & credentials.
            </p>
          </div>

          <div className="mt-6">
            <a
              href="https://www.linkedin.com/in/krushna-nole/"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/10 py-2.5 text-xs font-semibold text-[#60A5FA] transition-all hover:bg-[#0A66C2] hover:text-white hover:shadow-lg hover:shadow-[#0A66C2]/20 active:scale-[0.98]"
            >
              <LinkedinIcon className="h-4 w-4" />
              <span>Connect on LinkedIn</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </SpotlightCard>

        {/* CARD 3: GitHub Direct Link */}
        <SpotlightCard className="flex flex-col justify-between border-[#27272A] bg-[#0c0c0e]/95 p-6 transition-all hover:border-[#38BDF8]/60 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#71717A]">
                Source Code
              </span>
              <span className="font-mono text-[10px] text-[#38BDF8]">15+ Repos</span>
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272A] bg-[#141418] text-[#38BDF8] group-hover:border-[#38BDF8]/50 transition-colors">
              <GithubIcon className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#FAFAFA]">
              GitHub
            </h3>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Explore distributed systems, ML pipelines & codebases.
            </p>
          </div>

          <div className="mt-6">
            <a
              href="https://github.com/Kruxhna"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 py-2.5 text-xs font-semibold text-[#38BDF8] transition-all hover:bg-[#38BDF8] hover:text-black hover:shadow-lg hover:shadow-[#38BDF8]/20 active:scale-[0.98]"
            >
              <GithubIcon className="h-4 w-4" />
              <span>Visit @Kruxhna</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </SpotlightCard>

        {/* CARD 4: Codolio Direct Link */}
        <SpotlightCard className="flex flex-col justify-between border-[#27272A] bg-[#0c0c0e]/95 p-6 transition-all hover:border-[#F59E0B]/60 group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#71717A]">
                Algorithmic Rigor
              </span>
              <span className="font-mono text-[10px] text-[#F59E0B]">300+ Solved</span>
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#27272A] bg-[#141418] text-[#F59E0B] group-hover:border-[#F59E0B]/50 transition-colors">
              <CodolioIcon className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#FAFAFA]">
              Codolio DSA Hub
            </h3>
            <p className="mt-1 text-xs text-[#A1A1AA]">
              Verified multi-platform LeetCode, GFG & CodeChef stats.
            </p>
          </div>

          <div className="mt-6">
            <a
              href="https://codolio.com/profile/Kruxhna/problemSolving"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 py-2.5 text-xs font-semibold text-[#FBBF24] transition-all hover:bg-[#F59E0B] hover:text-black hover:shadow-lg hover:shadow-[#F59E0B]/20 active:scale-[0.98]"
            >
              <CodolioIcon className="h-4 w-4" />
              <span>View Codolio Profile</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </SpotlightCard>
      </div>

      {/* Secondary Direct Transmission Terminal */}
      <div className="mt-8">
        <SpotlightCard className="p-6 sm:p-8 border-[#27272A] bg-[#0c0c0e]/90">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#38BDF8]">
                <MessageSquare className="h-4 w-4" />
                <span>Direct Dispatch Console</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-[#FAFAFA]">
                Send an encrypted message
              </h3>
              <p className="mt-1 text-xs text-[#A1A1AA] leading-relaxed">
                Prefer sending a note directly from this browser session? Fill out the parameters below to dispatch a message directly.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-[#71717A]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Base Location: Mumbai / Pune, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Timezone: IST (UTC +5:30)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                  <span>Turnaround: Typically within 24 hours</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 w-full max-w-lg space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] uppercase text-[#71717A] mb-1">
                  Your Name / Identity
                </label>
                <input
                  type="text"
                  required
                  data-cursor="text"
                  placeholder="e.g. Dr. Aris Thorne (Research Lead)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[#27272A] bg-[#141418] px-3.5 py-2.5 text-xs text-[#FAFAFA] placeholder-[#52525B] transition-colors focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#71717A] mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  data-cursor="text"
                  placeholder="name@organization.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[#27272A] bg-[#141418] px-3.5 py-2.5 text-xs text-[#FAFAFA] placeholder-[#52525B] transition-colors focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#71717A] mb-1">
                  Message / Opportunity Details
                </label>
                <textarea
                  required
                  rows={3}
                  data-cursor="text"
                  placeholder="Details regarding an AI/ML engineering role, systems research, or collaboration..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-[#27272A] bg-[#141418] px-3.5 py-2.5 text-xs text-[#FAFAFA] placeholder-[#52525B] transition-colors focus:border-[#38BDF8] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#52525B]">
                  P2P Secure Channel
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || formSent}
                  data-cursor="magnetic"
                  className="flex items-center gap-2 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-4 py-2 text-xs font-semibold text-[#FAFAFA] transition-all hover:bg-[#38BDF8]/25 hover:border-[#38BDF8] active:scale-[0.98]"
                >
                  {formSent ? (
                    <>
                      <Check className="h-4 w-4 text-[#10B981]" />
                      <span className="text-[#10B981]">Transmission Dispatched!</span>
                    </>
                  ) : isSubmitting ? (
                    <span>Dispatching...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 text-[#38BDF8]" />
                      <span>Dispatch Message ↵</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
