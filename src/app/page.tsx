"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { HeroSection } from "@/components/sections/HeroSection";
import { DSAShowcaseSection } from "@/components/sections/DSAShowcaseSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { WhatIDoSection } from "@/components/sections/WhatIDoSection";
import { GitHubStorySection } from "@/components/sections/GitHubStorySection";
import { TechStackGrid } from "@/components/sections/TechStackGrid";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--text-primary)] antialiased">
      {/* Floating Pill Navigation */}
      <Navbar onOpenCommandMenu={() => setCommandMenuOpen(true)} />

      {/* Main Content Sections (Rendered cleanly without blur/fade animations) */}
      <main className="relative z-10 w-full overflow-x-clip">
        {/* Full-bleed Hero Section */}
        <HeroSection />

        {/* Bento Dashboard Section: DSA / Problem Solving (id="dsa") */}
        <DSAShowcaseSection />

        {/* Full-Width Featured Work Section (id="work") */}
        <ProjectsSection />

        {/* Expansive Downstream Sections Aligned with Hero, DSA and Work (max-w-[1720px]) */}
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-10 lg:px-12">
          {/* Scroll-Synced Capabilities: What I Do */}
          <WhatIDoSection />

          {/* GitHub Activity & Interactive Googly Eyes Matrix */}
          <GitHubStorySection />

          {/* Technologies & Tooling Asymmetric Grid */}
          <TechStackGrid />

          {/* Editorial Minimalist About Section */}
          <AboutSection />

          {/* High-Contrast Bento Contact Section */}
          <ContactSection />
        </div>
      </main>

      {/* Minimalist Developer Footer */}
      <Footer />

      {/* Cmd + K Command Palette */}
      <CommandMenu
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
      />
    </div>
  );
}
