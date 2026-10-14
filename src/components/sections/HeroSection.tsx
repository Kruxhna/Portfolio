"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
  type MotionValue,
} from "framer-motion";
import { Letter3DViewer } from "@/components/ui/Letter3DViewer";

const ACCENT_COLOR = "#AD6A4C";

const ALIAS_LIST = [
  "rset", "Kruxhna", "krush", "0xKrush", "aiml-k", "5<4t", "kru",
];
// scramble pool: lowercase + a few specials matching the spec
const GLYPH_CHARS = "abcdefghijklmnopqrstuvwxyz#%4!@*";

const WORDMARK = "krushna".split("");

// deterministic per-character scatter vectors (targets at 900px scroll & click burst impulses)
interface ScatterVector {
  targetX: number;
  targetY: number;
  targetRotate: number;
  burstX: number;
  burstY: number;
  burstRotate: number;
}

const SCATTER_VECTORS: ScatterVector[] = [
  // 0: 'k' - Pulls up-left toward the top-left navbar logo and tilts counter-clockwise
  { targetX: -65, targetY: -150, targetRotate: -38, burstX: -95, burstY: -70, burstRotate: -40 },
  // 1: 'r' - Drops down-left across the Hero/Work divider, hovering near the left edge of "things"
  { targetX: -35, targetY: 470, targetRotate: -22, burstX: -55, burstY: 90, burstRotate: -25 },
  // 2: 'u' - Travels down with the scroll to float directly over the "things i made" headline
  { targetX: 85, targetY: 630, targetRotate: 32, burstX: 45, burstY: -90, burstRotate: 30 },
  // 3: 's' - Drifts diagonally down-center over the middle of "things i made"
  { targetX: 195, targetY: 545, targetRotate: -28, burstX: 85, burstY: 80, burstRotate: -35 },
  // 4: 'h' - Floats over the upper-center space between "things" and the right column
  { targetX: 300, targetY: 410, targetRotate: 24, burstX: 115, burstY: -80, burstRotate: 25 },
  // 5: 'n' - Drifts wide right and down into the (01) WORK section
  { targetX: 400, targetY: 590, targetRotate: -19, burstX: 145, burstY: 90, burstRotate: -30 },
  // 6: 'a' - Shoots toward the upper-right of the (01) WORK section with a clockwise tilt
  { targetX: 500, targetY: 360, targetRotate: 35, burstX: 185, burstY: -65, burstRotate: 40 },
];

interface ScatterLetterProps {
  letter: string;
  index: number;
  scrollY: MotionValue<number>;
  isScattered: boolean;
  reducedMotion: boolean;
  innerRef: (el: HTMLSpanElement | null) => void;
  onRegisterBurst: (fn: () => void) => void;
  onLetterClick: () => void;
}

