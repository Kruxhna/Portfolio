"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onOpenCommandMenu?: () => void;
  resumeUrl?: string;
}

export function Navbar({
  onOpenCommandMenu,
  resumeUrl = "/resume.pdf",
}: NavbarProps) {
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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const sectionIds = ["about", "dsa", "work", "projects", "arsenal", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
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

  // Smooth scroll with navbar offset
  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - navOffset,
        behavior: "smooth",
      });
      window.history.pushState(null, "", `#${sectionId}`);
    }
  };

  // Smooth scroll to top
  const scrollToTop = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            ? "border-b border-[rgba(205,180,158,0.12)] bg-[#0A0807]/90 shadow-lg backdrop-blur-md"
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
                borderColor: "rgba(206, 164, 145, 0.28)",
                borderWidth: "1px",
                borderStyle: "solid",
                backgroundColor: "#0A0807",
                color: "#AD6A4C",
              }}
            >
              k
            </span>
            <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-[#DEC1B4]">
              KRUSHNA
            </span>
          </button>
        </div>

        {/* Center: Desktop Navigation Links (Default rgba(222, 193, 180, 0.55), Active/Hover #DEC1B4 with #AD6A4C indicator) */}
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
            const isActive = isWorkActive || activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-cursor="magnetic"
                onClick={(e) => handleNavClick(item.id, e)}
                className={cn(
                  "relative py-1 flex items-center gap-1.5 transition-colors group cursor-pointer",
                  isActive
                    ? "text-[#DEC1B4] font-medium"
                    : "text-[rgba(222,193,180,0.55)] hover:text-[#DEC1B4]"
                )}
              >
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C]" />
                )}
                <span>{item.label}</span>
                <span
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-px bg-[#AD6A4C] transition-transform duration-200 origin-left",
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </a>
            );
          })}
        </div>

        {/* Right: Live Time, Motion, Theme & Command Palette */}
        <div className="flex items-center gap-4 lg:gap-6 font-mono text-[11px] text-[rgba(222,193,180,0.55)]">
          {/* Live Indian Standard Time */}
          <span className="hidden sm:inline" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>
            IN {timeString || "22:15:00"}
          </span>

          {/* Interactive Motion Toggle */}
          <button
            onClick={toggleMotion}
            className="hidden lg:inline hover:text-[#DEC1B4] transition-colors cursor-pointer select-none"
            title="Toggle Motion Reduction"
          >
            MOTION: {motionMode}
          </button>

          {/* Interactive Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden lg:inline hover:text-[#DEC1B4] transition-colors cursor-pointer select-none"
            title="Toggle Light/Dark Theme"
          >
            THEME: {themeMode}
          </button>

          {/* Command Menu Button (⌘K) */}
          {onOpenCommandMenu && (
            <button
              onClick={onOpenCommandMenu}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] text-[#DEC1B4] transition-colors cursor-pointer"
              style={{
                backgroundColor: "#0A0807",
                border: "1px solid rgba(173, 106, 76, 0.35)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#AD6A4C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(173, 106, 76, 0.35)";
              }}
              title="Open Command Palette (⌘K)"
            >
              <Command className="h-3 w-3 text-[#AD6A4C]" />
              <span>⌘K</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(206,164,145,0.25)] text-[#DEC1B4] hover:border-[#AD6A4C]"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[rgba(205,180,158,0.12)] bg-[#0A0807]/95 px-6 py-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 font-mono text-xs uppercase tracking-wider space-y-3">
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
                    ? "text-[#DEC1B4] font-medium"
                    : "text-[rgba(222,193,180,0.55)] hover:text-[#DEC1B4]"
                )}
              >
                {isActive && <span className="inline-block mr-2 text-[#AD6A4C]">•</span>}
                {item.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
