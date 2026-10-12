"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Letter3DViewer } from "@/components/ui/Letter3DViewer";

const ACCENT_COLOR = "#3ecf8e";

const ALIAS_LIST = [
  "rset", "Kruxhna", "krush", "0xKrush", "aiml-k", "5<4t", "kru",
];

const GLYPH_CHARS = "!@#$%^&*()_+~|}{[]:;?><";

export function HeroSection() {
  const [aliasIndex, setAliasIndex] = useState(0);
  const [displayedAlias, setDisplayedAlias] = useState(ALIAS_LIST[0]);
  const [isScrambling, setIsScrambling] = useState(false);

  const aliasIndexRef = useRef(0);
  const isScramblingRef = useRef(false);
  const scrambleIvRef = useRef<NodeJS.Timeout | null>(null);

  const scrambleToNext = useCallback(() => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;
    setIsScrambling(true);

    const nextIdx = (aliasIndexRef.current + 1) % ALIAS_LIST.length;
    aliasIndexRef.current = nextIdx;
    setAliasIndex(nextIdx);

    const target = ALIAS_LIST[nextIdx];
    let i = 0;
    const max = target.length * 3;

    if (scrambleIvRef.current) clearInterval(scrambleIvRef.current);
    scrambleIvRef.current = setInterval(() => {
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
        setIsScrambling(false);
        isScramblingRef.current = false;
      }
    }, 35);
  }, []);

  // Automatic periodic shuffle every 3.8s
  useEffect(() => {
    const timer = setInterval(() => {
      scrambleToNext();
    }, 3800);
    return () => {
      clearInterval(timer);
      if (scrambleIvRef.current) clearInterval(scrambleIvRef.current);
    };
  }, [scrambleToNext]);

  return (
    <section
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

        {/* ── UPPER ZONE ────────────────────────────────────────────────── */}
        <div
          className="flex-1 min-h-0 flex flex-row items-start justify-between"
          style={{ paddingTop: "clamp(5.5rem, 8vh, 7rem)" }}
        >

          {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
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

            {/* Headline — delay 0.18s */}
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
                className="font-mono font-normal"
                style={{
                  color: "#eeeef2",
                  textDecoration: "underline dashed",
                  textDecorationColor: ACCENT_COLOR,
                  textUnderlineOffset: "6px",
                  textDecorationThickness: "2px",
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

          {/* ── RIGHT ZONE: 3D K — delay 0.30s ─────────────────────────── */}
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

        {/* ── WORDMARK ZONE ─────────────────────────────────────────────── */}
        <div
          className="w-full shrink-0 flex flex-col justify-end"
          style={{ paddingBottom: "clamp(2rem, 5vh, 4rem)" }}
        >
          {/* "krushna" — 3× bigger, slides up dramatically, delay 0.48s */}
          <h1
            className="hero-animate hero-wordmark font-sans font-black whitespace-nowrap overflow-visible leading-none text-[#eeeef2]"
            style={{
              fontSize: "clamp(8rem, min(31vw, 33vh), 36rem)",
              letterSpacing: "-0.045em",
              lineHeight: 0.85,
              textShadow: "none",
              animationDelay: "0.48s",
            }}
          >
            krushna
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
  );
}
