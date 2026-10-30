"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MirageFooterExperience } from "@/components/MirageFooterExperience";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { HeroSection } from "@/components/sections/HeroSection";
import { DSAShowcaseSection } from "@/components/sections/DSAShowcaseSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { WhatIDoSection } from "@/components/sections/WhatIDoSection";
import { GitHubStorySection } from "@/components/sections/GitHubStorySection";
import { TechStackGrid } from "@/components/sections/TechStackGrid";
import { AboutSection } from "@/components/sections/AboutSection";
import { ScrollSectionTransition } from "@/components/ui/ScrollSectionTransition";

export default function Home() {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-transparent text-[var(--text-primary)] antialiased">
      {/* Floating Pill Navigation */}
      <Navbar onOpenCommandMenu={() => setCommandMenuOpen(true)} />

      {/* Main Content Sections Wrapped in Tsunami Liquid-Wave Scroll Transitions */}
      <main className="relative z-10 w-full overflow-x-clip">
        {/* 00 // Full-Bleed Hero Section (overflowVisible preserves scattered letters) */}
        <ScrollSectionTransition
          showDivider={false}
          overflowVisible={true}
          distortionScale={16}
          waveAngle={115}
        >
          <HeroSection />
        </ScrollSectionTransition>

        {/* 01 // Bento Dashboard Section: DSA / Problem Solving (id="dsa") */}
        <ScrollSectionTransition
          indexTag="01"
          label="ALGORITHMIC RIGOR & TELEMETRY"
          distortionScale={22}
          waveAngle={112}
        >
          <DSAShowcaseSection />
        </ScrollSectionTransition>

        {/* 02 // Full-Width Featured Work Section (id="work") */}
        <ScrollSectionTransition
          indexTag="02"
          label="FEATURED ENGINEERING SYSTEMS"
          distortionScale={24}
          waveAngle={118}
        >
          <ProjectsSection />
        </ScrollSectionTransition>

        {/* Expansive Downstream Sections Aligned with Hero, DSA and Work (max-w-[1720px]) */}
        <div className="mx-auto w-full max-w-[1720px] px-6 sm:px-10 lg:px-12">
          {/* 03 // Scroll-Synced Capabilities: What I Do */}
          <ScrollSectionTransition
            indexTag="03"
            label="ARCHITECTURAL CAPABILITIES"
            showDivider={false}
            distortionScale={18}
            waveAngle={110}
          >
            <WhatIDoSection />
          </ScrollSectionTransition>

          {/* 04 // GitHub Activity & Interactive Googly Eyes Matrix */}
          <ScrollSectionTransition
            indexTag="04"
            label="OPEN SOURCE & COMMIT MATRIX"
            distortionScale={20}
            waveAngle={115}
          >
            <GitHubStorySection />
          </ScrollSectionTransition>

          {/* 05 // Technologies & Tooling Asymmetric Grid */}
          <ScrollSectionTransition
            indexTag="05"
            label="TECHNICAL ARSENAL & TOOLING"
            distortionScale={22}
            waveAngle={114}
          >
            <TechStackGrid />
          </ScrollSectionTransition>

          {/* 06 // Editorial Minimalist About Section */}
          <ScrollSectionTransition
            indexTag="06"
            label="IDENTITY & BACKGROUND"
            distortionScale={20}
            waveAngle={116}
          >
            <AboutSection />
          </ScrollSectionTransition>
        </div>
      </main>

      {/* 07 // Interactive Monument & Mirage Footer Experience */}
      <ScrollSectionTransition
        showDivider={false}
        distortionScale={18}
        waveAngle={115}
      >
        <MirageFooterExperience />
      </ScrollSectionTransition>

      {/* Cmd + K Command Palette */}
      <CommandMenu
        isOpen={commandMenuOpen}
        onClose={() => setCommandMenuOpen(false)}
      />
    </div>
  );
}
