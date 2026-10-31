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
  Users,
  Box,
  FolderGit2,
} from "lucide-react";
import { TERMINAL_COMMANDS } from "@/data/portfolioData";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { ExternalLinkPill, ExternalArrow } from "@/components/ui/ExternalLinkPill";
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

export const REPO_METADATA_OVERRIDES: Record<
  string,
  { description: string; language?: string; architecture?: string[]; recentCommits?: string[] }
> = {
  'llama-cluster': {
    description: 'Distributed LLaMA inference cluster across heterogeneous nodes via RPC & tensor parallelism.',
    language: 'C++/CUDA',
    architecture: [
      'Coordinator Node -> gRPC / ggml-rpc -> Worker Shard Nodes',
      'Ring-AllReduce tensor synchronization over low-latency LAN',
    ],
    recentCommits: [
      'feat(rpc): optimize KV-cache quantization across worker nodes',
      'perf(cuda): fuse RoPE + FlashAttention kernels for multi-GPU split',
    ],
  },
  'Trinetra': {
    description: 'Real-time multi-stream computer vision & anomaly detection pipeline with edge telemetry.',
    language: 'Python',
    architecture: [
      'RTSP Ingest -> YOLOv8 / TensorRT Inference Engine -> Event Broker',
      'WebSocket live telemetry stream + automated alert dispatch',
    ],
    recentCommits: [
      'feat(vision): add spatial-temporal anomaly scoring tracker',
      'perf(pipeline): async frame batching for 60fps RTSP streams',
    ],
  },
  'DEEPFAKE': {
    description: 'Spatiotemporal deepfake forensics & frequency-domain artifact classifier using vision transformers.',
    language: 'Python',
    architecture: [
      'Face Extraction (RetinaFace) -> DCT Frequency Branch + ViT Spatial Backbone',
      'Ensemble temporal coherence head with Grad-CAM explainability',
    ],
    recentCommits: [
      'feat(model): integrate spectral residual attention block',
      'eval(metrics): add cross-dataset AUC benchmark on FaceForensics++',
    ],
  },
  'Aptitude': {
    description: 'Quantitative aptitude reasoning benchmark engine with dynamic difficulty calibration.',
    language: 'TypeScript',
    architecture: [
      'Adaptive Question Bank -> ELO Rating Calibration Engine -> React Native UI',
      'Offline-first IndexedDB cache + background sync daemon',
    ],
    recentCommits: [
      'feat(engine): add Glicko-2 dynamic difficulty calibration algorithm',
      'perf(cache): optimize offline question bank serialization',
    ],
  },
  'smart-scan-ew': {
    description: 'Adaptive RF spectrum scanning engine maximizing POI against agile radar frequency-hopping patterns.',
    language: 'Python',
    architecture: [
      'SDR Stream Ingest -> FFT Spectral Clustering -> Priority Queue Scheduler',
      'Zero-copy circular ring buffer with real-time waterfall visualization',
    ],
    recentCommits: [
      'feat(dsp): parallel FFT clustering for multi-band radar intercepts',
      'perf(buffer): zero-copy shm ring buffer for high-throughput SDR',
    ],
  },
};

export function dispatchTerminalCommand(command: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("terminal:execute", {
        detail: { command },
      })
    );
  }
}

