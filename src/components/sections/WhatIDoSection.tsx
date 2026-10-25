"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

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
// BESPOKE ARCHITECTURAL SCHEMATIC VISUALS (ESPRESSO & COPPER PALETTE)
// ============================================================================

/**
 * 01 | DISTRIBUTED INFERENCE MESH & SYSTEMS PROGRAMMING
 * Visualizes multi-node pipeline parallelism, Tailscale WireGuard mesh,
 * CUDA/C++ primary GPU shard with 4x4 quantized matrix, and zero-copy SHM.
 */
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
          <circle cx="14" cy="14" r="0.8" fill="#AD6A4C" fillOpacity="0.25" />
        </pattern>
        <linearGradient id="inf-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#AD6A4C" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#DEC1B4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#AD6A4C" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="url(#inf-grid)" />

      {/* NODE 00: Primary GPU Device (CUDA C++) */}
      <g transform="translate(35, 36)">
        <rect
          width="250"
          height="128"
          rx="14"
          fill="#0A0807"
          fillOpacity="0.92"
          stroke="#AD6A4C"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <text x="18" y="24" fill="#DEC1B4" fontSize="11" fontFamily="monospace" fontWeight="700">
          NODE 00 // RTX GPU (CUDA C++)
        </text>
        <text x="18" y="42" fill="#CEA491" fontSize="9" fontFamily="monospace">
          12GB GDDR6X · 504 GB/s BANDWIDTH
        </text>

        <rect x="18" y="56" width="214" height="26" rx="6" fill="#140D0A" stroke="#AD6A4C" strokeOpacity="0.35" />
        <text x="28" y="73" fill="#DEC1B4" fontSize="9.5" fontFamily="monospace" fontWeight="600">
          GGUF Layers 00–18 (Active VRAM)
        </text>

        <rect x="18" y="92" width="102" height="22" rx="4" fill="#AD6A4C" fillOpacity="0.18" />
        <text x="26" y="106" fill="#DEC1B4" fontSize="8.5" fontFamily="monospace" fontWeight="600">
          CUDA:0 STREAMS
        </text>
        <rect x="128" y="92" width="104" height="22" rx="4" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.25" />
        <text x="136" y="106" fill="#CEA491" fontSize="8.5" fontFamily="monospace">
          FP16 TENSORS
        </text>
      </g>

      {/* NODE 01: Worker Cluster Node (Rust Daemon) */}
      <g transform="translate(355, 36)">
        <rect
          width="250"
          height="128"
          rx="14"
          fill="#0A0807"
          fillOpacity="0.92"
          stroke="#CEA491"
          strokeOpacity="0.3"
          strokeWidth="1"
        />
        <text x="18" y="24" fill="#DEC1B4" fontSize="11" fontFamily="monospace" fontWeight="700">
          NODE 01 // WORKER CLUSTER (RUST)
        </text>
        <text x="18" y="42" fill="#CEA491" fontSize="9" fontFamily="monospace">
          P2P RPC DAEMON · TAILSCALE MESH
        </text>

        <rect x="18" y="56" width="214" height="26" rx="6" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.25" />
        <text x="28" y="73" fill="#DEC1B4" fontSize="9.5" fontFamily="monospace" fontWeight="600">
          GGUF Layers 19–36 (Offload Node)
        </text>

        <rect x="18" y="92" width="102" height="22" rx="4" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.25" />
        <text x="26" y="106" fill="#CEA491" fontSize="8.5" fontFamily="monospace">
          Q4_K_M QUANT
        </text>
        <rect x="128" y="92" width="104" height="22" rx="4" fill="#AD6A4C" fillOpacity="0.18" />
        <text x="136" y="106" fill="#DEC1B4" fontSize="8.5" fontFamily="monospace" fontWeight="600">
          SHM RING BUF
        </text>
      </g>

      {/* Interconnect Bridge */}
      <path
        d="M 285 100 C 320 100, 320 100, 355 100"
        stroke="#AD6A4C"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle cx="320" cy="100" r="5" fill="#DEC1B4" stroke="#AD6A4C" strokeWidth="2" className="animate-pulse" />
      <text x="320" y="82" fill="#AD6A4C" fontSize="8" fontFamily="monospace" fontWeight="700" textAnchor="middle" letterSpacing="0.08em">
        TAILSCALE MESH
      </text>

      {/* LOWER PANEL: Real-Time Tensor Mesh & Telemetry */}
      <g transform="translate(35, 185)">
        <rect
          width="570"
          height="140"
          rx="16"
          fill="#120D0B"
          fillOpacity="0.94"
          stroke="#AD6A4C"
          strokeOpacity="0.32"
          strokeWidth="1"
        />

        {/* Left Side: 4x4 Quantized Matrix Weights Grid */}
        <g transform="translate(24, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="700">
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
                fill={isHighlight ? "#AD6A4C" : "#1C1410"}
                stroke="#AD6A4C"
                strokeOpacity={isHighlight ? "0.9" : "0.22"}
              />
            );
          })}
        </g>

        {/* Center: Live Performance Telemetry */}
        <g transform="translate(180, 24)">
          <rect width="180" height="94" rx="8" fill="#0A0807" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="14" y="22" fill="#CEA491" fontSize="9" fontFamily="monospace">INTERCONNECT TELEMETRY</text>
          <text x="14" y="44" fill="#DEC1B4" fontSize="14" fontFamily="monospace" fontWeight="800">
            &lt; 0.8ms <tspan fontSize="9" fill="#AD6A4C">IPC</tspan>
          </text>
          <text x="14" y="66" fill="#DEC1B4" fontSize="12" fontFamily="monospace" fontWeight="700">
            42.4 <tspan fontSize="9" fill="#CEA491">tokens / sec</tspan>
          </text>
          <text x="14" y="83" fill="#AD6A4C" fontSize="8.5" fontFamily="monospace" fontWeight="600">
            ZERO-COPY RING BUFFER
          </text>
        </g>

        {/* Right Side: Runtime Stack Badges */}
        <g transform="translate(385, 24)">
          <rect width="165" height="94" rx="8" fill="#0A0807" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="14" y="20" fill="#CEA491" fontSize="8.5" fontFamily="monospace">RUNTIME ENGINE</text>
          <text x="14" y="39" fill="#DEC1B4" fontSize="11" fontFamily="monospace" fontWeight="700">
            llama.cpp + LibTorch
          </text>
          <text x="14" y="58" fill="#CEA491" fontSize="9.5" fontFamily="monospace">
            C++ / CUDA Kernels
          </text>
          <text x="14" y="78" fill="#AD6A4C" fontSize="9" fontFamily="monospace" fontWeight="600">
            CMake · FlashAttention-2
          </text>
        </g>
      </g>
    </svg>
  );
}

