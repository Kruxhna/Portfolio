"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Terminal as TerminalIcon,
  Play,
  RotateCw,
  Cpu,
  Activity,
  Star,
  GitFork,
  ExternalLink,
  Flame,
  Check,
  Copy,
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2,
  Code2,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";
import { TERMINAL_COMMANDS } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { GithubIcon, LinkedinIcon, CodolioIcon } from "@/components/ui/Icons";

interface HistoryItem {
  cmd: string;
  output: string;
  isSpecial?: "contact" | "skills" | "projects" | "github";
}

interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
}

interface GithubProfileData {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  total_stars: number;
  streak_days: number;
  top_repos: GithubRepo[];
}

const FALLBACK_GITHUB_DATA: GithubProfileData = {
  login: "Kruxhna",
  name: "Krushna",
  avatar_url: "https://avatars.githubusercontent.com/u/115390946?v=4",
  html_url: "https://github.com/Kruxhna",
  bio: "BE CSE student specializing in AIML. Passionate about building data-driven AI solutions. Sharpening skills in Python, deep learning, and data structures.",
  public_repos: 15,
  followers: 10,
  following: 6,
  total_stars: 5,
  streak_days: 18,
  top_repos: [
    {
      name: "llama-cluster",
      description: "Distributed LLM inference cluster with RPC daemons and cross-node pipeline parallelism on consumer GPUs.",
      language: "Python",
      stars: 2,
      forks: 0,
      url: "https://github.com/Kruxhna/llama-cluster",
    },
    {
      name: "Trinetra",
      description: "Computer vision and video forensics architecture for multi-frame feature extraction and monitoring.",
      language: "Python",
      stars: 2,
      forks: 0,
      url: "https://github.com/Kruxhna/Trinetra",
    },
    {
      name: "DEEPFAKE",
      description: "Spatial-Temporal deepfake detector utilizing MTCNN face alignment, EfficientNet-B0, and Bi-LSTM temporal pass.",
      language: "Python",
      stars: 1,
      forks: 0,
      url: "https://github.com/Kruxhna/DEEPFAKE",
    },
    {
      name: "Aptitude",
      description: "Gamified adaptive GATE training platform with ELO engine, spaced repetition, and offline-first mobile client.",
      language: "TypeScript",
      stars: 1,
      forks: 0,
      url: "https://github.com/Kruxhna/Aptitude",
    },
    {
      name: "smart-scan-ew",
      description: "Adaptive RF spectrum scanning engine maximizing POI against agile radar frequency-hopping patterns.",
      language: "Python",
      stars: 1,
      forks: 0,
      url: "https://github.com/Kruxhna/smart-scan-ew",
    },
  ],
};

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#38BDF8",
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  "C++": "#EC4899",
  "Jupyter Notebook": "#F97316",
  HTML: "#E34C26",
  CSS: "#8B5CF6",
};

// Generate simulated activity heatmap grid data (18 weeks x 7 days)
const GENERATED_HEATMAP = Array.from({ length: 18 * 7 }, (_, i) => {
  // Higher activity density in recent weeks
  const factor = (i / (18 * 7)) * 0.7 + 0.3;
  const rand = Math.random();
  if (rand < 0.28) return 0;
  if (rand < 0.6) return Math.min(3, Math.floor(rand * 3 * factor) + 1);
  if (rand < 0.88) return Math.min(4, Math.floor(rand * 4 * factor) + 2);
  return 4;
});

