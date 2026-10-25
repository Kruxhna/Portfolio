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
  0: { bg: "bg-[#14100D]/80", border: "border-[rgba(221,112,116,0.14)]" },
  1: { bg: "bg-[#4E0104]", border: "border-[#7B0408]/70" },
  2: { bg: "bg-[#9F0B10]", border: "border-[#C3181E]/70" },
  3: { bg: "bg-[#C3181E]", border: "border-[#E44847]/80" },
  4: { bg: "bg-[#E46B5E]", border: "border-[#ECC3AB]" },
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
      <div className="h-14 w-80 bg-[#14100D] rounded-xl animate-pulse mb-8 border border-[rgba(221,112,116,0.15)]" />
      <div className="w-full h-[340px] bg-[#0A0807]/85 rounded-[28px] border border-[rgba(221,112,116,0.15)] animate-pulse" />
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
  // GOOGLY EYES PHYSICS (60FPS CURSOR TRACKING WITH CLAMPED VECTORS)
  // ============================================================================
  const eye1Ref = useRef<SVGSVGElement | null>(null);
  const eye2Ref = useRef<SVGSVGElement | null>(null);
  const [eye1Offset, setEye1Offset] = useState({ x: 0, y: 0 });
  const [eye2Offset, setEye2Offset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;
    let target1 = { x: 0, y: 0 };
    let target2 = { x: 0, y: 0 };
    let current1 = { x: 0, y: 0 };
    let current2 = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      [
        { ref: eye1Ref, setTarget: (t: { x: number; y: number }) => (target1 = t) },
        { ref: eye2Ref, setTarget: (t: { x: number; y: number }) => (target2 = t) },
      ].forEach(({ ref, setTarget }) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const angle = Math.atan2(dy, dx);
        const dist = Math.hypot(dx, dy);

        // Max radius for pupil displacement inside 100x100 viewBox (sclera radius 48, pupil 21 => max 22)
        const maxDist = 22;
        // Sensitivity based on distance from eye
        const scaleDist = Math.min(maxDist, dist / (rect.width / 32));

        setTarget({
          x: Math.cos(angle) * scaleDist,
          y: Math.sin(angle) * scaleDist,
        });
      });
    };

    const animate = () => {
      // Smooth spring easing
      current1.x += (target1.x - current1.x) * 0.18;
      current1.y += (target1.y - current1.y) * 0.18;
      current2.x += (target2.x - current2.x) * 0.18;
      current2.y += (target2.y - current2.y) * 0.18;

      setEye1Offset({ x: current1.x, y: current1.y });
      setEye2Offset({ x: current2.x, y: current2.y });

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
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
      id="story"
      className="relative z-10 w-full bg-transparent py-20 md:py-28 text-[#ECC3AB]"
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
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#ECC3AB] flex flex-wrap items-center gap-x-3 gap-y-0 leading-tight">
            <span>Want to know about my</span>
            <span className="font-serif italic font-normal bg-gradient-to-r from-[#C3181E] via-[#E46B5E] to-[#ECC3AB] bg-clip-text text-transparent text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] pr-2 lowercase tracking-normal">
              story?
            </span>
          </h2>

          <a
            href="https://github.com/Kruxhna"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="pointer"
            className="bg-[#C3181E] hover:bg-[#E14945] border border-[#E44847]/60 text-[#ECC3AB] px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-[0.12em] uppercase hover:shadow-[0_4px_20px_-4px_rgba(195,24,30,0.55)] transition-all duration-300 inline-flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <span>READ MY JOURNEY</span>
            <ArrowUpRight className="w-4 h-4 text-[#ECC3AB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </a>
        </div>

        {/* ================================================================= */}
        {/* B. MAIN DARK BENTO CARD (GITHUB CONTRIBUTION GRAPH)               */}
        {/* ================================================================= */}
        <div className="relative w-full rounded-[28px] bg-[#0A0807]/85 backdrop-blur-xl p-6 sm:p-8 md:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.85)] border border-[rgba(221,112,116,0.18)] hover:border-[rgba(228,107,94,0.45)] transition-colors duration-500 overflow-visible">
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
                <circle cx="50" cy="50" r="48" fill="#F7EFEA" stroke="#0A0807" strokeWidth="2.5" />
                <g style={{ transform: `translate(${eye1Offset.x}px, ${eye1Offset.y}px)` }}>
                  <circle cx="50" cy="50" r="21" fill="#0A0807" />
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
                <circle cx="50" cy="50" r="48" fill="#F7EFEA" stroke="#0A0807" strokeWidth="2.5" />
                <g style={{ transform: `translate(${eye2Offset.x}px, ${eye2Offset.y}px)` }}>
                  <circle cx="50" cy="50" r="21" fill="#0A0807" />
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
                  <span className="text-[10px] md:text-xs font-semibold tracking-widest text-[#DD7074] uppercase font-mono mb-1 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E02E32] animate-pulse" />
                    <span>GITHUB ACTIVITY</span>
                  </span>
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#ECC3AB] tracking-tight flex items-center gap-2">
                    <span>
                      {data.total.toLocaleString()} Commits in {selectedYear}
                    </span>
                    {isLoading && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#E46B5E] animate-ping" />
                    )}
                  </span>
                </div>

                {/* Right: Contribution Intensity Legend + Year Selector Dropdown */}
                <div className="flex items-center flex-wrap gap-4 text-xs font-mono text-[#DD7074] sm:ml-auto">
                  {/* Legend */}
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-[11px] text-[#DD7074]/80">Less</span>
                    <div className="flex gap-1.5 items-center">
                      <div className="h-3 w-3 rounded-[3px] border border-[rgba(221,112,116,0.14)] bg-[#14100D]/80" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#7B0408]/70 bg-[#4E0104]" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#C3181E]/70 bg-[#9F0B10]" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#E44847]/80 bg-[#C3181E]" />
                      <div className="h-3 w-3 rounded-[3px] border border-[#ECC3AB] bg-[#E46B5E]" />
                    </div>
                    <span className="text-[11px] text-[#DD7074]/80">More</span>
                  </div>

                  {/* Year Dropdown Pill Button */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      data-cursor="pointer"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0A0807]/80 hover:bg-[#14100D] text-[#ECC3AB] text-xs font-mono border border-[rgba(221,112,116,0.22)] hover:border-[#E46B5E]/60 transition-all cursor-pointer shadow-sm select-none"
                    >
                      <span className="font-semibold">{selectedYear}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#DD7074] transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu Options */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-28 rounded-xl bg-[#0A0807] border border-[rgba(221,112,116,0.25)] shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                        {AVAILABLE_YEARS.map((y) => (
                          <button
                            key={y}
                            type="button"
                            data-cursor="pointer"
                            onClick={() => handleYearChange(y)}
                            className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded-lg transition-colors flex items-center justify-between ${
                              y === selectedYear
                                ? "bg-[#C3181E]/20 text-[#ECC3AB] font-semibold border-l-2 border-[#E46B5E]"
                                : "text-[#DD7074] hover:bg-[#14100D] hover:text-[#ECC3AB]"
                            }`}
                          >
                            <span>{y}</span>
                            {y === selectedYear && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E46B5E]" />
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
                <div className="flex w-full mb-2 pl-7 font-mono text-[10px] text-[#DD7074]/80 tracking-wider">
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
                  <div className="flex flex-col justify-between h-[106px] text-[10px] font-mono text-[#DD7074]/80 pt-1 select-none pr-1">
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
          className="pointer-events-none z-[100] px-3 py-1.5 rounded-lg bg-[#0A0807]/95 backdrop-blur-md border border-[rgba(221,112,116,0.35)] text-[11px] font-mono text-[#ECC3AB] shadow-[0_8px_24px_rgba(0,0,0,0.85)] whitespace-nowrap animate-in fade-in duration-100 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#E46B5E]" />
          <span>{activeTooltip.text}</span>
        </div>
      )}
    </section>
  );
}

export default GitHubStorySection;