/**
 * 02 | APPLIED ML & AGENTIC SYSTEMS
 * Visualizes autonomous reasoning loops, deep learning pipelines,
 * multi-frame temporal feature extraction, and calibrated confidence telemetry.
 */
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
          <circle cx="15" cy="15" r="0.8" fill="#AD6A4C" fillOpacity="0.22" />
        </pattern>
        <linearGradient id="ml-spark-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#AD6A4C" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#AD6A4C" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="url(#ml-grid)" />

      {/* TOP PIPELINE: 4-Stage Autonomous Pipeline Architecture */}
      <g transform="translate(35, 36)">
        <rect
          width="570"
          height="140"
          rx="16"
          fill="#0A0807"
          fillOpacity="0.92"
          stroke="#AD6A4C"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />
        <text x="20" y="24" fill="#DEC1B4" fontSize="11" fontFamily="monospace" fontWeight="700">
          AUTONOMOUS MULTI-AGENT &amp; DEEP LEARNING PIPELINE
        </text>

        {/* 4 Pipeline Stages */}
        <g transform="translate(18, 44)">
          {/* Stage 1: Stream Ingestion */}
          <rect width="118" height="74" rx="8" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="10" y="20" fill="#AD6A4C" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 01</text>
          <text x="10" y="38" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="600">Stream Ingest</text>
          <text x="10" y="56" fill="#CEA491" fontSize="8.5" fontFamily="monospace">RF / 16-Frame Tensor</text>

          {/* Arrow 1 */}
          <path d="M 122 37 L 138 37" stroke="#AD6A4C" strokeWidth="1.5" />
          <polygon points="138,37 133,34 133,40" fill="#AD6A4C" />

          {/* Stage 2: Feature Extractor */}
          <g transform="translate(144, 0)">
            <rect width="118" height="74" rx="8" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
            <text x="10" y="20" fill="#AD6A4C" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 02</text>
            <text x="10" y="38" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="600">Feature Fusion</text>
            <text x="10" y="56" fill="#CEA491" fontSize="8.5" fontFamily="monospace">MTCNN + EfficientNet</text>
          </g>

          {/* Arrow 2 */}
          <path d="M 268 37 L 284 37" stroke="#AD6A4C" strokeWidth="1.5" />
          <polygon points="284,37 279,34 279,40" fill="#AD6A4C" />

          {/* Stage 3: Agentic Reasoning */}
          <g transform="translate(290, 0)">
            <rect width="118" height="74" rx="8" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
            <text x="10" y="20" fill="#AD6A4C" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 03</text>
            <text x="10" y="38" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="600">Agent Reasoning</text>
            <text x="10" y="56" fill="#DEC1B4" fontSize="8.5" fontFamily="monospace">Tool Orchestrator</text>
          </g>

          {/* Arrow 3 */}
          <path d="M 414 37 L 430 37" stroke="#AD6A4C" strokeWidth="1.5" />
          <polygon points="430,37 425,34 425,40" fill="#AD6A4C" />

          {/* Stage 4: Calibrated Decision */}
          <g transform="translate(436, 0)">
            <rect width="98" height="74" rx="8" fill="#AD6A4C" fillOpacity="0.18" stroke="#AD6A4C" strokeOpacity="0.65" />
            <text x="10" y="20" fill="#DEC1B4" fontSize="9" fontFamily="monospace" fontWeight="700">STAGE 04</text>
            <text x="10" y="38" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="700">Calibrated</text>
            <text x="10" y="56" fill="#27C93F" fontSize="8.5" fontFamily="monospace" fontWeight="600">Conf: 0.948</text>
          </g>
        </g>
      </g>

      {/* BOTTOM SECTION: Telemetry Sparkline, State Machine & Stack */}
      <g transform="translate(35, 192)">
        <rect
          width="570"
          height="136"
          rx="16"
          fill="#120D0B"
          fillOpacity="0.94"
          stroke="#CEA491"
          strokeOpacity="0.24"
          strokeWidth="1"
        />

        {/* Left: Temporal Confidence Sparkline */}
        <g transform="translate(20, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10" fontFamily="monospace" fontWeight="700">
            TEMPORAL CONFIDENCE TELEMETRY
          </text>
          <g transform="translate(0, 22)">
            <rect width="180" height="72" rx="6" fill="#0A0807" stroke="#CEA491" strokeOpacity="0.2" />
            {/* Sparkline path */}
            <path
              d="M 12 55 Q 32 50, 52 38 T 92 42 T 132 20 L 168 18 L 168 64 L 12 64 Z"
              fill="url(#ml-spark-fill)"
            />
            <path
              d="M 12 55 Q 32 50, 52 38 T 92 42 T 132 20 L 168 18"
              stroke="#AD6A4C"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="168" cy="18" r="3.5" fill="#27C93F" />
            <text x="14" y="62" fill="#DEC1B4" fontSize="8.5" fontFamily="monospace" fontWeight="700">
              16-FRAME SPATIAL WINDOW · 14ms
            </text>
          </g>
        </g>

        {/* Center: Autonomous State Loop */}
        <g transform="translate(225, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10" fontFamily="monospace" fontWeight="700">
            AGENT REASONING STATE MACHINE
          </text>
          <g transform="translate(0, 22)">
            <rect width="185" height="72" rx="6" fill="#0A0807" stroke="#AD6A4C" strokeOpacity="0.3" />
            <g transform="translate(12, 18)">
              <rect width="72" height="20" rx="4" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.25" />
              <text x="8" y="14" fill="#CEA491" fontSize="8" fontFamily="monospace">[01] INGEST</text>

              <rect x="80" y="0" width="82" height="20" rx="4" fill="#AD6A4C" fillOpacity="0.2" stroke="#AD6A4C" strokeOpacity="0.5" />
              <text x="88" y="14" fill="#DEC1B4" fontSize="8" fontFamily="monospace" fontWeight="600">[02] TRIAGE</text>
            </g>
            <text x="12" y="56" fill="#DEC1B4" fontSize="8.5" fontFamily="monospace" fontWeight="600">
              DETERMINISTIC VERIFICATION LOOP
            </text>
          </g>
        </g>

        {/* Right: ML Frameworks */}
        <g transform="translate(435, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10" fontFamily="monospace" fontWeight="700">
            MODEL ARCHITECTURE
          </text>
          <rect x="0" y="22" width="118" height="72" rx="6" fill="#0A0807" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="10" y="40" fill="#DEC1B4" fontSize="9.5" fontFamily="monospace" fontWeight="700">PyTorch JIT</text>
          <text x="10" y="56" fill="#CEA491" fontSize="8.5" fontFamily="monospace">Bi-LSTM + MTCNN</text>
          <text x="10" y="74" fill="#AD6A4C" fontSize="8.5" fontFamily="monospace" fontWeight="600">Hugging Face</text>
        </g>
      </g>
    </svg>
  );
}