export function LabSection() {
  const [activeMainTab, setActiveMainTab] = useState<"terminal" | "neural">("terminal");
  const [githubViewMode, setGithubViewMode] = useState<"overview" | "readme_stats">("overview");

  // Live GitHub Data state
  const [githubData, setGithubData] = useState<GithubProfileData>(FALLBACK_GITHUB_DATA);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Live Cache");

  // Terminal State
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      cmd: "help",
      output: TERMINAL_COMMANDS.help,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [cmdHistoryList, setCmdHistoryList] = useState<string[]>(["help"]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  // Neural Simulator State (Preserved for full forensic demo)
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simResult, setSimResult] = useState<{
    score: number;
    label: string;
    latency: number;
  } | null>(null);

  const commandChips = ["help", "skills", "contact", "projects", "whoami", "clear"];

  // Fetch real GitHub Profile and Repos
  const fetchGithubData = async () => {
    setIsFetchingGithub(true);
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch("https://api.github.com/users/Kruxhna", {
          headers: { Accept: "application/vnd.github.v3+json" },
        }),
        fetch("https://api.github.com/users/Kruxhna/repos?sort=updated&per_page=15", {
          headers: { Accept: "application/vnd.github.v3+json" },
        }),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        let topRepos: GithubRepo[] = FALLBACK_GITHUB_DATA.top_repos;
        let totalStars = 5;

        if (reposRes.ok) {
          const reposData = await reposRes.json();
          if (Array.isArray(reposData) && reposData.length > 0) {
            totalStars = reposData.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
            topRepos = reposData
              .filter((r) => !r.fork)
              .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
              .slice(0, 5)
              .map((r) => ({
                name: r.name,
                description: r.description || "Open source software project by Krushna.",
                language: r.language || "Python",
                stars: r.stargazers_count || 0,
                forks: r.forks_count || 0,
                url: r.html_url,
              }));
          }
        }

        setGithubData({
          login: userData.login || "Kruxhna",
          name: userData.name || "Krushna",
          avatar_url: userData.avatar_url || FALLBACK_GITHUB_DATA.avatar_url,
          html_url: userData.html_url || "https://github.com/Kruxhna",
          bio: userData.bio || FALLBACK_GITHUB_DATA.bio,
          public_repos: userData.public_repos || 15,
          followers: userData.followers || 10,
          following: userData.following || 6,
          total_stars: Math.max(totalStars, 5),
          streak_days: 18,
          top_repos: topRepos.length > 0 ? topRepos : FALLBACK_GITHUB_DATA.top_repos,
        });
        setLastSyncedTime("Just now");
      }
    } catch {
      // In case of rate limits or offline mode, keep fallback gracefully
      setLastSyncedTime("Cached");
    } finally {
      setIsFetchingGithub(false);
    }
  };

  useEffect(() => {
    fetchGithubData();
  }, []);

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    // Track command in history list
    setCmdHistoryList((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    if (lower === "clear") {
      setHistory([]);
      setInputVal("");
      return;
    }

    let special: HistoryItem["isSpecial"] = undefined;
    if (lower === "contact") special = "contact";
    else if (lower === "skills") special = "skills";
    else if (lower === "projects") special = "projects";
    else if (lower === "github") special = "github";

    const output =
      TERMINAL_COMMANDS[lower] ||
      `zsh: command not found: "${trimmed}". Type "help" to see available commands or click the suggestion chips above.`;

    setHistory((prev) => [...prev, { cmd: trimmed, output, isSpecial: special }]);
    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistoryList.length === 0) return;
      const nextIndex =
        historyIndex === -1 ? cmdHistoryList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(cmdHistoryList[nextIndex] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= cmdHistoryList.length) {
        setHistoryIndex(-1);
        setInputVal("");
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistoryList[nextIndex] || "");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = inputVal.toLowerCase().trim();
      if (!current) return;
      const match = commandChips.find((c) => c.startsWith(current));
      if (match) {
        setInputVal(match);
      }
    }
  };

  useEffect(() => {
    if (activeMainTab === "terminal") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, activeMainTab]);

  // Simulation Runner
  const runSimulation = () => {
    if (simRunning) return;
    setSimRunning(true);
    setSimStep(1);
    setSimResult(null);

    const t1 = setTimeout(() => setSimStep(2), 700);
    const t2 = setTimeout(() => setSimStep(3), 1400);
    const t3 = setTimeout(() => setSimStep(4), 2100);
    const t4 = setTimeout(() => {
      setSimStep(5);
      setSimResult({
        score: 0.964,
        label: "SYNTHETIC ARTIFACT DETECTED (DEEPFAKE)",
        latency: 26.8,
      });
      setSimRunning(false);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  };

  const copyContactEmail = () => {
    navigator.clipboard.writeText("krushna.aiml@gmail.com");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="lab" className="relative py-20 sm:py-28">
      {/* Section Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[#10B981]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span>Interactive Terminal & Activity Widget</span>
        </div>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl">
              Terminal & Live GitHub Activity
            </h2>
            <p className="mt-1 max-w-2xl text-sm sm:text-base text-[#A1A1AA]">
              Query Krushna&apos;s stack and credentials through a macOS-styled interactive terminal or inspect real-time GitHub stats, repositories, and contribution telemetry.
            </p>
          </div>

          {/* Tab Switcher: Terminal & Activity vs Neural Simulator */}
          <div className="flex gap-1.5 rounded-xl border border-[#27272A] bg-[#111115]/80 p-1 backdrop-blur-md">
            <button
              onClick={() => setActiveMainTab("terminal")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeMainTab === "terminal"
                  ? "bg-[#18181b] text-[#10B981] border border-[#10B981]/30 shadow-sm"
                  : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              <TerminalIcon className="h-3.5 w-3.5" />
              <span>Interactive CLI & GitHub</span>
            </button>
            <button
              onClick={() => setActiveMainTab("neural")}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeMainTab === "neural"
                  ? "bg-[#18181b] text-[#38BDF8] border border-[#38BDF8]/30 shadow-sm"
                  : "text-[#71717A] hover:text-[#A1A1AA]"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Neural Inspector</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Widget Area */}
      <div className="mt-8">
        {activeMainTab === "terminal" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* LEFT / MAIN COLUMN: Interactive Fake Terminal (macOS Style) */}
            <div
              className={`transition-all duration-300 ${
                isTerminalExpanded ? "lg:col-span-12" : "lg:col-span-7"
              }`}
            >
              <div
                className="group relative flex flex-col rounded-2xl border border-[#27272A] bg-[#0c0c0e] shadow-2xl transition-all duration-200 hover:border-[#38BDF8]/30"
                onClick={() => terminalInputRef.current?.focus()}
              >
                {/* macOS Style Window Titlebar */}
                <div className="flex items-center justify-between border-b border-[#27272A] bg-[#141418] px-4 py-3 select-none">
                  {/* macOS Traffic Light Window Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory([]);
                      }}
                      title="Clear terminal"
                      className="group/dot relative flex h-3 w-3 items-center justify-center rounded-full bg-[#FF5F56] border border-[#E0443E] transition-opacity hover:opacity-90"
                    >
                      <span className="opacity-0 group-hover/dot:opacity-100 text-[8px] font-bold text-black leading-none">
                        ×
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTerminalExpanded(false);
                      }}
                      title="Reset window size"
                      className="group/dot relative flex h-3 w-3 items-center justify-center rounded-full bg-[#FFBD2E] border border-[#DEA123] transition-opacity hover:opacity-90"
                    >
                      <span className="opacity-0 group-hover/dot:opacity-100 text-[8px] font-bold text-black leading-none">
                        –
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTerminalExpanded(!isTerminalExpanded);
                      }}
                      title={isTerminalExpanded ? "Collapse width" : "Expand width"}
                      className="group/dot relative flex h-3 w-3 items-center justify-center rounded-full bg-[#27C93F] border border-[#1AAB29] transition-opacity hover:opacity-90"
                    >
                      <span className="opacity-0 group-hover/dot:opacity-100 text-[7px] font-bold text-black leading-none">
                        +
                      </span>
                    </button>

                    {/* Window Title with Prompt Identification */}
                    <div className="ml-3 flex items-center gap-2 font-mono text-[11px] text-[#A1A1AA]">
                      <TerminalIcon className="h-3 w-3 text-[#10B981]" />
                      <span className="font-semibold text-[#FAFAFA]">visitor@krushna-aiml:~</span>
                      <span className="text-[#52525B]">|</span>
                      <span className="text-[10px] text-[#71717A]">zsh</span>
                    </div>
                  </div>

                  {/* Window Controls Right */}
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#71717A]">
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTerminalExpanded(!isTerminalExpanded);
                      }}
                      className="rounded p-1 hover:bg-[#27272A] hover:text-[#FAFAFA] transition-colors"
                      title={isTerminalExpanded ? "Restore" : "Maximize"}
                    >
                      {isTerminalExpanded ? (
                        <Minimize2 className="h-3.5 w-3.5" />
                      ) : (
                        <Maximize2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Command Suggestion Chips */}
                <div className="flex flex-wrap items-center gap-1.5 border-b border-[#27272A]/70 bg-[#111115]/60 px-4 py-2 font-mono">
                  <span className="text-[10.5px] text-[#71717A] mr-1">Quick run:</span>
                  {commandChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCommand(chip);
                      }}
                      className={`rounded-md border px-2 py-0.5 text-[11px] transition-all ${
                        chip === "help"
                          ? "border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8] hover:bg-[#38BDF8]/20"
                          : chip === "skills"
                          ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20"
                          : chip === "contact"
                          ? "border-[#A855F7]/40 bg-[#A855F7]/10 text-[#C084FC] hover:bg-[#A855F7]/20"
                          : chip === "clear"
                          ? "border-[#71717A]/40 bg-[#18181b] text-[#A1A1AA] hover:text-[#FAFAFA]"
                          : "border-[#27272A] bg-[#18181b] text-[#A1A1AA] hover:border-[#38BDF8]/40 hover:text-[#FAFAFA]"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Terminal Console Output Scroll Area */}
                <div className="min-h-[340px] max-h-[440px] overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs">
                  {/* Terminal Greeting Banner */}
                  <div className="rounded-lg border border-[#27272A]/60 bg-[#111115]/50 p-3 text-[11px] leading-relaxed text-[#A1A1AA]">
                    <div className="flex items-center gap-2 text-[#38BDF8] font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-[#38BDF8]" />
                      <span>Krushna&apos;s AIML Interactive Terminal [Build v2026.10]</span>
                    </div>
                    <p className="mt-1 text-[#71717A]">
                      Connected to <span className="text-[#FAFAFA]">visitor@krushna-aiml</span>. Type commands below or click the quick action chips.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-[#52525B]">
                      <span>Commands: <strong className="text-[#10B981]">help</strong>, <strong className="text-[#10B981]">skills</strong>, <strong className="text-[#10B981]">contact</strong>, <strong className="text-[#10B981]">clear</strong></span>
                      <span>• Tab completion supported</span>
                    </div>
                  </div>

                  {/* Render Command Execution History */}
                  {history.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 animate-in fade-in duration-200">
                      {/* Executed Command Line */}
                      <div className="flex items-center gap-2 text-[#10B981]">
                        <span className="font-bold select-none text-[#10B981]">
                          visitor@krushna-aiml:~$
                        </span>
                        <span className="font-bold text-[#FAFAFA]">{item.cmd}</span>
                      </div>

                      {/* Render Rich Special Output Cards or Monospace Output */}
                      {item.isSpecial === "contact" ? (
                        <div className="rounded-xl border border-[#A855F7]/30 bg-[#14121a] p-4 text-[12px] space-y-3">
                          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
                            <span className="font-bold text-[#C084FC]">
                              ⚡ DIRECT COMMUNICATION & SOCIALS
                            </span>
                            <button
                              onClick={copyContactEmail}
                              className="flex items-center gap-1 rounded bg-[#27272A] px-2 py-0.5 text-[10px] text-[#A1A1AA] hover:text-white"
                            >
                              {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedLink ? "Copied Email!" : "Copy Email"}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <a
                              href="https://www.linkedin.com/in/krushna-nole/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 rounded-lg border border-[#27272A] bg-[#18181b] p-2.5 text-[#A1A1AA] hover:border-[#0A66C2] hover:text-[#FAFAFA] transition-all"
                            >
                              <LinkedinIcon className="h-4 w-4 text-[#0A66C2]" />
                              <div>
                                <div className="text-[10px] text-[#71717A]">LinkedIn</div>
                                <div className="font-bold text-[#FAFAFA]">/in/krushna-nole ↗</div>
                              </div>
                            </a>
                            <a
                              href="mailto:krushna.aiml@gmail.com"
                              className="flex items-center gap-2.5 rounded-lg border border-[#27272A] bg-[#18181b] p-2.5 text-[#A1A1AA] hover:border-emerald-500 hover:text-[#FAFAFA] transition-all"
                            >
                              <div className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                                @
                              </div>
                              <div>
                                <div className="text-[10px] text-[#71717A]">Direct Email</div>
                                <div className="font-bold text-[#FAFAFA]">krushna.aiml@gmail.com</div>
                              </div>
                            </a>
                            <a
                              href="https://github.com/Kruxhna"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 rounded-lg border border-[#27272A] bg-[#18181b] p-2.5 text-[#A1A1AA] hover:border-[#38BDF8] hover:text-[#FAFAFA] transition-all"
                            >
                              <GithubIcon className="h-4 w-4 text-[#38BDF8]" />
                              <div>
                                <div className="text-[10px] text-[#71717A]">GitHub Profile</div>
                                <div className="font-bold text-[#FAFAFA]">github.com/Kruxhna ↗</div>
                              </div>
                            </a>
                            <a
                              href="https://codolio.com/profile/Kruxhna/problemSolving"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 rounded-lg border border-[#27272A] bg-[#18181b] p-2.5 text-[#A1A1AA] hover:border-[#F59E0B] hover:text-[#FAFAFA] transition-all"
                            >
                              <CodolioIcon className="h-4 w-4 text-[#F59E0B]" />
                              <div>
                                <div className="text-[10px] text-[#71717A]">Codolio DSA Hub</div>
                                <div className="font-bold text-[#FAFAFA]">300+ Problems Solved ↗</div>
                              </div>
                            </a>
                          </div>
                        </div>
                      ) : item.isSpecial === "skills" ? (
                        <div className="rounded-xl border border-[#10B981]/30 bg-[#0d1612] p-4 text-[11.5px] space-y-3">
                          <div className="font-bold text-[#10B981] flex items-center justify-between border-b border-[#10B981]/20 pb-2">
                            <span>🧠 TECHNICAL MATRIX: AI/ML & DSA</span>
                            <span className="text-[10px] text-[#71717A]">B.E. AIML Mumbai</span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="font-bold text-[#38BDF8]">[AI/ML & Deep Learning]</span>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {[
                                  "PyTorch",
                                  "TensorFlow",
                                  "OpenCV",
                                  "Hugging Face",
                                  "CUDA",
                                  "EfficientNet",
                                  "Bi-LSTM",
                                  "llama.cpp",
                                  "FastAPI",
                                  "Scikit-Learn",
                                ].map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded border border-[#38BDF8]/20 bg-[#38BDF8]/10 px-1.5 py-0.5 text-[10.5px] text-[#38BDF8]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-1">
                              <span className="font-bold text-[#F59E0B]">[Data Structures & Algorithms]</span>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {[
                                  "C++ (STL)",
                                  "Python",
                                  "Dynamic Programming",
                                  "Graphs & Trees",
                                  "Binary Search",
                                  "Heaps",
                                  "Backtracking",
                                  "Sliding Window",
                                  "300+ Solved",
                                ].map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-1.5 py-0.5 text-[10.5px] text-[#F59E0B]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-[#D4D4D8]">
                          {item.output}
                        </pre>
                      )}
                    </div>
                  ))}

                  <div ref={terminalEndRef} />
                </div>

                {/* Terminal Interactive Input Prompt Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommand(inputVal);
                  }}
                  className="flex items-center gap-2 border-t border-[#27272A] bg-[#141418] px-4 py-3 font-mono text-xs"
                >
                  <span className="text-[#10B981] font-bold select-none whitespace-nowrap">
                    visitor@krushna-aiml:~$
                  </span>
                  <input
                    ref={terminalInputRef}
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="type 'help', 'skills', 'contact', 'clear'..."
                    className="flex-1 bg-transparent text-sm text-[#FAFAFA] placeholder-[#52525B] focus:outline-none"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg border border-[#27272A] bg-[#18181b] px-3 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:border-[#10B981]/50 hover:bg-[#10B981]/10 hover:text-[#10B981] transition-all"
                  >
                    <span>Run</span>
                    <span className="text-[10px] text-[#71717A]">↵</span>
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Live GitHub Profile Card */}
            <div
              className={`transition-all duration-300 ${
                isTerminalExpanded ? "hidden" : "lg:col-span-5"
              }`}
            >
              <SpotlightCard className="h-full flex flex-col justify-between border-[#27272A] bg-[#0c0c0e]/95 p-5 sm:p-6 shadow-2xl">
                <div>
                  {/* GitHub Profile Header & Real-time Status */}
                  <div className="flex items-start justify-between gap-3 border-b border-[#27272A] pb-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {/* Live Avatar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={githubData.avatar_url}
                          alt={githubData.name}
                          className="h-12 w-12 rounded-xl border-2 border-[#27272A] object-cover shadow-md"
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#10B981] ring-2 ring-[#0c0c0e]">
                          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[#FAFAFA] text-base leading-tight">
                            {githubData.name}
                          </h3>
                          <Badge variant="cyan" size="sm">
                            github.com/{githubData.login}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-[#71717A] font-mono">
                          B.E. AIML @ University of Mumbai
                        </p>
                      </div>
                    </div>

                    {/* Refresh / Sync Live Data Button */}
                    <button
                      onClick={fetchGithubData}
                      disabled={isFetchingGithub}
                      title="Sync live stats from GitHub API"
                      className="rounded-lg border border-[#27272A] bg-[#18181b] p-2 text-[#71717A] hover:border-[#38BDF8]/40 hover:text-[#FAFAFA] transition-all"
                    >
                      <RotateCw
                        className={`h-4 w-4 ${isFetchingGithub ? "animate-spin text-[#38BDF8]" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Bio Synopsis */}
                  <p className="mt-4 text-xs leading-relaxed text-[#A1A1AA]">
                    {githubData.bio}
                  </p>

                  {/* High-Impact Real-Time Stats Bento Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 font-mono">
                    <div className="rounded-xl border border-[#27272A] bg-[#141418] p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#71717A]">
                        <Star className="h-3 w-3 text-[#EAB308]" />
                        <span>Stars</span>
                      </div>
                      <div className="mt-1 text-base font-bold text-[#FAFAFA]">
                        {githubData.total_stars}+
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#27272A] bg-[#141418] p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#71717A]">
                        <Code2 className="h-3 w-3 text-[#38BDF8]" />
                        <span>Repos</span>
                      </div>
                      <div className="mt-1 text-base font-bold text-[#FAFAFA]">
                        {githubData.public_repos}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#27272A] bg-[#141418] p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] text-[#71717A]">
                        <Flame className="h-3 w-3 text-[#EF4444]" />
                        <span>Streak</span>
                      </div>
                      <div className="mt-1 text-base font-bold text-[#10B981]">
                        {githubData.streak_days}d
                      </div>
                    </div>
                  </div>

                  {/* Sub-view Switcher: Repos vs Readme Stats Card */}
                  <div className="mt-4 flex rounded-lg border border-[#27272A] bg-[#111115] p-1 text-xs">
                    <button
                      onClick={() => setGithubViewMode("overview")}
                      className={`flex-1 rounded-md py-1 font-medium transition-all ${
                        githubViewMode === "overview"
                          ? "bg-[#18181b] text-[#FAFAFA] shadow"
                          : "text-[#71717A] hover:text-[#A1A1AA]"
                      }`}
                    >
                      Top Repositories & Heatmap
                    </button>
                    <button
                      onClick={() => setGithubViewMode("readme_stats")}
                      className={`flex-1 rounded-md py-1 font-medium transition-all ${
                        githubViewMode === "readme_stats"
                          ? "bg-[#18181b] text-[#38BDF8] shadow"
                          : "text-[#71717A] hover:text-[#A1A1AA]"
                      }`}
                    >
                      GitHub Readme Stats
                    </button>
                  </div>

                  {/* View 1: Top Repositories & Contribution Heatmap */}
                  {githubViewMode === "overview" ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                        <span>FEATURED OSS REPOSITORIES</span>
                        <span>{githubData.top_repos.length} SHOWCASED</span>
                      </div>

                      <div className="space-y-2">
                        {githubData.top_repos.slice(0, 3).map((repo) => (
                          <a
                            key={repo.name}
                            href={repo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block rounded-xl border border-[#27272A] bg-[#111115] p-3 transition-all hover:border-[#38BDF8]/40 hover:bg-[#18181b]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-[#FAFAFA] group-hover:text-[#38BDF8] transition-colors">
                                {repo.name}
                              </span>
                              <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A]">
                                {repo.stars > 0 && (
                                  <span className="flex items-center gap-1 text-[#EAB308]">
                                    <Star className="h-3 w-3 fill-current" />
                                    {repo.stars}
                                  </span>
                                )}
                                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#38BDF8]" />
                              </div>
                            </div>
                            <p className="mt-1 line-clamp-1 text-[11px] text-[#A1A1AA]">
                              {repo.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              {repo.language && (
                                <span className="flex items-center gap-1 font-mono text-[10px] text-[#71717A]">
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{
                                      backgroundColor:
                                        LANGUAGE_COLORS[repo.language] || "#10B981",
                                    }}
                                  />
                                  <span>{repo.language}</span>
                                </span>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Simulated 18-week Contribution Streak Heatmap */}
                      <div className="mt-4 rounded-xl border border-[#27272A] bg-[#111115] p-3">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] mb-2">
                          <span className="flex items-center gap-1.5 text-[#10B981]">
                            <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
                            <span>18-Week Contribution Activity</span>
                          </span>
                          <span>Synced</span>
                        </div>
                        <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
                          {GENERATED_HEATMAP.map((level, i) => (
                            <div
                              key={i}
                              title={`Activity level: ${level}`}
                              className={`h-2.5 w-2.5 rounded-xs transition-colors ${
                                level === 0
                                  ? "bg-[#18181b]"
                                  : level === 1
                                  ? "bg-emerald-950 border border-emerald-900/60"
                                  : level === 2
                                  ? "bg-emerald-800"
                                  : level === 3
                                  ? "bg-emerald-600"
                                  : "bg-emerald-400 shadow-xs shadow-emerald-500/50"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[9.5px] font-mono text-[#52525B]">
                          <span>Less active</span>
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-xs bg-[#18181b]" />
                            <span className="h-2 w-2 rounded-xs bg-emerald-950" />
                            <span className="h-2 w-2 rounded-xs bg-emerald-800" />
                            <span className="h-2 w-2 rounded-xs bg-emerald-600" />
                            <span className="h-2 w-2 rounded-xs bg-emerald-400" />
                          </div>
                          <span>More active</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View 2: Live GitHub Readme Stats Embeds */
                    <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                      <div className="text-[11px] font-mono text-[#71717A]">
                        GITHUB README STATS CARD:
                      </div>
                      <div className="rounded-xl border border-[#27272A] bg-[#111115] p-2 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://github-readme-stats.vercel.app/api?username=Kruxhna&show_icons=true&theme=tokyonight&hide_border=true&bg_color=111115&title_color=38bdf8&icon_color=10b981&text_color=a1a1aa"
                          alt="GitHub Readme Stats"
                          className="w-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="text-[11px] font-mono text-[#71717A] pt-1">
                        CONTRIBUTION STREAK:
                      </div>
                      <div className="rounded-xl border border-[#27272A] bg-[#111115] p-2 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://github-readme-streak-stats.herokuapp.com/?user=Kruxhna&theme=tokyonight&hide_border=true&background=111115&stroke=27272a&ring=38bdf8&fire=f59e0b&currStreakNum=10b981"
                          alt="GitHub Streak Stats"
                          className="w-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Link to GitHub Profile */}
                <div className="mt-5 border-t border-[#27272A] pt-4">
                  <a
                    href="https://github.com/Kruxhna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/10 py-2.5 text-xs font-semibold text-[#38BDF8] transition-all hover:bg-[#38BDF8] hover:text-black hover:shadow-lg hover:shadow-[#38BDF8]/20"
                  >
                    <GithubIcon className="h-4 w-4" />
                    <span>View https://github.com/Kruxhna ↗</span>
                  </a>
                </div>
              </SpotlightCard>
            </div>
          </div>
        ) : (
          /* TAB 2: Neural Architecture Forensic Simulator */
          <SpotlightCard className="p-6 sm:p-8 border-[#27272A] bg-[#111115]/95">
            <div className="flex flex-col justify-between gap-4 border-b border-[#27272A] pb-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="cyan">Spatial-Temporal Forensic Pipeline</Badge>
                  <span className="font-mono text-xs text-[#71717A]">
                    PyTorch • 16-Frame Sequence
                  </span>
                </div>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#FAFAFA]">
                  EfficientNet-B0 + Bidirectional LSTM Pipeline Visualizer
                </h3>
              </div>

              <button
                onClick={runSimulation}
                disabled={simRunning}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  simRunning
                    ? "bg-[#27272A] text-[#71717A] cursor-not-allowed"
                    : "bg-[#38BDF8] text-black hover:bg-[#38BDF8]/90 hover:shadow-lg hover:shadow-[#38BDF8]/20"
                }`}
              >
                {simRunning ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin text-[#38BDF8]" />
                    <span>Processing Frames...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Run Simulated Video Inference</span>
                  </>
                )}
              </button>
            </div>

            {/* Pipeline Stage Blocks */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Stage 1 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 1
                    ? "border-[#38BDF8] bg-[#38BDF8]/5 shadow-md shadow-[#38BDF8]/5"
                    : "border-[#27272A] bg-[#09090b]/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                  <span>STAGE 01</span>
                  {simStep >= 1 && <span className="text-[#38BDF8]">ACTIVE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#FAFAFA]">
                  MTCNN Face Alignment
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Detects landmarks & crops 16 consecutive 224x224 RGB face patches.
                </p>
                <div className="mt-3 rounded bg-[#18181b] p-1.5 font-mono text-[11px] text-[#71717A]">
                  Shape: [16, 3, 224, 224]
                </div>
              </div>

              {/* Stage 2 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 2
                    ? "border-[#38BDF8] bg-[#38BDF8]/5 shadow-md shadow-[#38BDF8]/5"
                    : "border-[#27272A] bg-[#09090b]/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                  <span>STAGE 02</span>
                  {simStep >= 2 && <span className="text-[#38BDF8]">ACTIVE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#FAFAFA]">
                  Spatial Feature Backbone
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  EfficientNet-B0 maps frame textures into compact latent representations.
                </p>
                <div className="mt-3 rounded bg-[#18181b] p-1.5 font-mono text-[11px] text-[#71717A]">
                  Shape: [16, 1280]
                </div>
              </div>

              {/* Stage 3 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 3
                    ? "border-[#38BDF8] bg-[#38BDF8]/5 shadow-md shadow-[#38BDF8]/5"
                    : "border-[#27272A] bg-[#09090b]/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                  <span>STAGE 03</span>
                  {simStep >= 3 && <span className="text-[#38BDF8]">ACTIVE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#FAFAFA]">
                  Bi-LSTM Temporal Pass
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Learns inter-frame velocity, micro-flicker, and facial landmark jitter.
                </p>
                <div className="mt-3 rounded bg-[#18181b] p-1.5 font-mono text-[11px] text-[#71717A]">
                  Hidden Dim: 256 x 2
                </div>
              </div>

              {/* Stage 4 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 4
                    ? "border-[#10B981] bg-[#10B981]/5 shadow-md shadow-[#10B981]/5"
                    : "border-[#27272A] bg-[#09090b]/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
                  <span>STAGE 04</span>
                  {simStep >= 4 && <span className="text-[#10B981]">COMPLETE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#FAFAFA]">
                  Forensic Confidence
                </div>
                <p className="mt-1 text-xs text-[#A1A1AA]">
                  Linear classification head with sigmoid probability calibration.
                </p>
                <div className="mt-3 rounded bg-[#18181b] p-1.5 font-mono text-[11px] text-[#71717A]">
                  Output: [0.0 to 1.0]
                </div>
              </div>
            </div>

            {/* Inference Telemetry & Output */}
            {simResult && (
              <div className="mt-6 rounded-xl border border-[#38BDF8]/40 bg-[#09090b] p-5 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-wider text-red-400 font-semibold">
                        {simResult.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-[#A1A1AA]">
                      Inter-frame temporal discontinuity score:{" "}
                      <span className="font-mono text-[#FAFAFA] font-bold">
                        {(simResult.score * 100).toFixed(1)}%
                      </span>{" "}
                      synthetic confidence.
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#71717A]">
                    <div>
                      <span>LATENCY: </span>
                      <span className="text-[#10B981] font-bold">
                        {simResult.latency}ms
                      </span>
                    </div>
                    <div>
                      <span>DEVICE: </span>
                      <span className="text-[#FAFAFA]">CUDA:0 (RTX)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SpotlightCard>
        )}
      </div>
    </section>
  );
}
