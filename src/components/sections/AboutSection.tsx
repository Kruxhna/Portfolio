"use client";

import React, { useRef, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  MotionValue,
} from "framer-motion";

// ============================================================================
// TYPES & DATA DEFINITIONS
// ============================================================================

export interface LanguageSkill {
  id: string;
  name: string;
  sub?: string;
  level: string;
  isStack?: boolean;
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
    isStack: true,
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
  "I'm Krushna, a CS & AI/ML engineering undergrad in Mumbai. Most of what I build starts with a bottleneck that bugs me—a quick script or low-level experiment that snowballs into distributed inference engines, radar simulations, and tools other people actually use.";

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

  // useTransform is called at the component root, never inside a map loop
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const y = useTransform(progress, [start, end], [4, 0]);

  if (shouldReduceMotion) {
    return (
      <span className="inline-block mr-[0.26em] text-neutral-100 opacity-100">
        {word}
      </span>
    );
  }

  return (
    <motion.span
      style={{ opacity, y }}
      className="inline-block mr-[0.26em] text-neutral-100 will-change-[opacity,transform]"
    >
      {word}
    </motion.span>
  );
}

// ============================================================================
// MAIN COMPONENT: AboutSection (egorz.com-inspired)
// ============================================================================

export function AboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const words = useMemo(() => BIO_STATEMENT.split(" "), []);
  const shouldReduceMotion = useReducedMotion();

  // Scroll tracking for word-by-word reveal scrub
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.45"],
  });

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative z-10 w-full bg-transparent py-24 sm:py-32 md:py-40 text-neutral-100 selection:bg-[#ef4444] selection:text-white"
    >
      {/* Backward-compatible anchor links for navbars and command menu */}
      <span id="timeline" className="absolute -top-28 pointer-events-none" />
      <span id="experience" className="absolute -top-28 pointer-events-none" />

      {/* =================================================================== */}
      {/* 1. TOP SECTION DIVIDER & META HEADER                                */}
      {/* =================================================================== */}
      <div className="w-full">
        {/* Animated 1px Hairline Top Divider */}
        <motion.div
          initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-px bg-white/10 origin-left"
        />

        {/* Monospace Metadata Row */}
        <div className="flex items-center justify-between gap-4 pt-4 mb-12 sm:mb-16 select-none font-mono text-xs uppercase tracking-[0.08em] text-neutral-400">
          <h2 id="about-heading" className="flex items-center gap-1.5 font-normal">
            <span className="text-[#ef4444] font-medium">(02)</span>
            <span className="text-neutral-200">ABOUT</span>
          </h2>
          <span className="hidden sm:inline text-neutral-400">
            THE PERSON BEHIND IT
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. HERO BIO STATEMENT (WORD-BY-WORD SCROLL SCRUB)                   */}
      {/* =================================================================== */}
      <div ref={containerRef} className="w-full">
        <p className="font-sans text-[clamp(1.85rem,4.2vw,3.6rem)] font-medium tracking-[-0.03em] leading-[1.14] max-w-[95%] text-neutral-100">
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

      {/* =================================================================== */}
      {/* 3. BOTTOM 2-COLUMN SUB-GRID (SPEAKS & OFF-SCREEN)                   */}
      {/* =================================================================== */}
      <div className="mt-16 sm:mt-20 md:mt-24 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* ── LEFT COLUMN: SPEAKS (Languages & Stack) ── */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-neutral-400 select-none">
              SPEAKS
            </span>
          </div>

          <div className="flex flex-col border-y border-white/10 divide-y divide-white/10">
            {LANGUAGES.map((lang, idx) => (
              <motion.div
                key={lang.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{
                  duration: 0.45,
                  delay: idx * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative py-3.5 flex items-baseline justify-between transition-colors duration-150 cursor-default"
              >
                {/* Left: Language Name + optional sub-label */}
                <div className="flex items-center gap-2 transition-transform duration-200 group-hover:translate-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444] opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-2" />
                  <span className="font-sans text-[clamp(1.15rem,1.6vw,1.35rem)] font-medium text-neutral-100 tracking-[-0.01em]">
                    {lang.name}
                  </span>
                  {lang.sub && (
                    <span className="font-mono text-xs text-neutral-500 tracking-normal ml-1">
                      {lang.sub}
                    </span>
                  )}
                </div>

                {/* Right: Proficiency Monospace Tag */}
                <span
                  className={`font-mono text-xs tracking-wider transition-colors duration-200 select-none ${
                    lang.isStack
                      ? "text-[#ef4444] group-hover:text-white"
                      : "text-neutral-400 group-hover:text-[#ef4444]"
                  }`}
                >
                  {lang.level}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: OFF-SCREEN (Interests & Creative pursuits) ── */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs uppercase tracking-[0.08em] text-neutral-400 select-none">
              OFF-SCREEN
            </span>
          </div>

          {/* Top border hairline */}
          <div className="border-t border-white/10 pt-3.5">
            <p className="group/list font-sans text-[clamp(1.15rem,1.6vw,1.35rem)] font-medium leading-relaxed tracking-[-0.01em] text-neutral-100">
              {OFF_SCREEN_INTERESTS.map((interest, i) => (
                <React.Fragment key={interest}>
                  <span className="inline-block transition-all duration-200 cursor-default group-hover/list:opacity-35 hover:!opacity-100 hover:text-white">
                    {interest}
                  </span>
                  {i < OFF_SCREEN_INTERESTS.length - 1 && (
                    <span className="font-mono text-[#ef4444]/60 mx-2.5 select-none transition-opacity duration-200 group-hover/list:opacity-40">
                      /
                    </span>
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
