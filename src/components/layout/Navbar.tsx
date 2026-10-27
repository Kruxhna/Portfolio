"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";

interface NavbarProps {
  onOpenCommandMenu?: () => void;
  resumeUrl?: string;
}

export function Navbar({
  onOpenCommandMenu,
  resumeUrl = "/resume.pdf",
}: NavbarProps) {
  const { scrollTo } = useSmoothScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeString, setTimeString] = useState<string>("");
  const [activeSection, setActiveSection] = useState("about");
  const [motionMode, setMotionMode] = useState<"FULL" | "REDUCED">("FULL");
  const [themeMode, setThemeMode] = useState<"DARK" | "LIGHT">("DARK");

  const toggleMotion = () => {
    const next = motionMode === "FULL" ? "REDUCED" : "FULL";
    setMotionMode(next);
    if (next === "REDUCED") {
      document.documentElement.classList.add("reduced-motion");
    } else {
      document.documentElement.classList.remove("reduced-motion");
    }
  };

  const toggleTheme = () => {
    const next = themeMode === "DARK" ? "LIGHT" : "DARK";
    setThemeMode(next);
    if (next === "LIGHT") {
      document.documentElement.classList.add("theme-light");
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.classList.remove("theme-light");
      document.documentElement.removeAttribute("data-theme");
    }
  };

  // Live ticking clock for Indian Standard Time (matching egorz.com video top bar)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      setTimeString(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll listener for sticky backdrop + IntersectionObserver for accurate scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sectionIds = ["about", "what-i-do", "dsa", "work", "projects", "arsenal", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection((prev) => (prev !== entry.target.id ? entry.target.id : prev));
          }
        });
      },
      {
        rootMargin: "-20% 0px -50% 0px",
        threshold: 0.1,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  // Smooth scroll with navbar offset using Lenis inertial engine
  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      scrollTo(el, { offset: -80, duration: 1.2 });
      window.history.pushState(null, "", `#${sectionId}`);
    }
  };

  // Smooth scroll to top using Lenis inertial engine
  const scrollToTop = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    scrollTo(0, { duration: 1.2 });
    if (window.location.hash) {
      window.history.pushState(null, "", window.location.pathname);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 hero-animate hero-fade-up"
      style={{ animationDelay: "0s", animationDuration: "0.7s" }}
    >
      <nav
        className={cn(
          "w-full px-[2.5vw] py-4 sm:py-5 flex items-center justify-between transition-all duration-300 select-none",
          isScrolled
            ? "border-b border-[rgba(221,112,116,0.18)] bg-[#0A0807]/90 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        {/* Left: Brand Anchor (Circle Logo + KRUSHNA) */}
        <div className="flex items-center gap-3">
          <button
            onClick={scrollToTop}
            data-cursor="magnetic"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Scroll to top"
          >
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-all group-hover:scale-105"
              style={{
                borderColor: "#A11E3C",
                borderWidth: "1px",
                borderStyle: "solid",
                backgroundColor: "#5C0105",
                color: "#ECC3AB",
              }}
            >
              k
            </span>
            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#E8A791]">
              KRUSHNA
            </span>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-[11px] uppercase tracking-widest">
          {[
            { id: "work", label: "WORK" },
            { id: "about", label: "ABOUT" },
            { id: "arsenal", label: "TOOLBOX" },
            { id: "dsa", label: "DSA" },
            { id: "contact", label: "CONTACT" },
          ].map((item) => {
            const isWorkActive =
              (item.id === "work" || item.id === "projects") &&
              (activeSection === "work" || activeSection === "projects");
            const isAboutActive =
              item.id === "about" &&
              (activeSection === "about" || activeSection === "what-i-do");
            const isActive = isWorkActive || isAboutActive || activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-cursor="magnetic"
                onClick={(e) => handleNavClick(item.id, e)}
                className={cn(
                  "relative py-1 flex items-center gap-1.5 transition-colors group cursor-pointer",
                  isActive
                    ? "text-[#E02E32] font-medium"
                    : "text-[#E69683] hover:text-[#ECC3AB]"
                )}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E02E32]" />
                )}
                <span>{item.label}</span>
                <span
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-px bg-[#E02E32] transition-transform duration-200 origin-left",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </a>
            );
          })}
        </div>

        {/* Right: Live Time, Motion, Theme & Command Palette */}
        <div className="flex items-center gap-3 lg:gap-4 font-mono text-[11px] text-[#DD7074]">
          {/* Live Indian Standard Time */}
          <span className="hidden sm:inline" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>
            IN {timeString || "22:15:00"}
          </span>

          {/* Interactive Motion Toggle (Secondary HUD Pill) */}
          <button
            onClick={toggleMotion}
            className="hidden lg:inline-flex items-center rounded-md px-2.5 py-1 text-[10px] text-[#E8A791] bg-[#4E0104]/85 border border-[#9A142C] hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67] transition-colors cursor-pointer select-none"
            title="Toggle Motion Reduction"
          >
            MOTION: {motionMode}
          </button>

          {/* Interactive Theme Toggle (Secondary HUD Pill) */}
          <button
            onClick={toggleTheme}
            className="hidden lg:inline-flex items-center rounded-md px-2.5 py-1 text-[10px] text-[#E8A791] bg-[#4E0104]/85 border border-[#9A142C] hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67] transition-colors cursor-pointer select-none"
            title="Toggle Light/Dark Theme"
          >
            THEME: {themeMode}
          </button>

          {/* Command Menu Button (⌘K) */}
          {onOpenCommandMenu && (
            <button
              onClick={onOpenCommandMenu}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-[#E8A791] bg-[#4E0104]/85 border border-[#9A142C] hover:bg-[#7B0408] hover:text-[#ECC3AB] hover:border-[#D94F67] transition-colors cursor-pointer"
              title="Open Command Palette (⌘K)"
            >
              <Command className="h-3 w-3 text-[#E46B5E]" />
              <span>⌘K</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[#9A142C] bg-[#4E0104]/85 text-[#ECC3AB] hover:border-[#D94F67]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#9A142C]/40 bg-[#0A0807]/95 px-6 py-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 font-mono text-xs uppercase tracking-wider space-y-3">
          {[
            { id: "work", label: "WORK" },
            { id: "about", label: "ABOUT" },
            { id: "arsenal", label: "TOOLBOX" },
            { id: "dsa", label: "DSA" },
            { id: "contact", label: "CONTACT" },
          ].map((item) => {
            const isWorkActive =
              (item.id === "work" || item.id === "projects") &&
              (activeSection === "work" || activeSection === "projects");
            const isActive = isWorkActive || activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(item.id, e)}
                className={cn(
                  "block py-1 transition-colors",
                  isActive
                    ? "text-[#E02E32] font-medium"
                    : "text-[#E69683] hover:text-[#ECC3AB]"
                )}
              >
                {isActive && <span className="inline-block mr-2 text-[#E02E32]">•</span>}
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
