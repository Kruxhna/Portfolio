"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TsunamiScrollReveal } from "@/components/ui/TsunamiScrollReveal";

// ============================================================================
// DATA TYPES & DEFINITIONS
// ============================================================================

export type VisualType =
  | "inference-mesh"
  | "agent-pipeline"
  | "spatial-canvas"
  | "cloud-topology";

export interface CapabilityItem {
  id: string;
  number: string;
  categoryPill: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  visualType: "inference-mesh" | "agent-pipeline" | "spatial-canvas" | "cloud-topology";
  image?: string;
}

// Backward-compatible alias
export type CapabilityCardItem = CapabilityItem;

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: "distributed-inference",
    number: "01",
    categoryPill: "Distributed Inference & Systems",
    eyebrow: "DISTRIBUTED INFERENCE & SYSTEMS PROGRAMMING",
    title: "Low-Latency Compute & Inference Engines",
    description:
      "I architect distributed LLM inference meshes and hardware-accelerated compute pipelines in Rust, C++, and CUDA. From multi-node pipeline parallelism over Tailscale to custom memory management and runtime optimization, I engineer systems built to eliminate compute bottlenecks.",
    tags: [
      "Rust",
      "C++ / CUDA",
      "llama.cpp",
      "Pipeline Parallelism",
      "Tailscale Mesh",
      "CMake",
    ],
    visualType: "inference-mesh",
    image: "/Images/what-i-do/card-1.jpg",
  },
  {
    id: "applied-ml-agents",
    number: "02",
    categoryPill: "Applied ML & Agentic Systems",
    eyebrow: "APPLIED MACHINE LEARNING & AGENTIC SYSTEMS",
    title: "Autonomous Agents & Deep Learning Pipelines",
    description:
      "I build end-to-end deep learning architectures, computer vision models, and multi-agent workflows that solve high-stakes analytical problems. Whether designing adaptive radar scan optimization or automated forensic triage engines, I focus on deterministic, production-grade intelligence.",
    tags: [
      "PyTorch",
      "AI Agents",
      "Computer Vision",
      "Deep Learning",
      "Python / Pandas",
      "Hugging Face",
    ],
    visualType: "agent-pipeline",
    image: "/Images/what-i-do/card-2.jpg",
  },
  {
    id: "spatial-web-frontend",
    number: "03",
    categoryPill: "Spatial Web & Creative Frontend",
    eyebrow: "SPATIAL WEB & CREATIVE FRONTEND ENGINEERING",
    title: "3D WebGL Interfaces & Tactile Applications",
    description:
      "I craft interactive 3D web experiences and cross-platform mobile applications that merge shader-level graphics with fluid motion design. By pairing Three.js and WebGL2 with Next.js and React Native, I bridge systems-grade performance with editorial visual craft.",
    tags: [
      "Next.js",
      "Three.js / WebGL2",
      "React Native",
      "TypeScript",
      "Framer Motion",
      "Figma",
    ],
    visualType: "spatial-canvas",
    image: "/Images/what-i-do/card-3.jpg",
  },
  {
    id: "microservices-infra",
    number: "04",
    categoryPill: "Microservices & Infrastructure",
    eyebrow: "HIGH-THROUGHPUT MICROSERVICES & INFRASTRUCTURE",
    title: "Asynchronous Backends & Cloud Topology",
    description:
      "I take complex architectures from local prototypes to resilient production environments. Using high-concurrency Rust and Python backends, containerized microservices, and automated CI/CD pipelines, I ensure distributed systems stay observable, fast, and fault-tolerant at scale.",
    tags: [
      "Axum",
      "FastAPI",
      "Docker Compose",
      "Terraform",
      "Jenkins CI/CD",
      "MongoDB Atlas",
    ],
    visualType: "cloud-topology",
    image: "/Images/what-i-do/card-4.png",
  },
];

// Backward-compatible alias
export const CAPABILITIES_DATA = CAPABILITIES;

// ============================================================================
// BESPOKE ARCHITECTURAL SCHEMATIC VISUALS (CRIMSON, CORAL & PEACH PALETTE)
// ============================================================================

