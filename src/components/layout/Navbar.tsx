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

  // Scroll listener for sticky backdrop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const scrollPos = window.scrollY + 160;
      const sections = ["about", "stats", "projects", "arsenal", "contact"];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          return;
        }
      }
      setActiveSection("about");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            ? "border-b border-[#27272A]/70 bg-[#0f1115]/90 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        )}
      >
        {/* Left: Brand Anchor (Circle Logo + KRUSHNA) */}
        <div className="flex items-center gap-3">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Scroll to top"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/5 font-mono text-[11px] text-white transition-all group-hover:border-white/50 group-hover:bg-white/10">
              k
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#eeeef2]">
              KRUSHNA
            </span>
          </button>
        </div>

        {/* Center: Desktop Navigation Links (11-12px mono, uppercase, gray; active item brighter) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-[11px] uppercase tracking-widest text-[#71717a]">
          <Link
            href="#projects"
            className={`nav-link-underline transition-colors hover:text-white ${
              activeSection === "projects" ? "text-white font-medium" : "text-[#71717a]"
            }`}
          >
            WORK
          </Link>
          <Link
            href="#about"
            className={`nav-link-underline transition-colors hover:text-white ${
              activeSection === "about" ? "text-white font-medium" : "text-[#71717a]"
            }`}
          >
            ABOUT
          </Link>
          <Link
            href="#arsenal"
            className={`nav-link-underline transition-colors hover:text-white ${
              activeSection === "arsenal" ? "text-white font-medium" : "text-[#71717a]"
            }`}
          >
            TOOLBOX
          </Link>
          <Link
            href="#stats"
            className={`nav-link-underline transition-colors hover:text-white ${
              activeSection === "stats" ? "text-white font-medium" : "text-[#71717a]"
            }`}
          >
            DSA
          </Link>
          <Link
            href="#contact"
            className={`nav-link-underline transition-colors hover:text-white ${
              activeSection === "contact" ? "text-white font-medium" : "text-[#71717a]"
            }`}
          >
            CONTACT
          </Link>
        </div>

        {/* Right: Live Time, Motion, Theme & Command Palette (Video Style) */}
        <div className="flex items-center gap-4 lg:gap-6 font-mono text-[11px] text-[#71717a]">
          {/* Live Indian Standard Time */}
          <span className="hidden sm:inline text-[#71717a]" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}>
            IN {timeString || "22:15:00"}
          </span>

          {/* Motion Status */}
          <span className="hidden lg:inline text-[#71717a]">
            MOTION: FULL
          </span>

          {/* Theme Status */}
          <span className="hidden lg:inline text-[#71717a]">
            THEME: AUTO
          </span>

          {/* Command Menu Button (⌘K) */}
          {onOpenCommandMenu && (
            <button
              onClick={onOpenCommandMenu}
              className="flex items-center gap-1.5 rounded-md border border-[#27272A] bg-[#141418] px-2 py-1 text-[10px] text-[#A1A1AA] hover:text-white hover:border-[#38BDF8]/40 transition-colors"
              title="Open Command Palette (⌘K)"
            >
              <Command className="h-3 w-3" />
              <span>⌘K</span>
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-[#27272A] text-[#A1A1AA] hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#27272A] bg-[#09090b]/95 px-6 py-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 font-mono text-xs uppercase tracking-wider space-y-3">
          <Link
            href="#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#A1A1AA] hover:text-white"
          >
            WORK
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#A1A1AA] hover:text-white"
          >
            ABOUT
          </Link>
          <Link
            href="#arsenal"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#A1A1AA] hover:text-white"
          >
            TOOLBOX
          </Link>
          <Link
            href="#stats"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#A1A1AA] hover:text-white"
          >
            DSA
          </Link>
          <Link
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-[#A1A1AA] hover:text-white"
          >
            CONTACT
          </Link>
        </div>
      )}
    </header>
  );
}
