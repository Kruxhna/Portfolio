"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { ArrowUp, ArrowUpRight, MapPin, Sparkles, FileText, Mail, Send } from "lucide-react";
import { PERSONAL_INFO } from "@/data/portfolioData";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { SandTextMonument } from "@/components/SandTextMonument";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// CENTRAL CONFIGURATION OBJECT
// ============================================================================

export const TEXT_ANIM_CONFIG = {
  scrubSmoothness: 1.2,
  staggerSpeed: 0.045,
  marqueeBaseSpeed: 1.0,
  velocitySkewMax: 5.0, // degrees
  magneticStrength: 0.3, // 0 to 1
  primaryColor: "#F5EEF0",
  mutedColor: "#A68E94",
  accentColor: "#6D001A",
  bgColor: "#000000", // Flat dark obsidian background (Zero 3D / WebGL)
};

// ============================================================================
// HELPER: Split Text Into Masked Words
// ============================================================================

function SplitMaskedText({
  text,
  className = "",
  innerClassName = "",
}: {
  text: string;
  className?: string;
  innerClassName?: string;
}) {
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <span className={`inline ${className}`}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="line-mask inline-block overflow-hidden mr-[0.26em] align-top"
        >
          <span
            className={`line-inner inline-block will-change-transform ${innerClassName}`}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

// ============================================================================
// COMPONENT 1: Magnetic Slot-Machine Pill Button
// ============================================================================

interface SlotMachinePillProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  primary?: boolean;
}

function SlotMachinePill({
  href,
  label,
  icon,
  external = false,
  onClick,
  primary = false,
}: SlotMachinePillProps) {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [textOffset, setTextOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);

    // Magnetic pull within 80px radius
    if (dist < 80) {
      setBtnOffset({
        x: dx * TEXT_ANIM_CONFIG.magneticStrength,
        y: dy * TEXT_ANIM_CONFIG.magneticStrength,
      });
      setTextOffset({
        x: dx * (TEXT_ANIM_CONFIG.magneticStrength * 0.5),
        y: dy * (TEXT_ANIM_CONFIG.magneticStrength * 0.5),
      });
    }
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setBtnOffset({ x: 0, y: 0 });
    setTextOffset({ x: 0, y: 0 });
  };

  return (
    <a
      ref={buttonRef}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      data-cursor="pointer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${btnOffset.x}px, ${btnOffset.y}px, 0)`,
        transition: isHovered
          ? "transform 0.1s ease-out"
          : "transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s, border-color 0.3s",
      }}
      className={`group relative inline-flex items-center justify-center rounded-full px-6 py-3.5 text-xs sm:text-sm font-sans font-medium tracking-wide select-none overflow-hidden will-change-transform ${
        isHovered
          ? "bg-[#F5EEF0] text-[#000000] border border-[#F5EEF0] shadow-[0_0_24px_rgba(222,193,180,0.32)]"
          : primary
          ? "bg-transparent text-[#F5EEF0] border border-[#6D001A] hover:border-[#F5EEF0]"
          : "bg-transparent text-[#F5EEF0] border border-[#A68E94]/30 hover:border-[#F5EEF0]"
      }`}
    >
      <div
        style={{
          transform: `translate3d(${textOffset.x}px, ${textOffset.y}px, 0)`,
          transition: isHovered
            ? "transform 0.1s ease-out"
            : "transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
        className="flex items-center gap-2"
      >
        {icon && <span className="relative z-10">{icon}</span>}

        {/* Slot-Machine Double-Text Roll */}
        <div className="relative h-[1.3em] overflow-hidden flex flex-col justify-start">
          <span
            className="inline-block transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: isHovered ? "translateY(-105%)" : "translateY(0%)",
            }}
          >
            {label}
          </span>
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 inline-block transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] font-semibold"
            style={{
              transform: isHovered ? "translateY(0%)" : "translateY(105%)",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </a>
  );
}

// ============================================================================
// COMPONENT 2: Social Link Row with Sliding Arrow Mask
// ============================================================================

interface SocialRowProps {
  href: string;
  label: string;
  sublabel?: string;
}