function InferenceMeshVisual() {
  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
    >
      <defs>
        <pattern id="inf-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="14" cy="14" r="0.8" fill="#C93B5B" fillOpacity="0.25" />
        </pattern>
      </defs>

      <rect width="640" height="360" fill="url(#inf-grid)" />

      {/* NODE 00: Primary GPU Device (CUDA C++) */}
      <g transform="translate(35, 36)">
        <rect
          width="250"
          height="128"
          rx="14"
          fill="#000000"
          fillOpacity="0.92"
          stroke="#C93B5B"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <text x="18" y="24" fill="#F5EEF0" fontSize="11" fontFamily="monospace" fontWeight="700">
          NODE 00 // RTX GPU (CUDA C++)
        </text>
        <text x="18" y="42" fill="#A68E94" fontSize="9" fontFamily="monospace">
          12GB GDDR6X · 504 GB/s BANDWIDTH
        </text>

        <rect x="18" y="56" width="214" height="26" rx="6" fill="#140D0A" stroke="#C93B5B" strokeOpacity="0.35" />
        <text x="28" y="73" fill="#F5EEF0" fontSize="9.5" fontFamily="monospace" fontWeight="600">
          GGUF Layers 00–18 (Active VRAM)
        </text>

        <rect x="18" y="92" width="102" height="22" rx="4" fill="#C93B5B" fillOpacity="0.18" />
        <text x="26" y="106" fill="#F5EEF0" fontSize="8.5" fontFamily="monospace" fontWeight="600">
          CUDA:0 STREAMS
        </text>
        <rect x="128" y="92" width="104" height="22" rx="4" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.25" />
        <text x="136" y="106" fill="#A68E94" fontSize="8.5" fontFamily="monospace">
          FP16 TENSORS
        </text>
      </g>

      {/* NODE 01: Worker Cluster Node (Rust Daemon) */}
      <g transform="translate(355, 36)">
        <rect
          width="250"
          height="128"
          rx="14"
          fill="#000000"
          fillOpacity="0.92"
          stroke="#A68E94"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <text x="18" y="24" fill="#F5EEF0" fontSize="11" fontFamily="monospace" fontWeight="700">
          NODE 01 // WORKER CLUSTER (RUST)
        </text>
        <text x="18" y="42" fill="#A68E94" fontSize="9" fontFamily="monospace">
          P2P RPC DAEMON · TAILSCALE MESH
        </text>

        <rect x="18" y="56" width="214" height="26" rx="6" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.25" />
        <text x="28" y="73" fill="#F5EEF0" fontSize="9.5" fontFamily="monospace" fontWeight="600">
          GGUF Layers 19–36 (Offload Node)
        </text>

        <rect x="18" y="92" width="102" height="22" rx="4" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.25" />
        <text x="26" y="106" fill="#A68E94" fontSize="8.5" fontFamily="monospace">
          Q4_K_M QUANT
        </text>
        <rect x="128" y="92" width="104" height="22" rx="4" fill="#C93B5B" fillOpacity="0.18" />
        <text x="136" y="106" fill="#F5EEF0" fontSize="8.5" fontFamily="monospace" fontWeight="600">
          SHM RING BUF
        </text>
      </g>

      {/* Interconnect Bridge */}
      <path
        d="M 285 100 C 320 100, 320 100, 355 100"
        stroke="#C93B5B"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle cx="320" cy="100" r="5" fill="#F5EEF0" stroke="#C93B5B" strokeWidth="2" className="animate-pulse" />
      <text x="320" y="82" fill="#C93B5B" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">
        TAILSCALE MESH
      </text>

      {/* LOWER PANEL: Real-Time Tensor Mesh & Telemetry */}
      <g transform="translate(35, 185)">
        <rect
          width="570"
          height="140"
          rx="16"
          fill="#0A0204"
          fillOpacity="0.94"
          stroke="#C93B5B"
          strokeOpacity="0.32"
          strokeWidth="1"
        />

        <g transform="translate(24, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="700">
            QUANTIZED TENSOR MATRIX [4x4]
          </text>
          {Array.from({ length: 16 }, (_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const isHighlight = i === 5 || i === 10 || i === 2 || i === 15;
            return (
              <rect
                key={i}
                x={col * 22}
                y={22 + row * 18}
                width="18"
                height="14"
                rx="3"
                fill={isHighlight ? "#C93B5B" : "#1C1410"}
                stroke="#C93B5B"
                strokeOpacity={isHighlight ? "0.9" : "0.22"}
              />
            );
          })}
        </g>

        <g transform="translate(180, 24)">
          <rect width="180" height="94" rx="8" fill="#000000" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="14" y="22" fill="#A68E94" fontSize="9" fontFamily="monospace">INTERCONNECT TELEMETRY</text>
          <text x="14" y="44" fill="#F5EEF0" fontSize="14" fontFamily="monospace" fontWeight="800">
            &lt; 0.8ms <tspan fontSize="9" fill="#C93B5B">IPC</tspan>
          </text>
          <text x="14" y="66" fill="#F5EEF0" fontSize="12" fontFamily="monospace" fontWeight="700">
            42.4 <tspan fontSize="9" fill="#A68E94">tokens / sec</tspan>
          </text>
          <text x="14" y="83" fill="#C93B5B" fontSize="8.5" fontFamily="monospace" fontWeight="600">
            ZERO-COPY RING BUFFER
          </text>
        </g>

        <g transform="translate(385, 24)">
          <rect width="165" height="94" rx="8" fill="#000000" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="14" y="20" fill="#A68E94" fontSize="8.5" fontFamily="monospace">RUNTIME ENGINE</text>
          <text x="14" y="39" fill="#F5EEF0" fontSize="11" fontFamily="monospace" fontWeight="700">
            llama.cpp + LibTorch
          </text>
          <text x="14" y="58" fill="#A68E94" fontSize="9.5" fontFamily="monospace">
            C++ / CUDA Kernels
          </text>
          <text x="14" y="78" fill="#C93B5B" fontSize="9" fontFamily="monospace" fontWeight="600">
            CMake · FlashAttention-2
          </text>
        </g>
      </g>
    </svg>
  );
}

