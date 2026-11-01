"use client";

import React, { useRef, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionValue,
} from "framer-motion";
import { PixelBlockImageReveal } from "@/components/ui/PixelBlockImageReveal";

// ============================================================================
// DATA DEFINITIONS
// ============================================================================

export interface LanguageSkill {
  id: string;
  name: string;
  sub?: string;
  level: string;
}

const LANGUAGES: LanguageSkill[] = [
  { id: "en", name: "English", level: "FLUENT" },
  { id: "hi", name: "Hindi", level: "FLUENT" },
  { id: "mr", name: "Marathi", level: "NATIVE" },
  {
    id: "stack",
    name: "Python / C++ / Rust",
    sub: "systems & ML",
    level: "DAILY",
  },
];

const OFF_SCREEN_INTERESTS: string[] = [
  "digital media design",
  "video editing & filmmaking",
  "competitive programming",
  "3D web experiments",
  "gaming",
];

const BIO_STATEMENT =
  "I'm Krushna, a CS & AI/ML undergrad. I hunt down compute bottlenecks and build my way out of them—shipping distributed LLM meshes, radar spectrum simulators, and low-latency tools people actually use";

// ============================================================================
// DEDICATED CHILD COMPONENT FOR SCROLL SCRUB (STRICT RULES OF HOOKS)
// ============================================================================

interface ScrollWordProps {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
  shouldReduceMotion: boolean | null;
}

function ScrollWord({
  word,
  index,
  total,
  progress,
  shouldReduceMotion,
}: ScrollWordProps) {
  const start = index / total;
  const end = Math.min(1, start + 1 / total);

  // useTransform called at component root
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const y = useTransform(progress, [start, end], [4, 0]);

  if (shouldReduceMotion) {
    return (
      <span className="inline-block mr-[0.25em] text-neutral-100 opacity-100">
        {word}
      </span>
    );
  }

  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block mr-[0.25em] text-neutral-100 will-change-[opacity,transform]"
    >
      {word}
    </motion.span>
  );
}

// ============================================================================
// MAIN COMPONENT: AboutSection (egorz.com-inspired)
// ============================================================================

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const words = useMemo(() => BIO_STATEMENT.split(" "), []);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking for word-by-word reveal scrub
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-labelledby="about-heading"
      className="relative z-10 w-full bg-transparent py-24 sm:py-32 md:py-40 text-neutral-100 selection:bg-[#6D001A] selection:text-white"
    >
      {/* Backward-compatible anchor links for navbars and command menu */}
      <span id="timeline" className="absolute -top-28 pointer-events-none" />
      <span id="experience" className="absolute -top-28 pointer-events-none" />

      {/* =================================================================== */}
      {/* 1. TOP SECTION DIVIDER & META HEADER                                */}
      {/* =================================================================== */}
      <div className="w-full">
        {/* Full-width 1px top border */}
        <div className="w-full border-t border-white/10 pt-4 mb-14">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.08em] text-neutral-400 select-none">
            <h2 id="about-heading" className="font-normal">
              (02) ABOUT
            </h2>
            <span>THE PERSON BEHIND IT</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. HERO BIO STATEMENT & PORTRAIT (SIDE-BY-SIDE SPLIT)               */}
      {/* =================================================================== */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
        {/* Left: Bio Statement with Word-by-Word Scroll Scrub */}
        <div className="lg:col-span-7 xl:col-span-8">
          <p className="font-sans font-medium text-[clamp(1.75rem,3.8vw,3.4rem)] tracking-[-0.035em] leading-[1.14] text-neutral-100">
            {words.map((word, i) => (
              <ScrollWord
                key={`${word}-${i}`}
                word={word}
                index={i}
                total={words.length}
                progress={scrollYProgress}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </p>
        </div>

        {/* Right: Krushna Portrait with Brutalist Pixel-Block Grid Reveal */}
        <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end items-end relative mt-8 lg:mt-0">
          <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[440px]">
            {/* Subtle atmospheric ambient glow behind portrait */}
            <div
              className="absolute inset-0 -inset-x-8 rounded-full pointer-events-none opacity-40 blur-3xl -z-10"
              style={{
                background: "radial-gradient(circle at 60% 50%, rgba(158, 11, 46, 0.35), transparent 70%)",
              }}
            />

            <PixelBlockImageReveal
              src="/Images/krushna.png"
              alt="Krushna - AI/ML Engineer & Systems Specialist"
              width={1088}
              height={1445}
              columns={8}
              rows={10}
              coverColor="#000000"
              duration={0.38}
              once={false}
              className="w-full drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)]"
              imageClassName="w-full h-auto object-contain select-none pointer-events-none filter contrast-[1.04]"
            />
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. BOTTOM 2-COLUMN METADATA GRID                                    */}
      {/* =================================================================== */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* ── LEFT COLUMN: SPEAKS ── */}
        <div className="flex flex-col">
          <h3 className="font-mono text-xs uppercase tracking-[0.08em] text-neutral-400 mb-3 select-none">
            SPEAKS
          </h3>

          <div className="flex flex-col">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.id}
                className="border-t border-white/10 py-3 flex items-baseline justify-between group"
              >
                <div className="flex items-baseline">
                  <span className="font-sans text-lg font-medium text-neutral-100">
                    {lang.name}
                  </span>
                  {lang.sub && (
                    <span className="text-sm text-neutral-500 ml-2 font-normal">
                      {lang.sub}
                    </span>
                  )}
                </div>

                <span className="font-mono text-xs uppercase tracking-[0.08em] text-neutral-400 group-hover:text-white transition-colors select-none">
                  {lang.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: OFF-SCREEN ── */}
        <div className="flex flex-col">
          <h3 className="font-mono text-xs uppercase tracking-[0.08em] text-neutral-400 mb-3 select-none">
            OFF-SCREEN
          </h3>

          <div className="border-t border-white/10 pt-3">
            <p className="group/list leading-relaxed">
              {OFF_SCREEN_INTERESTS.map((interest, i) => (
                <React.Fragment key={interest}>
                  <span className="font-sans text-lg font-medium text-neutral-100 transition-opacity duration-200 group-hover/list:opacity-35 hover:!opacity-100 cursor-default">
                    {interest}
                  </span>
                  {i < OFF_SCREEN_INTERESTS.length - 1 && (
                    <span className="text-neutral-600 mx-2 select-none">/</span>
                  )}
                </React.Fragment>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// Backward-compatible export alias for any components importing ExperienceSection
export const ExperienceSection = AboutSection;

export default AboutSection;
