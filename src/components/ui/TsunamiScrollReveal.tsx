"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";
import { useGlobalTsunamiMode } from "@/lib/tsunamiStore";

// ============================================================================
// REA REVERSE-ENGINEERED TSUNAMI SCROLL-ANIMATION ENGINE
// Target: https://www.framer.com/marketplace/components/tsunami/
// Full WebGL Liquid Wave Distortion, CAESAR Chromatic Dispersion & Fluid Mask Reveal
// ============================================================================

export interface TsunamiScrollRevealProps {
  /** Image or Video Media Source URL */
  src?: string;
  /** Explicit media type override (auto-detected if omitted) */
  mediaType?: "image" | "video";
  /** Liquid wave distortion strength (0.0 to 1.5, default 0.6) */
  distortion?: number;
  /** Wave spatial frequency multiplier (0.5 to 3.0, default 1.0) */
  waveFrequency?: number;
  /** Spatial width of the wave band (0.05 to 0.6, default 0.24) */
  waveWidth?: number;
  /** Wave propagation angle in degrees (0 to 360, default 112) */
  angle?: number;
  /** Turbulence and liquid disturbance factor (0.0 to 1.0, default 0.35) */
  disturbance?: number;
  /** RGB channel splitting and chromatic aberration intensity (0.0 to 1.0, default 0.35) */
  dispersion?: number;
  /** Specular highlight reflection intensity (0.0 to 1.0, default 0.32) */
  reflection?: number;
  /** Trailing diffuse shadow intensity (0.0 to 1.0, default 0.22) */
  shadow?: number;
  /** Gaussian blur radius applied to spectral dispersion (0.0 to 0.01, default 0.002) */
  blurRadius?: number;
  /** Blend specular highlight with underlying texture luminance */
  blendReflection?: boolean;
  /** Blend shadow with underlying texture luminance */
  blendShadow?: boolean;
  /** Enable scroll-driven liquid mask reveal (0% to 100% fluid unveiling) */
  mask?: boolean;
  /** Viewport entry progress where reveal begins (0.0 = bottom of screen, default 0.05) */
  revealStart?: number;
  /** Viewport exit progress where reveal completes (1.0 = top of screen, default 0.72) */
  revealEnd?: number;
  /** Linear interpolation damping factor (0.01 to 0.3, default 0.09) */
  lerpSmoothness?: number;
  /** Velocity sensitivity multiplier (increases turbulence on fast scrolls, default 1.8) */
  velocityMultiplier?: number;
  /** Object fit mode in UV space: "cover" or "contain" (default "cover") */
  fit?: "cover" | "contain";
  /** Loop playback for video media */
  loop?: boolean;
  /** Autoplay video media */
  autoplay?: boolean;
  /** Mute video media (required for web autoplay) */
  muted?: boolean;
  /** Ambient wave drift speed when scrolling stops */
  ambientSpeed?: number;
  /** Alt text for accessibility */
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 vUv;
varying vec2 vTextureCoord;

uniform vec2 uMediaSize;
uniform vec2 uPanelSize;
uniform int uFitMode; // 0: contain, 1: cover

void main() {
  vUv = a_position * 0.5 + 0.5;

  if (uFitMode == 1) {
    vec2 ratio = vec2(
      min((uPanelSize.x / uPanelSize.y) / (uMediaSize.x / uMediaSize.y), 1.0),
      min((uPanelSize.y / uPanelSize.x) / (uMediaSize.y / uMediaSize.x), 1.0)
    );
    vTextureCoord = (vUv - vec2(0.5)) * ratio + vec2(0.5);
  } else {
    vTextureCoord = vUv;
  }

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
uniform float uWaveFrequency;
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
uniform vec2 uPanelSize;

const vec2 NOISE_SEED = vec2(12.9898, 78.233);
const float NOISE_MULTIPLIER = 43758.5453123;
const vec3 LUMINANCE_WEIGHTS = vec3(0.299, 0.587, 0.114);
const float PI = 3.14159265359;

// CAESAR Theme Constants (#6D001A Burgundy, #9E0B2E Crimson, #E899AC Blush)
const vec3 CAESAR_ACCENT = vec3(0.427, 0.0, 0.102);
const vec3 CAESAR_HIGHLIGHT = vec3(0.620, 0.043, 0.180);
const vec3 CAESAR_BLUSH = vec3(0.910, 0.600, 0.675);

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

vec4 sampleTexture(vec2 uv) {
  if (uHasTexture == 1) {
    return texture2D(uTexture, clamp(uv, 0.0, 1.0));
  }
  vec2 c = uv - 0.5;
  vec3 col = mix(vec3(0.04, 0.008, 0.016), CAESAR_ACCENT * 0.35, length(c));
  return vec4(col, 1.0);
}

vec4 gaussianBlur(vec2 uv, float radius, float intensity) {
  if (radius <= 0.0 || intensity <= 0.0) {
    return sampleTexture(uv);
  }

  vec4 result = vec4(0.0);
  float totalWeight = 0.0;

  float centerWeight = 0.147761;
  result += sampleTexture(uv) * centerWeight;
  totalWeight += centerWeight;

  float adjWeight = 0.118318;
  result += sampleTexture(clamp(uv + vec2(radius, 0.0), 0.0, 1.0)) * adjWeight;
  result += sampleTexture(clamp(uv + vec2(-radius, 0.0), 0.0, 1.0)) * adjWeight;
  result += sampleTexture(clamp(uv + vec2(0.0, radius), 0.0, 1.0)) * adjWeight;
  result += sampleTexture(clamp(uv + vec2(0.0, -radius), 0.0, 1.0)) * adjWeight;
  totalWeight += adjWeight * 4.0;

  float diagWeight = 0.094907;
  float diagRadius = radius * 0.707;
  result += sampleTexture(clamp(uv + vec2(diagRadius, diagRadius), 0.0, 1.0)) * diagWeight;
  result += sampleTexture(clamp(uv + vec2(-diagRadius, diagRadius), 0.0, 1.0)) * diagWeight;
  result += sampleTexture(clamp(uv + vec2(diagRadius, -diagRadius), 0.0, 1.0)) * diagWeight;
  result += sampleTexture(clamp(uv + vec2(-diagRadius, -diagRadius), 0.0, 1.0)) * diagWeight;
  totalWeight += diagWeight * 4.0;

  return result / totalWeight;
}

vec4 applySpectralDispersion(vec2 uv, vec2 distortion, float strength, float enhance, float blurRadius) {
  vec2 distortedUV = clamp(uv + distortion, 0.0, 1.0);
  vec4 baseColor = sampleTexture(distortedUV);

  if (strength <= 0.001) return baseColor;

  vec2 waveDir = vec2(cos(uAngle), sin(uAngle));
  vec2 dispersionDir = vec2(-waveDir.y, waveDir.x);
  float scale = strength * enhance * 0.011;

  vec2 offset1 = dispersionDir * (0.35 * scale);
  vec2 offset2 = dispersionDir * (0.75 * scale);
  vec2 offset3 = dispersionDir * (1.15 * scale);

  // Direct fast chromatic sampling without 27-tap multi-pass gaussian blur
  vec4 sample1 = sampleTexture(clamp(distortedUV + offset1, 0.0, 1.0));
  vec4 sample2 = sampleTexture(clamp(distortedUV + offset2, 0.0, 1.0));
  vec4 sample3 = sampleTexture(clamp(distortedUV + offset3, 0.0, 1.0));

  // Prismatic CAESAR Channel Splitting
  vec3 dispersed = vec3(
    baseColor.r * 0.55 + sample1.r * 0.45 + CAESAR_HIGHLIGHT.r * 0.12,
    sample1.g * 0.32 + sample2.g * 0.68,
    sample2.b * 0.40 + sample3.b * 0.60 + CAESAR_BLUSH.b * 0.10
  );

  float mixFactor = clamp(strength * enhance * 0.62, 0.0, 0.92);
  return vec4(mix(baseColor.rgb, dispersed, mixFactor), baseColor.a);
}

void main() {
  vec2 uv = vTextureCoord;

  float velBoost = clamp(uVelocity * 0.8, 0.0, 2.0);
  float effectiveDistortion = uDistortionStrength * (1.0 + velBoost * 1.5) * 0.4;
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
    vec2 noiseCoord1 = (rotatedUV * uWaveFrequency + vec2(uProgress * 0.6 + uTime * 0.03, 0.0)) * 15.0;
    vec2 noiseCoord2 = (rotatedUV * uWaveFrequency + vec2(0.0, uProgress * 2.2 + uTime * 0.02)) * 12.0;
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
    vec2 gradX = (fractalNoise((rotatedUV * uWaveFrequency + vec2(gradStep, 0.0)) * 15.0) -
                 fractalNoise((rotatedUV * uWaveFrequency - vec2(gradStep, 0.0)) * 15.0)) * vec2(0.5 / gradStep, 0.0);
    vec2 gradY = (fractalNoise((rotatedUV * uWaveFrequency + vec2(0.0, gradStep)) * 15.0) -
                 fractalNoise((rotatedUV * uWaveFrequency - vec2(0.0, gradStep)) * 15.0)) * vec2(0.0, 0.5 / gradStep);

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

    vec3 specTint = mix(CAESAR_HIGHLIGHT, CAESAR_BLUSH, 0.55);

    if (uBlendReflection) {
      float luminance = dot(textureColor.rgb, LUMINANCE_WEIGHTS);
      float blendFactor = smoothstep(0.15, 0.88, luminance) * totalReflection;
      textureColor.rgb = mix(textureColor.rgb,
                            textureColor.rgb + specTint * totalReflection * 1.7, blendFactor);
    } else {
      textureColor.rgb += specTint * totalReflection * 1.7;
    }

    if (uBlendShadow) {
      float luminance = dot(textureColor.rgb, LUMINANCE_WEIGHTS);
      float blendFactor = smoothstep(0.8, 0.1, luminance);
      textureColor.rgb = mix(textureColor.rgb,
                            textureColor.rgb * (1.0 - totalShadow * 0.8), blendFactor);
    } else {
      textureColor.rgb *= (1.0 - totalShadow * 0.6);
    }

    // CAESAR Edge Prismatic Rim Light
    float edgeDistance = smoothstep(0.0, uWaveWidth * 0.5, distanceToWave);
    float rimLight = (1.0 - edgeDistance) * waveMask * uReflection * 0.45;
    textureColor.rgb += CAESAR_HIGHLIGHT * rimLight;
  }

  if (uMask) {
    float maskEdge = waveCenter - uWaveWidth * 0.5;
    float baseMask = smoothstep(maskEdge - uWaveWidth * 0.3, maskEdge + uWaveWidth * 0.3, projectedPosition);

    if (waveMask > 0.001) {
      float maskDisturbance = (fractalNoise(rotatedUV * 15.0 * uWaveFrequency) - 0.5) * effectiveDisturbance * 0.7;
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

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Tsunami scroll shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function TsunamiScrollReveal({
  src,
  mediaType,
  distortion = 0.6,
  waveFrequency = 1.0,
  waveWidth = 0.24,
  angle = 112,
  disturbance = 0.35,
  dispersion = 0.35,
  reflection = 0.32,
  shadow = 0.22,
  blurRadius = 0.002,
  blendReflection = true,
  blendShadow = true,
  mask = true,
  revealStart = 0.04,
  revealEnd = 0.72,
  lerpSmoothness = 0.09,
  velocityMultiplier = 1.8,
  fit = "cover",
  loop = true,
  autoplay = true,
  muted = true,
  ambientSpeed = 0.015,
  alt = "Tsunami Reveal Media",
  className = "",
  style,
}: TsunamiScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tsunamiMode] = useGlobalTsunamiMode();

  const isVideo =
    mediaType === "video" ||
    (mediaType === undefined &&
      typeof src === "string" &&
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src));

  const isVisibleRef = useRef<boolean>(true);
  const targetProgressRef = useRef<number>(0.0);
  const currentProgressRef = useRef<number>(0.0);
  const appearProgressRef = useRef<number>(0.0);
  const velocityRef = useRef<number>(0.0);
  const targetVelocityRef = useRef<number>(0.0);
  const lastScrollYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const timeRef = useRef<number>(0);

  const mediaElementRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const mediaDimensionsRef = useRef<{ width: number; height: number }>({
    width: 1920,
    height: 1080,
  });
  const [mediaReady, setMediaReady] = useState<boolean>(false);

  // Reset appear sweep when switching to "appear" mode
  useEffect(() => {
    if (tsunamiMode === "appear") {
      appearProgressRef.current = 0.0;
    }
  }, [tsunamiMode]);

  // Load Media Element
  useEffect(() => {
    if (!src) {
      setMediaReady(false);
      return;
    }

    let active = true;

    if (isVideo) {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.muted = muted;
      video.loop = loop;
      video.autoplay = autoplay;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.preload = "auto";
      video.src = src;

      const handleReady = () => {
        if (!active) return;
        mediaDimensionsRef.current = {
          width: video.videoWidth || 1920,
          height: video.videoHeight || 1080,
        };
        mediaElementRef.current = video;
        setMediaReady(true);
        if (autoplay) {
          video.play().catch(() => {});
        }
      };

      video.addEventListener("loadeddata", handleReady);
      video.addEventListener("canplay", handleReady);

      return () => {
        active = false;
        video.pause();
        video.removeAttribute("src");
        video.load();
        mediaElementRef.current = null;
      };
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.loading = "lazy";
      img.onload = () => {
        if (!active) return;
        mediaDimensionsRef.current = {
          width: img.naturalWidth || 1920,
          height: img.naturalHeight || 1080,
        };
        mediaElementRef.current = img;
        setMediaReady(true);
      };
      img.src = src;

      return () => {
        active = false;
        mediaElementRef.current = null;
      };
    }
  }, [src, isVideo, loop, autoplay, muted]);

  // IntersectionObserver to pause off-screen rendering
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.01, rootMargin: "200px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Viewport Scroll Progress Tracking & Velocity Calculation
  const updateScrollPhysics = useCallback(
    (lenisVelocity?: number) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight || 1;
      const totalDist = windowH + rect.height;
      const currentDist = windowH - rect.top;

      const viewportProgress = Math.min(Math.max(currentDist / totalDist, 0.0), 1.0);

      let mappedProgress = 0.0;
      if (viewportProgress <= revealStart) {
        mappedProgress = 0.0;
      } else if (viewportProgress >= revealEnd) {
        mappedProgress = 1.0;
      } else {
        mappedProgress = (viewportProgress - revealStart) / (revealEnd - revealStart);
      }
      targetProgressRef.current = mappedProgress;

      if (typeof lenisVelocity === "number") {
        targetVelocityRef.current = Math.abs(lenisVelocity) * 0.08 * velocityMultiplier;
      } else {
        const now = performance.now();
        const dt = Math.max(now - lastTimeRef.current, 10);
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollYRef.current;
        const instantVelocity = (Math.abs(deltaY) / dt) * 16.66;

        targetVelocityRef.current = instantVelocity * velocityMultiplier;
        lastScrollYRef.current = currentScrollY;
        lastTimeRef.current = now;
      }
    },
    [revealStart, revealEnd, velocityMultiplier]
  );

  // Sync directly with Lenis smooth scroll
  useLenis(
    useCallback(
      (lenis: Lenis) => {
        updateScrollPhysics(lenis.velocity);
      },
      [updateScrollPhysics]
    )
  );

  useEffect(() => {
    updateScrollPhysics();
    const onScroll = () => updateScrollPhysics();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateScrollPhysics]);

  // WebGL Render Loop
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
      console.error("Program link failed:", gl.getProgramInfoLog(program));
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
    const uWaveFreqLoc = gl.getUniformLocation(program, "uWaveFrequency");
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
    const uHasTextureLoc = gl.getUniformLocation(program, "uHasTexture");
    const uMediaSizeLoc = gl.getUniformLocation(program, "uMediaSize");
    const uPanelSizeLoc = gl.getUniformLocation(program, "uPanelSize");
    const uFitModeLoc = gl.getUniformLocation(program, "uFitMode");

    const texture: WebGLTexture | null = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Flip Y so DOM images/videos render right-side-up in WebGL UV space
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([10, 2, 4, 255])
    );