function AgentPipelineVisual() {
  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
    >
      <defs>
        <pattern id="ml-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="0.8" fill="#C93B5B" fillOpacity="0.22" />
        </pattern>
        <linearGradient id="ml-spark-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C93B5B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#C93B5B" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="url(#ml-grid)" />

      <g transform="translate(35, 36)">
        <rect
          width="570"
          height="140"
          rx="16"
          fill="#000000"
          fillOpacity="0.92"
          stroke="#C93B5B"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />
        <text x="20" y="24" fill="#F5EEF0" fontSize="11" fontFamily="monospace" fontWeight="700">
          AUTONOMOUS MULTI-AGENT &amp; DEEP LEARNING PIPELINE
        </text>

        <g transform="translate(18, 44)">
          <rect width="118" height="74" rx="8" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="10" y="20" fill="#C93B5B" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 01</text>
          <text x="10" y="38" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="600">Stream Ingest</text>
          <text x="10" y="56" fill="#A68E94" fontSize="8.5" fontFamily="monospace">RF / 16-Frame Tensor</text>

          <path d="M 122 37 L 138 37" stroke="#C93B5B" strokeWidth="1.5" />
          <polygon points="138,37 133,34 133,40" fill="#C93B5B" />

          <g transform="translate(144, 0)">
            <rect width="118" height="74" rx="8" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
            <text x="10" y="20" fill="#C93B5B" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 02</text>
            <text x="10" y="38" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="600">Feature Fusion</text>
            <text x="10" y="56" fill="#A68E94" fontSize="8.5" fontFamily="monospace">MTCNN + EfficientNet</text>
          </g>

          <path d="M 268 37 L 284 37" stroke="#C93B5B" strokeWidth="1.5" />
          <polygon points="284,37 279,34 279,40" fill="#C93B5B" />

          <g transform="translate(290, 0)">
            <rect width="118" height="74" rx="8" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
            <text x="10" y="20" fill="#C93B5B" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 03</text>
            <text x="10" y="38" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="600">Agent Reasoning</text>
            <text x="10" y="56" fill="#F5EEF0" fontSize="8.5" fontFamily="monospace">Tool Orchestrator</text>
          </g>

          <path d="M 414 37 L 430 37" stroke="#C93B5B" strokeWidth="1.5" />
          <polygon points="430,37 425,34 425,40" fill="#C93B5B" />

          <g transform="translate(436, 0)">
            <rect width="98" height="74" rx="8" fill="#C93B5B" fillOpacity="0.18" stroke="#C93B5B" strokeOpacity="0.65" />
            <text x="10" y="20" fill="#F5EEF0" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 04</text>
            <text x="10" y="38" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="700">Calibrated</text>
            <text x="10" y="56" fill="#27C93F" fontSize="8.5" fontFamily="monospace" fontWeight="600">Conf: 0.948</text>
          </g>
        </g>
      </g>

      <g transform="translate(35, 192)">
        <rect
          width="570"
          height="136"
          rx="16"
          fill="#0A0204"
          fillOpacity="0.94"
          stroke="#A68E94"
          strokeOpacity="0.24"
          strokeWidth="1"
        />

        <g transform="translate(20, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10" fontFamily="monospace" fontWeight="700">
            TEMPORAL CONFIDENCE TELEMETRY
          </text>
          <g transform="translate(0, 22)">
            <rect width="180" height="72" rx="6" fill="#000000" stroke="#A68E94" strokeOpacity="0.2" />
            <path
              d="M 12 55 Q 32 50, 52 38 T 92 42 T 132 20 L 168 18 L 168 64 L 12 64 Z"
              fill="url(#ml-spark-fill)"
            />
            <path
              d="M 12 55 Q 32 50, 52 38 T 92 42 T 132 20 L 168 18"
              stroke="#C93B5B"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="168" cy="18" r="3.5" fill="#27C93F" />
            <text x="14" y="62" fill="#F5EEF0" fontSize="8.5" fontFamily="monospace" fontWeight="700">
              16-FRAME SPATIAL WINDOW · 14ms
            </text>
          </g>
        </g>

        <g transform="translate(225, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10" fontFamily="monospace" fontWeight="700">
            AGENT REASONING STATE MACHINE
          </text>
          <g transform="translate(0, 22)">
            <rect width="185" height="72" rx="6" fill="#000000" stroke="#C93B5B" strokeOpacity="0.3" />
            <g transform="translate(12, 18)">
              <rect width="72" height="20" rx="4" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.25" />
              <text x="8" y="14" fill="#A68E94" fontSize="8" fontFamily="monospace">[01] INGEST</text>

              <rect x="80" y="0" width="82" height="20" rx="4" fill="#C93B5B" fillOpacity="0.2" stroke="#C93B5B" strokeOpacity="0.5" />
              <text x="88" y="14" fill="#F5EEF0" fontSize="8" fontFamily="monospace" fontWeight="600">[02] TRIAGE</text>
            </g>
            <text x="12" y="56" fill="#F5EEF0" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              DETERMINISTIC VERIFICATION LOOP
            </text>
          </g>
        </g>

        <g transform="translate(435, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10" fontFamily="monospace" fontWeight="700">
            MODEL ARCHITECTURE
          </text>
          <rect x="0" y="22" width="118" height="72" rx="6" fill="#000000" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="10" y="40" fill="#F5EEF0" fontSize="9.5" fontFamily="monospace" fontWeight="700">PyTorch JIT</text>
          <text x="10" y="56" fill="#A68E94" fontSize="8.5" fontFamily="monospace">Bi-LSTM + MTCNN</text>
          <text x="10" y="74" fill="#C93B5B" fontSize="8.5" fontFamily="monospace" fontWeight="600">Hugging Face</text>
        </g>
      </g>
    </svg>
  );
}