function SocialRow({ href, label, sublabel }: SocialRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative block w-full py-4 transition-colors duration-300"
    >
      {/* 1px Hairline Top Border */}
      <div
        className="hairline-draw absolute top-0 left-0 w-full h-[1px] bg-[#A68E94]/20 transition-colors duration-300 group-hover:bg-[#F5EEF0]"
      />

      <div className="flex items-center justify-between">
        <div
          className="flex items-baseline gap-2 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: isHovered ? "translateX(10px)" : "translateX(0px)",
          }}
        >
          <span className="font-sans text-sm sm:text-base font-medium text-[#F5EEF0] group-hover:text-white">
            {label}
          </span>
          {sublabel && (
            <span className="font-mono text-[11px] text-[#A68E94]/60">
              {sublabel}
            </span>
          )}
        </div>

        {/* Diagonal Arrow Slide from Bottom-Left Clip Mask */}
        <div className="relative overflow-hidden w-5 h-5 flex items-center justify-center">
          <span
            className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-[#6D001A] group-hover:text-[#F5EEF0]"
            style={{
              transform: isHovered
                ? "translate(0%, 0%)"
                : "translate(-100%, 100%)",
            }}
          >
            ↗
          </span>
          <span
            aria-hidden="true"
            className="absolute inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] text-[#A68E94]/50"
            style={{
              transform: isHovered
                ? "translate(100%, -100%)"
                : "translate(0%, 0%)",
            }}
          >
            ↗
          </span>
        </div>
      </div>
    </a>
  );
}

// ============================================================================
// COMPONENT 3: Directional Underline Link
// ============================================================================

