"use client";

import React, { useState } from "react";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { BackgroundDecor } from "@/components/layout/BackgroundDecor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CommandMenu } from "@/components/layout/CommandMenu";
import { HeroSection } from "@/components/sections/HeroSection";
import { DSAShowcaseSection } from "@/components/sections/DSAShowcaseSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { LabSection } from "@/components/sections/LabSection";
import { ArsenalSection } from "@/components/sections/ArsenalSection";
import { ResearchSection } from "@/components/sections/ResearchSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0f1115] text-[#FAFAFA] antialiased selection:bg-[#4fa89b]/25 selection:text-[#4fa89b]">
      {/* Bespoke Hollow Circle Custom Cursor (egorz.com style) */}
      <CustomCursor />

      {/* Background Decor Layer (Dot Grid, Film Grain, Ambient Glows) */}
      <BackgroundDecor />

      {/* Floating Pill Navigation */}
      <Navbar onOpenCommandMenu={() => setCommandMenuOpen(true)} />

      {/* Main Content Sections */}
      <main className="relative z-10 w-full overflow-hidden">
        {/* Full-bleed Hero Section covering the full screen ratio */}
        <HeroSection />

        {/* Expansive Downstream Sections */}
        <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 xl:px-20">
          <DSAShowcaseSection />
          <ProjectsSection />
          <LabSection />
          <ArsenalSection />
          <ResearchSection />
          <ExperienceSection />
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