function SpatialCanvasVisual() {
  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
    >
      <defs>
        <pattern id="spatial-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#A68E94" strokeWidth="0.5" strokeOpacity="0.06" />
        </pattern>
        <linearGradient id="spatial-curve-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C93B5B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C93B5B" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="url(#spatial-grid)" />

      <g transform="translate(35, 36)">
        <rect
          width="265"
          height="288"
          rx="16"
          fill="#000000"
          fillOpacity="0.92"
          stroke="#C93B5B"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />
        <text x="18" y="26" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="700">
          3D SCENE &amp; CANVAS // THREE.JS
        </text>

        <g stroke="#A68E94" strokeOpacity="0.18" strokeWidth="1">
          <line x1="42" y1="210" x2="224" y2="210" />
          <line x1="62" y1="190" x2="204" y2="190" />
          <line x1="82" y1="170" x2="184" y2="170" />
          <line x1="42" y1="210" x2="92" y2="160" />
          <line x1="133" y1="210" x2="133" y2="160" />
          <line x1="224" y1="210" x2="174" y2="160" />
        </g>

        <g stroke="#C93B5B" strokeWidth="1.5">
          <rect x="98" y="78" width="70" height="70" fill="none" strokeOpacity="0.3" strokeDasharray="3 3" />
          <line x1="78" y1="108" x2="98" y2="78" strokeOpacity="0.5" />
          <line x1="148" y1="108" x2="168" y2="78" strokeOpacity="0.5" />
          <line x1="78" y1="178" x2="98" y2="148" strokeOpacity="0.5" />
          <line x1="148" y1="178" x2="168" y2="148" strokeOpacity="0.5" />
          <rect x="78" y="108" width="70" height="70" fill="#C93B5B" fillOpacity="0.08" stroke="#F5EEF0" strokeWidth="1.6" />
        </g>

        <circle cx="78" cy="108" r="3.5" fill="#C93B5B" />
        <circle cx="148" cy="108" r="3.5" fill="#F5EEF0" />
        <circle cx="78" cy="178" r="3.5" fill="#F5EEF0" />
        <circle cx="148" cy="178" r="3.5" fill="#C93B5B" />

        <text x="18" y="234" fill="#A68E94" fontSize="8.5" fontFamily="monospace">
          Euler: [18.4°, -24.8°, 0.0°] · OrbitControls
        </text>

        <rect x="18" y="248" width="228" height="24" rx="6" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
        <circle cx="30" cy="260" r="3" fill="#27C93F" />
        <text x="40" y="263" fill="#F5EEF0" fontSize="9" fontFamily="monospace" fontWeight="600">
          60 FPS · SHADER PASS · FBO MASK
        </text>
      </g>

      <g transform="translate(325, 36)">
        <rect
          width="280"
          height="288"
          rx="16"
          fill="#000000"
          fillOpacity="0.92"
          stroke="#A68E94"
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />
        <text x="18" y="26" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="700">
          FRAMER MOTION // BEZIER CURVE
        </text>

        <g transform="translate(25, 44)">
          <rect width="230" height="126" rx="8" fill="#0A0204" stroke="#A68E94" strokeOpacity="0.15" />
          <line x1="20" y1="106" x2="210" y2="106" stroke="#A68E94" strokeOpacity="0.2" />
          <line x1="20" y1="20" x2="20" y2="106" stroke="#A68E94" strokeOpacity="0.2" />

          <path
            d="M 20 106 C 65 20, 95 20, 210 20 L 210 106 Z"
            fill="url(#spatial-curve-fill)"
          />

          <path
            d="M 20 106 C 65 20, 95 20, 210 20"
            stroke="#C93B5B"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <line x1="20" y1="106" x2="65" y2="20" stroke="#F5EEF0" strokeOpacity="0.4" strokeDasharray="2 2" />
          <circle cx="65" cy="20" r="3.5" fill="#F5EEF0" />

          <line x1="210" y1="20" x2="95" y2="20" stroke="#F5EEF0" strokeOpacity="0.4" strokeDasharray="2 2" />
          <circle cx="95" cy="20" r="3.5" fill="#C93B5B" />
        </g>

        <rect x="25" y="186" width="230" height="24" rx="6" fill="#140D0A" stroke="#C93B5B" strokeOpacity="0.3" />
        <text x="35" y="202" fill="#F5EEF0" fontSize="9" fontFamily="monospace" fontWeight="600">
          ease: [0.22, 1, 0.36, 1] · 350ms
        </text>

        <g transform="translate(25, 224)">
          <rect width="70" height="22" rx="4" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="10" y="15" fill="#A68E94" fontSize="8" fontFamily="monospace">MOBILE 390</text>

          <rect x="78" y="0" width="70" height="22" rx="4" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="88" y="15" fill="#A68E94" fontSize="8" fontFamily="monospace">TABLET 768</text>

          <rect x="156" y="0" width="74" height="22" rx="4" fill="#C93B5B" fillOpacity="0.2" stroke="#C93B5B" strokeOpacity="0.5" />
          <text x="164" y="15" fill="#F5EEF0" fontSize="8" fontFamily="monospace" fontWeight="700">1720px</text>
        </g>

        <text x="25" y="268" fill="#A68E94" fontSize="8.5" fontFamily="monospace">
          Three.js Canvas + React Native + Figma
        </text>
      </g>
    </svg>
  );
}

