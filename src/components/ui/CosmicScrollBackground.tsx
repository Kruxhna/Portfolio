"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// ============================================================================
// 3D COSMIC NEBULA & STARFIELD FLY-THROUGH BACKGROUND (SCROLL-DRIVEN)
// High-performance Three.js WebGL background with bidirectional Z-axis flight,
// buttery-smooth scroll damping, interactive cursor parallax, procedural FBM
// volumetric nebula clouds, multi-layer starfield & cosmic dust.
// ============================================================================

export interface CosmicScrollBackgroundProps {
  className?: string;
  starCount?: number;
  dustCount?: number;
  nebulaCount?: number;
  baseSpeed?: number;
  scrollSensitivity?: number;
  lerpFactor?: number;
}

// Tunnel spatial constants
const TUNNEL_DEPTH = 3200.0;

// ============================================================================
// SHADERS
// ============================================================================

// Starfield Vertex Shader with GPU Modulo Depth-Wrapping & Velocity Streak
const STAR_VERTEX_SHADER = `
uniform float uTime;
uniform float uTunnelOffset;
uniform float uTunnelDepth;
uniform float uVelocity;
uniform float uPixelRatio;

attribute float aSize;
attribute vec3 aColor;
attribute float aTwinkleSpeed;
attribute float aTwinklePhase;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = aColor;

  // GPU modulo infinite tunnel flight
  float zRel = mod(position.z - uTunnelOffset, uTunnelDepth);
  float zPos = zRel - uTunnelDepth;

  // Strict GLSL edge0 < edge1 compliance
  float farFade = smoothstep(-uTunnelDepth, -uTunnelDepth + 600.0, zPos);
  float nearFade = 1.0 - smoothstep(-140.0, -15.0, zPos);
  float depthFade = clamp(farFade * nearFade, 0.0, 1.0);

  // Dynamic twinkle
  float twinkle = 0.65 + 0.35 * sin(uTime * aTwinkleSpeed + aTwinklePhase);
  vAlpha = twinkle * depthFade;

  vec4 mvPosition = modelViewMatrix * vec4(position.x, position.y, zPos, 1.0);
  
  // Smooth, gentle velocity streak on scroll
  float speedBoost = clamp(abs(uVelocity) * 0.025, 0.0, 1.2);
  float pointSize = aSize * (1.0 + speedBoost) * (420.0 / -mvPosition.z) * uPixelRatio;
  gl_PointSize = clamp(pointSize, 1.0, 42.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;

// Starfield Fragment Shader with Soft Gaussian Glow Core
const STAR_FRAGMENT_SHADER = `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float distSq = dot(coord, coord);
  if (distSq > 0.25) discard;

  float dist = sqrt(distSq) * 2.0; // 0.0 to 1.0
  float core = exp(-dist * dist * 10.0);
  float halo = smoothstep(1.0, 0.0, dist) * 0.45;
  float intensity = core + halo;

  gl_FragColor = vec4(vColor * (1.0 + core * 0.65), vAlpha * intensity);
}
`;

// Volumetric Nebula Vertex Shader
const NEBULA_VERTEX_SHADER = `
uniform float uTunnelOffset;
uniform float uTunnelDepth;

varying vec2 vUv;
varying float vDepthFade;

