"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";

// ============================================================================
// REVERSE-ENGINEERED TSUNAMI SHADER PIPELINE
// Source: https://www.framer.com/marketplace/components/tsunami/
// Architect: Jayzhushi / Reveals.cool
// Clean-Room Re-Engineering for Next.js App Router (Liquid Chrome + Scroll Dynamics)
// ============================================================================

export type TsunamiMode = "scroll" | "appear" | "sequence";

export interface TsunamiColors {
  bg?: string; // Base void (e.g. #000000)
  fg?: string; // Elevated surface (e.g. #0A0204)
  accent?: string; // Core accent (e.g. #6D001A)
  highlight?: string; // Hot specular tint (e.g. #9E0B2E)
}

export interface TsunamiProps {
  /** Interaction mode: "scroll" (scroll-driven), "appear" (one-shot sweep), "sequence" (continuous loop) */
  mode?: TsunamiMode;
  /** Wave position progress (0.0 to 1.0) */
  waveProgress?: number;
  /** Wave propagation angle in degrees (0 to 360, default 110) */
  angle?: number;
  /** Primary wave distortion amplitude (0.0 to 1.5, default 0.65) */
  distortion?: number;
  /** Spatial width of the wave band (0.05 to 0.6, default 0.26) */
  waveWidth?: number;
  /** Wave height factor (0.0 to 1.0, default 0.3) */
  waveHeight?: number;
  /** Turbulence disturbance (0.0 to 1.0, default 0.38) */
  disturbance?: number;
  /** Spectral chromatic dispersion / chromatic aberration (0.0 to 1.0, default 0.35) */
  dispersion?: number;
  /** Specular crest reflection / highlight intensity (0.0 to 1.0, default 0.35) */
  reflection?: number;
  /** Trailing diffuse shadow intensity (0.0 to 1.0, default 0.22) */
  shadow?: number;
  /** Gaussian blur radius applied to spectral dispersion (0.0 to 0.01, default 0.002) */
  blurRadius?: number;
  /** Blend specular highlight with surface luminance */
  blendReflection?: boolean;
  /** Blend shadow with surface luminance */
  blendShadow?: boolean;
  /** Apply transparency wipe mask */
  mask?: boolean;
  /** Sync wave progress automatically with smooth page scroll */
  scrollControlled?: boolean;
  /** Velocity sensitivity multiplier on scroll (default 2.0) */
  velocityMultiplier?: number;
  /** Respond interactively to pointer/mouse movement */
  interactive?: boolean;
  /** Continuous ambient liquid drift speed */
  ambientSpeed?: number;
  /** Plain color palette tokens */
  colors?: TsunamiColors;
  /** Optional texture source */
  textureSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Callback when appear animation completes */
  onAnimationComplete?: () => void;
}

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 vUv;
varying vec2 vTextureCoord;

void main() {
  vUv = a_position * 0.5 + 0.5;
  vTextureCoord = vUv;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;

uniform sampler2D uTexture;
uniform int uHasTexture;
varying vec2 vUv;
varying vec2 vTextureCoord;

uniform float uProgress;
uniform float uWaveWidth;
uniform float uDistortionStrength;
uniform float uWaveHeight;
uniform float uDispersion;
uniform float uBlurRadius;
uniform float uReflection;
uniform float uShadow;
uniform float uDisturbance;
uniform float uAngle;
uniform bool uBlendReflection;
uniform bool uBlendShadow;
uniform bool uMask;
uniform float uVelocity;
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorBg;
uniform vec3 uColorFg;
uniform vec3 uColorAccent;
uniform vec3 uColorHighlight;

const vec2 NOISE_SEED = vec2(12.9898, 78.233);
const float NOISE_MULTIPLIER = 43758.5453123;
const vec3 LUMINANCE_WEIGHTS = vec3(0.299, 0.587, 0.114);
const float PI = 3.14159265359;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 st) {
  return fract(sin(dot(st, NOISE_SEED)) * NOISE_MULTIPLIER);
}

float smoothNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fractalNoise(vec2 st) {
  return 0.5 * smoothNoise(st) +
         0.25 * smoothNoise(st * 2.0) +
         0.125 * smoothNoise(st * 4.0);
}