function CloudTopologyVisual() {
  return (
    <svg
      viewBox="0 0 640 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full select-none"
    >
      <defs>
        <pattern id="cloud-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="0.8" fill="#C93B5B" fillOpacity="0.25" />
        </pattern>
      </defs>

      <rect width="640" height="360" fill="url(#cloud-grid)" />

      <g transform="translate(35, 36)">
        <rect
          width="570"
          height="146"
          rx="16"
          fill="#000000"
          fillOpacity="0.92"
          stroke="#C93B5B"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />

        <g transform="translate(18, 16)">
          <rect width="534" height="28" rx="6" fill="#140D0A" stroke="#A68E94" strokeOpacity="0.2" />
          <circle cx="14" cy="14" r="3" fill="#27C93F" />
          <text x="26" y="18" fill="#F5EEF0" fontSize="9" fontFamily="monospace" fontWeight="700">
            EDGE INGRESS // CLOUDFLARE CDN · TLS 1.3 · HTTP/3 · RATE LIMIT 10k req/s
          </text>
        </g>

        <g transform="translate(18, 54)">
          <rect width="260" height="74" rx="8" fill="#0A0204" stroke="#C93B5B" strokeOpacity="0.4" />
          <text x="12" y="20" fill="#C93B5B" fontSize="9" fontFamily="monospace" fontWeight="700">SERVICE 01 // RUST AXUM</text>
          <text x="12" y="38" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="600">Tokio Async Worker Daemon</text>
          <text x="12" y="56" fill="#A68E94" fontSize="8.5" fontFamily="monospace">16 Worker Threads · p99 &lt; 0.4ms</text>

          <g transform="translate(274, 0)">
            <rect width="260" height="74" rx="8" fill="#0A0204" stroke="#A68E94" strokeOpacity="0.25" />
            <text x="12" y="20" fill="#C93B5B" fontSize="9" fontFamily="monospace" fontWeight="700">SERVICE 02 // FASTAPI</text>
            <text x="12" y="38" fill="#F5EEF0" fontSize="10.5" fontFamily="monospace" fontWeight="600">Uvicorn ASGI Connection Pool</text>
            <text x="12" y="56" fill="#A68E94" fontSize="8.5" fontFamily="monospace">Pydantic V2 · OpenAPI 3.1 Spec</text>
          </g>
        </g>
      </g>

      <g transform="translate(35, 198)">
        <rect
          width="570"
          height="126"
          rx="16"
          fill="#0A0204"
          fillOpacity="0.94"
          stroke="#A68E94"
          strokeOpacity="0.24"
          strokeWidth="1"
        />

        <g transform="translate(20, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10" fontFamily="monospace" fontWeight="700">
            DISTRIBUTED DATA STORE
          </text>
          <rect x="0" y="22" width="160" height="66" rx="6" fill="#000000" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="10" y="42" fill="#F5EEF0" fontSize="9.5" fontFamily="monospace" fontWeight="600">MongoDB Atlas</text>
          <text x="10" y="60" fill="#A68E94" fontSize="8.5" fontFamily="monospace">Replica Set (3 Nodes)</text>
          <text x="10" y="76" fill="#C93B5B" fontSize="8.5" fontFamily="monospace">Redis Ephemeral Cache</text>
        </g>

        <g transform="translate(200, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10" fontFamily="monospace" fontWeight="700">
            TERRAFORM INFRASTRUCTURE AS CODE
          </text>
          <rect x="0" y="22" width="170" height="66" rx="6" fill="#000000" stroke="#C93B5B" strokeOpacity="0.3" />
          <text x="12" y="42" fill="#27C93F" fontSize="9" fontFamily="monospace">+ 4 to add, 0 to change</text>
          <text x="12" y="60" fill="#A68E94" fontSize="8.5" fontFamily="monospace">AWS ECS · Fargate · VPC</text>
          <text x="12" y="76" fill="#F5EEF0" fontSize="8.5" fontFamily="monospace" fontWeight="600">Docker Compose Orchestration</text>
        </g>

        <g transform="translate(390, 20)">
          <text x="0" y="12" fill="#F5EEF0" fontSize="10" fontFamily="monospace" fontWeight="700">
            AUTOMATED CI/CD &amp; HEALTH
          </text>
          <rect x="0" y="22" width="160" height="66" rx="6" fill="#000000" stroke="#A68E94" strokeOpacity="0.2" />
          <text x="12" y="42" fill="#F5EEF0" fontSize="9" fontFamily="monospace">Jenkins Build #142</text>
          <text x="12" y="60" fill="#27C93F" fontSize="8.5" fontFamily="monospace" fontWeight="600">Pipeline Passed (0m 48s)</text>
          <text x="12" y="76" fill="#C93B5B" fontSize="8.5" fontFamily="monospace" fontWeight="600">UPTIME: 99.99% · 24/7</text>
        </g>
      </g>
    </svg>
  );
}