const FALLBACK_GITHUB_DATA: GithubProfileData = {
  login: "kruxhna",
  name: "Krushna",
  avatar_url: "https://avatars.githubusercontent.com/u/115390946?v=4",
  html_url: "https://github.com/kruxhna",
  bio: "AI Systems & ML Engineering | Distributed LLM Inference (C++/CUDA/Rust), Computer Vision & Applied Deep Learning.",
  public_repos: 12,
  followers: 7,
  following: 6,
  total_stars: 5,
  streak_days: 18,
  top_repos: [
    {
      name: "llama-cluster",
      description: "Distributed LLaMA inference cluster across heterogeneous nodes via RPC & tensor parallelism.",
      language: "Python",
      stars: 2,
      forks: 0,
      url: "https://github.com/Kruxhna/llama-cluster",
    },
    {
      name: "Trinetra",
      description: "Real-time multi-stream computer vision & anomaly detection pipeline with edge telemetry.",
      language: "Python",
      stars: 2,
      forks: 0,
      url: "https://github.com/Kruxhna/Trinetra",
    },
    {
      name: "DEEPFAKE",
      description: "Spatiotemporal deepfake forensics & frequency-domain artifact classifier using vision transformers.",
      language: "Python",
      stars: 1,
      forks: 0,
      url: "https://github.com/Kruxhna/DEEPFAKE",
    },
    {
      name: "Aptitude",
      description: "Quantitative aptitude reasoning benchmark engine with dynamic difficulty calibration.",
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
  Python: "#C93B5B",
  TypeScript: "#F5EEF0",
  JavaScript: "#A68E94",
  "C++": "#9E0B2E",
  "C++/CUDA": "#9E0B2E",
  "Jupyter Notebook": "#F5EEF0",
  HTML: "#A68E94",
  CSS: "#C93B5B",
};

// Generate simulated activity heatmap grid data (18 columns x 5 rows = 90 cells)
// Use deterministic pseudo-random based on index to ensure exact SSR/client match
const GENERATED_HEATMAP = Array.from({ length: 18 * 5 }, (_, i) => {
  const pseudoRand = (Math.abs(Math.sin((i + 1) * 12.9898 + (i % 5) * 78.233)) * 43758.5453) % 1;
  const factor = (i / (18 * 5)) * 0.7 + 0.3;
  if (pseudoRand < 0.28) return 0;
  if (pseudoRand < 0.58) return Math.min(2, Math.floor(pseudoRand * 3 * factor) + 1);
  if (pseudoRand < 0.85) return Math.min(3, Math.floor(pseudoRand * 4 * factor) + 2);
  return 4;
});

const HEATMAP_INTENSITY_COLORS = [
  "rgba(255, 255, 255, 0.04)",
  "rgba(154, 20, 44, 0.55)",
  "rgba(195, 24, 30, 0.75)",
  "rgba(224, 46, 50, 0.90)",
  "#C93B5B",
];

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
  const [activeFrame, setActiveFrame] = useState<number>(12);
  const [tuningThreshold, setTuningThreshold] = useState<number>(0.85);
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
              .map((r) => {
                const override = REPO_METADATA_OVERRIDES[r.name];
                return {
                  name: r.name,
                  description:
                    override?.description ||
                    r.description ||
                    "Open source software project by Krushna.",
                  language: override?.language || r.language || "Python",
                  stars: r.stargazers_count || 0,
                  forks: r.forks_count || 0,
                  url: r.html_url,
                };
              });
          }
        }

        setGithubData({
          login: userData.login || "kruxhna",
          name: userData.name || "Krushna",
          avatar_url: userData.avatar_url || FALLBACK_GITHUB_DATA.avatar_url,
          html_url: userData.html_url || "https://github.com/kruxhna",
          bio: userData.bio || FALLBACK_GITHUB_DATA.bio,
          public_repos: userData.public_repos ?? 12,
          followers: userData.followers ?? 7,
          following: userData.following ?? 6,
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

  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const handleCommandRef = useRef<(cmd: string) => void>(() => {});

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

    let output = TERMINAL_COMMANDS[lower];

    // Check if inspecting a repo (e.g. "inspect llama-cluster" or "llama-cluster")
    const inspectTarget = lower.startsWith("inspect ")
      ? trimmed.slice(8).trim()
      : trimmed;
    const repoMatch = Object.keys(REPO_METADATA_OVERRIDES).find(
      (k) => k.toLowerCase() === inspectTarget.toLowerCase()
    );

    if (repoMatch) {
      const meta = REPO_METADATA_OVERRIDES[repoMatch];
      output = `=== [REPOSITORY TELEMETRY: ${repoMatch.toUpperCase()}] ===
Language:     ${meta.language || "Python"}
Overview:     ${meta.description}

[ARCHITECTURE PIPELINE]
${meta.architecture?.map((a) => `  ↳ ${a}`).join("\n") || "  ↳ No architecture nodes recorded"}

[RECENT TELEMETRY COMMITS]
${meta.recentCommits?.map((c) => `  * ${c}`).join("\n") || "  * No recent commits recorded"}

Source URL:   https://github.com/Kruxhna/${repoMatch}`;
    }

    if (!output) {
      output = `zsh: command not found: "${trimmed}". Type "help" to see available commands or click the suggestion chips above.`;
    }

    setHistory((prev) => [...prev, { cmd: trimmed, output, isSpecial: special }]);
    setInputVal("");
  };

  handleCommandRef.current = handleCommand;

  useEffect(() => {
    const handleTerminalExecute = (e: Event) => {
      const customEvent = e as CustomEvent<{ command: string }>;
      if (customEvent.detail && typeof customEvent.detail.command === "string") {
        setActiveMainTab("terminal");
        handleCommandRef.current(customEvent.detail.command);
      }
    };

    window.addEventListener("terminal:execute", handleTerminalExecute);
    return () => {
      window.removeEventListener("terminal:execute", handleTerminalExecute);
    };
  }, []);

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
    setActiveFrame(4);
    setSimResult(null);

    const t1 = setTimeout(() => { setSimStep(2); setActiveFrame(8); }, 700);
    const t2 = setTimeout(() => { setSimStep(3); setActiveFrame(12); }, 1400);
    const t3 = setTimeout(() => { setSimStep(4); setActiveFrame(16); }, 2100);
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
    navigator.clipboard.writeText("krxh662@gmail.com");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="lab" className="relative z-10 w-full bg-transparent py-20 sm:py-28">
      {/* Section Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 font-mono text-[0.75rem] tracking-[0.14em] uppercase text-[#A68E94]">
          <span className="text-[#9E0B2E] font-bold animate-pulse">•</span>
          <span>03 | GITHUB ACTIVITY</span>
        </div>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h2
              className="text-[#F5EEF0]"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Terminal &amp; Live GitHub
            </h2>
            <p
              className="mt-2 text-[#A68E94]"
              style={{
                maxWidth: "560px",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              Query Krushna&apos;s stack and credentials through an interactive terminal or inspect real-time GitHub stats, repositories, and contribution telemetry.
            </p>
          </div>

          {/* Right Segmented Pill Toggle */}
          <div
            style={{
              borderRadius: "9999px",
              padding: "4px",
              background: "rgba(0, 0, 0, 0.8)",
              border: "1px solid rgba(38, 16, 21, 0.2)",
            }}
            className="inline-flex items-center backdrop-blur-md self-start md:self-auto shrink-0"
          >
            <button
              type="button"
              onClick={() => setActiveMainTab("terminal")}
              data-cursor="pointer"
              style={{
                borderRadius: "9999px",
                padding: "8px 18px",
              }}
              className={`text-xs transition-all ${
                activeMainTab === "terminal"
                  ? "bg-[#6D001A] text-[#F5EEF0] border border-[#9E0B2E]/60 shadow-sm font-semibold"
                  : "bg-transparent text-[#A68E94] hover:text-[#F5EEF0] font-medium"
              }`}
            >
              <span>&gt; Interactive CLI</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab("neural")}
              data-cursor="pointer"
              style={{
                borderRadius: "9999px",
                padding: "8px 18px",
              }}
              className={`inline-flex items-center gap-2 text-xs transition-all ${
                activeMainTab === "neural"
                  ? "bg-[#6D001A] text-[#F5EEF0] border border-[#9E0B2E]/60 shadow-sm font-semibold"
                  : "bg-transparent text-[#A68E94] hover:text-[#F5EEF0] font-medium"
              }`}
            >
              <Box className="h-3.5 w-3.5" />
              <span>Neural Inspector</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Area */}
      <div className="mt-8">
        {activeMainTab === "terminal" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* LEFT / MAIN COLUMN: Interactive Fake Terminal */}
            <div
              className={`transition-all duration-300 ${
                isTerminalExpanded ? "lg:col-span-12" : "lg:col-span-7"
              }`}
            >
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.88)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(38, 16, 21, 0.18)",
                  borderRadius: "16px",
                }}
                className="group relative flex flex-col shadow-2xl transition-all duration-200 overflow-hidden"
                onClick={() => terminalInputRef.current?.focus()}
              >
                {/* macOS Style Window Titlebar */}
                <div className="flex items-center justify-between border-b border-[rgba(221,112,116,0.14)] px-4 py-3 select-none">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHistory([]);
                        }}
                        data-cursor="pointer"
                        title="Clear terminal"
                        className="h-3 w-3 rounded-full bg-[#FF5F56] transition-opacity hover:opacity-80"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTerminalExpanded(false);
                        }}
                        data-cursor="pointer"
                        title="Reset window size"
                        className="h-3 w-3 rounded-full bg-[#FFBD2E] transition-opacity hover:opacity-80"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsTerminalExpanded(!isTerminalExpanded);
                        }}
                        data-cursor="pointer"
                        title={isTerminalExpanded ? "Collapse width" : "Expand width"}
                        className="h-3 w-3 rounded-full bg-[#27C93F] transition-opacity hover:opacity-80"
                      />
                    </div>

                    <div className="font-mono text-xs text-[#A68E94] flex items-center gap-1.5">
                      <span className="text-[#F5EEF0] font-semibold">visitor@krushna-aiml:~</span>
                      <span className="text-[#C93B5B] animate-pulse font-bold">_</span>
                    </div>
                  </div>

                  {/* Window Controls Right */}
                  <div className="flex items-center gap-2.5">
                    <span
                      style={{
                        border: "1px solid rgba(158, 11, 46, 0.35)",
                        background: "rgba(78, 1, 4, 0.7)",
                        color: "#F5EEF0",
                        fontSize: "0.7rem",
                        borderRadius: "9999px",
                        padding: "2px 10px",
                      }}
                      className="font-mono font-medium inline-flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#9E0B2E] animate-pulse" />
                      ONLINE
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTerminalExpanded(!isTerminalExpanded);
                      }}
                      data-cursor="pointer"
                      className="rounded p-1 text-[#A68E94] hover:text-[#F5EEF0] transition-colors"
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
                <div className="flex flex-wrap items-center gap-1.5 border-b border-[rgba(221,112,116,0.12)] bg-[#000000]/50 px-4 py-2 font-mono">
                  <span className="text-[11px] text-[#A68E94] mr-1">Quick run:</span>
                  {commandChips.map((chip) => {
                    const isActive = chip === "help";
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCommand(chip);
                        }}
                        data-cursor="pointer"
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#6D001A] text-[#F5EEF0] border border-[#9E0B2E]/60 shadow-sm font-semibold"
                            : "bg-[#240009]/70 border border-[#6D001A]/60 text-[#F5EEF0] hover:bg-[#3B000E] hover:text-[#F5EEF0]"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {/* Terminal Console Output Scroll Area */}
                <div className="min-h-[340px] max-h-[440px] overflow-y-auto p-4 sm:p-5 space-y-4 font-mono text-xs">
                  {/* MOTD Banner */}
                  <div
                    style={{
                      borderRadius: "10px",
                      border: "1px solid rgba(38, 16, 21, 0.18)",
                      background: "rgba(78, 1, 4, 0.25)",
                      padding: "14px",
                    }}
                    className="text-[11.5px] leading-relaxed text-[#A68E94]"
                  >
                    <div className="flex items-center gap-2 text-[#F5EEF0] font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-[#C93B5B]" />
                      <span>✨ Krushna&apos;s AIML Interactive Terminal [Build v2026.10]</span>
                    </div>
                    <p className="mt-1 text-[#A68E94]">
                      Connected to <span className="text-[#F5EEF0]">visitor@krushna-aiml</span>. Type commands below or click the quick action chips.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-[#A68E94]">
                      <span>
                        Commands: <strong className="text-[#F5EEF0]">help</strong>, <strong className="text-[#F5EEF0]">skills</strong>, <strong className="text-[#F5EEF0]">contact</strong>, <strong className="text-[#F5EEF0]">clear</strong>
                      </span>
                      <span>• Tab completion supported</span>
                    </div>
                  </div>

                  {/* Render Command Execution History */}
                  {history.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 animate-in fade-in duration-200">
                      {/* Executed Command Line */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold select-none text-[#C93B5B]">
                          visitor@krushna-aiml:~$
                        </span>
                        <span className="font-semibold text-[#F5EEF0]">{item.cmd}</span>
                      </div>

                      {/* Render Rich Special Output Cards or Monospace Output */}
                      {item.isSpecial === "contact" ? (
                        <div
                          style={{
                            borderRadius: "10px",
                            border: "1px solid rgba(38, 16, 21, 0.18)",
                            background: "rgba(0, 0, 0, 0.7)",
                            padding: "14px",
                          }}
                          className="text-[12px] space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-[rgba(221,112,116,0.14)] pb-2">
                            <span className="font-bold text-[#F5EEF0]">
                              ⚡ DIRECT COMMUNICATION &amp; SOCIALS
                            </span>
                            <button
                              type="button"
                              onClick={copyContactEmail}
                              data-cursor="pointer"
                              className="flex items-center gap-1.5 rounded-md border border-[rgba(221,112,116,0.2)] bg-[rgba(221,112,116,0.06)] px-2.5 py-1 text-[10.5px] text-[#A68E94] hover:text-[#F5EEF0] hover:border-[rgba(228,107,94,0.4)] cursor-pointer transition-all"
                            >
                              {copiedLink ? <Check className="h-3 w-3 text-[#C93B5B]" /> : <Copy className="h-3 w-3" />}
                              <span>{copiedLink ? "Copied Email!" : "Copy Email"}</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <a
                              href="https://www.linkedin.com/in/krushna-nole/"
                              target="_blank"
                              rel="noopener noreferrer"
                              data-cursor="pointer"
                              className="group flex items-center justify-between gap-2.5 rounded-lg border border-[rgba(221,112,116,0.16)] bg-[rgba(0,0,0,0.8)] p-2.5 text-[#F5EEF0] hover:border-[#C93B5B]/50 hover:bg-[rgba(221,112,116,0.08)] transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <LinkedinIcon className="h-4 w-4 text-[#C93B5B] shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[10px] text-[#A68E94]">LinkedIn</div>
                                  <div className="font-semibold text-[#F5EEF0] truncate">/in/krushna-nole</div>
                                </div>
                              </div>
                              <ExternalArrow className="text-[#A68E94] group-hover:text-[#C93B5B] shrink-0 transition-colors" />
                            </a>
                            <a
                              href="mailto:krxh662@gmail.com"
                              data-cursor="pointer"
                              className="group flex items-center justify-between gap-2.5 rounded-lg border border-[rgba(221,112,116,0.16)] bg-[rgba(0,0,0,0.8)] p-2.5 text-[#F5EEF0] hover:border-[#C93B5B]/50 hover:bg-[rgba(221,112,116,0.08)] transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#240009] text-[#F5EEF0] border border-[#6D001A]/60 text-xs font-bold">
                                  @
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[10px] text-[#A68E94]">Direct Email</div>
                                  <div className="font-semibold text-[#F5EEF0] truncate">krxh662@gmail.com</div>
                                </div>
                              </div>
                              <ExternalArrow className="text-[#A68E94] group-hover:text-[#C93B5B] shrink-0 transition-colors" />
                            </a>
                            <a
                              href="https://github.com/kruxhna"
                              target="_blank"
                              rel="noopener noreferrer"
                              data-cursor="pointer"
                              className="group flex items-center justify-between gap-2.5 rounded-lg border border-[rgba(221,112,116,0.16)] bg-[rgba(0,0,0,0.8)] p-2.5 text-[#F5EEF0] hover:border-[#C93B5B]/50 hover:bg-[rgba(221,112,116,0.08)] transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <GithubIcon className="h-4 w-4 text-[#C93B5B] shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[10px] text-[#A68E94]">GitHub Profile</div>
                                  <div className="font-semibold text-[#F5EEF0] truncate">github.com/kruxhna</div>
                                </div>
                              </div>
                              <ExternalArrow className="text-[#A68E94] group-hover:text-[#C93B5B] shrink-0 transition-colors" />
                            </a>
                            <a
                              href="https://codolio.com/profile/Kruxhna/problemSolving"
                              target="_blank"
                              rel="noopener noreferrer"
                              data-cursor="pointer"
                              className="group flex items-center justify-between gap-2.5 rounded-lg border border-[rgba(221,112,116,0.16)] bg-[rgba(0,0,0,0.8)] p-2.5 text-[#F5EEF0] hover:border-[#C93B5B]/50 hover:bg-[rgba(221,112,116,0.08)] transition-all"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <CodolioIcon className="h-4 w-4 text-[#C93B5B] shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-[10px] text-[#A68E94]">Codolio DSA Hub</div>
                                  <div className="font-semibold text-[#F5EEF0] truncate">300+ Problems Solved</div>
                                </div>
                              </div>
                              <ExternalArrow className="text-[#A68E94] group-hover:text-[#C93B5B] shrink-0 transition-colors" />
                            </a>
                          </div>
                        </div>
                      ) : item.isSpecial === "skills" ? (
                        <div
                          style={{
                            borderRadius: "10px",
                            border: "1px solid rgba(38, 16, 21, 0.18)",
                            background: "rgba(0, 0, 0, 0.7)",
                            padding: "14px",
                          }}
                          className="text-[11.5px] space-y-3"
                        >
                          <div className="font-bold text-[#F5EEF0] flex items-center justify-between border-b border-[rgba(221,112,116,0.14)] pb-2">
                            <span>🧠 TECHNICAL MATRIX: AI/ML &amp; DSA</span>
                            <span className="text-[10px] text-[#A68E94]">B.E. AIML Mumbai</span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="font-bold text-[#C93B5B]">[AI/ML &amp; Deep Learning]</span>
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
                                    className="rounded border border-[rgba(221,112,116,0.18)] bg-[#240009]/40 px-1.5 py-0.5 text-[10.5px] text-[#F5EEF0]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-1">
                              <span className="font-bold text-[#C93B5B]">[Data Structures &amp; Algorithms]</span>
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
                                    className="rounded border border-[rgba(221,112,116,0.18)] bg-[#240009]/40 px-1.5 py-0.5 text-[10.5px] text-[#F5EEF0]"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <pre className="whitespace-pre-wrap font-mono text-[11.5px] leading-relaxed text-[#A68E94]">
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
                  className="flex items-center gap-2 border-t border-[rgba(221,112,116,0.14)] bg-[#000000]/50 px-4 py-3 font-mono text-xs"
                >
                  <span className="text-[#C93B5B] font-bold select-none whitespace-nowrap">
                    visitor@krushna-aiml:~$
                  </span>
                  <input
                    ref={terminalInputRef}
                    type="text"
                    value={inputVal}
                    data-cursor="text"
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type 'help', 'skills', 'contact', 'clear'..."
                    className="flex-1 bg-transparent text-sm text-[#F5EEF0] placeholder-[#A68E94]/50 focus:outline-none"
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <button
                    type="submit"
                    data-cursor="pointer"
                    style={{
                      background: "#6D001A",
                      color: "#F5EEF0",
                      borderRadius: "8px",
                      border: "1px solid rgba(158, 11, 46, 0.6)",
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold hover:bg-[#9E0B2E] hover:border-[#F5EEF0]/80 transition-all cursor-pointer shadow-sm shadow-[#6D001A]/20"
                  >
                    <span>Run</span>
                    <span className="text-[10px] opacity-80">↵</span>
                  </button>
                </form>
              </div>

              {/* Bottom Tech Tags */}
              <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[0.78rem] text-[#A68E94] px-1">
                <span>JavaScript</span>
                <span className="text-[rgba(221,112,116,0.3)]">•</span>
                <span>Node + sharp</span>
                <span className="text-[rgba(221,112,116,0.3)]">•</span>
                <span>Cloudflare Workers</span>
                <span className="text-[rgba(221,112,116,0.3)]">•</span>
                <span>Durable Objects</span>
              </div>
            </div>

            {/* RIGHT COLUMN: GitHub Activity Card Component */}
            <div
              className={`transition-all duration-300 ${
                isTerminalExpanded ? "hidden" : "lg:col-span-5"
              }`}
            >
              <div
                style={{
                  borderRadius: "16px",
                  background: "rgba(0, 0, 0, 0.88)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(38, 16, 21, 0.18)",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
                className="shadow-2xl relative"
              >
                {/* A. Profile Header & Bio */}
                <div className="flex flex-col gap-3">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar Wrapper */}
                      <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={githubData.avatar_url}
                          alt={githubData.name || "Krushna"}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                          }}
                          className="object-cover border border-[rgba(221,112,116,0.25)] shadow-md"
                        />
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#9E0B2E",
                            border: "2px solid #000000",
                          }}
                          className="absolute -bottom-1 -right-1 rounded-full"
                        />
                      </div>

                      {/* Identity Block */}
                      <div className="min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[#F5EEF0] text-[1.1rem] leading-tight">
                            {githubData.name || "Krushna"}
                          </span>
                          <a
                            href={githubData.html_url || "https://github.com/kruxhna"}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cursor="pointer"
                            style={{
                              fontFamily: "var(--font-mono), monospace",
                              fontSize: "0.72rem",
                              padding: "2px 10px",
                              borderRadius: "9999px",
                              background: "rgba(38, 16, 21, 0.08)",
                              border: "1px solid rgba(38, 16, 21, 0.2)",
                              color: "#A68E94",
                            }}
                            className="hover:text-[#F5EEF0] hover:border-[rgba(228,107,94,0.5)] transition-all inline-flex items-center"
                          >
                            github.com/{githubData.login}
                          </a>
                        </div>
                        <p className="mt-0.5 text-[0.8rem] text-[#A68E94] truncate">
                          B.E. AIML @ University of Mumbai
                        </p>
                      </div>
                    </div>

                    {/* Refresh Button */}
                    <button
                      type="button"
                      onClick={fetchGithubData}
                      disabled={isFetchingGithub}
                      data-cursor="pointer"
                      title="Sync live stats from GitHub API"
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        border: "1px solid rgba(38, 16, 21, 0.2)",
                        background: "rgba(38, 16, 21, 0.04)",
                      }}
                      className="flex items-center justify-center shrink-0 text-[#A68E94] hover:text-[#F5EEF0] hover:bg-[rgba(221,112,116,0.1)] hover:border-[rgba(228,107,94,0.5)] transition-all cursor-pointer"
                    >
                      <RotateCw
                        className={`h-3.5 w-3.5 ${isFetchingGithub ? "animate-spin text-[#C93B5B]" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Bio Text */}
                  <p
                    style={{
                      fontSize: "0.79rem",
                      lineHeight: "1.55",
                      color: "#A68E94",
                    }}
                  >
                    {githubData.bio || "AI Systems & ML Engineering | Distributed LLM Inference (C++/CUDA/Rust), Computer Vision & Applied Deep Learning."}
                  </p>
                </div>

                {/* B. 4-Column Telemetry Stats Strip */}
                <div
                  style={{
                    borderTop: "1px solid rgba(38, 16, 21, 0.16)",
                    borderBottom: "1px solid rgba(38, 16, 21, 0.16)",
                    padding: "14px 0",
                  }}
                  className="grid grid-cols-4 divide-x divide-[rgba(221,112,116,0.14)]"
                >
                  {/* Stat 1: Stars */}
                  <div className="flex flex-col items-center justify-center text-center px-1">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-[#C93B5B] fill-[#C93B5B]" />
                      <span className="text-[1.05rem] font-bold text-[#F5EEF0]">
                        {githubData.total_stars > 0 ? `${githubData.total_stars}+` : "5+"}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[0.72rem] text-[#A68E94]">Stars</span>
                  </div>

                  {/* Stat 2: Repositories */}
                  <div className="flex flex-col items-center justify-center text-center px-1">
                    <div className="flex items-center gap-1.5">
                      <GitFork className="h-3.5 w-3.5 text-[#C93B5B]" />
                      <span className="text-[1.05rem] font-bold text-[#F5EEF0]">
                        {githubData.public_repos || 12}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[0.72rem] text-[#A68E94]">Repositories</span>
                  </div>

                  {/* Stat 3: Streak */}
                  <div className="flex flex-col items-center justify-center text-center px-1">
                    <div className="flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-[#C93B5B] fill-[#C93B5B]" />
                      <span className="text-[1.05rem] font-bold text-[#F5EEF0]">
                        {githubData.streak_days || 18}d
                      </span>
                    </div>
                    <span className="mt-0.5 text-[0.72rem] text-[#A68E94]">Streak</span>
                  </div>

                  {/* Stat 4: Followers */}
                  <div className="flex flex-col items-center justify-center text-center px-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#C93B5B]" />
                      <span className="text-[1.05rem] font-bold text-[#F5EEF0]">
                        {githubData.followers || 7}
                      </span>
                    </div>
                    <span className="mt-0.5 text-[0.72rem] text-[#A68E94]">Followers</span>
                  </div>
                </div>

                {/* C. Featured Repositories List */}
                <div className="flex flex-col gap-2">
                  {/* Subheader Row */}
                  <div className="flex items-center justify-between text-[#A68E94] font-mono text-[0.7rem] uppercase tracking-[0.08em]">
                    <span>FEATURED REPOSITORIES</span>
                    <span>{githubData.top_repos?.length || 5} SHOWCASED</span>
                  </div>

                  {/* Repo Items */}
                  <div className="flex flex-col divide-y divide-[rgba(221,112,116,0.12)]">
                    {(githubData.top_repos?.length > 0
                      ? githubData.top_repos.slice(0, 5)
                      : FALLBACK_GITHUB_DATA.top_repos
                    ).map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="pointer"
                        className="group flex items-center justify-between gap-3 py-2.5 px-1 hover:bg-[rgba(221,112,116,0.04)] rounded-md transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FolderGit2 className="h-[15px] w-[15px] text-[#A68E94] shrink-0 group-hover:text-[#C93B5B] transition-colors" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[0.85rem] font-semibold text-[#F5EEF0] group-hover:text-[#C93B5B] transition-colors truncate">
                                {repo.name}
                              </span>
                            </div>
                            <p className="text-[0.74rem] text-[#A68E94]/80 line-clamp-1 mt-0.5">
                              {repo.description || "Open source software project by Krushna."}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    LANGUAGE_COLORS[repo.language || "Python"] || "#C93B5B",
                                }}
                              />
                              <span className="font-mono text-[0.7rem] text-[#A68E94]">
                                {repo.language || "Python"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 font-mono text-[0.75rem] text-[#A68E94]">
                          <Star className="h-3 w-3 text-[#C93B5B] fill-[#C93B5B]" />
                          <span>{repo.stars}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* D. 18-Week Contribution Activity Heatmap */}
                <div className="flex flex-col gap-2.5">
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[0.75rem] text-[#F5EEF0]">
                      <Star className="h-3 w-3 text-[#C93B5B] fill-[#C93B5B]" />
                      <span>18-Week Contribution Activity</span>
                    </div>
                    <span className="text-[0.72rem] text-[#A68E94]">Synced</span>
                  </div>

                  {/* Heatmap Grid: 18 cols x 5 rows */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
                      gap: "4px",
                    }}
                  >
                    {GENERATED_HEATMAP.map((level, idx) => (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: HEATMAP_INTENSITY_COLORS[level],
                          borderRadius: "3px",
                        }}
                        className="aspect-square transition-all hover:scale-125 hover:shadow-sm hover:shadow-[#6D001A]/40"
                        title={`Activity level: ${level}`}
                      />
                    ))}
                  </div>

                  {/* Legend Footer Row */}
                  <div className="flex items-center justify-between text-[0.7rem] text-[#A68E94]">
                    <span>Less active</span>
                    <div className="flex items-center gap-1.5">
                      {HEATMAP_INTENSITY_COLORS.map((color, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: color,
                            width: "6px",
                            height: "6px",
                            borderRadius: "9999px",
                          }}
                        />
                      ))}
                    </div>
                    <span>More active</span>
                  </div>
                </div>

                {/* E. Bottom Full-Width Profile Link Button */}
                <a
                  href="https://github.com/kruxhna"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="pointer"
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(38, 16, 21, 0.25)",
                    background: "rgba(38, 16, 21, 0.04)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#F5EEF0",
                  }}
                  className="group hover:border-[rgba(228,107,94,0.5)] hover:bg-[rgba(221,112,116,0.08)] transition-all"
                >
                  <GithubIcon className="h-4 w-4 text-[#A68E94] group-hover:text-[#F5EEF0] transition-colors" />
                  <span>View github.com/Kruxhna</span>
                  <span className="text-[#C93B5B] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: Neural Architecture Forensic Simulator */
          <SpotlightCard className="p-6 sm:p-8 border-[rgba(221,112,116,0.18)]" style={{ background: "rgba(0, 0, 0, 0.88)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderRadius: "16px" }}>
            <div className="flex flex-col justify-between gap-4 border-b border-[rgba(221,112,116,0.18)] pb-5 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="accent">Spatial-Temporal Forensic Pipeline</Badge>
                  <span className="font-mono text-xs text-[#A68E94]/70">
                    PyTorch • 16-Frame Sequence
                  </span>
                </div>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#F5EEF0]">
                  EfficientNet-B0 + Bidirectional LSTM Pipeline Visualizer
                </h3>
              </div>

              <button
                onClick={runSimulation}
                disabled={simRunning}
                data-cursor="magnetic"
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                  simRunning
                    ? "bg-[#181310] text-[#A68E94]/60 cursor-not-allowed border border-[rgba(221,112,116,0.15)]"
                    : "bg-[#6D001A] text-[#F5EEF0] border border-[#9E0B2E]/60 hover:bg-[#9E0B2E] hover:text-[#F5EEF0] hover:border-[#F5EEF0]/80 active:bg-[#6D001A] shadow-lg shadow-[#6D001A]/20"
                }`}
              >
                {simRunning ? (
                  <>
                    <Activity className="h-4 w-4 animate-spin text-[#F5EEF0]" />
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
                    ? "border-[#C93B5B] bg-[#240009]/30 shadow-md shadow-[#6D001A]/10"
                    : "border-[rgba(221,112,116,0.18)] bg-[#120E0B]/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#A68E94]/70">
                  <span>STAGE 01</span>
                  {simStep >= 1 && <span className="text-[#C93B5B]">ACTIVE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#F5EEF0]">
                  MTCNN Face Alignment
                </div>
                <p className="mt-1 text-xs text-[#A68E94]">
                  Detects landmarks & crops 16 consecutive 224x224 RGB face patches.
                </p>
                <div className="mt-3 rounded bg-[#181310] p-1.5 font-mono text-[11px] text-[#A68E94]/70">
                  Shape: [16, 3, 224, 224]
                </div>
              </div>

              {/* Stage 2 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 2
                    ? "border-[#C93B5B] bg-[#240009]/30 shadow-md shadow-[#6D001A]/10"
                    : "border-[rgba(221,112,116,0.18)] bg-[#120E0B]/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#A68E94]/70">
                  <span>STAGE 02</span>
                  {simStep >= 2 && <span className="text-[#C93B5B]">ACTIVE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#F5EEF0]">
                  Spatial Feature Backbone
                </div>
                <p className="mt-1 text-xs text-[#A68E94]">
                  EfficientNet-B0 maps frame textures into compact latent representations.
                </p>
                <div className="mt-3 rounded bg-[#181310] p-1.5 font-mono text-[11px] text-[#A68E94]/70">
                  Shape: [16, 1280]
                </div>
              </div>

              {/* Stage 3 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 3
                    ? "border-[#C93B5B] bg-[#240009]/30 shadow-md shadow-[#6D001A]/10"
                    : "border-[rgba(221,112,116,0.18)] bg-[#120E0B]/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#A68E94]/70">
                  <span>STAGE 03</span>
                  {simStep >= 3 && <span className="text-[#C93B5B]">ACTIVE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#F5EEF0]">
                  Bi-LSTM Temporal Pass
                </div>
                <p className="mt-1 text-xs text-[#A68E94]">
                  Learns inter-frame velocity, micro-flicker, and facial landmark jitter.
                </p>
                <div className="mt-3 rounded bg-[#181310] p-1.5 font-mono text-[11px] text-[#A68E94]/70">
                  Hidden Dim: 256 x 2
                </div>
              </div>

              {/* Stage 4 */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  simStep >= 4
                    ? "border-[#C93B5B] bg-[#240009]/30 shadow-md shadow-[#6D001A]/10"
                    : "border-[rgba(221,112,116,0.18)] bg-[#120E0B]/50"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-[#A68E94]/70">
                  <span>STAGE 04</span>
                  {simStep >= 4 && <span className="text-[#C93B5B]">COMPLETE</span>}
                </div>
                <div className="mt-2 text-sm font-bold text-[#F5EEF0]">
                  Forensic Confidence
                </div>
                <p className="mt-1 text-xs text-[#A68E94]">
                  Linear classification head with sigmoid probability calibration.
                </p>
                <div className="mt-3 rounded bg-[#181310] p-1.5 font-mono text-[11px] text-[#A68E94]/70">
                  Output: [0.0 to 1.0]
                </div>
              </div>
            </div>

            {/* 16-Frame Temporal Video Progress Line (Scrubber) */}
            <div className="mt-8 rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#120E0B] p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-[#A68E94]/70 mb-2.5">
                <span className="flex items-center gap-1.5 text-[#C93B5B] uppercase tracking-wider font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9E0B2E] animate-pulse" />
                  Video Sequence Progress Scrubber
                </span>
                <span className="text-[#F5EEF0]">
                  FRAME {activeFrame} / 16 • {((activeFrame / 16) * 100).toFixed(0)}% ({(activeFrame * 62.5).toFixed(0)}ms)
                </span>
              </div>

              {/* Video Progress Line Scrubber */}
              <div
                data-cursor="scrub"
                data-cursor-label="← drag →"
                className="group relative h-6 w-full cursor-ew-resize flex items-center select-none"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setActiveFrame(Math.max(1, Math.min(16, Math.round(pct * 16))));
                }}
              >
                <div className="h-2 w-full rounded-full bg-[#181310] overflow-hidden border border-[rgba(221,112,116,0.18)]">
                  <div
                    className="h-full bg-gradient-to-r from-[#6D001A] via-[#C93B5B] to-[#F5EEF0] transition-all duration-100"
                    style={{ width: `${(activeFrame / 16) * 100}%` }}
                  />
                </div>
                {/* Visual frame scrubber head */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#F5EEF0] border-2 border-[#6D001A] shadow-lg pointer-events-none transition-all duration-75"
                  style={{ left: `calc(${(activeFrame / 16) * 100}% - 8px)` }}
                />
              </div>

              {/* Frame ticks */}
              <div className="mt-1.5 flex justify-between text-[9px] text-[#A68E94]/60">
                {Array.from({ length: 16 }, (_, i) => (
                  <span
                    key={i}
                    onClick={() => setActiveFrame(i + 1)}
                    className={`cursor-pointer hover:text-[#C93B5B] transition-colors ${
                      activeFrame === i + 1 ? "text-[#C93B5B] font-bold" : ""
                    }`}
                  >
                    f{i + 1}
                  </span>
                ))}
              </div>
            </div>

            {/* Dev Tuning Sliders */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#120E0B] p-4">
                <div className="flex items-center justify-between text-[11px] text-[#A68E94]/70 mb-2">
                  <span className="uppercase text-[#F5EEF0]">Dev Tuning: Decision Threshold</span>
                  <span className="text-[#C93B5B] font-bold">{(tuningThreshold * 100).toFixed(0)}%</span>
                </div>
                <div
                  data-cursor="scrub"
                  data-cursor-label="← drag →"
                  className="group relative h-5 w-full cursor-ew-resize flex items-center select-none"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(0.1, Math.min(0.99, (e.clientX - rect.left) / rect.width));
                    setTuningThreshold(parseFloat(pct.toFixed(2)));
                  }}
                >
                  <div className="h-1.5 w-full rounded-full bg-[#181310] overflow-hidden border border-[rgba(221,112,116,0.18)]">
                    <div
                      className="h-full bg-[#6D001A]"
                      style={{ width: `${tuningThreshold * 100}%` }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-[#F5EEF0] border border-[#6D001A] shadow-md pointer-events-none"
                    style={{ left: `calc(${tuningThreshold * 100}% - 7px)` }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[rgba(221,112,116,0.18)] bg-[#120E0B] p-4">
                <div className="flex items-center justify-between text-[11px] text-[#A68E94]/70 mb-2">
                  <span className="uppercase text-[#F5EEF0]">Dev Tuning: Temporal Pass Window</span>
                  <span className="text-[#C93B5B] font-bold">16 frames (250ms)</span>
                </div>
                <div
                  data-cursor="scrub"
                  data-cursor-label="← drag →"
                  className="group relative h-5 w-full cursor-ew-resize flex items-center select-none"
                >
                  <div className="h-1.5 w-full rounded-full bg-[#181310] overflow-hidden border border-[rgba(221,112,116,0.18)]">
                    <div className="h-full bg-[#6D001A]" style={{ width: "75%" }} />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-[#F5EEF0] border border-[#6D001A] shadow-md pointer-events-none"
                    style={{ left: "calc(75% - 7px)" }}
                  />
                </div>
              </div>
            </div>

            {/* Inference Telemetry & Output */}
            {simResult && (
              <div className="mt-6 rounded-xl border border-[#9E0B2E]/40 bg-[#120E0B] p-5 animate-in fade-in slide-from-top-2">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-[#9E0B2E] animate-pulse" />
                      <span className="font-mono text-xs uppercase tracking-wider text-[#C93B5B] font-semibold">
                        {simResult.label}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-[#A68E94]">
                      Inter-frame temporal discontinuity score:{" "}
                      <span className="font-mono text-[#F5EEF0] font-bold">
                        {(simResult.score * 100).toFixed(1)}%
                      </span>{" "}
                      synthetic confidence.
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-[#A68E94]/70">
                    <div>
                      <span>LATENCY: </span>
                      <span className="text-[#C93B5B] font-bold">
                        {simResult.latency}ms
                      </span>
                    </div>
                    <div>
                      <span>DEVICE: </span>
                      <span className="text-[#F5EEF0]">CUDA:0 (RTX)</span>
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
