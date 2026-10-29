"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SiPytorch,
  SiCplusplus,
  SiPython,
  SiRust,
  SiDocker,
  SiFastapi,
  SiLinux,
  SiTypescript,
  SiNextdotjs,
  SiGit,
  SiHuggingface,
  SiOpencv,
  SiPostgresql,
  SiTailwindcss,
  SiMongodb,
  SiNvidia,
  SiExpress,
  SiReact,
  SiNodedotjs,
  SiJavascript,
  SiMysql,
  SiHtml5,
  SiC,
} from "react-icons/si";
import { FaCss3Alt, FaJava } from "react-icons/fa6";

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

export interface TechItem {
  name: string;
  category?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TechStackData {
  row1: TechItem[];
  row2: TechItem[];
  row3: TechItem[];
}

// Custom typographic Oracle logo reverse-engineered from reference website
function OracleLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-black tracking-tighter leading-none select-none text-2xl md:text-3xl font-sans ${className}`}
    >
      O
    </span>
  );
}

// ----------------------------------------------------------------------------
// 1. KRUSHNA'S SPECIALIZED SYSTEMS & AI/ML STACK (DEFAULT)
// ----------------------------------------------------------------------------
export const KRUSHNA_STACK: TechStackData = {
  // Row 1: 4 Core Pillar Technologies (Large Featured Slots)
  row1: [
    { name: "PyTorch", category: "Deep Learning & Neural Tensors", icon: SiPytorch },
    { name: "C++", category: "Low-Latency & Systems Compute", icon: SiCplusplus },
    { name: "Python", category: "Scientific Computing & Modeling", icon: SiPython },
    { name: "Rust", category: "Memory-Safe Systems & Parallelism", icon: SiRust },
  ],
  // Row 2: 6 Infrastructure, Cloud & Full-Stack Technologies
  row2: [
    { name: "CUDA", category: "GPU Hardware Acceleration", icon: SiNvidia },
    { name: "Docker", category: "Containerization & Isolation", icon: SiDocker },
    { name: "FastAPI", category: "Asynchronous REST & Neural APIs", icon: SiFastapi },
    { name: "TypeScript", category: "Type-Safe Application Logic", icon: SiTypescript },
    { name: "Next.js", category: "Production Web Architecture", icon: SiNextdotjs },
    { name: "Linux", category: "Kernel, Shell & DevOps", icon: SiLinux },
  ],
  // Row 3: 6 Specialized Tooling, Databases & Vision Libraries
  row3: [
    { name: "Hugging Face", category: "Transformers & LLMs", icon: SiHuggingface },
    { name: "OpenCV", category: "Computer Vision & Spatial Streams", icon: SiOpencv },
    { name: "PostgreSQL", category: "Relational Data Storage", icon: SiPostgresql },
    { name: "Tailwind CSS", category: "Utility-First Design Tokens", icon: SiTailwindcss },
    { name: "MongoDB", category: "Document Store & Metadata", icon: SiMongodb },
    { name: "Git", category: "Version Control & GitOps", icon: SiGit },
  ],
};

// ----------------------------------------------------------------------------
// 2. REFERENCE TECH STACK (EXACT ROHIT MEHTA 16-SLOT MERN / SWE SET)
// ----------------------------------------------------------------------------
export const REFERENCE_STACK: TechStackData = {
  // Row 1: 4 Core Featured Columns
  row1: [
    { name: "MongoDB", category: "NoSQL Database", icon: SiMongodb },
    { name: "Express.js", category: "Backend Framework", icon: SiExpress },
    { name: "React.js", category: "Frontend Library", icon: SiReact },
    { name: "Node.js", category: "JavaScript Runtime", icon: SiNodedotjs },
  ],
  // Row 2: 6 Standard Columns
  row2: [
    { name: "JavaScript", category: "Core Language", icon: SiJavascript },
    { name: "PostgreSQL", category: "Relational Database", icon: SiPostgresql },
    { name: "Docker", category: "Containers", icon: SiDocker },
    { name: "Tailwind CSS", category: "Utility CSS", icon: SiTailwindcss },
    { name: "MySQL", category: "Relational Database", icon: SiMysql },
    { name: "HTML5", category: "Markup Standard", icon: SiHtml5 },
  ],
  // Row 3: 6 Standard Columns
  row3: [
    { name: "CSS3", category: "Styling Standard", icon: FaCss3Alt },
    { name: "Oracle", category: "Enterprise DB", icon: OracleLogo },
    { name: "Git", category: "Version Control", icon: SiGit },
    { name: "JAVA", category: "OOP Language", icon: FaJava },
    { name: "C++", category: "Systems Programming", icon: SiCplusplus },
    { name: "C", category: "Foundations", icon: SiC },
  ],
};

// ============================================================================
// DIRECTIONAL HOVER CELL COMPONENT
// ============================================================================

interface DirectionalCellProps {
  item: TechItem;
  isLarge?: boolean;
  isLastRow?: boolean;
}

function DirectionalCell({ item, isLarge = false, isLastRow = false }: DirectionalCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [entryDir, setEntryDir] = useState<number>(0);
  const [exitDir, setExitDir] = useState<number>(0);

  // Mathematical quadrant calculation for edge entry/exit detection
  // Returns: 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
  const calculateDirection = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const w = rect.width;
    const h = rect.height;
    return Math.round((Math.atan2(y / h, x / w) * (180 / Math.PI) + 180) / 90 + 3) % 4;
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const dir = calculateDirection(e);
    setEntryDir(dir);
    setIsHovered(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const dir = calculateDirection(e);
    setExitDir(dir);
    setIsHovered(false);
  };

  // Convert 0..3 direction index into initial transform coordinates
  const getTransformOffset = (direction: number) => {
    switch (direction) {
      case 0:
        return { x: "0%", y: "-100%" }; // Top
      case 1:
        return { x: "100%", y: "0%" };  // Right
      case 2:
        return { x: "0%", y: "100%" };  // Bottom
      case 3:
        return { x: "-100%", y: "0%" }; // Left
      default:
        return { x: "0%", y: "0%" };
    }
  };

  const IconComponent = item.icon;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cursor="pointer"
      className={`relative overflow-hidden group cursor-pointer select-none flex flex-col items-center justify-center transition-colors duration-150 border-r border-b border-[rgba(221,112,116,0.18)] -mb-px -mr-px ${
        isLarge
          ? "basis-[50%] md:basis-0 flex-grow flex-shrink min-h-[195px] sm:min-h-[205px] md:min-h-[225px] p-6 sm:p-8"
          : "basis-[30%] sm:basis-[20%] md:basis-0 flex-grow flex-shrink min-h-[110px] md:min-h-[125px] p-4 sm:p-5"
      } ${isLastRow ? "md:border-b-0" : ""}`}
    >
      {/* ── SOLID HIGH-CONTRAST INVERT DIRECTIONAL OVERLAY ── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="directional-overlay"
            initial={getTransformOffset(entryDir)}
            animate={{ x: "0%", y: "0%" }}
            exit={getTransformOffset(exitDir)}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[#ECC3AB] z-0 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ── CONTENT CONTAINER (ELEVATED ABOVE WIPING OVERLAY) ── */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {/* Monochromatic Tech Icon */}
        <div
          className={`transition-all duration-300 ease-out flex items-center justify-center ${
            isHovered
              ? "text-[#0A0807] scale-110"
              : "text-[#ECC3AB] group-hover:text-[#F7EFEA]"
          }`}
        >
          <IconComponent
            className={
              isLarge
                ? "w-13 h-13 sm:w-14 sm:h-14 md:w-15 md:h-15"
                : "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
            }
          />
        </div>

        {/* Micro-Label Reveal on Hover */}
        <span
          className={`font-mono text-[10.5px] sm:text-[11px] font-bold tracking-[0.14em] uppercase text-center whitespace-nowrap transition-all duration-200 mt-2.5 ${
            isHovered
              ? "opacity-100 translate-y-0 text-[#0A0807]"
              : "opacity-0 translate-y-2 text-[#0A0807]"
          }`}
        >
          {item.name}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: TechStackGrid
// ============================================================================

export function TechStackGrid() {
  const [activeStackMode, setActiveStackMode] = useState<"custom" | "reference">("custom");

  const activeData = activeStackMode === "custom" ? KRUSHNA_STACK : REFERENCE_STACK;

  return (
    <section
      id="arsenal"
      className="relative z-10 w-full bg-transparent py-20 md:py-28 text-[#ECC3AB]"
    >
      {/* Anchor links for navbar & command palette backward compatibility */}
      <span id="skills" className="absolute -top-28 pointer-events-none" />
      <span id="toolbox" className="absolute -top-28 pointer-events-none" />
      <span id="tech-stack" className="absolute -top-28 pointer-events-none" />

      <div className="w-full">
        {/* ================================================================= */}
        {/* A. SECTION HEADER WITH CALLIGRAPHIC/SCRIPT ACCENT                 */}
        {/* ================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            {/* Eyebrow Kicker */}
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#DD7074] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E02E32] animate-pulse" />
              <span>05 // TECHNOLOGIES &amp; TOOLING</span>
            </div>

            {/* Heading: "Technologies" (Calligraphic Script) + "I work with" (Tight Sans) */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-sans font-medium tracking-[-0.035em] text-[#ECC3AB] flex flex-wrap items-baseline gap-x-3.5 gap-y-1 leading-[1.12]">
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-cursive text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-normal bg-gradient-to-r from-[#E02E32] via-[#E46B5E] to-[#ECC3AB] bg-clip-text text-transparent capitalize tracking-normal -mt-2 md:mt-0 pt-2 sm:pt-4"
              >
                Technologies
              </motion.span>
              <span>I work with</span>
            </h2>
          </div>

          {/* Stack Profile Switcher Pill Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#0A0807]/80 backdrop-blur-md border border-[rgba(221,112,116,0.22)] shadow-sm self-start md:self-end">
            <button
              type="button"
              data-cursor="pointer"
              onClick={() => setActiveStackMode("custom")}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeStackMode === "custom"
                  ? "bg-[#C3181E] text-[#ECC3AB] shadow-md border border-[#E44847]/60"
                  : "text-[#DD7074] hover:text-[#ECC3AB] hover:bg-[#14100D]"
              }`}
            >
              Core Systems &amp; AI
            </button>
            <button
              type="button"
              data-cursor="pointer"
              onClick={() => setActiveStackMode("reference")}
              className={`px-4 py-1.5 rounded-full font-mono text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeStackMode === "reference"
                  ? "bg-[#C3181E] text-[#ECC3AB] shadow-md border border-[#E44847]/60"
                  : "text-[#DD7074] hover:text-[#ECC3AB] hover:bg-[#14100D]"
              }`}
            >
              Full-Stack Reference
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* B. ASYMMETRICAL 3-ROW BORDERED LOGO MATRIX                        */}
        {/* ================================================================= */}
        <div className="relative w-full rounded-[20px] border border-[rgba(221,112,116,0.18)] bg-[#0A0807]/90 backdrop-blur-xl overflow-hidden shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)]">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(228, 107, 94, 0.4), transparent 70%)",
            }}
          />

          {/* ── ROW 1: 4 LARGE FEATURED COLUMNS ── */}
          <div className="flex flex-wrap relative z-10 w-full">
            {activeData.row1.map((item) => (
              <DirectionalCell key={item.name} item={item} isLarge={true} />
            ))}
          </div>

          {/* ── ROW 2: 6 STANDARD COLUMNS ── */}
          <div className="flex flex-wrap relative z-10 w-full">
            {activeData.row2.map((item) => (
              <DirectionalCell key={item.name} item={item} isLarge={false} />
            ))}
          </div>

          {/* ── ROW 3: 6 STANDARD COLUMNS ── */}
          <div className="flex flex-wrap relative z-10 w-full">
            {activeData.row3.map((item) => (
              <DirectionalCell key={item.name} item={item} isLarge={false} isLastRow={true} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Backward-compatible alias for seamless drop-in replacement
export const ArsenalSection = TechStackGrid;

export default TechStackGrid;