// Procedural Dark Liquid Chrome / Organic Fluid Metal (matches reference recording)
vec4 sampleSource(vec2 uv) {
  if (uHasTexture == 1) {
    return texture2D(uTexture, uv);
  }

  // Centered normalized coordinates
  vec2 p = (uv - 0.5) * 2.2;
  
  // Multi-stone fluid sculpture curvature (matching Framer demo)
  float d1 = length(p - vec2(-0.35, 0.35)) - 0.46;
  float d2 = length(p - vec2(0.35, 0.35)) - 0.44;
  float d3 = length(p - vec2(0.0, -0.22)) - 0.58;
  float d4 = length(p - vec2(-0.45, -0.42)) - 0.40;
  float d5 = length(p - vec2(0.45, -0.42)) - 0.40;

  float k = 0.22;
  float d = -log(exp(-k*d1) + exp(-k*d2) + exp(-k*d3) + exp(-k*d4) + exp(-k*d5)) / k;

  float shapeMask = smoothstep(0.12, -0.05, d);
  
  // Normal derivation from curvature
  vec3 N = normalize(vec3(p.x * 2.2, p.y * 2.2, 0.95));
  float microDetail = (smoothNoise(uv * 18.0 + uTime * 0.02) - 0.5) * 0.08;
  N = normalize(N + vec3(microDetail, microDetail, 0.0));

  // Lighting Setup:
  // Key light: cool high-specular white light
  vec3 keyDir = normalize(vec3(0.5, 0.75, 0.8));
  float keyDiff = max(0.0, dot(N, keyDir));
  float keySpec = pow(max(0.0, dot(reflect(-keyDir, N), vec3(0.0, 0.0, 1.0))), 28.0);

  // Fill light: deep burgundy tone (#6D001A)
  vec3 fillDir = normalize(vec3(-0.7, -0.5, 0.6));
  float fillSpec = pow(max(0.0, dot(reflect(-fillDir, N), vec3(0.0, 0.0, 1.0))), 16.0);

  // Fresnel rim glint
  float fresnel = pow(1.0 - max(0.0, N.z), 2.8);

  // Chrome Surface Color Synthesis
  vec3 chrome = vec3(0.05, 0.05, 0.06) + vec3(0.18) * keyDiff;
  chrome += vec3(1.0, 0.98, 1.0) * keySpec * 2.4;                 // Gleaming chrome glint
  chrome += uColorAccent * fillSpec * 1.6;                         // Burgundy specular reflection
  chrome += mix(vec3(0.45), uColorHighlight, 0.55) * fresnel * 1.4; // Specular rim reflection

  // Subtle brushed metallic scratch micro-texture
  float scratch = (hash21(uv * 700.0) - 0.5) * 0.03;
  chrome += scratch;

  // Background Void with soft ambient radial wine warmth
  float bgRadial = 1.0 - smoothstep(0.0, 0.85, length(uv - vec2(0.5, 0.38)));
  vec3 backgroundCol = mix(uColorBg, uColorFg, bgRadial * 0.75);

  vec3 finalColor = mix(backgroundCol, chrome, shapeMask);

  return vec4(finalColor, 1.0);
}

vec4 gaussianBlur(vec2 uv, float radius, float intensity) {
  if (radius <= 0.0 || intensity <= 0.0) {
    return sampleSource(uv);
  }

  vec4 result = vec4(0.0);
  float totalWeight = 0.0;

  float centerWeight = 0.147761;
  result += sampleSource(uv) * centerWeight;
  totalWeight += centerWeight;

  float adjWeight = 0.118318;
  result += sampleSource(clamp(uv + vec2(radius, 0.0), 0.0, 1.0)) * adjWeight;
  result += sampleSource(clamp(uv + vec2(-radius, 0.0), 0.0, 1.0)) * adjWeight;
  result += sampleSource(clamp(uv + vec2(0.0, radius), 0.0, 1.0)) * adjWeight;
  result += sampleSource(clamp(uv + vec2(0.0, -radius), 0.0, 1.0)) * adjWeight;
  totalWeight += adjWeight * 4.0;

  float diagWeight = 0.094907;
  float diagRadius = radius * 0.707;
  result += sampleSource(clamp(uv + vec2(diagRadius, diagRadius), 0.0, 1.0)) * diagWeight;
  result += sampleSource(clamp(uv + vec2(-diagRadius, diagRadius), 0.0, 1.0)) * diagWeight;
  result += sampleSource(clamp(uv + vec2(diagRadius, -diagRadius), 0.0, 1.0)) * diagWeight;
  result += sampleSource(clamp(uv + vec2(-diagRadius, -diagRadius), 0.0, 1.0)) * diagWeight;
  totalWeight += diagWeight * 4.0;

  return result / totalWeight;
}