function CardVisual({ visualType }: { visualType: VisualType }) {
  switch (visualType) {
    case "inference-mesh":
      return <InferenceMeshVisual />;
    case "agent-pipeline":
      return <AgentPipelineVisual />;
    case "spatial-canvas":
      return <SpatialCanvasVisual />;
    case "cloud-topology":
      return <CloudTopologyVisual />;
    default:
      return null;
  }
}

// ============================================================================
// MAIN COMPONENT: WhatIDoSection
// ============================================================================

export function WhatIDoSection() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  // Scroll-Spy detection using IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
            }
          });
        },
        {
          rootMargin: "-35% 0px -35% 0px",
          threshold: 0.1,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const activeCard = CAPABILITIES[activeIndex] ?? CAPABILITIES[0];

  return (
    <section
      id="what-i-do"
      className="relative z-10 w-full bg-transparent text-[#F5EEF0] py-24 md:py-36"
    >
      {/* Anchor for backward-compatible #capabilities navigation */}
      <span id="capabilities" className="absolute -top-28 pointer-events-none" />

      {/* Subtle ambient radial glow in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 30%, rgba(158, 11, 46, 0.08), transparent 60%)",
          }}
        />
      </div>

      {/* 12-Column Split Grid */}
      <div className="w-full">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: STICKY COUNTER, EDITORIAL TITLE, ACTIVE PILL & CTA   */}
          {/* ================================================================= */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 lg:h-[calc(100vh-14rem)] flex flex-col justify-between mb-14 lg:mb-0">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] uppercase text-[#A68E94] mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9E0B2E] animate-pulse" />
                <span>CAPABILITIES | WHAT I DO</span>
              </p>

              <div className="overflow-hidden h-[7rem] sm:h-[8.5rem] lg:h-[10rem] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeCard.number}
                    initial={reducedMotion ? false : { y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reducedMotion ? undefined : { y: -32, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="block font-extrabold text-[6.5rem] sm:text-[8rem] lg:text-[9.5rem] leading-none tracking-tighter select-none text-[#F5EEF0] drop-shadow-[0_8px_32px_rgba(228,107,94,0.18)]"
                  >
                    {activeCard.number}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-8">
              <h2 className="text-5xl md:text-6xl tracking-tight leading-[1.05]">
                <span className="font-bold text-[#F5EEF0]">What </span>
                <span className="font-serif italic font-normal text-[#C93B5B]">i do</span>
              </h2>

              <motion.div
                layout
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#6D001A] text-[#F5EEF0] px-7 py-3.5 rounded-full font-mono text-sm md:text-base font-semibold tracking-tight border border-[#9E0B2E]/60 shadow-[0_4px_24px_-4px_rgba(195,24,30,0.55)] inline-flex items-center gap-2.5 w-fit mt-6 select-none"
              >
                <span className="w-2 h-2 rounded-full bg-[#F5EEF0] animate-pulse shrink-0" />
                <div className="overflow-hidden h-6 flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeCard.categoryPill}
                      initial={reducedMotion ? false : { y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={reducedMotion ? undefined : { y: -12, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="whitespace-nowrap"
                    >
                      {activeCard.categoryPill}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </motion.div>

              <div>
                <a
                  href="#work"
                  data-cursor="pointer"
                  className="bg-[#000000]/75 backdrop-blur-md border border-[rgba(221,112,116,0.25)] text-[#F5EEF0] px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-[0.12em] uppercase hover:bg-[#6D001A] hover:text-[#F5EEF0] hover:border-[#9E0B2E]/60 hover:shadow-[0_4px_20px_-4px_rgba(195,24,30,0.5)] transition-all duration-300 inline-flex items-center gap-2 w-fit mt-8 group cursor-pointer"
                >
                  <span>VIEW ALL WORKS</span>
                  <ArrowUpRight className="w-4 h-4 text-[#A68E94] group-hover:text-[#F5EEF0] transition-all duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: VERTICAL STACK OF 4 CAPABILITY CARDS                */}
          {/* ================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-16 md:gap-24">
            {CAPABILITIES.map((card, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.div
                  key={card.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  initial={reducedMotion ? false : { opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className={`bg-[#080204]/95 rounded-[28px] p-7 sm:p-10 md:p-12 transition-all duration-500 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.75)] relative group overflow-hidden border ${
                    isActive
                      ? "border-[#C93B5B]/50 shadow-[inset_0_1px_0_0_rgba(236,195,171,0.15)]"
                      : "border-[rgba(221,112,116,0.16)] hover:border-[#C93B5B]/40"
                  }`}
                >
                  {/* Card Media Header with WebGL Tsunami Scroll Reveal */}
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-[#000000] border border-[rgba(221,112,116,0.16)] relative group-hover:border-[#C93B5B]/35 transition-colors duration-500">
                    <div className="w-full h-full group-hover:scale-[1.03] transition-transform duration-700 ease-out overflow-hidden">
                      {card.image ? (
                        <TsunamiScrollReveal
                          src={card.image}
                          alt={card.title}
                          angle={112}
                          distortion={0.62}
                          waveWidth={0.25}
                          disturbance={0.36}
                          dispersion={0.35}
                          reflection={0.32}
                          shadow={0.22}
                          mask={true}
                          revealStart={0.04}
                          revealEnd={0.65}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full p-2 sm:p-3 flex items-center justify-center">
                          <CardVisual visualType={card.visualType} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Eyebrow */}
                  <p className="font-mono text-xs md:text-sm font-medium tracking-[0.15em] uppercase text-[#C93B5B] mb-3">
                    {card.eyebrow}
                  </p>

                  {/* Card Title */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-sans font-medium text-[#F5EEF0] tracking-[-0.035em] leading-[1.12] mb-5">
                    {card.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-base md:text-lg text-[#A68E94]/85 leading-relaxed mb-9 max-w-2xl">
                    {card.description}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        data-cursor="pointer"
                        className="px-4 py-1.5 rounded-full border border-[rgba(221,112,116,0.20)] bg-[#000000]/75 font-mono text-[#F5EEF0] text-xs md:text-sm font-medium hover:border-[#C93B5B]/60 hover:bg-[#C93B5B]/10 hover:text-[#F5EEF0] transition-all duration-200 cursor-pointer select-none"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhatIDoSection;