function DirectionalUnderlineLink({
  href,
  children,
  onClick,
}: {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [origin, setOrigin] = useState<"left" | "right">("left");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      onClick={onClick}
      data-cursor="pointer"
      onMouseEnter={() => {
        setOrigin("left");
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setOrigin("right");
        setIsHovered(false);
      }}
      className="group relative inline-block py-1 text-xs font-mono text-[#A68E94]/75 hover:text-[#F5EEF0] transition-colors select-none"
    >
      <span>{children}</span>
      <span
        style={{
          transformOrigin: origin === "left" ? "left center" : "right center",
          transform: isHovered ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="absolute bottom-0 left-0 w-full h-[1px] bg-[#6D001A] pointer-events-none"
      />
    </a>
  );
}

// ============================================================================
// COMPONENT 4: Dual-Row Velocity-Driven Counter Marquee
// ============================================================================

function VelocityCounterMarquee() {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const scrollVelocityRef = useRef(0);
  const pos1Ref = useRef(0);
  const pos2Ref = useRef(-600);
  const currentSpeedRef = useRef(TEXT_ANIM_CONFIG.marqueeBaseSpeed);
  const currentSkewRef = useRef(0);
  const currentDirRef = useRef(1);

  useLenis(
    useCallback((lenis: any) => {
      scrollVelocityRef.current = lenis.velocity || 0;
      ScrollTrigger.update();
    }, [])
  );

  useEffect(() => {
    let rafId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const v = scrollVelocityRef.current;
      const absV = Math.abs(v);

      // 1x idle up to 5x peak speed
      const targetMultiplier =
        TEXT_ANIM_CONFIG.marqueeBaseSpeed + Math.min(absV * 0.28, 4.0);

      // Horizontal skew clamped between -5deg and +5deg
      const targetSkew = Math.max(
        -TEXT_ANIM_CONFIG.velocitySkewMax,
        Math.min(TEXT_ANIM_CONFIG.velocitySkewMax, v * 0.35)
      );

      // Direction inversion: if scrolling upward, travel direction flips smoothly
      const targetDir = v < -0.1 ? -1 : 1;

      // Smooth exponential lerp
      currentSpeedRef.current += (targetMultiplier - currentSpeedRef.current) * 0.1;
      currentSkewRef.current += (targetSkew - currentSkewRef.current) * 0.1;
      currentDirRef.current += (targetDir - currentDirRef.current) * 0.08;

      const delta = currentSpeedRef.current * currentDirRef.current * dt * 85;

      pos1Ref.current = (pos1Ref.current - delta) % 1400;
      pos2Ref.current = (pos2Ref.current + delta) % 1400;

      if (row1Ref.current) {
        row1Ref.current.style.transform = `translate3d(${pos1Ref.current}px, 0, 0) skewX(${currentSkewRef.current}deg)`;
      }
      if (row2Ref.current) {
        row2Ref.current.style.transform = `translate3d(${pos2Ref.current}px, 0, 0) skewX(${-currentSkewRef.current}deg)`;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const row1Text =
    "LET'S TALK • चलो बात करते हैं • LET'S TALK • चलो बात करते हैं • LET'S TALK • चलो बात करते हैं • LET'S TALK • चलो बात करते हैं • ";
  const row2Text =
    "OPEN FOR COLLABORATION • चलो कुछ नया बनाते हैं • OPEN FOR COLLABORATION • चलो कुछ नया बनाते हैं • OPEN FOR COLLABORATION • चलो कुछ नया बनाते हैं • ";

  return (
    <div className="relative z-20 w-full overflow-hidden select-none py-8 border-y border-[#261015]/80 bg-[#000000]">
      {/* Row 1: Right-to-Left Loop */}
      <div className="relative flex whitespace-nowrap overflow-hidden">
        <div
          ref={row1Ref}
          className="flex items-center text-[clamp(1.15rem,2.1vw,1.9rem)] font-sans font-medium uppercase tracking-[0.22em] text-[#A68E94]/75 will-change-transform"
        >
          <span className="inline-block mr-6">{row1Text}</span>
          <span className="inline-block mr-6">{row1Text}</span>
          <span className="inline-block mr-6">{row1Text}</span>
        </div>
      </div>

      {/* Row 2: Left-to-Right Loop */}
      <div className="relative flex whitespace-nowrap overflow-hidden mt-3">
        <div
          ref={row2Ref}
          className="flex items-center text-[clamp(1.15rem,2.1vw,1.9rem)] font-sans font-medium uppercase tracking-[0.22em] text-[#A68E94]/55 will-change-transform"
        >
          <span className="inline-block mr-6">{row2Text}</span>
          <span className="inline-block mr-6">{row2Text}</span>
          <span className="inline-block mr-6">{row2Text}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: MirageFooterExperience (100% Text & UI Animation Architecture)
// ============================================================================

export function MirageFooterExperience() {
  const containerRef = useRef<HTMLElement>(null);
  const monumentRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [monumentLang, setMonumentLang] = useState<"EN" | "HI">("EN");
  const { scrollTo } = useSmoothScroll();

  // GSAP ScrollTrigger Orchestration
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Monumental Display Reveal
      if (monumentRef.current) {
        gsap.fromTo(
          monumentRef.current,
          {
            opacity: 0.35,
          },
          {
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: monumentRef.current,
              start: "top 90%",
              end: "top 55%",
              scrub: 0.8,
            },
          }
        );
      }

      // 3. Editorial 3-Column Grid: Split-Line Reveals & Hairline Border Draws
      const lineInners = gridRef.current?.querySelectorAll(".line-inner");
      if (lineInners && lineInners.length > 0) {
        gsap.fromTo(
          lineInners,
          {
            yPercent: 115,
            rotateZ: 2.5,
          },
          {
            yPercent: 0,
            rotateZ: 0,
            duration: 0.9,
            stagger: 0.045,
            ease: "cubic-bezier(0.16, 1, 0.3, 1)",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Hairline Border Draws
      const hairlines = gridRef.current?.querySelectorAll(".hairline-draw");
      if (hairlines && hairlines.length > 0) {
        gsap.fromTo(
          hairlines,
          {
            scaleX: 0,
            transformOrigin: "left center",
          },
          {
            scaleX: 1,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // CTA Pill Stagger Pop-In
      const pills = gridRef.current?.querySelectorAll(".cta-pill-item");
      if (pills && pills.length > 0) {
        gsap.fromTo(
          pills,
          {
            y: 24,
            opacity: 0,
            scale: 0.94,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    scrollTo(0, { duration: 1.4 });
  };

  return (
    <footer
      id="footer"
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#000000] text-[#F5EEF0] selection:bg-[#6D001A] selection:text-white"
    >
      {/* Anchor targets */}
      <span id="monument" className="absolute -top-24 pointer-events-none" />
      <span id="contact" className="absolute -top-24 pointer-events-none" />

      {/* Top Hairline Divider */}
      <div className="w-full border-t border-[#261015]/80" />

      {/* =================================================================== */}
      {/* 1. MONUMENTAL DISPLAY GLYPH MASK-RISE                               */}
      {/* =================================================================== */}
      <div className="relative w-full pt-10 sm:pt-14 md:pt-18 pb-4 sm:pb-6 overflow-hidden">
        {/* Language / Mode Switcher */}
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-10 lg:px-16 mb-4 sm:mb-6 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#A68E94]/70 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6D001A] animate-pulse" />
            <span>MONUMENTAL DISPLAY // 2026</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-[#261015]/80 bg-[#0A0204]/80 p-1 font-mono text-[11px] uppercase text-[#F5EEF0]">
            {(["EN", "HI"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setMonumentLang(lang)}
                data-cursor="pointer"
                className={`px-3 py-1 rounded-full transition-all duration-200 ${
                  monumentLang === lang
                    ? "bg-[#6D001A] text-[#000000] font-bold shadow-sm"
                    : "text-[#A68E94]/70 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Hover Sand-Particle Scatter & Mirage Turbulence Monument */}
        <div
          ref={monumentRef}
          className="w-full max-w-[1720px] mx-auto overflow-hidden select-none px-4 sm:px-8 md:px-12 flex items-center justify-center"
        >
          <SandTextMonument
            text={monumentLang === "HI" ? "कृष्ण" : "KRUXHNA"}
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. DUAL-ROW VELOCITY-DRIVEN COUNTER MARQUEE                         */}
      {/* =================================================================== */}
      <VelocityCounterMarquee />

      {/* =================================================================== */}
      {/* 3. EDITORIAL 3-COLUMN GRID: SPLIT-LINE REVEALS & HAIRLINES          */}
      {/* =================================================================== */}
      <div
        ref={gridRef}
        className="relative z-20 mx-auto w-full max-w-[1720px] px-6 sm:px-10 lg:px-16 pt-20 sm:pt-28 pb-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 lg:gap-14">
          {/* ── COL 1: LOCATIONS / ACADEMIC ROOTS (md:col-span-3) ── */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6D001A] select-none font-semibold">
              [ 01 // LOCATIONS ]
            </span>

            {/* Block 1: Mumbai */}
            <div className="relative pt-4">
              <div className="hairline-draw absolute top-0 left-0 w-full h-[1px] bg-[#261015]/80" />
              <h5 className="font-sans text-lg font-medium text-[#F5EEF0]">
                <SplitMaskedText text="Mumbai / India" />
              </h5>
              <p className="font-mono text-xs text-[#A68E94]/75 mt-1 leading-relaxed">
                <SplitMaskedText text="Navi Mumbai, Uran • UTC+5:30" />
              </p>
            </div>

            {/* Block 2: Rigor */}
            <div className="relative pt-4 mt-2">
              <div className="hairline-draw absolute top-0 left-0 w-full h-[1px] bg-[#261015]/80" />
              <h5 className="font-sans text-lg font-medium text-[#F5EEF0]">
                <SplitMaskedText text="Systems & ML Rigor" />
              </h5>
              <p className="font-mono text-xs text-[#A68E94]/75 mt-1 leading-relaxed">
                <SplitMaskedText text="B.E. AIML • Mumbai University" />
              </p>
            </div>
          </div>

          {/* ── COL 2: MAIN CTA & MAGNETIC PILLS (md:col-span-6) ── */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6D001A] select-none font-semibold">
                [ 02 // COLLABORATION ]
              </span>

              {/* Headline with Masked Split-Line Reveal */}
              <h3 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-[#F5EEF0] tracking-[-0.035em] leading-[1.12] mt-4 max-w-xl">
                <SplitMaskedText text="Ready to build something extraordinary?" />
              </h3>
            </div>

            {/* 3 Tactile Magnetic Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 mt-8 sm:mt-10">
              <div className="cta-pill-item">
                <SlotMachinePill
                  href="/resume.pdf"
                  label="Get the resume ↗"
                  icon={<FileText className="h-4 w-4" />}
                  external
                />
              </div>
              <div className="cta-pill-item">
                <SlotMachinePill
                  href={`mailto:${PERSONAL_INFO.email}`}
                  label="Drop a line ↗"
                  icon={<Mail className="h-4 w-4" />}
                  external
                />
              </div>
              <div className="cta-pill-item">
                <SlotMachinePill
                  href={`mailto:${PERSONAL_INFO.email}?subject=Collaboration%20Inquiry`}
                  label="Let's talk ↗"
                  icon={<Send className="h-4 w-4" />}
                  primary
                  external
                />
              </div>
            </div>
          </div>

          {/* ── COL 3: SOCIAL ROWS (md:col-span-3) ── */}
          <div className="md:col-span-3 flex flex-col">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#6D001A] select-none font-semibold mb-4">
              [ 03 // NETWORK ]
            </span>

            <div className="flex flex-col">
              <SocialRow
                href={PERSONAL_INFO.github}
                label="GitHub"
                sublabel="// @Kruxhna"
              />
              <SocialRow
                href={PERSONAL_INFO.linkedin}
                label="LinkedIn"
                sublabel="// in/krushna-nole"
              />
              <SocialRow
                href={PERSONAL_INFO.codolio}
                label="LeetCode"
                sublabel="// Codolio Archive"
              />
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. LEGAL BAR & DIRECTIONAL UNDERLINE MICRO-LINKS                    */}
        {/* =================================================================== */}
        <div className="mt-14 pt-8 border-t border-[#261015]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6 font-mono text-xs text-[#A68E94]/75">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>© 2026 Krushna Nole. All rights reserved.</span>
            <span className="text-[#A68E94]/30">•</span>
            <DirectionalUnderlineLink href={`mailto:${PERSONAL_INFO.email}`}>
              {PERSONAL_INFO.email}
            </DirectionalUnderlineLink>
            <span className="text-[#A68E94]/30">•</span>
            <span>Uran, Navi Mumbai</span>
          </div>

          <div className="flex items-center gap-6 self-start sm:self-auto">
            <DirectionalUnderlineLink onClick={scrollToTop}>
              Back to top ↑
            </DirectionalUnderlineLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default MirageFooterExperience;
