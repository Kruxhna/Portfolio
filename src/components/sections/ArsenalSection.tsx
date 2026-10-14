"use client";

import React, { useState } from "react";
import { Brain, Terminal, Server, GraduationCap } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  PyTorchLogo,
  TensorFlowLogo,
  HuggingFaceLogo,
  OpenCVLogo,
  ScikitLearnLogo,
  LangChainLogo,
  NumPyLogo,
  PandasLogo,
  PythonLogo,
  CppLogo,
  SQLLogo,
  TSLogo,
  DockerLogo,
  FastAPILogo,
  FlaskLogo,
  GitLogo,
  LinuxLogo,
  CloudLogo,
  WandbLogo,
  DSALogo,
  OOPLogo,
  DBMSLogo,
  OSLogo,
} from "@/components/ui/TechLogos";

interface TechItem {
  name: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ArsenalPillar {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  spotlightRgba: string;
  borderColor: string;
  badgeVariant: string;
  items: TechItem[];
}

const PILLARS: ArsenalPillar[] = [
  {
    id: "ai-ml",
    title: "Artificial Intelligence & Machine Learning",
    subtitle: "Deep learning models, vision architectures, and tensor computation",
    icon: Brain,
    accentColor: "text-[#AD6A4C]",
    spotlightRgba: "rgba(173, 106, 76, 0.12)",
    borderColor: "hover:border-[rgba(173,106,76,0.45)]",
    badgeVariant: "border-[rgba(173,106,76,0.35)] bg-[rgba(173,106,76,0.15)] text-[#AD6A4C]",
    items: [
      { name: "PyTorch", badge: "Core Engine", icon: PyTorchLogo },
      { name: "TensorFlow", badge: "Production", icon: TensorFlowLogo },
      { name: "Hugging Face", badge: "Transformers", icon: HuggingFaceLogo },
      { name: "OpenCV", badge: "Computer Vision", icon: OpenCVLogo },
      { name: "Scikit-learn", badge: "Classical ML", icon: ScikitLearnLogo },
      { name: "LangChain", badge: "LLM Agents", icon: LangChainLogo },
      { name: "NumPy", badge: "Vector Math", icon: NumPyLogo },
      { name: "Pandas", badge: "Dataframes", icon: PandasLogo },
    ],
  },
  {
    id: "languages",
    title: "Programming Languages",
    subtitle: "Algorithmic problem solving, low-latency compute, and web systems",
    icon: Terminal,
    accentColor: "text-[#AD6A4C]",
    spotlightRgba: "rgba(173, 106, 76, 0.12)",
    borderColor: "hover:border-[rgba(173,106,76,0.45)]",
    badgeVariant: "border-[rgba(173,106,76,0.35)] bg-[rgba(173,106,76,0.15)] text-[#AD6A4C]",
    items: [
      { name: "Python", badge: "Expert", icon: PythonLogo },
      { name: "C++", badge: "DSA & CP", icon: CppLogo },
      { name: "SQL", badge: "Queries & DDL", icon: SQLLogo },
      { name: "JavaScript / TypeScript", badge: "Modern Web", icon: TSLogo },
    ],
  },
  {
    id: "mlops-cloud",
    title: "MLOps, Cloud & Backend",
    subtitle: "Containerization, asynchronous neural APIs, and experiment tracking",
    icon: Server,
    accentColor: "text-[#AD6A4C]",
    spotlightRgba: "rgba(173, 106, 76, 0.12)",
    borderColor: "hover:border-[rgba(173,106,76,0.45)]",
    badgeVariant: "border-[rgba(173,106,76,0.35)] bg-[rgba(173,106,76,0.15)] text-[#AD6A4C]",
    items: [
      { name: "Docker", badge: "Containers", icon: DockerLogo },
      { name: "FastAPI", badge: "Async APIs", icon: FastAPILogo },
      { name: "Flask", badge: "Microservices", icon: FlaskLogo },
      { name: "Git / GitHub", badge: "VCS & CI/CD", icon: GitLogo },
      { name: "Linux / Bash", badge: "Kernel & Shell", icon: LinuxLogo },
      { name: "AWS / GCP Basics", badge: "Cloud Compute", icon: CloudLogo },
      { name: "Weights & Biases", badge: "Tracking", icon: WandbLogo },
    ],
  },
  {
    id: "cs-foundations",
    title: "Computer Science Foundations",
    subtitle: "Core theoretical pillars, memory architectures, and algorithmic rigor",
    icon: GraduationCap,
    accentColor: "text-[#AD6A4C]",
    spotlightRgba: "rgba(173, 106, 76, 0.12)",
    borderColor: "hover:border-[rgba(173,106,76,0.45)]",
    badgeVariant: "border-[rgba(173,106,76,0.35)] bg-[rgba(173,106,76,0.15)] text-[#AD6A4C]",
    items: [
      { name: "Data Structures & Algorithms", badge: "O(N) Bounds", icon: DSALogo },
      { name: "Object-Oriented Programming (OOP)", badge: "Design Patterns", icon: OOPLogo },
      { name: "Database Management Systems (DBMS)", badge: "ACID & Normalization", icon: DBMSLogo },
      { name: "Operating Systems", badge: "IPC & Memory", icon: OSLogo },
    ],
  },
];

export function ArsenalSection() {
  const [selectedPillar, setSelectedPillar] = useState<string>("all");

  const displayedPillars =
    selectedPillar === "all"
      ? PILLARS
      : PILLARS.filter((p) => p.id === selectedPillar);

  return (
    <section id="arsenal" className="relative py-20 sm:py-28">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#AD6A4C]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C] animate-pulse" />
          <span>04 // TECH STACK</span>
        </div>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#DEC1B4] sm:text-4xl">
              Skills &amp; Tooling
            </h2>
            <p className="mt-1 max-w-xl text-sm sm:text-base text-[rgba(222,193,180,0.65)]">
              Organized, high-density matrix of frameworks, systems, and foundational engineering competencies.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-[rgba(206,164,145,0.14)] bg-[#0A0807] p-1 backdrop-blur-sm">
            <button
              onClick={() => setSelectedPillar("all")}
              data-cursor="link"
              className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                selectedPillar === "all"
                  ? "bg-[#14100D] text-[#DEC1B4] border border-[rgba(173,106,76,0.35)]"
                  : "text-[rgba(222,193,180,0.55)] hover:text-[#DEC1B4]"
              }`}
            >
              All Matrix
            </button>
            {PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                data-cursor="link"
                className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  selectedPillar === p.id
                    ? "bg-[#14100D] text-[#DEC1B4] border border-[rgba(173,106,76,0.35)]"
                    : "text-[rgba(222,193,180,0.55)] hover:text-[#DEC1B4]"
                }`}
              >
                {p.title.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. HIGH-DENSITY BENTO MATRIX */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {displayedPillars.map((pillar) => {
          const HeaderIcon = pillar.icon;
          return (
            <SpotlightCard
              key={pillar.id}
              spotlightColor={pillar.spotlightRgba}
              className={`group flex flex-col justify-between border-[rgba(206,164,145,0.14)] bg-[#0A0807] p-6 sm:p-7 transition-all duration-300 ${pillar.borderColor}`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-[rgba(206,164,145,0.14)] pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(206,164,145,0.18)] bg-[#14100D]">
                      <HeaderIcon className={`h-4 w-4 ${pillar.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#DEC1B4]">
                        {pillar.title}
                      </h3>
                      <p className="text-[11px] font-mono text-[rgba(222,193,180,0.55)]">
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] ${pillar.badgeVariant}`}>
                    {pillar.items.length} Skills
                  </span>
                </div>

                {/* Minimalist Tech Chips Grid */}
                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {pillar.items.map((item) => {
                    const Logo = item.icon;
                    return (
                      <div
                        key={item.name}
                        data-cursor="link"
                        className="group/chip flex items-center justify-between gap-2 rounded-xl border border-[rgba(206,164,145,0.12)] bg-[#0A0807] px-3 py-2.5 transition-all duration-200 hover:border-[#AD6A4C] hover:bg-[#14100D] hover:shadow-md hover:shadow-black/60"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#DEC1B4] transition-transform duration-200 group-hover/chip:scale-110">
                            <Logo className="h-4 w-4" />
                          </span>
                          <span className="truncate font-mono text-xs font-medium text-[#DEC1B4] group-hover/chip:text-[#EEDED7]">
                            {item.name}
                          </span>
                        </div>

                        {item.badge && (
                          <span className="shrink-0 rounded bg-[#14100D] border border-[rgba(206,164,145,0.14)] px-1.5 py-0.5 font-mono text-[9px] text-[rgba(222,193,180,0.55)] group-hover/chip:text-[#DEC1B4]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pillar Footer Bar */}
              <div className="mt-6 border-t border-[rgba(206,164,145,0.14)] pt-3 flex items-center justify-between font-mono text-[11px] text-[rgba(222,193,180,0.55)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C]" />
                  Production Ready
                </span>
                <span className={pillar.accentColor}>Verified Competency</span>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
}
