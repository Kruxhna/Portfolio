"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Letter3DViewer } from "@/components/ui/Letter3DViewer";

const ACCENT_COLOR = "#3ecf8e";

const ALIAS_LIST = [
  "rset", "Kruxhna", "krush", "0xKrush", "aiml-k", "5<4t", "kru",
];
// scramble pool: lowercase + a few specials matching the spec
const GLYPH_CHARS = "abcdefghijklmnopqrstuvwxyz#%4!@*";

const WORDMARK = "krushna".split("");

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
  const cursorRingRef = useRef<HTMLDivElement>(null);

  // cursor state (only updated in mouse events → used as targets in RAF)
  const cursorRef = useRef({ x: 0, y: 0, overWordmark: false });
  // animated cursor ring position
  const ringPosRef = useRef({ x: -200, y: -200 }); // start offscreen
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

      // Check if cursor is over wordmark zone
      const wm = wordmarkRef.current;
      if (wm) {
        const r = wm.getBoundingClientRect();
        const pad = 24;
        cursorRef.current.overWordmark =
          e.clientX >= r.left - pad && e.clientX <= r.right + pad &&
          e.clientY >= r.top - pad && e.clientY <= r.bottom + pad;
      }
    };
    const handleMouseLeave = () => {
      cursorRef.current.overWordmark = false;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

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

      // ── Cursor ring ─────────────────────────────────────────────────────
      const ring = cursorRingRef.current;
      if (ring) {
        ringPosRef.current.x = damp(ringPosRef.current.x, cursorRef.current.x, 12, dt);
        ringPosRef.current.y = damp(ringPosRef.current.y, cursorRef.current.y, 12, dt);
        ring.style.transform = `translate(${ringPosRef.current.x - 50}px, ${ringPosRef.current.y - 50}px)`;
        // Grow ring over wordmark
        if (cursorRef.current.overWordmark) {
          ring.classList.add("over-wordmark");
        } else {
          ring.classList.remove("over-wordmark");
        }
      }

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
      window.removeEventListener("mouseleave", handleMouseLeave);
      io.disconnect();
    };
  }, []);

  return (
    <>
      {/* ── Custom cursor ring (fixed, outside section) ─────────────────── */}
      <div id="cursor-ring" ref={cursorRingRef} aria-hidden="true" />

      <section
        ref={sectionRef}
        id="about"
        className="relative w-full bg-[#0f1115] select-none"
        style={{ height: "100dvh", overflow: "hidden" }}
      >
        {/*
          Outer: full-height flex column, 2.5vw side padding.
          Rows:
            1. Upper zone: flex-1  (left text + right 3D K)
            2. Wordmark zone: shrink-0, pinned to bottom
        */}
        <div
          className="w-full h-full flex flex-col"
          style={{ padding: "0 2.5vw" }}
        >

          {/* ── UPPER ZONE ──────────────────────────────────────────────── */}
          <div
            className="flex-1 min-h-0 flex flex-row items-start justify-between"
            style={{ paddingTop: "clamp(5.5rem, 8vh, 7rem)" }}
          >

            {/* ── LEFT COLUMN ───────────────────────────────────────────── */}
            <div
              className="flex flex-col items-start"
              style={{ maxWidth: "min(40rem, 54vw)" }}
            >

              {/* Eyebrow — delay 0.05s */}
              <p
                className="hero-animate hero-fade-up font-mono uppercase text-[#6b7280] mb-3"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  animationDelay: "0.05s",
                }}
              >
                STUDENT DEVELOPER · INDIA
              </p>

              {/* Headline — delay 0.18s; line-by-line stagger via clip-mask */}
              <h2
                className="hero-animate hero-fade-up text-[#eeeef2] font-sans font-normal select-text"
                style={{
                  fontSize: "clamp(40px, 3.4vw, 64px)",
                  lineHeight: 1.25,
                  fontWeight: 450,
                  animationDelay: "0.18s",
                }}
              >
                I{" "}
                <span className="font-mono font-normal" style={{ color: ACCENT_COLOR }}>
                  script
                </span>
                ,{" "}
                <span className="font-mono font-normal" style={{ color: ACCENT_COLOR }}>
                  automate
                </span>{" "}
                and{" "}
                <span className="font-mono font-normal" style={{ color: ACCENT_COLOR }}>
                  build
                </span>{" "}
                tools that fix the{" "}
                <span
                  className="font-mono font-normal headline-accent-underline"
                  style={{
                    color: "#eeeef2",
                    textDecorationColor: ACCENT_COLOR,
                  }}
                >
                  small annoyances
                </span>{" "}
                everyone else just puts up with.
              </h2>

              {/* Alias — delay 0.38s */}
              <div
                className="hero-animate hero-fade-up mt-1 inline-flex items-center gap-2 font-mono cursor-pointer group transition-opacity hover:opacity-70 select-none"
                style={{
                  marginLeft: "clamp(200px, 18vw, 320px)",
                  fontSize: "clamp(16px, 1.25vw, 20px)",
                  color: ACCENT_COLOR,
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
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M4 6c0 6 5 11 14 11" />
                  <polyline points="14 13 18 17 14 21" />
                </svg>
              </div>

            </div>

            {/* ── RIGHT ZONE: 3D K — delay 0.30s ───────────────────────── */}
            <div
              className="hero-animate hero-k shrink-0 flex items-start justify-end"
              style={{
                width: "clamp(240px, 35vw, 560px)",
                marginTop: "-0.5rem",
                animationDelay: "0.30s",
              }}
            >
              <Letter3DViewer accentColor={ACCENT_COLOR} />
            </div>

          </div>

          {/* ── WORDMARK ZONE ────────────────────────────────────────────── */}
          <div
            className="w-full shrink-0 flex flex-col justify-end"
            style={{ paddingBottom: "clamp(2rem, 5vh, 4rem)" }}
          >
            {/*
              "krushna" wordmark — split into one <span> per letter.
              aria-label on the h1 for screen readers; spans aria-hidden.
              clip: overflow-visible so letters don't get cut during variable-font animation.
              font-kerning: none keeps spacing stable while axes change.
            */}
            <h1
              ref={wordmarkRef}
              aria-label="krushna"
              className="hero-animate font-sans font-black whitespace-nowrap overflow-visible leading-none text-[#eeeef2]"
              style={{
                fontSize: "clamp(8rem, min(31vw, 33vh), 36rem)",
                letterSpacing: "-0.045em",
                lineHeight: 0.85,
                textShadow: "none",
                fontKerning: "none",
                animationName: "none", // letters animate individually below
                opacity: 1,
              }}
            >
              {WORDMARK.map((letter, i) => (
                <span
                  key={i}
                  ref={(el) => { letterSpanRefs.current[i] = el; }}
                  aria-hidden="true"
                  className="hero-letter wordmark-letter"
                  style={{
                    animationDelay: `${0.48 + i * 0.05}s`,
                  }}
                >
                  {letter}
                </span>
              ))}
            </h1>

            {/* 1px divider — delay 0.72s, expands left→right */}
            <div
              className="hero-animate hero-divider w-full h-px mt-3"
              style={{
                background: "rgba(255,255,255,0.08)",
                animationDelay: "0.72s",
              }}
            />
          </div>

        </div>
      </section>
    </>
  );
}
