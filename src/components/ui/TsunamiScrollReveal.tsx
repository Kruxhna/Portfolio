"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

// ============================================================================
// REA REVERSE-ENGINEERED TSUNAMI SCROLL-ANIMATION ENGINE
// Target: https://www.framer.com/marketplace/components/tsunami/
// Full WebGL2 / WebGL1 Liquid Wave Distortion, Chromatic Dispersion & Fluid Mask Reveal
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
  /** Wave propagation angle in degrees (0 to 360, default 90) */
  angle?: number;
  /** Turbulence and liquid disturbance factor (0.0 to 1.0, default 0.35) */
  disturbance?: number;
  /** RGB channel splitting and chromatic aberration intensity (0.0 to 1.0, default 0.3) */
  dispersion?: number;
  /** Specular highlight reflection intensity (0.0 to 1.0, default 0.3) */
  reflection?: number;
  /** Trailing diffuse shadow intensity (0.0 to 1.0, default 0.2) */
  shadow?: number;
  /** Gaussian blur radius applied to spectral dispersion (0.0 to 0.01, default 0.002) */
  blurRadius?: number;
  /** Blend specular highlight with underlying texture luminance */
  blendReflection?: boolean;
  /** Blend shadow with underlying texture luminance */
  blendShadow?: boolean;
  /** Enable scroll-driven liquid mask reveal (0% to 100% fluid unveiling) */
  mask?: boolean;
  /** Viewport entry progress where reveal begins (0.0 = bottom of screen, default 0.1) */
  revealStart?: number;
  /** Viewport exit progress where reveal completes (1.0 = top of screen, default 0.85) */
  revealEnd?: number;
  /** Linear interpolation damping factor (0.01 to 0.3, default 0.08 for buttery smoothness) */
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
    // UV Aspect-Ratio Cover Scaling
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
  // Fallback dark procedural aesthetic
  vec2 c = uv - 0.5;
  vec3 col = mix(vec3(0.0, 0.0, 0.0), vec3(0.04, 0.01, 0.02), length(c));
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
  float scale = strength * enhance * 0.01;

  vec2 offset1 = dispersionDir * (0.35 * scale);
  vec2 offset2 = dispersionDir * (0.75 * scale);
  vec2 offset3 = dispersionDir * (1.10 * scale);

  float blurIntensity = clamp(strength * enhance * 0.35, 0.0, 1.0);
  vec4 sample1, sample2, sample3;

  if (blurRadius > 0.0 && blurIntensity > 0.1) {
    sample1 = gaussianBlur(clamp(distortedUV + offset1, 0.0, 1.0), blurRadius * 0.5, blurIntensity);
    sample2 = gaussianBlur(clamp(distortedUV + offset2, 0.0, 1.0), blurRadius * 0.75, blurIntensity);
    sample3 = gaussianBlur(clamp(distortedUV + offset3, 0.0, 1.0), blurRadius, blurIntensity);
  } else {
    sample1 = sampleTexture(clamp(distortedUV + offset1, 0.0, 1.0));
    sample2 = sampleTexture(clamp(distortedUV + offset2, 0.0, 1.0));
    sample3 = sampleTexture(clamp(distortedUV + offset3, 0.0, 1.0));
  }

  // Prismatic RGB Channel Splitting
  vec3 dispersed = vec3(
    baseColor.r * 0.60 + sample1.r * 0.40,
    sample1.g * 0.30 + sample2.g * 0.70,
    sample2.b * 0.40 + sample3.b * 0.60
  );

  float mixFactor = clamp(strength * enhance * 0.60, 0.0, 0.90);
  return vec4(mix(baseColor.rgb, dispersed, mixFactor), baseColor.a);
}