function ScatterLetter({
  letter,
  index,
  scrollY,
  isScattered,
  reducedMotion,
  innerRef,
  onRegisterBurst,
  onLetterClick,
}: ScatterLetterProps) {
  const vector = SCATTER_VECTORS[index] || {
    targetX: (index - 3) * 70,
    targetY: 400,
    targetRotate: (index % 2 === 0 ? 1 : -1) * 25,
    burstX: (index - 3) * 45,
    burstY: -50,
    burstRotate: (index % 2 === 0 ? 1 : -1) * 30,
  };

  const springConfig = { stiffness: 85, damping: 20, mass: 0.8 };

  // Scroll-driven transforms mapped across [0, 900px]
  const targetX = reducedMotion ? 0 : vector.targetX;
  const targetY = reducedMotion ? 0 : vector.targetY;
  const targetRot = reducedMotion ? 0 : vector.targetRotate;

  const rawScrollX = useTransform(scrollY, [0, 900], [0, targetX]);
  const rawScrollY = useTransform(scrollY, [0, 900], [0, targetY]);
  const rawScrollRotate = useTransform(scrollY, [0, 900], [0, targetRot]);

  const springScrollX = useSpring(rawScrollX, springConfig);
  const springScrollY = useSpring(rawScrollY, springConfig);
  const springScrollRotate = useSpring(rawScrollRotate, springConfig);

  // Click burst impulse values
  const clickX = useMotionValue(0);
  const clickY = useMotionValue(0);
  const clickRotate = useMotionValue(0);

  const triggerBurst = useCallback(() => {
    if (reducedMotion) return;
    clickX.set(vector.burstX);
    clickY.set(vector.burstY);
    clickRotate.set(vector.burstRotate);

    animate(clickX, 0, {
      type: "spring",
      stiffness: 95,
      damping: 14,
      mass: 0.6,
    });
    animate(clickY, 0, {
      type: "spring",
      stiffness: 95,
      damping: 14,
      mass: 0.6,
    });
    animate(clickRotate, 0, {
      type: "spring",
      stiffness: 95,
      damping: 14,
      mass: 0.6,
    });
  }, [reducedMotion, vector, clickX, clickY, clickRotate]);

  useEffect(() => {
    onRegisterBurst(triggerBurst);
  }, [onRegisterBurst, triggerBurst]);

  // Combined transforms (scroll physics + click impulse)
  const totalX = useTransform([springScrollX, clickX], ([sx, cx]) => Number(sx) + Number(cx));
  const totalY = useTransform([springScrollY, clickY], ([sy, cy]) => Number(sy) + Number(cy));
  const totalRotate = useTransform([springScrollRotate, clickRotate], ([sr, cr]) => Number(sr) + Number(cr));

  return (
    <motion.span
      className={`inline-block relative select-none ${
        isScattered ? "pointer-events-none" : "pointer-events-auto cursor-pointer"
      }`}
      onClick={(e) => {
        if (!isScattered) {
          e.stopPropagation();
          onLetterClick();
        }
      }}
      style={{
        x: totalX,
        y: totalY,
        rotate: totalRotate,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Inner span: preserves entrance animation and fontVariationSettings */}
      <span
        ref={innerRef}
        aria-hidden="true"
        className="hero-letter wordmark-letter inline-block"
        style={{
          animationDelay: `${0.48 + index * 0.05}s`,
        }}
      >
        {letter}
      </span>
    </motion.span>
  );
}

// smoothstep: maps t in [0,1] → smooth 0..1
function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

// frame-rate-independent exponential damping
function damp(current: number, target: number, speed: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

export function HeroSection() {
  // ── alias scramble state ──────────────────────────────────────────────────
  const [displayedAlias, setDisplayedAlias] = useState(ALIAS_LIST[0]);
  const aliasIndexRef = useRef(0);
  const isScramblingRef = useRef(false);
  const scrambleIvRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrambleToNext = useCallback(() => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;

    const nextIdx = (aliasIndexRef.current + 1) % ALIAS_LIST.length;
    aliasIndexRef.current = nextIdx;
    const target = ALIAS_LIST[nextIdx];
    let i = 0;
    const max = target.length * 3; // ~600ms at 35ms interval

    if (scrambleIvRef.current) clearInterval(scrambleIvRef.current);
    scrambleIvRef.current = setInterval(() => {
      // Pause when tab hidden
      if (document.hidden) return;
      setDisplayedAlias(() =>
        target.split("").map((_, idx) => {
          if (idx < i / 3) return target[idx];
          return GLYPH_CHARS[Math.floor(Math.random() * GLYPH_CHARS.length)];
        }).join("")
      );
      i++;
      if (i >= max) {
        if (scrambleIvRef.current) clearInterval(scrambleIvRef.current);
        setDisplayedAlias(target);
        isScramblingRef.current = false;
      }
    }, 35);
  }, []);

  // Auto-cycle alias every 3.5s, paused when tab hidden
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) scrambleToNext();
    }, 3500);
    return () => {
      clearInterval(timer);
      if (scrambleIvRef.current) clearInterval(scrambleIvRef.current);
    };
  }, [scrambleToNext]);

  // ── refs for RAF loop ─────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLHeadingElement>(null);
  const letterSpanRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // cursor state (only updated in mouse events → used as targets in RAF)
  const cursorRef = useRef({ x: 0, y: 0 });
  // per-letter variable font axes [wght, wdth]
  const letterAxesRef = useRef<{ wght: number; wdth: number }[]>(
    WORDMARK.map(() => ({ wght: 900, wdth: 125 }))
  );
  const letterRectCacheRef = useRef<DOMRect[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isVisibleRef = useRef(true);

  // ── RAF main loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return; // entrance CSS handles reduced motion

    // Radius for wordmark letter influence: ~18vw in px
    const getRadius = () => window.innerWidth * 0.18;

    // Recompute letter rects (called on resize / scroll)
    const updateRects = () => {
      letterRectCacheRef.current = letterSpanRefs.current.map(
        (el) => el?.getBoundingClientRect() ?? new DOMRect()
      );
    };

    // Initial rect computation after paint
    const initTimer = setTimeout(updateRects, 300);

    const handleResize = () => updateRects();
    const handleScroll = () => updateRects();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // IntersectionObserver: pause RAF when hero is offscreen
    const io = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.01 }
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    // Mouse tracking — only update targets, never animate directly
    const handleMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ── The shared RAF loop ───────────────────────────────────────────────
    const tick = (now: number) => {
      rafRef.current = requestAnimationFrame(tick);

      // Pause when tab hidden or hero offscreen
      if (document.hidden || !isVisibleRef.current) {
        lastTimeRef.current = now;
        return;
      }

      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.05);
      lastTimeRef.current = now;

      // ── Variable font wordmark letters ─────────────────────────────────
      const radius = getRadius();
      const axes = letterAxesRef.current;
      const rects = letterRectCacheRef.current;
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;

      for (let i = 0; i < WORDMARK.length; i++) {
        const rect = rects[i];
        if (!rect) continue;
        const lx = rect.left + rect.width / 2;
        const ly = rect.top + rect.height / 2;
        const dist = Math.sqrt((cx - lx) ** 2 + (cy - ly) ** 2);
        // influence 0 (far) → 1 (close); smoothstep
        const rawT = 1 - dist / radius;
        const influence = smoothstep(Math.max(0, rawT));

        // Near cursor: lighter (wght 200, wdth 62); far: heavy (wght 900, wdth 125)
        const targetWght = 900 - influence * 700;   // 900 → 200
        const targetWdth = 125 - influence * 63;    // 125 → 62

        axes[i].wght = damp(axes[i].wght, targetWght, 7, dt);
        axes[i].wdth = damp(axes[i].wdth, targetWdth, 7, dt);

        const el = letterSpanRefs.current[i];
        if (el) {
          el.style.fontVariationSettings = `"wght" ${axes[i].wght.toFixed(1)}, "wdth" ${axes[i].wdth.toFixed(1)}`;
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(initTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      io.disconnect();
    };
  }, []);

  // ── scroll & physics scatter state ─────────────────────────────────────────
  const { scrollY } = useScroll();
  const [isScattered, setIsScattered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const burstFnsRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScattered(latest > 40);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const handleWordmarkClick = useCallback(() => {
    if (isScattered) return;
    burstFnsRef.current.forEach((fn) => fn?.());
  }, [isScattered]);

  return (
    <>
      <section
        ref={sectionRef}
        id="about"
        className="relative w-full bg-transparent select-none overflow-visible pointer-events-none"
        style={{ height: "100dvh" }}
      >
        {/*
          Outer: full-height flex column, 2.5vw side padding.
          Rows:
            1. Upper zone: flex-1  (left text + right 3D K)
            2. Wordmark zone: shrink-0, pinned to bottom
        */}
        <div
          className="w-full h-full flex flex-col overflow-visible pointer-events-none"
          style={{ padding: "0 2.5vw" }}
        >

          {/* ── UPPER ZONE ──────────────────────────────────────────────── */}
          <div
            className="flex-1 min-h-0 flex flex-row items-start justify-between pointer-events-none"
            style={{ paddingTop: "clamp(5.5rem, 8vh, 7rem)" }}
          >

            {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
            <div
              className="flex flex-col items-start pointer-events-none"
              style={{ maxWidth: "min(40rem, 54vw)" }}
            >

              {/* Eyebrow — delay 0.05s */}
              <p
                className="hero-animate hero-fade-up font-mono uppercase text-[rgba(222,193,180,0.55)] tracking-widest mb-3 pointer-events-none"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  animationDelay: "0.05s",
                }}
              >
                STUDENT DEVELOPER · INDIA
              </p>

              {/* Headline — delay 0.18s */}
              <h2
                className="hero-animate hero-fade-up text-[#DEC1B4] font-sans font-normal pointer-events-none"
                style={{
                  fontSize: "clamp(36px, 3.2vw, 58px)",
                  lineHeight: 1.25,
                  fontWeight: 450,
                  animationDelay: "0.18s",
                }}
              >
                I{" "}
                <span className="font-mono font-medium" style={{ color: "#AD6A4C" }}>
                  profile
                </span>
                ,{" "}
                <span className="font-mono font-medium" style={{ color: "#AD6A4C" }}>
                  optimize
                </span>{" "}
                and{" "}
                <span className="font-mono font-medium" style={{ color: "#AD6A4C" }}>
                  scale
                </span>{" "}
                engines that turn{" "}
                <span
                  className="font-serif italic font-normal headline-accent-underline"
                  style={{
                    color: "#EEDED7",
                    textDecorationColor: "#BF866D",
                  }}
                >
                  heavy math
                </span>{" "}
                into millisecond latency.
              </h2>

              {/* Handwritten Footnote (aka rset + Curved Arrow) — delay 0.38s */}
              <div
                data-cursor="magnetic"
                className="hero-animate hero-fade-up mt-1 inline-flex items-center gap-2 font-mono cursor-pointer group transition-opacity hover:opacity-75 select-none pointer-events-auto"
                style={{
                  marginLeft: "clamp(200px, 18vw, 320px)",
                  fontSize: "clamp(15px, 1.2vw, 19px)",
                  color: "#AD6A4C",
                  animationDelay: "0.38s",
                }}
                onClick={scrambleToNext}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && scrambleToNext()}
                title="Click to shuffle alias"
              >
                <span>aka {displayedAlias}</span>
                <svg
                  className="w-5 h-5 translate-y-0.5 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 24 24" fill="none" stroke="#AD6A4C"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M4 6c0 6 5 11 14 11" />
                  <polyline points="14 13 18 17 14 21" />
                </svg>
              </div>

            </div>

            {/* ── RIGHT ZONE: 3D K — delay 0.30s ───────────────────────── */}
            <div
              className="hero-animate hero-k shrink-0 flex items-start justify-end pointer-events-none"
              style={{
                width: "clamp(240px, 35vw, 560px)",
                marginTop: "-0.5rem",
                animationDelay: "0.30s",
              }}
            >
              <Letter3DViewer accentColor="#AD6A4C" />
            </div>

          </div>

          {/* ── WORDMARK ZONE ────────────────────────────────────────────── */}
          <div
            className="w-full shrink-0 flex flex-col justify-end relative z-30 overflow-visible pointer-events-none"
            style={{ paddingBottom: "clamp(1.5rem, 4vh, 3rem)" }}
          >
            {/*
              "krushna" wordmark — split into one <span> per letter with scroll/click scatter.
              Color: Rodeo Dust (#DEC1B4)
              leading-[0.82], clamp(4.2rem, 12vw, 13.5rem)
            */}
            <h1
              ref={wordmarkRef}
              data-cursor="invert"
              aria-label="krushna"
              onClick={handleWordmarkClick}
              className={`hero-animate font-sans font-black whitespace-nowrap overflow-visible text-[#DEC1B4] relative z-30 select-none ${
                isScattered ? "pointer-events-none" : "pointer-events-auto cursor-pointer"
              }`}
              style={{
                fontSize: "clamp(4.2rem, 12vw, 13.5rem)",
                letterSpacing: "-0.045em",
                lineHeight: 0.82,
                textShadow: "none",
                fontKerning: "none",
                animationName: "none", // letters animate individually below
                opacity: 1,
              }}
            >
              {WORDMARK.map((letter, i) => (
                <ScatterLetter
                  key={i}
                  letter={letter}
                  index={i}
                  scrollY={scrollY}
                  isScattered={isScattered}
                  reducedMotion={reducedMotion}
                  innerRef={(el) => {
                    letterSpanRefs.current[i] = el;
                  }}
                  onRegisterBurst={(fn) => {
                    burstFnsRef.current[i] = fn;
                  }}
                  onLetterClick={handleWordmarkClick}
                />
              ))}
            </h1>

            {/* 1px divider — delay 0.72s, expands left→right */}
            <div
              className="hero-animate hero-divider w-full h-px mt-3 relative z-10 pointer-events-none"
              style={{
                background: "rgba(206, 164, 145, 0.14)",
                animationDelay: "0.72s",
              }}
            />
          </div>

        </div>
      </section>
    </>
  );
}