/**
 * 03 | SPATIAL WEB & CREATIVE FRONTEND ENGINEERING
 * Visualizes 3D WebGL2 wireframe cube, Three.js scene telemetry,
 * Framer Motion cubic bezier curve, and responsive multi-device viewport craft.
 */
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
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#CEA491" strokeWidth="0.5" strokeOpacity="0.06" />
        </pattern>
        <linearGradient id="spatial-curve-fill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#AD6A4C" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#AD6A4C" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="url(#spatial-grid)" />

      {/* LEFT: 3D Wireframe Perspective Viewport */}
      <g transform="translate(35, 36)">
        <rect
          width="265"
          height="288"
          rx="16"
          fill="#0A0807"
          fillOpacity="0.92"
          stroke="#AD6A4C"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />
        <text x="18" y="26" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="700">
          3D SCENE &amp; CANVAS // THREE.JS
        </text>

        {/* Isometric Grid Floor */}
        <g stroke="#CEA491" strokeOpacity="0.18" strokeWidth="1">
          <line x1="42" y1="210" x2="224" y2="210" />
          <line x1="62" y1="190" x2="204" y2="190" />
          <line x1="82" y1="170" x2="184" y2="170" />
          <line x1="42" y1="210" x2="92" y2="160" />
          <line x1="133" y1="210" x2="133" y2="160" />
          <line x1="224" y1="210" x2="174" y2="160" />
        </g>

        {/* 3D Wireframe Cube with Vertices */}
        <g stroke="#AD6A4C" strokeWidth="1.5">
          {/* Back Face */}
          <rect x="98" y="78" width="70" height="70" fill="none" strokeOpacity="0.3" strokeDasharray="3 3" />
          {/* Connecting Depth Edges */}
          <line x1="78" y1="108" x2="98" y2="78" strokeOpacity="0.5" />
          <line x1="148" y1="108" x2="168" y2="78" strokeOpacity="0.5" />
          <line x1="78" y1="178" x2="98" y2="148" strokeOpacity="0.5" />
          <line x1="148" y1="178" x2="168" y2="148" strokeOpacity="0.5" />
          {/* Front Face */}
          <rect x="78" y="108" width="70" height="70" fill="#AD6A4C" fillOpacity="0.08" stroke="#DEC1B4" strokeWidth="1.6" />
        </g>

        {/* Vertices */}
        <circle cx="78" cy="108" r="3.5" fill="#AD6A4C" />
        <circle cx="148" cy="108" r="3.5" fill="#DEC1B4" />
        <circle cx="78" cy="178" r="3.5" fill="#DEC1B4" />
        <circle cx="148" cy="178" r="3.5" fill="#AD6A4C" />

        {/* Camera Euler Angles */}
        <text x="18" y="234" fill="#CEA491" fontSize="8.5" fontFamily="monospace">
          Euler: [18.4°, -24.8°, 0.0°] · OrbitControls
        </text>

        {/* WebGL Telemetry Pill */}
        <rect x="18" y="248" width="228" height="24" rx="6" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
        <circle cx="30" cy="260" r="3" fill="#27C93F" />
        <text x="40" y="263" fill="#DEC1B4" fontSize="9" fontFamily="monospace" fontWeight="600">
          60 FPS · SHADER PASS · FBO MASK
        </text>
      </g>

      {/* RIGHT: Cubic Bezier Motion Curve & Responsive Viewports */}
      <g transform="translate(325, 36)">
        <rect
          width="280"
          height="288"
          rx="16"
          fill="#0A0807"
          fillOpacity="0.92"
          stroke="#CEA491"
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />
        <text x="18" y="26" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="700">
          FRAMER MOTION // BEZIER CURVE
        </text>

        {/* Curve Graph Grid */}
        <g transform="translate(25, 44)">
          <rect width="230" height="126" rx="8" fill="#120D0B" stroke="#CEA491" strokeOpacity="0.15" />
          {/* Axis Ticks */}
          <line x1="20" y1="106" x2="210" y2="106" stroke="#CEA491" strokeOpacity="0.2" />
          <line x1="20" y1="20" x2="20" y2="106" stroke="#CEA491" strokeOpacity="0.2" />

          {/* Area Under Curve */}
          <path
            d="M 20 106 C 65 20, 95 20, 210 20 L 210 106 Z"
            fill="url(#spatial-curve-fill)"
          />

          {/* The Cubic Bezier Curve: (0.22, 1, 0.36, 1) */}
          <path
            d="M 20 106 C 65 20, 95 20, 210 20"
            stroke="#AD6A4C"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Control Point Handles */}
          <line x1="20" y1="106" x2="65" y2="20" stroke="#DEC1B4" strokeOpacity="0.4" strokeDasharray="2 2" />
          <circle cx="65" cy="20" r="3.5" fill="#DEC1B4" />

          <line x1="210" y1="20" x2="95" y2="20" stroke="#DEC1B4" strokeOpacity="0.4" strokeDasharray="2 2" />
          <circle cx="95" cy="20" r="3.5" fill="#AD6A4C" />
        </g>

        {/* Bezier Formula Tag */}
        <rect x="25" y="186" width="230" height="24" rx="6" fill="#140D0A" stroke="#AD6A4C" strokeOpacity="0.3" />
        <text x="35" y="202" fill="#DEC1B4" fontSize="9" fontFamily="monospace" fontWeight="600">
          ease: [0.22, 1, 0.36, 1] · 350ms
        </text>

        {/* Responsive Viewport Pills */}
        <g transform="translate(25, 224)">
          <rect width="70" height="22" rx="4" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="10" y="15" fill="#CEA491" fontSize="8" fontFamily="monospace">MOBILE 390</text>

          <rect x="78" y="0" width="70" height="22" rx="4" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="88" y="15" fill="#CEA491" fontSize="8" fontFamily="monospace">TABLET 768</text>

          <rect x="156" y="0" width="74" height="22" rx="4" fill="#AD6A4C" fillOpacity="0.2" stroke="#AD6A4C" strokeOpacity="0.5" />
          <text x="164" y="15" fill="#DEC1B4" fontSize="8" fontFamily="monospace" fontWeight="700">1720px</text>
        </g>

        <text x="25" y="268" fill="#CEA491" fontSize="8.5" fontFamily="monospace">
          Three.js Canvas + React Native + Figma
        </text>
      </g>
    </svg>
  );
}