void main() {
  vec2 uv = vTextureCoord;

  // Velocity-reactive distortion amplitude and disturbance boost
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

  // Gaussian Wave Mask
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

  // Spectral Chromatic Aberration Dispersion
  float dispersionStrength = waveMask * effectiveDispersion * 2.0;
  float dispersionEnhance = 1.0 + effectiveDistortion * 2.0 + effectiveDisturbance * 1.5;
  vec4 textureColor = applySpectralDispersion(uv, distortion, dispersionStrength, dispersionEnhance, uBlurRadius);

  // Specular Highlight and Rim Light Computation
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

    if (uBlendReflection) {
      float luminance = dot(textureColor.rgb, LUMINANCE_WEIGHTS);
      float blendFactor = smoothstep(0.2, 0.9, luminance) * totalReflection;
      textureColor.rgb = mix(textureColor.rgb,
                            textureColor.rgb + vec3(totalReflection * 1.6), blendFactor);
    } else {
      textureColor.rgb += vec3(totalReflection * 1.6);
    }

    if (uBlendShadow) {
      float luminance = dot(textureColor.rgb, LUMINANCE_WEIGHTS);
      float blendFactor = smoothstep(0.8, 0.1, luminance);
      textureColor.rgb = mix(textureColor.rgb,
                            textureColor.rgb * (1.0 - totalShadow * 0.8), blendFactor);
    } else {
      textureColor.rgb *= (1.0 - totalShadow * 0.6);
    }

    // Edge Prismatic Rim Light
    float edgeDistance = smoothstep(0.0, uWaveWidth * 0.5, distanceToWave);
    float rimLight = (1.0 - edgeDistance) * waveMask * uReflection * 0.4;
    textureColor.rgb += vec3(rimLight * 0.95, rimLight * 0.35, rimLight * 0.65);
  }

  // Dynamic Liquid Wave Mask Reveal (Fluid organic leading edge)
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
  angle = 90,
  disturbance = 0.35,
  dispersion = 0.3,
  reflection = 0.3,
  shadow = 0.2,
  blurRadius = 0.002,
  blendReflection = true,
  blendShadow = true,
  mask = true,
  revealStart = 0.05,
  revealEnd = 0.90,
  lerpSmoothness = 0.08,
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

  // Auto-detect media type
  const isVideo =
    mediaType === "video" ||
    (mediaType === undefined &&
      typeof src === "string" &&
      /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src));

  // Physics & Animation Refs
  const isVisibleRef = useRef<boolean>(true);
  const targetProgressRef = useRef<number>(0.0);
  const currentProgressRef = useRef<number>(0.0);
  const velocityRef = useRef<number>(0.0);
  const targetVelocityRef = useRef<number>(0.0);
  const lastScrollYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const timeRef = useRef<number>(0);

  // Media references
  const mediaElementRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  const mediaDimensionsRef = useRef<{ width: number; height: number }>({
    width: 1920,
    height: 1080,
  });
  const [mediaReady, setMediaReady] = useState<boolean>(false);

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
  const updateScrollPhysics = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const windowH = window.innerHeight;
    const totalDist = windowH + rect.height;
    const currentDist = windowH - rect.top;

    // Viewport relative progress: 0.0 entering bottom, 1.0 leaving top
    const viewportProgress = Math.min(Math.max(currentDist / totalDist, 0.0), 1.0);

    // Map to reveal start and end bounds
    let mappedProgress = 0.0;
    if (viewportProgress <= revealStart) {
      mappedProgress = 0.0;
    } else if (viewportProgress >= revealEnd) {
      mappedProgress = 1.0;
    } else {
      mappedProgress = (viewportProgress - revealStart) / (revealEnd - revealStart);
    }
    targetProgressRef.current = mappedProgress;

    // Scroll Velocity Calculation
    const now = performance.now();
    const dt = Math.max(now - lastTimeRef.current, 10);
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollYRef.current;
    const instantVelocity = (Math.abs(deltaY) / dt) * 16.66; // Normalized to 60fps frame delta

    targetVelocityRef.current = instantVelocity * velocityMultiplier;
    lastScrollYRef.current = currentScrollY;
    lastTimeRef.current = now;
  }, [revealStart, revealEnd, velocityMultiplier]);

  useEffect(() => {
    updateScrollPhysics();
    window.addEventListener("scroll", updateScrollPhysics, { passive: true });
    window.addEventListener("resize", updateScrollPhysics);
    return () => {
      window.removeEventListener("scroll", updateScrollPhysics);
      window.removeEventListener("resize", updateScrollPhysics);
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

    // Uniform locations
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

    // Texture setup
    let texture: WebGLTexture | null = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Initial 1x1 transparent placeholder
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );

    let textureLoaded = false;
    let animId: number;
    let width = 0;
    let height = 0;

    // Mobile DPR cap optimization
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

    // Main 120 FPS High-Performance Animation Loop
    const render = () => {
      // Pause execution when scrolled off-screen
      if (!isVisibleRef.current) {
        animId = requestAnimationFrame(render);
        return;
      }

      timeRef.current += ambientSpeed;
      handleResize();

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      // Lerp physics smoothing
      currentProgressRef.current +=
        (targetProgressRef.current - currentProgressRef.current) * lerpSmoothness;

      velocityRef.current +=
        (targetVelocityRef.current - velocityRef.current) * 0.15;
      // Exponential velocity decay when stationary
      targetVelocityRef.current *= 0.88;

      // Update texture content
      const media = mediaElementRef.current;
      if (media) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (isVideo) {
          const video = media as HTMLVideoElement;
          if (video.readyState >= 2) {
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

      gl.uniform1f(uProgressLoc, currentProgressRef.current);
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
      gl.uniform1i(uMaskLoc, mask ? 1 : 0);
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