vec4 applySpectralDispersion(vec2 uv, vec2 distortion, float strength, float enhance, float blurRadius) {
  vec2 distortedUV = clamp(uv + distortion, 0.0, 1.0);
  vec4 baseColor = sampleSource(distortedUV);

  if (strength <= 0.001) return baseColor;

  vec2 waveDir = vec2(cos(uAngle), sin(uAngle));
  vec2 dispersionDir = vec2(-waveDir.y, waveDir.x);
  float scale = strength * enhance * 0.01;

  vec2 offset1 = dispersionDir * (0.35 * scale);
  vec2 offset2 = dispersionDir * (0.75 * scale);
  vec2 offset3 = dispersionDir * (1.15 * scale);

  float blurIntensity = clamp(strength * enhance * 0.35, 0.0, 1.0);
  vec4 sample1, sample2, sample3;

  if (blurRadius > 0.0 && blurIntensity > 0.1) {
    sample1 = gaussianBlur(clamp(distortedUV + offset1, 0.0, 1.0), blurRadius * 0.5, blurIntensity);
    sample2 = gaussianBlur(clamp(distortedUV + offset2, 0.0, 1.0), blurRadius * 0.75, blurIntensity);
    sample3 = gaussianBlur(clamp(distortedUV + offset3, 0.0, 1.0), blurRadius, blurIntensity);
  } else {
    sample1 = sampleSource(clamp(distortedUV + offset1, 0.0, 1.0));
    sample2 = sampleSource(clamp(distortedUV + offset2, 0.0, 1.0));
    sample3 = sampleSource(clamp(distortedUV + offset3, 0.0, 1.0));
  }

  // Intense Rainbow Prismatic Channel Splitting (Cyan / Magenta / Yellow / Blue)
  vec3 dispersed = vec3(
    baseColor.r * 0.55 + sample1.r * 0.45 + 0.15 * sample1.r,
    sample1.g * 0.30 + sample2.g * 0.70,
    sample2.b * 0.38 + sample3.b * 0.62 + 0.12 * sample3.r
  );

  float mixFactor = clamp(strength * enhance * 0.65, 0.0, 0.92);
  return vec4(mix(baseColor.rgb, dispersed, mixFactor), baseColor.a);
}