/**
 * 04 | HIGH-THROUGHPUT MICROSERVICES & INFRASTRUCTURE
 * Visualizes async Rust Axum & Python FastAPI backends, Cloudflare edge CDN,
 * MongoDB Atlas document cluster, Terraform IaC, and automated CI/CD pipeline.
 */
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
          <circle cx="16" cy="16" r="0.8" fill="#AD6A4C" fillOpacity="0.25" />
        </pattern>
      </defs>

      <rect width="640" height="360" fill="url(#cloud-grid)" />

      {/* TOP PIPELINE: Edge Gateway & Asynchronous Microservices */}
      <g transform="translate(35, 36)">
        <rect
          width="570"
          height="146"
          rx="16"
          fill="#0A0807"
          fillOpacity="0.92"
          stroke="#AD6A4C"
          strokeOpacity="0.38"
          strokeWidth="1.2"
        />

        {/* Edge CDN Ingress Header */}
        <g transform="translate(18, 16)">
          <rect width="534" height="28" rx="6" fill="#140D0A" stroke="#CEA491" strokeOpacity="0.2" />
          <circle cx="14" cy="14" r="3" fill="#27C93F" />
          <text x="26" y="18" fill="#DEC1B4" fontSize="9" fontFamily="monospace" fontWeight="700">
            EDGE INGRESS // CLOUDFLARE CDN · TLS 1.3 · HTTP/3 · RATE LIMIT 10k req/s
          </text>
        </g>

        {/* Dual Microservices: Rust Axum & Python FastAPI */}
        <g transform="translate(18, 54)">
          {/* Microservice A: Rust Axum */}
          <rect width="260" height="74" rx="8" fill="#120D0B" stroke="#AD6A4C" strokeOpacity="0.4" />
          <text x="12" y="20" fill="#AD6A4C" fontSize="9" fontFamily="monospace" fontWeight="700">SERVICE 01 // RUST AXUM</text>
          <text x="12" y="38" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="600">Tokio Async Worker Daemon</text>
          <text x="12" y="56" fill="#CEA491" fontSize="8.5" fontFamily="monospace">16 Worker Threads · p99 &lt; 0.4ms</text>

          {/* Microservice B: Python FastAPI */}
          <g transform="translate(274, 0)">
            <rect width="260" height="74" rx="8" fill="#120D0B" stroke="#CEA491" strokeOpacity="0.25" />
            <text x="12" y="20" fill="#AD6A4C" fontSize="9" fontFamily="monospace" fontWeight="700">SERVICE 02 // FASTAPI</text>
            <text x="12" y="38" fill="#DEC1B4" fontSize="10.5" fontFamily="monospace" fontWeight="600">Uvicorn ASGI Connection Pool</text>
            <text x="12" y="56" fill="#CEA491" fontSize="8.5" fontFamily="monospace">Pydantic V2 · OpenAPI 3.1 Spec</text>
          </g>
        </g>
      </g>

      {/* BOTTOM INFRASTRUCTURE: Distributed Database, Terraform IaC, CI/CD */}
      <g transform="translate(35, 198)">
        <rect
          width="570"
          height="126"
          rx="16"
          fill="#120D0B"
          fillOpacity="0.94"
          stroke="#CEA491"
          strokeOpacity="0.24"
          strokeWidth="1"
        />

        {/* Database Store */}
        <g transform="translate(20, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10" fontFamily="monospace" fontWeight="700">
            DISTRIBUTED DATA STORE
          </text>
          <rect x="0" y="22" width="160" height="66" rx="6" fill="#0A0807" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="10" y="42" fill="#DEC1B4" fontSize="9.5" fontFamily="monospace" fontWeight="600">MongoDB Atlas</text>
          <text x="10" y="60" fill="#CEA491" fontSize="8.5" fontFamily="monospace">Replica Set (3 Nodes)</text>
          <text x="10" y="76" fill="#AD6A4C" fontSize="8.5" fontFamily="monospace">Redis Ephemeral Cache</text>
        </g>

        {/* Terraform IaC Spec */}
        <g transform="translate(200, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10" fontFamily="monospace" fontWeight="700">
            TERRAFORM INFRASTRUCTURE AS CODE
          </text>
          <rect x="0" y="22" width="170" height="66" rx="6" fill="#0A0807" stroke="#AD6A4C" strokeOpacity="0.3" />
          <text x="12" y="42" fill="#27C93F" fontSize="9" fontFamily="monospace">+ 4 to add, 0 to change</text>
          <text x="12" y="60" fill="#CEA491" fontSize="8.5" fontFamily="monospace">AWS ECS · Fargate · VPC</text>
          <text x="12" y="76" fill="#DEC1B4" fontSize="8.5" fontFamily="monospace" fontWeight="600">Docker Compose Orchestration</text>
        </g>

        {/* CI/CD & Health */}
        <g transform="translate(390, 20)">
          <text x="0" y="12" fill="#DEC1B4" fontSize="10" fontFamily="monospace" fontWeight="700">
            AUTOMATED CI/CD &amp; HEALTH
          </text>
          <rect x="0" y="22" width="160" height="66" rx="6" fill="#0A0807" stroke="#CEA491" strokeOpacity="0.2" />
          <text x="12" y="42" fill="#DEC1B4" fontSize="9" fontFamily="monospace">Jenkins Build #142</text>
          <text x="12" y="60" fill="#27C93F" fontSize="8.5" fontFamily="monospace" fontWeight="600">Pipeline Passed (0m 48s)</text>
          <text x="12" y="76" fill="#AD6A4C" fontSize="8.5" fontFamily="monospace" fontWeight="600">UPTIME: 99.99% · 24/7</text>
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
      className="relative z-10 w-full bg-transparent text-[#DEC1B4] py-24 md:py-36"
    >
      {/* Anchor for backward-compatible #about and #capabilities navigation */}
      <span id="about" className="absolute -top-28 pointer-events-none" />
      <span id="capabilities" className="absolute -top-28 pointer-events-none" />

      {/* Subtle ambient radial glow in background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle at 20% 30%, rgba(173, 106, 76, 0.08), transparent 60%)",
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
            {/* Top Group: Section Kicker & Giant Index Numeral */}
            <div>
              {/* Section Kicker */}
              <p className="font-mono text-xs tracking-[0.16em] uppercase text-[#CEA491]/80 mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#AD6A4C] animate-pulse" />
                <span>CAPABILITIES | WHAT I DO</span>
              </p>

              {/* Massive Bold Grotesque Index Counter (01 - 04) */}
              <div className="overflow-hidden h-[7rem] sm:h-[8.5rem] lg:h-[10rem] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeCard.number}
                    initial={reducedMotion ? false : { y: 32, opacity: 0, filter: "blur(6px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={reducedMotion ? undefined : { y: -32, opacity: 0, filter: "blur(6px)" }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="block font-extrabold text-[6.5rem] sm:text-[8rem] lg:text-[9.5rem] leading-none tracking-tighter select-none text-[#DEC1B4] drop-shadow-[0_8px_32px_rgba(173,106,76,0.18)]"
                  >
                    {activeCard.number}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom Group: Split Heading, Active Category Pill & CTA Button */}
            <div className="pt-8">
              {/* Split Heading: "What" (sans) + "i do" (editorial serif italic) */}
              <h2 className="text-5xl md:text-6xl tracking-tight leading-[1.05]">
                <span className="font-bold text-[#DEC1B4]">What </span>
                <span className="font-serif italic font-normal text-[#AD6A4C]">i do</span>
              </h2>

              {/* Active Category Pill with Smooth Morphing Width & Label Slide */}
              <motion.div
                layout
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#AD6A4C] text-[#0A0807] px-7 py-3.5 rounded-full font-mono text-sm md:text-base font-semibold tracking-tight shadow-[0_4px_24px_-4px_rgba(173,106,76,0.5)] inline-flex items-center gap-2.5 w-fit mt-6 select-none"
              >
                <span className="w-2 h-2 rounded-full bg-[#0A0807] animate-pulse shrink-0" />
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

              {/* CTA Button linking to #work */}
              <div>
                <a
                  href="#work"
                  data-cursor="pointer"
                  className="bg-[#0A0807]/70 backdrop-blur-md border border-[#CEA491]/30 text-[#DEC1B4] px-6 py-2.5 rounded-full font-mono text-xs font-semibold tracking-[0.12em] uppercase hover:bg-[#AD6A4C] hover:text-[#0A0807] hover:border-[#DEC1B4]/30 hover:shadow-[0_4px_20px_-4px_rgba(173,106,76,0.45)] transition-all duration-300 inline-flex items-center gap-2 w-fit mt-8 group cursor-pointer"
                >
                  <span>VIEW ALL WORKS</span>
                  <ArrowUpRight className="w-4 h-4 text-[#CEA491] group-hover:text-[#0A0807] transition-all duration-250 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className={`bg-[#120D0B]/82 backdrop-blur-xl rounded-[28px] p-7 sm:p-10 md:p-12 transition-all duration-500 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.75)] relative group overflow-hidden border ${
                    isActive
                      ? "border-[#AD6A4C]/45 shadow-[inset_0_1px_0_0_rgba(222,193,180,0.15)]"
                      : "border-[#CEA491]/16 hover:border-[#AD6A4C]/45"
                  }`}
                >
                  {/* Card Media Header / Interactive Visual Preview */}
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] mb-8 bg-[#0A0807] border border-[#CEA491]/15 relative group-hover:border-[#AD6A4C]/35 transition-colors duration-500">
                    <div className="w-full h-full group-hover:scale-[1.03] transition-transform duration-700 ease-out overflow-hidden">
                      {card.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={card.image}
                          alt={card.title}
                          className="w-full h-full object-cover select-none"
                        />
                      ) : (
                        <div className="w-full h-full p-2 sm:p-3 flex items-center justify-center">
                          <CardVisual visualType={card.visualType} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Eyebrow */}
                  <p className="font-mono text-xs md:text-sm font-medium tracking-[0.15em] uppercase text-[#AD6A4C] mb-3">
                    {card.eyebrow}
                  </p>

                  {/* Card Title */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.65rem] font-bold text-[#DEC1B4] tracking-tight leading-[1.15] mb-5">
                    {card.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-base md:text-lg text-[#CEA491]/85 leading-relaxed mb-9 max-w-2xl">
                    {card.description}
                  </p>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        data-cursor="pointer"
                        className="px-4 py-1.5 rounded-full border border-[#CEA491]/20 bg-[#0A0807]/75 font-mono text-[#DEC1B4] text-xs md:text-sm font-medium hover:border-[#AD6A4C] hover:bg-[#AD6A4C]/15 hover:text-[#F3E3DC] transition-all duration-200 cursor-pointer select-none"
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
