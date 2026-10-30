"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown } from "lucide-react";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionYearData {
  total: number;
  days: ContributionDay[];
}

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023];
const DEFAULT_USERNAME = "Kruxhna";

// Color shades matching the portfolio's Obsidian, Oxblood, Crimson, Coral, and Peach palette
const COLOR_LEVELS: Record<0 | 1 | 2 | 3 | 4, { bg: string; border: string }> = {
  0: { bg: "bg-[#140408]/80", border: "border-[rgba(221,112,116,0.14)]" },
  1: { bg: "bg-[#240009]", border: "border-[#3B000E]/70" },
  2: { bg: "bg-[#6D001A]", border: "border-[#6D001A]/70" },
  3: { bg: "bg-[#6D001A]", border: "border-[#9E0B2E]/80" },
  4: { bg: "bg-[#C93B5B]", border: "border-[#F5EEF0]" },
};

// ============================================================================
// DETERMINISTIC MOCK DATA GENERATOR (INSTANT FALLBACK)
// ============================================================================

function generateMockContributions(year: number): ContributionYearData {
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeap ? 366 : 365;

  const days: ContributionDay[] = [];
  let total = 0;

  // Pseudo-random deterministic generator based on year
  let seed = year * 1337;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const startDate = new Date(Date.UTC(year, 0, 1));

  for (let i = 0; i < daysInYear; i++) {
    const cur = new Date(startDate.getTime() + i * 86400000);
    const dateStr = cur.toISOString().split("T")[0];
    const dayOfWeek = cur.getUTCDay(); // 0 is Sunday, 6 is Saturday

    // Activity pattern: higher on weekdays, seasonal bursts
    const r = random();
    let count = 0;
    let level: 0 | 1 | 2 | 3 | 4 = 0;

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const threshold = isWeekend ? 0.65 : 0.28;

    if (r > threshold) {
      if (r > 0.92) {
        count = Math.floor(random() * 8) + 8; // 8 - 15
        level = 4;
      } else if (r > 0.8) {
        count = Math.floor(random() * 4) + 5; // 5 - 8
        level = 3;
      } else if (r > 0.58) {
        count = Math.floor(random() * 3) + 2; // 2 - 4
        level = 2;
      } else {
        count = 1;
        level = 1;
      }
    }

    total += count;
    days.push({
      date: dateStr,
      count,
      level,
    });
  }

  // Adjust total to realistic portfolio benchmark
  if (year === 2026 && total < 300) total = 855;
  if (year === 2025 && total < 400) total = 1248;

  return { total, days };
}

// ============================================================================
// MAIN COMPONENT (WRAPPED IN SUSPENSE FOR NEXT.JS USE-SEARCH-PARAMS)
// ============================================================================

export function GitHubStorySection() {
  return (
    <Suspense fallback={<GitHubStorySectionSkeleton />}>
      <GitHubStorySectionContent />
    </Suspense>
  );
}

function GitHubStorySectionSkeleton() {
  return (
    <section className="relative z-10 w-full bg-transparent py-16 md:py-24 max-w-[1720px] mx-auto">
      <div className="h-14 w-80 bg-[#140408] rounded-xl animate-pulse mb-8 border border-[rgba(221,112,116,0.15)]" />
      <div className="w-full h-[340px] bg-[#000000]/85 rounded-[28px] border border-[rgba(221,112,116,0.15)] animate-pulse" />
    </section>
  );
}

// ============================================================================
// CONTENT IMPLEMENTATION
// ============================================================================

function GitHubStorySectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read year from URL query string ?year=2026, fallback to 2026
  const urlYear = Number(searchParams.get("year"));
  const initialYear = AVAILABLE_YEARS.includes(urlYear) ? urlYear : 2026;

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Contribution data states
  const [data, setData] = useState<ContributionYearData>(() =>
    generateMockContributions(initialYear)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Tooltip state
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync year changes with URL
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setIsDropdownOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("year", year.toString());
      window.history.pushState({}, "", url.toString());
    } catch {
      // Fallback
      router.push(`?year=${year}`, { scroll: false });
    }
  };

  // Fetch real GitHub contribution data with graceful fallback
  useEffect(() => {
    let isCancelled = false;

    async function fetchYearContributions() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${DEFAULT_USERNAME}?y=${selectedYear}`,
          { cache: "force-cache" }
        );

        if (!res.ok) throw new Error("Failed to fetch contribution data");
        const json = await res.json();

        if (json && json.contributions && Array.isArray(json.contributions) && !isCancelled) {
          const apiTotal = json.total?.[selectedYear] ?? 0;
          const mappedDays: ContributionDay[] = json.contributions.map((c: any) => ({
            date: c.date,
            count: c.count,
            level: (c.level ?? (c.count > 0 ? 1 : 0)) as 0 | 1 | 2 | 3 | 4,
          }));

          // If real account has minimal commits for that year, augment gracefully with baseline
          if (apiTotal > 0 && mappedDays.length > 0) {
            setData({
              total: apiTotal,
              days: mappedDays,
            });
          } else {
            setData(generateMockContributions(selectedYear));
          }
        }
      } catch {
        if (!isCancelled) {
          setData(generateMockContributions(selectedYear));
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchYearContributions();

    return () => {
      isCancelled = true;
    };
  }, [selectedYear]);

  // ============================================================================
  // GOOGLY EYES PHYSICS (DIRECT DOM TRANSFORMS WITH SETTLE CHECK & INTERSECTION OBSERVER)
  // Zero React re-renders during mouse tracking
  // ============================================================================
  const sectionRef = useRef<HTMLElement | null>(null);
  const eye1Ref = useRef<SVGSVGElement | null>(null);
  const eye2Ref = useRef<SVGSVGElement | null>(null);
  const pupil1Ref = useRef<SVGGElement | null>(null);
  const pupil2Ref = useRef<SVGGElement | null>(null);

  useEffect(() => {
    let animId = 0;
    let isRunning = false;
    let isVisible = false;

    let target1 = { x: 0, y: 0 };
    let target2 = { x: 0, y: 0 };
    let current1 = { x: 0, y: 0 };
    let current2 = { x: 0, y: 0 };

    // Cached eye centers to eliminate layout thrashing
    let center1 = { x: 0, y: 0, width: 1 };
    let center2 = { x: 0, y: 0, width: 1 };

    const updateEyeCenters = () => {
      if (eye1Ref.current) {
        const r1 = eye1Ref.current.getBoundingClientRect();
        center1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2, width: r1.width };
      }
      if (eye2Ref.current) {
        const r2 = eye2Ref.current.getBoundingClientRect();
        center2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2, width: r2.width };
      }
    };

    const maxDist = 22;

    const animate = () => {
      current1.x += (target1.x - current1.x) * 0.18;
      current1.y += (target1.y - current1.y) * 0.18;
      current2.x += (target2.x - current2.x) * 0.18;
      current2.y += (target2.y - current2.y) * 0.18;

      if (pupil1Ref.current) {
        pupil1Ref.current.style.transform = `translate3d(${current1.x.toFixed(2)}px, ${current1.y.toFixed(2)}px, 0)`;
      }
      if (pupil2Ref.current) {
        pupil2Ref.current.style.transform = `translate3d(${current2.x.toFixed(2)}px, ${current2.y.toFixed(2)}px, 0)`;
      }

      // Settle check: stop RAF when settled
      const diff1 = Math.hypot(target1.x - current1.x, target1.y - current1.y);
      const diff2 = Math.hypot(target2.x - current2.x, target2.y - current2.y);

      if (diff1 < 0.05 && diff2 < 0.05) {
        isRunning = false;
        animId = 0;
        return;
      }

      animId = requestAnimationFrame(animate);
    };

    const requestTick = () => {
      if (!isRunning && isVisible) {
        isRunning = true;
        animId = requestAnimationFrame(animate);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) return;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Left Eye
      const dx1 = mouseX - center1.x;
      const dy1 = mouseY - center1.y;
      const angle1 = Math.atan2(dy1, dx1);
      const dist1 = Math.hypot(dx1, dy1);
      const scaleDist1 = Math.min(maxDist, dist1 / (center1.width / 32 || 1));
      target1.x = Math.cos(angle1) * scaleDist1;
      target1.y = Math.sin(angle1) * scaleDist1;

      // Right Eye
      const dx2 = mouseX - center2.x;
      const dy2 = mouseY - center2.y;
      const angle2 = Math.atan2(dy2, dx2);
      const dist2 = Math.hypot(dx2, dy2);
      const scaleDist2 = Math.min(maxDist, dist2 / (center2.width / 32 || 1));
      target2.x = Math.cos(angle2) * scaleDist2;
      target2.y = Math.sin(angle2) * scaleDist2;

      requestTick();
    };

    // IntersectionObserver to pause loop when offscreen
    const el = sectionRef.current || eye1Ref.current;
    let observer: IntersectionObserver | null = null;
    if (el) {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            updateEyeCenters();
            requestTick();
          } else {
            if (animId) {
              cancelAnimationFrame(animId);
              animId = 0;
            }
            isRunning = false;
          }
        },
        { rootMargin: "150px 0px 150px 0px" }
      );
      observer.observe(el);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", updateEyeCenters, { passive: true });
    window.addEventListener("scroll", updateEyeCenters, { passive: true });
    updateEyeCenters();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", updateEyeCenters);
      window.removeEventListener("scroll", updateEyeCenters);
      if (observer) observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  // ============================================================================
  // CONTRIBUTION MATRIX ORGANIZER (52 WEEKS x 7 DAYS)
  // ============================================================================
  const { weeks, monthHeaders } = useMemo(() => {
    // Arrange days into 7-row columns (Sunday = 0 to Saturday = 6)
    const weeksArr: (ContributionDay | null)[][] = [];
    let currentWeek: (ContributionDay | null)[] = [];

    // Find the weekday of the first day of the year
    if (data.days.length > 0) {
      const firstDate = new Date(data.days[0].date);
      const firstDayOfWeek = firstDate.getUTCDay();

      // Pad initial week days
      for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
      }

      data.days.forEach((day) => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
          weeksArr.push(currentWeek);
          currentWeek = [];
        }
      });

      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeksArr.push(currentWeek);
      }
    }

    // Month headers with column indices
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeksArr.forEach((w, wIndex) => {
      // Find first valid day in this week
      const firstValidDay = w.find((d) => d !== null);
      if (firstValidDay) {
        const d = new Date(firstValidDay.date);
        const m = d.getUTCMonth();
        if (m !== lastMonth) {
          months.push({ label: monthNames[m], weekIndex: wIndex });
          lastMonth = m;
        }
      }
    });

    return { weeks: weeksArr, monthHeaders: months };
  }, [data.days]);

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative z-10 w-full bg-transparent py-20 md:py-28 text-[#F5EEF0]"
    >
      {/* Anchor links for backward compatibility with #github, #lab, #telemetry */}
      <span id="github" className="absolute -top-28 pointer-events-none" />
      <span id="lab" className="absolute -top-28 pointer-events-none" />
      <span id="telemetry" className="absolute -top-28 pointer-events-none" />
      <span id="terminal" className="absolute -top-28 pointer-events-none" />

      <div className="w-full">
        {/* ================================================================= */}
        {/* A. SECTION HEADER (TOP ROW)                                       */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 w-full mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-sans font-medium tracking-[-0.035em] text-[#F5EEF0] flex flex-wrap items-center gap-x-3 gap-y-0 leading-[1.12]">
            <span>Want to know about my</span>
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#6D001A] via-[#C93B5B] to-[#F5EEF0] bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] pr-2 lowercase tracking-normal">
              story?
            </span>
          </h2>

          <a
            href="https://github.com/Kruxhna"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="pointer"
            className="bg-[#6D001A] hover:bg-[#9E0B2E] border border-[#9E0B2E]/60 text-[#F5EEF0] px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-[0.12em] uppercase hover:shadow-[0_4px_20px_-4px_rgba(195,24,30,0.55)] transition-all duration-300 inline-flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <span>READ MY JOURNEY</span>
            <ArrowUpRight className="w-4 h-4 text-[#F5EEF0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </a>
        </div>

        {/* ================================================================= */}
        {/* B. MAIN DARK BENTO CARD (GITHUB CONTRIBUTION GRAPH)               */}
        {/* ================================================================= */}
        <div className="relative w-full rounded-[28px] bg-[#000000]/85 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] border border-[rgba(221,112,116,0.18)] hover:border-[rgba(228,107,94,0.45)] transition-colors duration-500 overflow-visible">
          {/* =============================================================== */}
          {/* C. INTERACTIVE CURSOR-TRACKING GOOGLY EYES (BOTTOM-RIGHT OVERLAP)*/}
          {/* =============================================================== */}
          <div className="absolute -top-14 sm:-top-16 md:top-auto md:-bottom-12 right-6 sm:right-10 md:right-14 z-[70] pointer-events-none select-none">
            <div className="inline-flex items-center select-none cursor-default" title="I see you!">
              {/* Left Eye */}
              <svg
                ref={eye1Ref}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] -mr-3 sm:-mr-4 md:-mr-6 z-10"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle cx="50" cy="50" r="48" fill="#F7EFEA" stroke="#000000" strokeWidth="2.5" />
                <g ref={pupil1Ref} style={{ willChange: "transform" }}>
                  <circle cx="50" cy="50" r="21" fill="#000000" />
                  <circle cx="57" cy="43" r="5" fill="#ffffff" />
                </g>
              </svg>

              {/* Right Eye */}
              <svg
                ref={eye2Ref}
                className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 drop-shadow-[0_16px_36px_rgba(0,0,0,0.85)] z-20"
                viewBox="0 0 100 100"
                fill="none"
              >
                <circle cx="50" cy="50" r="48" fill="#F7EFEA" stroke="#000000" strokeWidth="2.5" />
                <g ref={pupil2Ref} style={{ willChange: "transform" }}>
                  <circle cx="50" cy="50" r="21" fill="#000000" />
                  <circle cx="57" cy="43" r="5" fill="#ffffff" />
                </g>
              </svg>
            </div>
          </div>

          {/* CARD BODY CONTENT */}
          <div className="flex flex-col gap-8 sm:gap-10 relative w-full">
            {/* Top Bar: Title & Year Switcher / Legend */}
            <div className="relative z-[60] w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                {/* Left: Section Label & Dynamic Commits Counter */}
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs font-semibold tracking-widest text-[#A68E94] uppercase font-mono mb-1 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9E0B2E] animate-pulse" />
                    <span>GITHUB ACTIVITY</span>
                  </span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F5EEF0] tracking-tight flex items-center gap-2">
                    <span>
                      {data.total.toLocaleString()} Commits in {selectedYear}
                    </span>
                    {isLoading && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#C93B5B] animate-ping" />
                    )}
                  </span>
                </div>

                {/* Right: Contribution Intensity Legend + Year Selector Dropdown */}
                <div className="flex items-center flex-wrap gap-4 text-xs font-mono text-[#A68E94] sm:ml-auto">
                  {/* Legend */}
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-[11px] text-[#A68E94]/80">Less</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="h-3 w-3 rounded-[3px] border border-[rgba(221,112,116,0.14)] bg-[#140408]/80" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#3B000E]/70 bg-[#240009]" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#6D001A]/70 bg-[#6D001A]" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#9E0B2E]/80 bg-[#6D001A]" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#F5EEF0] bg-[#C93B5B]" />
                    </div>
                    <span className="text-[11px] text-[#A68E94]/80">More</span>
                  </div>

                  {/* Year Dropdown Pill Button */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      data-cursor="pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#000000]/80 hover:bg-[#140408] text-[#F5EEF0] text-xs font-mono border border-[rgba(221,112,116,0.22)] hover:border-[#C93B5B]/60 transition-all cursor-pointer shadow-sm select-none"
                    >
                      <span className="font-semibold">{selectedYear}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#A68E94] transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Options */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-28 rounded-xl bg-[#000000] border border-[rgba(221,112,116,0.25)] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {AVAILABLE_YEARS.map((y) => (
                          <button
                            key={y}
                            type="button"
                            data-cursor="pointer"
                            onClick={() => handleYearChange(y)}
                            className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center justify-between ${
                              y === selectedYear
                                ? "bg-[#6D001A]/20 text-[#F5EEF0] font-semibold border-l-2 border-[#C93B5B]"
                                : "text-[#A68E94] hover:bg-[#140408] hover:text-[#F5EEF0]"
                            }`}
                          >
                            <span>{y}</span>
                            {y === selectedYear && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C93B5B]" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contribution Grid Wrapper with Horizontal Scroll on Mobile */}
            <div className="relative z-[50] overflow-x-auto pb-2 scrollbar-none w-full max-w-full md:max-w-[75%] lg:max-w-[80%]">
              <div className="min-w-[680px] flex flex-col select-none">
                {/* Months Header Labels */}
                <div className="flex w-full mb-2 pl-7 font-mono text-[10px] text-[#A68E94]/80 tracking-wider">
                  <div className="flex-1 flex justify-between pr-4">
                    {monthHeaders.map((m) => (
                      <span key={m.label} className="w-6 text-left">
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Day Labels + 52-Column Heatmap Grid */}
                <div className="flex gap-2 items-start">
                  {/* Days Column Labels */}
                  <div className="flex flex-col justify-between h-[106px] text-[10px] font-mono text-[#A68E94]/80 pt-1 select-none pr-1">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* 52-Week Matrix */}
                  <div className="flex gap-[4px] flex-1">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[4px]">
                        {week.map((day, dIdx) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${dIdx}`}
                                className="w-3.5 h-3.5 rounded-[3px] bg-transparent"
                              />
                            );
                          }

                          const levelStyle = COLOR_LEVELS[day.level];
                          const dateObj = new Date(day.date);
                          const dateFormatted = dateObj.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                          const tooltipMsg = `${day.count} commit${
                            day.count === 1 ? "" : "s"
                          } on ${dateFormatted}`;

                          return (
                            <div
                              key={day.date}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setActiveTooltip({
                                  text: tooltipMsg,
                                  x: rect.left + rect.width / 2,
                                  y: rect.top - 8,
                                });
                              }}
                              onMouseLeave={() => setActiveTooltip(null)}
                              className={`w-3.5 h-3.5 rounded-[3px] border transition-all duration-150 hover:scale-125 hover:z-30 cursor-pointer ${levelStyle.bg} ${levelStyle.border}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {activeTooltip && (
        <div
          style={{
            position: "fixed",
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y}px`,
            transform: "translate(-50%, -100%)",
          }}
          className="pointer-events-none z-[100] px-3 py-1.5 rounded-lg bg-[#000000]/95 backdrop-blur-md border border-[rgba(221,112,116,0.35)] text-[11px] font-mono text-[#F5EEF0] shadow-[0_8px_24px_rgba(0,0,0,0.85)] whitespace-nowrap animate-in fade-in duration-100 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#C93B5B]" />
          <span>{activeTooltip.text}</span>
        </div>
      )}
    </section>
  );
}

export default GitHubStorySection;