void main() {
  vec2 uv = vTextureCoord;

  // Velocity boost on rapid scroll
  float velBoost = clamp(uVelocity * 0.75, 0.0, 2.0);
  float effectiveDistortion = uDistortionStrength * (1.0 + velBoost * 1.5) * 0.42;
  float effectiveDisturbance = uDisturbance * (1.0 + velBoost * 1.2);
  float effectiveDispersion = uDispersion * (1.0 + velBoost * 2.0);

  vec2 direction = vec2(cos(uAngle), sin(uAngle));
  float projectedPosition = dot(uv, direction);

  vec2 corners[4];
  corners[0] = vec2(0.0, 0.0);
  corners[1] = vec2(1.0, 0.0);
  corners[2] = vec2(0.0, 1.0);
  corners[3] = vec2(1.0, 1.0);

  float minProj = dot(corners[0], direction);
  float maxProj = minProj;
  for(int i = 1; i < 4; i++) {
    float proj = dot(corners[i], direction);
    minProj = min(minProj, proj);
    maxProj = max(maxProj, proj);
  }

  float effectiveWaveWidth = uWaveWidth * 2.0;
  float totalRange = maxProj - minProj + effectiveWaveWidth * 2.0;
  float waveCenter = minProj - effectiveWaveWidth + uProgress * totalRange;
  float distanceToWave = abs(projectedPosition - waveCenter);

  float waveMask = exp(-distanceToWave * distanceToWave / (uWaveWidth * uWaveWidth * 0.5));

  float waveStart = waveCenter - uWaveWidth;
  float waveEnd = waveCenter + uWaveWidth;

  if (waveEnd < minProj || waveStart > maxProj) {
    waveMask = 0.0;
  } else {
    if (waveCenter < minProj) {
      float fadeRange = effectiveWaveWidth * 0.5;
      waveMask *= smoothstep(minProj - fadeRange, minProj + fadeRange, waveEnd);
    }
    if (waveCenter > maxProj) {
      float fadeRange = effectiveWaveWidth * 0.5;
      waveMask *= smoothstep(maxProj + fadeRange, maxProj - fadeRange, waveStart);
    }
  }

  float progressFade = 1.0;
  if (uProgress <= 0.05) {
    progressFade *= smoothstep(0.0, 0.05, uProgress);
  } else if (uProgress >= 0.95) {
    progressFade *= smoothstep(1.0, 0.95, uProgress);
  }
  waveMask *= progressFade;

  float cosAngle = cos(-uAngle);
  float sinAngle = sin(-uAngle);
  vec2 rotatedUV = vec2(
    uv.x * cosAngle - uv.y * sinAngle,
    uv.x * sinAngle + uv.y * cosAngle
  );

  vec2 distortion = vec2(0.0);
  if (waveMask > 0.001) {
    vec2 noiseCoord1 = (rotatedUV + vec2(uProgress * 0.55 + uTime * 0.025, 0.0)) * 15.0;
    vec2 noiseCoord2 = (rotatedUV + vec2(0.0, uProgress * 2.2 + uTime * 0.018)) * 12.0;
    float totalDisturbance = (fractalNoise(noiseCoord1) + fractalNoise(noiseCoord2) * 0.7 - 0.85) * effectiveDisturbance;

    vec2 perpDirection = vec2(-direction.y, direction.x);
    float attenuation = waveMask * effectiveDistortion;

    distortion = (totalDisturbance * 0.8 * direction +
                 totalDisturbance * 0.25 * perpDirection) * attenuation;

    float radialEffect = sin(distanceToWave / uWaveWidth * PI) * waveMask;
    distortion += (radialEffect + totalDisturbance * 0.3) * effectiveDistortion * 0.3 * direction;
  }

  float dispersionStrength = waveMask * effectiveDispersion * 2.0;
  float dispersionEnhance = 1.0 + effectiveDistortion * 2.0 + effectiveDisturbance * 1.5;
  vec4 textureColor = applySpectralDispersion(uv, distortion, dispersionStrength, dispersionEnhance, uBlurRadius);

  if (waveMask > 0.01) {
    const float gradStep = 0.01;
    vec2 gradX = (fractalNoise((rotatedUV + vec2(gradStep, 0.0)) * 15.0) -
                 fractalNoise((rotatedUV - vec2(gradStep, 0.0)) * 15.0)) * vec2(0.5 / gradStep, 0.0);
    vec2 gradY = (fractalNoise((rotatedUV + vec2(0.0, gradStep)) * 15.0) -
                 fractalNoise((rotatedUV - vec2(0.0, gradStep)) * 15.0)) * vec2(0.0, 0.5 / gradStep);

    vec2 noiseGradient = gradX + gradY;
    vec2 rotatedGrad = vec2(
      noiseGradient.x * cosAngle - noiseGradient.y * sinAngle,
      noiseGradient.x * sinAngle + noiseGradient.y * cosAngle
    );

    vec2 combinedGradient = normalize(normalize(distortion + vec2(0.001)) +
                                     rotatedGrad * effectiveDisturbance * effectiveDistortion * 2.0 + vec2(0.001));

    vec2 lightDir = vec2(-0.6, 0.8);
    float dotProduct = dot(combinedGradient, lightDir);
    float surfaceRoughness = abs(fractalNoise(rotatedUV * 20.0) - 0.5) * effectiveDisturbance;

    float reflection = pow(max(0.0, dotProduct), mix(2.0, 1.2, surfaceRoughness)) *
                      waveMask * effectiveDistortion * (1.0 + surfaceRoughness * 0.8);
    float shadow = pow(max(0.0, -dotProduct), mix(1.5, 1.0, surfaceRoughness)) *
                  waveMask * effectiveDistortion * (1.0 + surfaceRoughness * 0.8);

    float totalReflection = reflection * uReflection;
    float totalShadow = shadow * uShadow;

    vec3 specColor = mix(uColorHighlight, vec3(1.0, 1.0, 1.0), 0.70);

    if (uBlendReflection) {
      float luminance = dot(textureColor.rgb, LUMINANCE_WEIGHTS);
      float blendFactor = smoothstep(0.15, 0.85, luminance) * totalReflection;
      textureColor.rgb = mix(textureColor.rgb,
                            textureColor.rgb + specColor * totalReflection * 1.8, blendFactor);
    } else {
      textureColor.rgb += specColor * totalReflection * 1.8;
    }

    if (uBlendShadow) {
      float luminance = dot(textureColor.rgb, LUMINANCE_WEIGHTS);
      float blendFactor = smoothstep(0.8, 0.1, luminance);
      textureColor.rgb = mix(textureColor.rgb,
                            textureColor.rgb * (1.0 - totalShadow * 0.8), blendFactor);
    } else {
      textureColor.rgb *= (1.0 - totalShadow * 0.6);
    }

    // Prismatic Rim Lighting
    float edgeDistance = smoothstep(0.0, uWaveWidth * 0.5, distanceToWave);
    float rimLight = (1.0 - edgeDistance) * waveMask * uReflection * 0.40;
    textureColor.rgb += vec3(rimLight * 0.95, rimLight * 0.35, rimLight * 0.65);
  }

  // Rhythmic liquid breathing
  textureColor.rgb *= 1.0 + waveMask * 0.08 * sin(uProgress * 20.0 + uTime);

  if (uMask) {
    float maskEdge = waveCenter - uWaveWidth * 0.5;
    float baseMask = smoothstep(maskEdge - uWaveWidth * 0.3, maskEdge + uWaveWidth * 0.3, projectedPosition);

    if (waveMask > 0.001) {
      float maskDisturbance = (fractalNoise(rotatedUV * 15.0) - 0.5) * effectiveDisturbance * 0.7;
      float disturbedMask = smoothstep(maskEdge + maskDisturbance - uWaveWidth * 0.4,
                                     maskEdge + maskDisturbance + uWaveWidth * 0.2, projectedPosition);
      baseMask = mix(baseMask, disturbedMask, 0.75);
      baseMask = mix(baseMask, smoothstep(0.3, 0.7, baseMask), waveMask * 0.35);
    }

    textureColor.a *= clamp(baseMask, 0.0, 1.0);
  }

  gl_FragColor = textureColor;
}
`;

function hexToRgb(hex: string, fallback: [number, number, number]): [number, number, number] {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    return [r, g, b];
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return fallback;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Tsunami shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function Tsunami({
  mode = "scroll",
  waveProgress = 0.5,
  angle = 110,
  distortion = 0.65,
  waveWidth = 0.26,
  waveHeight = 0.3,
  disturbance = 0.38,
  dispersion = 0.35,
  reflection = 0.35,
  shadow = 0.22,
  blurRadius = 0.002,
  blendReflection = true,
  blendShadow = true,
  mask = false,
  scrollControlled = true,
  velocityMultiplier = 2.0,
  interactive = true,
  ambientSpeed = 0.015,
  colors = {
    bg: "#000000",
    fg: "#0A0204",
    accent: "#6D001A",
    highlight: "#9E0B2E",
  },
  textureSrc,
  className = "",
  style,
  onAnimationComplete,
}: TsunamiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic animation and scroll state
  const scrollProgressRef = useRef<number>(waveProgress);
  const targetScrollProgressRef = useRef<number>(waveProgress);
  const velocityRef = useRef<number>(0.0);
  const targetVelocityRef = useRef<number>(0.0);
  const lastScrollYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const timeRef = useRef<number>(0);
  const appearProgressRef = useRef<number>(0.0);
  const isAppearingRef = useRef<boolean>(mode === "appear");

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false,
  });

  // Trigger appear sweep
  useEffect(() => {
    if (mode === "appear") {
      appearProgressRef.current = 0.0;
      isAppearingRef.current = true;
    }
  }, [mode]);

  // Scroll Sync via Lenis & Native Fallback with Scroll Velocity
  const handleScrollUpdate = useCallback((scroll: number) => {
    if (!scrollControlled || mode !== "scroll") return;

    // Viewport-height rhythmic cycle: sweeps a liquid wave every ~1.3 viewports
    const cycleLength = window.innerHeight * 1.35;
    const rawCycle = (scroll / cycleLength) % 1.0;
    targetScrollProgressRef.current = rawCycle;

    // Scroll Velocity Calculation
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 10);
    const deltaY = scroll - lastScrollYRef.current;
    const instantVelocity = (Math.abs(deltaY) / dt) * 16.66;

    targetVelocityRef.current = instantVelocity * velocityMultiplier;
    lastScrollYRef.current = scroll;
    lastTimeRef.current = now;
  }, [scrollControlled, mode, velocityMultiplier]);

  useLenis(
    useCallback(
      (lenis: Lenis) => {
        handleScrollUpdate(lenis.scroll);
      },
      [handleScrollUpdate]
    )
  );

  useEffect(() => {
    if (!scrollControlled || mode !== "scroll") return;
    const handleNative = () => {
      handleScrollUpdate(window.scrollY);
    };
    window.addEventListener("scroll", handleNative, { passive: true });
    return () => window.removeEventListener("scroll", handleNative);
  }, [scrollControlled, mode, handleScrollUpdate]);

  // Pointer tracking for interactive liquid tilt
  useEffect(() => {
    if (!interactive) return;
    const handlePointerMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
      mouseRef.current.active = true;
    };
    const handlePointerLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [interactive]);

  // WebGL Render Pipeline
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Tsunami program link error:", gl.getProgramInfoLog(program));
      return;
    }

    const aPos = gl.getAttribLocation(program, "a_position");
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const uProgressLoc = gl.getUniformLocation(program, "uProgress");
    const uWaveWidthLoc = gl.getUniformLocation(program, "uWaveWidth");
    const uDistortionLoc = gl.getUniformLocation(program, "uDistortionStrength");
    const uWaveHeightLoc = gl.getUniformLocation(program, "uWaveHeight");
    const uDispersionLoc = gl.getUniformLocation(program, "uDispersion");
    const uBlurRadiusLoc = gl.getUniformLocation(program, "uBlurRadius");
    const uReflectionLoc = gl.getUniformLocation(program, "uReflection");
    const uShadowLoc = gl.getUniformLocation(program, "uShadow");
    const uDisturbanceLoc = gl.getUniformLocation(program, "uDisturbance");
    const uAngleLoc = gl.getUniformLocation(program, "uAngle");
    const uBlendReflLoc = gl.getUniformLocation(program, "uBlendReflection");
    const uBlendShadowLoc = gl.getUniformLocation(program, "uBlendShadow");
    const uMaskLoc = gl.getUniformLocation(program, "uMask");
    const uVelocityLoc = gl.getUniformLocation(program, "uVelocity");
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uResLoc = gl.getUniformLocation(program, "uResolution");
    const uHasTextureLoc = gl.getUniformLocation(program, "uHasTexture");
    const uColorBgLoc = gl.getUniformLocation(program, "uColorBg");
    const uColorFgLoc = gl.getUniformLocation(program, "uColorFg");
    const uColorAccentLoc = gl.getUniformLocation(program, "uColorAccent");
    const uColorHighlightLoc = gl.getUniformLocation(program, "uColorHighlight");

    let texture: WebGLTexture | null = null;
    let hasTexture = false;

    if (textureSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        hasTexture = true;
      };
      img.src = textureSrc;
    }

    const rgbBg = hexToRgb(colors.bg || "#000000", [0, 0, 0]);
    const rgbFg = hexToRgb(colors.fg || "#0A0204", [0.039, 0.008, 0.016]);
    const rgbAccent = hexToRgb(colors.accent || "#6D001A", [0.427, 0.0, 0.102]);
    const rgbHighlight = hexToRgb(colors.highlight || "#9E0B2E", [0.620, 0.043, 0.180]);

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;

      const renderW = Math.floor(width * dpr);
      const renderH = Math.floor(height * dpr);

      if (canvas.width !== renderW || canvas.height !== renderH) {
        canvas.width = renderW;
        canvas.height = renderH;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // 120 FPS Render Loop
    const render = () => {
      timeRef.current += ambientSpeed;
      handleResize();
      gl.viewport(0, 0, canvas.width, canvas.height);

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      let currentProg = 0.5;

      if (mode === "appear") {
        if (isAppearingRef.current) {
          appearProgressRef.current += 0.012; // ~1.4s smooth sweep
          if (appearProgressRef.current >= 1.0) {
            appearProgressRef.current = 1.0;
            isAppearingRef.current = false;
            onAnimationComplete?.();
          }
        }
        currentProg = appearProgressRef.current;
      } else if (mode === "sequence") {
        currentProg = (timeRef.current * 0.15) % 1.0;
      } else if (scrollControlled) {
        scrollProgressRef.current +=
          (targetScrollProgressRef.current - scrollProgressRef.current) * 0.10;
        currentProg = scrollProgressRef.current;
      } else {
        currentProg = waveProgress + Math.sin(timeRef.current * 0.7) * 0.08;
      }

      // Smooth velocity decay
      velocityRef.current +=
        (targetVelocityRef.current - velocityRef.current) * 0.15;
      targetVelocityRef.current *= 0.88;

      let computedAngle = (angle * Math.PI) / 180;
      if (interactive && mouseRef.current.active) {
        const tilt = (mouseRef.current.x - 0.5) * 0.28;
        computedAngle += tilt;
      }

      gl.uniform1f(uProgressLoc, currentProg);
      gl.uniform1f(uWaveWidthLoc, waveWidth);
      gl.uniform1f(uDistortionLoc, distortion);
      gl.uniform1f(uWaveHeightLoc, waveHeight);
      gl.uniform1f(uDispersionLoc, dispersion);
      gl.uniform1f(uBlurRadiusLoc, blurRadius);
      gl.uniform1f(uReflectionLoc, reflection);
      gl.uniform1f(uShadowLoc, shadow);
      gl.uniform1f(uDisturbanceLoc, disturbance);
      gl.uniform1f(uAngleLoc, computedAngle);
      gl.uniform1i(uBlendReflLoc, blendReflection ? 1 : 0);
      gl.uniform1i(uBlendShadowLoc, blendShadow ? 1 : 0);
      gl.uniform1i(uMaskLoc, mask ? 1 : 0);
      gl.uniform1f(uVelocityLoc, velocityRef.current);
      gl.uniform1f(uTimeLoc, timeRef.current);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);

      gl.uniform3f(uColorBgLoc, rgbBg[0], rgbBg[1], rgbBg[2]);
      gl.uniform3f(uColorFgLoc, rgbFg[0], rgbFg[1], rgbFg[2]);
      gl.uniform3f(uColorAccentLoc, rgbAccent[0], rgbAccent[1], rgbAccent[2]);
      gl.uniform3f(uColorHighlightLoc, rgbHighlight[0], rgbHighlight[1], rgbHighlight[2]);

      if (hasTexture && texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uHasTextureLoc, 1);
      } else {
        gl.uniform1i(uHasTextureLoc, 0);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (texture) gl.deleteTexture(texture);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [
    mode,
    waveProgress,
    angle,
    distortion,
    waveWidth,
    waveHeight,
    disturbance,
    dispersion,
    reflection,
    shadow,
    blurRadius,
    blendReflection,
    blendShadow,
    mask,
    scrollControlled,
    interactive,
    ambientSpeed,
    colors,
    textureSrc,
    onAnimationComplete,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`select-none pointer-events-none ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export { TsunamiScrollReveal, type TsunamiScrollRevealProps } from "./TsunamiScrollReveal";
export default Tsunami;