void main() {
  vUv = uv;

  // Infinite tunnel modulo wrap along Z
  float zRel = mod(position.z - uTunnelOffset, uTunnelDepth);
  float zPos = zRel - uTunnelDepth;

  // Strict GLSL edge0 < edge1 compliance
  float farFade = smoothstep(-uTunnelDepth, -uTunnelDepth + 800.0, zPos);
  float nearFade = 1.0 - smoothstep(-220.0, -40.0, zPos);
  vDepthFade = clamp(farFade * nearFade, 0.0, 1.0);

  vec4 mvPosition = modelViewMatrix * vec4(position.x, position.y, zPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

// Procedural Volumetric Nebula Cloud Fragment Shader (Domain-Warped FBM)
const NEBULA_FRAGMENT_SHADER = `
precision highp float;

uniform float uTime;
uniform vec3 uColor1; // Primary Filament (Cyan / Teal / Magenta)
uniform vec3 uColor2; // Secondary Veil (Indigo / Violet / Navy)
uniform vec3 uColor3; // Accent Highlights (Crimson / Amber)
uniform float uOpacity;

varying vec2 vUv;
varying float vDepthFade;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5000 * snoise(p); p = p * 2.02;
  f += 0.2500 * snoise(p); p = p * 2.03;
  f += 0.1250 * snoise(p); p = p * 2.01;
  f += 0.0625 * snoise(p);
  return f;
}

void main() {
  vec2 uv = vUv - vec2(0.5);
  float dist = length(uv);

  float boundary = 1.0 - smoothstep(0.05, 0.50, dist);
  if (boundary <= 0.001) discard;

  vec2 st = (vUv * 2.4) + vec2(uTime * 0.016, uTime * 0.012);
  float q1 = fbm(st);
  float q2 = fbm(st + vec2(4.3, 1.8) - uTime * 0.01);
  vec2 warp = vec2(q1, q2);

  float density = fbm(st + 3.0 * warp);
  density = smoothstep(-0.25, 0.65, density);

  vec3 col = mix(uColor1, uColor2, clamp(density * 1.5, 0.0, 1.0));
  col = mix(col, uColor3, clamp(length(warp) * 1.25, 0.0, 1.0));

  float coreGlow = pow(density, 2.0) * 1.5;
  col += uColor1 * coreGlow * 0.55;

  float finalAlpha = density * boundary * uOpacity * vDepthFade;
  finalAlpha = clamp(finalAlpha, 0.0, 0.88);

  gl_FragColor = vec4(col, finalAlpha);
}
`;

// ============================================================================
// COLOR PALETTES FOR NEBULA CLUSTERS (Matching Reference Video)
// ============================================================================
interface NebulaPalette {
  c1: [number, number, number];
  c2: [number, number, number];
  c3: [number, number, number];
}

const NEBULA_PALETTES: NebulaPalette[] = [
  // 1. Bioluminescent Cyan, Electric Indigo & Fiery Crimson (#00F5FF, #3A0CA3, #9E0B2E)
  {
    c1: [0.0, 0.96, 1.0],     // Cyan
    c2: [0.23, 0.05, 0.64],   // Indigo
    c3: [0.62, 0.04, 0.18],   // CAESAR Crimson #9E0B2E
  },
  // 2. Magenta Filament, Cosmic Violet & Fiery Amber (#F72585, #7209B7, #F97316)
  {
    c1: [0.97, 0.15, 0.52],   // Hot Magenta
    c2: [0.45, 0.04, 0.72],   // Violet
    c3: [0.98, 0.45, 0.10],   // Fiery Amber #f97316
  },
  // 3. Deep Sea Teal, Midnight Blue & Blush Orchid (#14B8A6, #1E1B4B, #E899AC)
  {
    c1: [0.08, 0.72, 0.65],   // Teal
    c2: [0.12, 0.11, 0.30],   // Midnight Navy
    c3: [0.91, 0.60, 0.68],   // CAESAR Blush #E899AC
  },
  // 4. Fiery Crimson Core, Deep Burgundy & Gold Highlight (#EF4444, #6D001A, #FBBF24)
  {
    c1: [0.94, 0.27, 0.27],   // Bright Crimson #ef4444
    c2: [0.43, 0.0, 0.10],    // Burgundy #6D001A
    c3: [0.98, 0.75, 0.15],   // Golden Amber
  },
];

export function CosmicScrollBackground({
  className = "",
  starCount = 4500,
  dustCount = 2000,
  nebulaCount = 28,
  baseSpeed = 0.22,             // Calm, majestic idle drift
  scrollSensitivity = 0.075,    // Smooth, gentle scroll acceleration
  lerpFactor = 0.045,           // Buttery soft inertia damping
}: CosmicScrollBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll physics & bidirectional flight references
  const lastScrollYRef = useRef<number>(0);
  const velocityRef = useRef<number>(0);
  const targetVelocityRef = useRef<number>(0);
  const tunnelOffsetRef = useRef<number>(0);
  const isReducedMotionRef = useRef<boolean>(false);

  // Mouse / Pointer Parallax Tracking
  const targetMouseXRef = useRef<number>(0);
  const targetMouseYRef = useRef<number>(0);
  const mouseXRef = useRef<number>(0);
  const mouseYRef = useRef<number>(0);

  // Non-blocking passive scroll & mouse listeners
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotionRef.current = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      const rawDelta = current - lastScrollYRef.current;
      lastScrollYRef.current = current;

      if (!isReducedMotionRef.current) {
        // Clamp raw delta per event to avoid violent speed spikes
        const clampedDelta = Math.max(-100, Math.min(100, rawDelta));
        targetVelocityRef.current += clampedDelta * scrollSensitivity;
        // Clamp target velocity to calm range (-4.5 to 5.5)
        targetVelocityRef.current = Math.max(-4.5, Math.min(5.5, targetVelocityRef.current));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isReducedMotionRef.current) return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      // Normalized coordinates from -1.0 to 1.0 centered at viewport center
      targetMouseXRef.current = (e.clientX / w - 0.5) * 2;
      targetMouseYRef.current = (e.clientY / h - 0.5) * 2;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, [scrollSensitivity]);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030308, 0.00045);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / Math.max(height, 1);

    const camera = new THREE.PerspectiveCamera(60, aspect, 1, TUNNEL_DEPTH + 400);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: false,
    });

    const maxDpr = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(maxDpr);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    // Uniforms shared across systems
    const commonUniforms = {
      uTime: { value: 0 },
      uTunnelOffset: { value: 0 },
      uTunnelDepth: { value: TUNNEL_DEPTH },
      uVelocity: { value: 0 },
      uPixelRatio: { value: maxDpr },
    };

    // ========================================================================
    // 2. MULTI-LAYERED STARFIELD TUNNEL (Thousands of crisp points)
    // ========================================================================
    const totalStars = starCount + dustCount;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(totalStars * 3);
    const colors = new Float32Array(totalStars * 3);
    const sizes = new Float32Array(totalStars);
    const twinkleSpeeds = new Float32Array(totalStars);
    const twinklePhases = new Float32Array(totalStars);

    const starColorChoices = [
      new THREE.Color(0xffffff), // Starlight White
      new THREE.Color(0xdbeafe), // Cool Ice Blue
      new THREE.Color(0xa5f3fc), // Bioluminescent Cyan
      new THREE.Color(0xe9d5ff), // Soft Lavender/Violet
      new THREE.Color(0xfef08a), // Warm Amber
    ];

    for (let i = 0; i < totalStars; i++) {
      const isDust = i >= starCount;

      const radius = isDust
        ? 50 + Math.random() * 420
        : 70 + Math.pow(Math.random(), 0.8) * 820;
      const angle = Math.random() * Math.PI * 2;

      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = Math.random() * TUNNEL_DEPTH;

      const col = starColorChoices[Math.floor(Math.random() * starColorChoices.length)];
      colors[i * 3 + 0] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = isDust ? 1.0 + Math.random() * 1.6 : 1.8 + Math.random() * 3.4;
      twinkleSpeeds[i] = 1.0 + Math.random() * 3.5;
      twinklePhases[i] = Math.random() * Math.PI * 2;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    starGeo.setAttribute("aTwinkleSpeed", new THREE.BufferAttribute(twinkleSpeeds, 1));
    starGeo.setAttribute("aTwinklePhase", new THREE.BufferAttribute(twinklePhases, 1));

    const starMaterial = new THREE.ShaderMaterial({
      vertexShader: STAR_VERTEX_SHADER,
      fragmentShader: STAR_FRAGMENT_SHADER,
      uniforms: commonUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starfield = new THREE.Points(starGeo, starMaterial);
    scene.add(starfield);

    // ========================================================================
    // 3. VOLUMETRIC NEBULA CLUSTER BILLBOARDS (Procedural FBM Filaments)
    // ========================================================================
    const nebulaPlanes: {
      mesh: THREE.Mesh;
      material: THREE.ShaderMaterial;
      baseX: number;
      baseY: number;
      baseZ: number;
      rotSpeed: number;
      swayFreq: number;
      swayAmp: number;
    }[] = [];

    const nebulaQuadGeo = new THREE.PlaneGeometry(1, 1, 1, 1);

    for (let i = 0; i < nebulaCount; i++) {
      const palette = NEBULA_PALETTES[i % NEBULA_PALETTES.length];

      const zFrac = i / nebulaCount;
      const z = zFrac * TUNNEL_DEPTH;

      let x: number;
      let y: number;

      if (i === 0) {
        // Hero upper-right cluster
        x = 260 + Math.random() * 80;
        y = 150 + Math.random() * 60;
      } else if (i === 1) {
        // Hero lower-left cluster
        x = -240 - Math.random() * 80;
        y = -140 - Math.random() * 60;
      } else {
        const theta = zFrac * Math.PI * 4 + (Math.random() - 0.5) * 1.2;
        const distFromCenter = 120 + Math.random() * 320;
        x = Math.cos(theta) * distFromCenter;
        y = Math.sin(theta) * distFromCenter * 0.72;
      }

      const scaleW = 850 + Math.random() * 850;
      const scaleH = 750 + Math.random() * 750;

      const nebulaMat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERTEX_SHADER,
        fragmentShader: NEBULA_FRAGMENT_SHADER,
        uniforms: {
          uTime: commonUniforms.uTime,
          uTunnelOffset: commonUniforms.uTunnelOffset,
          uTunnelDepth: commonUniforms.uTunnelDepth,
          uColor1: { value: new THREE.Vector3(...palette.c1) },
          uColor2: { value: new THREE.Vector3(...palette.c2) },
          uColor3: { value: new THREE.Vector3(...palette.c3) },
          uOpacity: { value: 0.46 + Math.random() * 0.28 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(nebulaQuadGeo, nebulaMat);
      mesh.position.set(x, y, z);
      mesh.scale.set(scaleW, scaleH, 1.0);
      mesh.rotation.z = Math.random() * Math.PI * 2;

      scene.add(mesh);

      nebulaPlanes.push({
        mesh,
        material: nebulaMat,
        baseX: x,
        baseY: y,
        baseZ: z,
        rotSpeed: (Math.random() - 0.5) * 0.0018,
        swayFreq: 0.25 + Math.random() * 0.4,
        swayAmp: 16 + Math.random() * 26,
      });
    }

    // ========================================================================
    // 4. ANIMATION & RENDER LOOP
    // ========================================================================
    let animId: number;
    let startTime = performance.now();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h);
      commonUniforms.uPixelRatio.value = dpr;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      animId = requestAnimationFrame(render);

      const now = performance.now();
      const elapsedTime = (now - startTime) * 0.001;

      // Buttery smooth inertial damping on scroll velocity
      velocityRef.current += (targetVelocityRef.current - velocityRef.current) * lerpFactor;
      targetVelocityRef.current *= 0.90; // smooth exponential decay

      const isReduced = isReducedMotionRef.current;
      const activeVelocity = isReduced ? 0 : clampValue(velocityRef.current, -3.5, 4.5);
      const activeSpeed = isReduced
        ? baseSpeed * 0.3
        : baseSpeed + activeVelocity;

      // Bidirectional flight accumulation
      tunnelOffsetRef.current += activeSpeed;

      // Update uniforms
      commonUniforms.uTime.value = elapsedTime;
      commonUniforms.uTunnelOffset.value = tunnelOffsetRef.current;
      commonUniforms.uVelocity.value = activeVelocity;

      // Cursor parallax tracking: smooth lerp toward target pointer position
      mouseXRef.current += (targetMouseXRef.current - mouseXRef.current) * 0.04;
      mouseYRef.current += (targetMouseYRef.current - mouseYRef.current) * 0.04;
      const mx = mouseXRef.current;
      const my = mouseYRef.current;

      // Cinematic camera motion: ambient sway + interactive cursor parallax
      if (!isReduced) {
        // Subtle position shift following the cursor
        camera.position.x = Math.sin(elapsedTime * 0.18) * 12.0 + mx * 32.0;
        camera.position.y = Math.cos(elapsedTime * 0.14) * 9.0 - my * 22.0;

        // Subtle holographic rotation tilt following the cursor
        camera.rotation.y = -mx * 0.045;
        camera.rotation.x = my * 0.035;
        camera.rotation.z = Math.sin(elapsedTime * 0.12) * 0.02 - mx * 0.015;

        // Subtle, gentle FOV warp on scroll (max +4° instead of violent zooming)
        const fovWarp = clampValue(Math.abs(activeVelocity) * 0.08, 0.0, 4.0);
        camera.fov = 60.0 + fovWarp;
        camera.updateProjectionMatrix();
      }

      // Gentle nebula billboard rotation & lateral drift
      for (let i = 0; i < nebulaPlanes.length; i++) {
        const item = nebulaPlanes[i];
        item.mesh.rotation.z += item.rotSpeed;
        item.mesh.position.x = item.baseX + Math.sin(elapsedTime * item.swayFreq + i) * item.swayAmp;
        item.mesh.position.y = item.baseY + Math.cos(elapsedTime * item.swayFreq * 0.8 + i) * (item.swayAmp * 0.6);
      }

      renderer.render(scene, camera);
    };

    render();

    // ========================================================================
    // 5. CLEANUP & WEBGL RESOURCE DISPOSAL
    // ========================================================================
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);

      // Dispose Starfield
      starGeo.dispose();
      starMaterial.dispose();

      // Dispose Nebulae
      nebulaQuadGeo.dispose();
      nebulaPlanes.forEach((item) => {
        item.material.dispose();
        scene.remove(item.mesh);
      });

      // Dispose Renderer
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [starCount, dustCount, nebulaCount, baseSpeed, lerpFactor]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{
        // Deep space void base matching portfolio charcoal theme (#030308 to #0a0a0d)
        background: "radial-gradient(ellipse at 50% 50%, #060208 0%, #030308 65%, #010103 100%)",
      }}
    >
      {/* Subtle atmospheric vignette preserving WCAG text readability */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 90% 85% at 50% 40%, rgba(3, 3, 8, 0.18) 0%, rgba(1, 1, 3, 0.65) 100%)",
        }}
      />
    </div>
  );
}

function clampValue(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export default CosmicScrollBackground;
