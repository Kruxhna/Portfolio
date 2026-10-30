"use client";

import React, { useState } from "react";
import {
  Mail,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, CodolioIcon } from "@/components/ui/Icons";
import { PERSONAL_INFO } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ExternalLinkPill } from "@/components/ui/ExternalLinkPill";


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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#6D001A] bg-[#000000]/95 px-4 py-3 text-xs font-mono text-[#F5EEF0] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <span className="flex h-2 w-2 rounded-full bg-[#9E0B2E] animate-pulse" />
          <Check className="h-4 w-4 text-[#C93B5B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section Header & Main Statement Call-to-Action */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#A68E94]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#9E0B2E] animate-pulse" />
          <span>05 // INITIATE TRANSMISSION</span>
        </div>

        <div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-medium tracking-[-0.035em] text-[#F5EEF0] max-w-3xl leading-[1.12]">
            Let&apos;s build something intelligent together.
          </h2>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#A68E94]/80 leading-relaxed">
            Whether you&apos;re looking for an AI/ML engineer for high-performance systems, deep learning pipelines, or exploring algorithmic collaborations—my inbox and coordinates are always open.
          </p>
        </div>
      </div>

      {/* Main Contact Grid (4 High-Contrast Action Cards in Bento Style) */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: Email & "Copy Email" Action Card */}
        <SpotlightCard className="flex flex-col justify-between border-[rgba(221,112,116,0.18)] bg-[#000000] p-6 transition-all hover:border-[rgba(228,107,94,0.45)] group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#A68E94]">
                Direct Mail
              </span>
              <span className="flex h-2 w-2 rounded-full bg-[#9E0B2E] animate-pulse" />
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] text-[#C93B5B] group-hover:border-[#C93B5B] transition-colors">
              <Mail className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#F5EEF0]">
              Electronic Mail
            </h3>
            <p className="mt-1 font-mono text-xs text-[#A68E94] truncate">
              {PERSONAL_INFO.email}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={handleCopyEmail}
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D001A] border border-[#9E0B2E]/60 text-[#F5EEF0] py-2.5 text-xs font-semibold hover:bg-[#9E0B2E] hover:text-[#F5EEF0] hover:border-[#F5EEF0]/80 active:bg-[#6D001A] transition-all cursor-pointer"
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

            <ExternalLinkPill
              href={`mailto:${PERSONAL_INFO.email}`}
              variant="secondary"
              size="sm"
              data-cursor="magnetic"
              className="w-full justify-center"
            >
              Open Mail Client
            </ExternalLinkPill>
          </div>
        </SpotlightCard>

        {/* CARD 2: LinkedIn Direct Link */}
        <SpotlightCard className="flex flex-col justify-between border-[rgba(221,112,116,0.18)] bg-[#000000] p-6 transition-all hover:border-[rgba(228,107,94,0.45)] group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#A68E94]">
                Network
              </span>
              <span className="font-mono text-[10px] text-[#A68E94]">Active</span>
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] text-[#C93B5B] group-hover:border-[#C93B5B] transition-colors">
              <LinkedinIcon className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#F5EEF0]">
              LinkedIn
            </h3>
            <p className="mt-1 text-xs text-[#F5EEF0]/85">
              Connect professionally, review updates &amp; credentials.
            </p>
          </div>

          <div className="mt-6">
            <ExternalLinkPill
              href="https://www.linkedin.com/in/krushna-nole/"
              variant="primary"
              size="md"
              data-cursor="magnetic"
              className="w-full justify-center"
            >
              <LinkedinIcon className="h-4 w-4" />
              Connect on LinkedIn
            </ExternalLinkPill>
          </div>
        </SpotlightCard>

        {/* CARD 3: GitHub Direct Link */}
        <SpotlightCard className="flex flex-col justify-between border-[rgba(221,112,116,0.18)] bg-[#000000] p-6 transition-all hover:border-[rgba(228,107,94,0.45)] group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#A68E94]">
                Source Code
              </span>
              <span className="font-mono text-[10px] text-[#C93B5B]">15+ Repos</span>
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] text-[#C93B5B] group-hover:border-[#C93B5B] transition-colors">
              <GithubIcon className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#F5EEF0]">
              GitHub
            </h3>
            <p className="mt-1 text-xs text-[#F5EEF0]/85">
              Explore distributed systems, ML pipelines &amp; codebases.
            </p>
          </div>

          <div className="mt-6">
            <ExternalLinkPill
              href="https://github.com/Kruxhna"
              variant="primary"
              size="md"
              data-cursor="magnetic"
              className="w-full justify-center"
            >
              <GithubIcon className="h-4 w-4" />
              Visit @Kruxhna
            </ExternalLinkPill>
          </div>
        </SpotlightCard>

        {/* CARD 4: Codolio Direct Link */}
        <SpotlightCard className="flex flex-col justify-between border-[rgba(221,112,116,0.18)] bg-[#000000] p-6 transition-all hover:border-[rgba(228,107,94,0.45)] group">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#A68E94]">
                Algorithmic Rigor
              </span>
              <span className="font-mono text-[10px] text-[#C93B5B]">300+ Solved</span>
            </div>

            <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] text-[#C93B5B] group-hover:border-[#C93B5B] transition-colors">
              <CodolioIcon className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-base font-bold text-[#F5EEF0]">
              Codolio DSA Hub
            </h3>
            <p className="mt-1 text-xs text-[#F5EEF0]/85">
              Verified multi-platform LeetCode, GFG &amp; CodeChef stats.
            </p>
          </div>

          <div className="mt-6">
            <ExternalLinkPill
              href="https://codolio.com/profile/Kruxhna/problemSolving"
              variant="primary"
              size="md"
              data-cursor="magnetic"
              className="w-full justify-center"
            >
              <CodolioIcon className="h-4 w-4" />
              View Codolio Profile
            </ExternalLinkPill>
          </div>
        </SpotlightCard>
      </div>

      {/* Secondary Direct Transmission Terminal */}
      <div className="mt-8">
        <SpotlightCard className="p-6 sm:p-8 border-[rgba(221,112,116,0.18)] bg-[#000000]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div className="max-w-md">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A68E94]">
                <MessageSquare className="h-4 w-4 text-[#C93B5B]" />
                <span>Direct Dispatch Console</span>
              </div>
              <h3 className="mt-2 text-xl font-bold text-[#F5EEF0]">
                Send an encrypted message
              </h3>
              <p className="mt-1 text-xs text-[#F5EEF0]/85 leading-relaxed">
                Prefer sending a note directly from this browser session? Fill out the parameters below to dispatch a message directly.
              </p>

              <div className="mt-6 space-y-2.5 text-xs font-mono text-[#A68E94]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#C93B5B]" />
                  <span>Base Location: Mumbai / Pune, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#C93B5B]" />
                  <span>Timezone: IST (UTC +5:30)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#C93B5B]" />
                  <span>Turnaround: Typically within 24 hours</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 w-full max-w-lg space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] uppercase text-[#A68E94] mb-1">
                  Your Name / Identity
                </label>
                <input
                  type="text"
                  required
                  data-cursor="text"
                  placeholder="e.g. Dr. Aris Thorne (Research Lead)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] px-3.5 py-2.5 text-xs text-[#F5EEF0] placeholder-[#A68E94]/50 transition-colors focus:border-[#C93B5B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#A68E94] mb-1">
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  data-cursor="text"
                  placeholder="name@organization.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] px-3.5 py-2.5 text-xs text-[#F5EEF0] placeholder-[#A68E94]/50 transition-colors focus:border-[#C93B5B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase text-[#A68E94] mb-1">
                  Message / Opportunity Details
                </label>
                <textarea
                  required
                  rows={3}
                  data-cursor="text"
                  placeholder="Details regarding an AI/ML engineering role, systems research, or collaboration..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full rounded-xl border border-[rgba(221,112,116,0.22)] bg-[#140408] px-3.5 py-2.5 text-xs text-[#F5EEF0] placeholder-[#A68E94]/50 transition-colors focus:border-[#C93B5B] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#A68E94]/70">
                  P2P Secure Channel
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting || formSent}
                  data-cursor="magnetic"
                  className="flex items-center gap-2 rounded-xl bg-[#6D001A] border border-[#9E0B2E]/60 text-[#F5EEF0] px-4 py-2 text-xs font-semibold hover:bg-[#9E0B2E] hover:text-[#F5EEF0] hover:border-[#F5EEF0]/80 active:bg-[#6D001A] transition-all cursor-pointer"
                >
                  {formSent ? (
                    <>
                      <Check className="h-4 w-4 text-[#F5EEF0]" />
                      <span className="text-[#F5EEF0]">Transmission Dispatched!</span>
                    </>
                  ) : isSubmitting ? (
                    <span>Dispatching...</span>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 text-[#F5EEF0]" />
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