    let textureLoaded = false;
    let animId: number;
    let width = 0;
    let height = 0;

    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const maxDpr = isTouch ? 1.5 : 2.0;

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      width = container.clientWidth;
      height = container.clientHeight;

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

    const render = () => {
      if (!isVisibleRef.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      timeRef.current += ambientSpeed;
      handleResize();

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      // Compute active wave progress based on Tsunami mode
      let activeProgress = currentProgressRef.current;
      if (tsunamiMode === "appear") {
        appearProgressRef.current = Math.min(1.0, appearProgressRef.current + 0.014);
        activeProgress = appearProgressRef.current;
      } else if (tsunamiMode === "sequence") {
        activeProgress = (timeRef.current * 0.18) % 1.0;
      } else {
        currentProgressRef.current +=
          (targetProgressRef.current - currentProgressRef.current) * lerpSmoothness;
        activeProgress = currentProgressRef.current;
      }

      velocityRef.current +=
        (targetVelocityRef.current - velocityRef.current) * 0.15;
      targetVelocityRef.current *= 0.88;

      const media = mediaElementRef.current;
      if (media) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (isVideo) {
          const video = media as HTMLVideoElement;
          if (video.readyState >= 2) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              video
            );
            textureLoaded = true;
          }
        } else if (!textureLoaded) {
          const img = media as HTMLImageElement;
          if (img.complete && img.naturalWidth > 0) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              img
            );
            textureLoaded = true;
          }
        }
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const radAngle = (angle * Math.PI) / 180;

      gl.uniform1f(uProgressLoc, activeProgress);
      gl.uniform1f(uWaveWidthLoc, waveWidth);
      gl.uniform1f(uDistortionLoc, distortion);
      gl.uniform1f(uWaveFreqLoc, waveFrequency);
      gl.uniform1f(uDispersionLoc, dispersion);
      gl.uniform1f(uBlurRadiusLoc, blurRadius);
      gl.uniform1f(uReflectionLoc, reflection);
      gl.uniform1f(uShadowLoc, shadow);
      gl.uniform1f(uDisturbanceLoc, disturbance);
      gl.uniform1f(uAngleLoc, radAngle);
      gl.uniform1i(uBlendReflLoc, blendReflection ? 1 : 0);
      gl.uniform1i(uBlendShadowLoc, blendShadow ? 1 : 0);
      gl.uniform1i(uMaskLoc, mask && tsunamiMode !== "sequence" ? 1 : 0);
      gl.uniform1f(uVelocityLoc, velocityRef.current);
      gl.uniform1f(uTimeLoc, timeRef.current);
      gl.uniform1i(uHasTextureLoc, textureLoaded ? 1 : 0);
      gl.uniform2f(
        uMediaSizeLoc,
        mediaDimensionsRef.current.width,
        mediaDimensionsRef.current.height
      );
      gl.uniform2f(uPanelSizeLoc, canvas.width, canvas.height);
      gl.uniform1i(uFitModeLoc, fit === "cover" ? 1 : 0);

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
    mediaReady,
    isVideo,
    tsunamiMode,
    distortion,
    waveFrequency,
    waveWidth,
    angle,
    disturbance,
    dispersion,
    reflection,
    shadow,
    blurRadius,
    blendReflection,
    blendShadow,
    mask,
    lerpSmoothness,
    fit,
    ambientSpeed,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      style={style}
      role="img"
      aria-label={alt}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block select-none pointer-events-none"
      />
    </div>
  );
}

export default TsunamiScrollReveal;
