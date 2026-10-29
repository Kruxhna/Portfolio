"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";

// ============================================================================
// REA REVERSE-ENGINEERED SHADER CONFIGURATION (from to-portfolio.com)
// ============================================================================

export type PixelMatrixScrollMode = "cycle" | "page" | "hero-dsa";

export interface PixelMatrixBackgroundProps {
  frontImagePath?: string;
  backImagePath?: string;
  scrollMode?: PixelMatrixScrollMode;
  className?: string;
}

export const DEFAULT_PIXEL_ASSETS = {
  front: "/Images/FRONT.png",
  back: "/Images/BACK.png",
} as const;

// Vertex Shader (Fullscreen Quad)
const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Fragment Shader (Deconstructed from to-portfolio.com WebGL Pipeline)
const FRAGMENT_SHADER_SRC = `
precision mediump float;
#define BLOCK_PX 52.0

varying vec2 v_uv;
uniform vec2 uResolution;
uniform float uPlateReveal;
uniform float uNoiseProgress;
uniform float uNoisePlateReveal;
uniform float uExitShrink;
uniform sampler2D uTextureFront;
uniform sampler2D uTextureBack;
uniform vec2 uUvScale;
uniform int uHasTextures;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hash31(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

void main() {
  float fy = v_uv.y;
  float rev = clamp(uPlateReveal, 0.0008, 1.0);
  float np = clamp(uNoiseProgress, 0.0, 1.0);
  float nr = clamp(uNoisePlateReveal, 0.0008, 1.0);
  float ex = clamp(uExitShrink, 0.0, 1.0);

  /* 色チカチカ対策: スクロール値を粗く量子化 (to-portfolio.com smooth hash quantization) */
  const float COLOR_STEPS = 8.0;
  float npQ = floor(np * COLOR_STEPS + 1.0e-4) / COLOR_STEPS;
  float nrT = clamp((nr - 0.06) / 0.94, 0.0, 1.0);
  float nrQ = 0.06 + floor(nrT * COLOR_STEPS + 1.0e-4) / COLOR_STEPS * 0.94;

  vec2 frag = gl_FragCoord.xy;
  vec2 bl = floor(frag / BLOCK_PX);
  float colX = bl.x;

  float bn = hash21(bl + vec2(npQ * 4.5 + nrQ * 3.0, npQ * 3.5 + nrQ * 2.5));
  float flick = hash31(vec3(colX, bl.y * 0.25, npQ * 5.5 + nrQ * 3.5));
  float wobble = (flick - 0.5) * 0.09 * (1.0 - rev * 0.85);

  /* 横方向: 低さは rev を下回らない。上だけランダムに盛る */
  float colRise = hash21(vec2(colX, 41.0)) * 0.16;
  float wob = wobble * (1.0 - fy * 0.28);
  float line = rev + max(0.0, colRise + wob);
  float mEntry = 1.0 - smoothstep(line - 0.052, line + 0.065, fy);
  /* 伸長終盤は上端まで確実に塗り切る */
  mEntry = max(mEntry, smoothstep(0.9, 1.0, rev));

  /* 離脱: 下からカットが上がり、ブロック揺らぎ付きで上に縮む */
  float exitHash = hash21(vec2(colX, 72.0));
  float exQ = floor(ex * 7.0 + 1.0e-4) / 7.0;
  float exitNoise = (exitHash - 0.5) * 0.16 * exQ;
  float cut = mix(-0.08, 1.1, ex) + exitNoise;
  float exitBand = 0.118;
  float mExit = smoothstep(cut - exitBand, cut + exitBand, fy);

  /* 離脱ブロックはカット境界のリムだけ */
  float exitBlockGate = smoothstep(0.02, 0.22, ex) * (1.0 - smoothstep(0.985, 1.0, ex));
  float cutRim = exitBlockGate * (1.0 - smoothstep(0.0, exitBand * 3.0, abs(fy - cut)));

  // Texture UVs with object-fit: cover scaling
  vec2 coverUv = (v_uv - 0.5) * uUvScale + 0.5;
  vec2 texUv = vec2(coverUv.x, 1.0 - coverUv.y);

  vec3 fgCol;
  vec3 bgCol;

  if (uHasTextures == 1) {
    fgCol = texture2D(uTextureFront, texUv).rgb;
    bgCol = texture2D(uTextureBack, texUv).rgb;
  } else {
    // Warm Obsidian & Charcoal Theme Fallback
    vec3 cTop = vec3(0.06, 0.05, 0.045);
    vec3 cMid = vec3(0.08, 0.065, 0.055);
    vec3 cBot = vec3(0.04, 0.032, 0.028);
    fgCol = mix(cBot, cMid, smoothstep(0.0, 0.52, fy));
    fgCol = mix(fgCol, cTop, smoothstep(0.4, 1.0, fy));
    bgCol = vec3(0.02, 0.015, 0.012);
  }

  // Active wavefront edge shimmer in Warm Terracotta / Amber palette (#E59866, #D97757)
  vec3 amberGlow = vec3(0.898, 0.596, 0.400); // #E59866
  vec3 terracotta = vec3(0.851, 0.467, 0.341); // #D97757
  float bnSoft = bn * 0.65 + 0.175;
  vec3 edgeRgb = mix(terracotta, amberGlow, bnSoft);

  float edgeDist = min(abs(fy - line), abs(fy - rev));
  float inIntro = 1.0 - smoothstep(0.0, 0.9, nr);
  float edgeBoost = (1.0 - smoothstep(0.0, 0.12, edgeDist)) * inIntro;
  float noiseAmt = inIntro * 0.32 + edgeBoost * 0.48;

  float afterStretch = smoothstep(0.98, 1.0, rev);
  float tailT = smoothstep(0.9, 1.0, np);
  float tailCeiling = 1.0 - pow(tailT, 0.4);
  float noiseCeiling = mix(1.0, tailCeiling, afterStretch);
  noiseCeiling = max(noiseCeiling, cutRim * 1.0);
  noiseAmt *= noiseCeiling;

  float mixK = noiseAmt * (0.45 + 0.55 * bnSoft);
  float blockBlendCeiling = 1.0 - smoothstep(0.76, 0.88, rev);
  mixK *= blockBlendCeiling;
  mixK = min(1.0, mixK + cutRim * (0.42 + 0.28 * bnSoft));

  // Compose foreground with edge accents
  vec3 col = mix(fgCol, edgeRgb, mixK * 0.55);
  col = mix(col, edgeRgb, cutRim * 0.75);

  // 52px Hairline Blueprint Grid (to-portfolio.com precision grid)
  vec2 g = fract(frag / BLOCK_PX);
  float gx = smoothstep(0.0, 0.04, g.x) * smoothstep(1.0, 0.96, g.x);
  float gy = smoothstep(0.0, 0.04, g.y) * smoothstep(1.0, 0.96, g.y);

  float gridTailT = smoothstep(0.85, 1.0, np);
  float gridTailCeiling = 1.0 - pow(gridTailT, 1.35);
  float gridCeiling = max(mix(1.0, gridTailCeiling, afterStretch), cutRim * 1.0);
  float gridExitBoost = 1.0 + cutRim * 2.2;
  col += (1.0 - gx * gy) * 0.035 * gridCeiling * gridExitBoost * amberGlow;

  // Lens Vignette
  vec2 c = v_uv - 0.5;
  float vig = 1.0 - dot(c, c) * 0.18;
  col *= vig;

  // Discrete binary-smooth transition between background and foreground
  float mask = clamp(mEntry * mExit, 0.0, 1.0);
  vec3 finalRgb = mix(bgCol, col, mask);

  gl_FragColor = vec4(finalRgb, 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createTexture(gl: WebGLRenderingContext, img: HTMLImageElement): WebGLTexture | null {
  const tex = gl.createTexture();
  if (!tex) return null;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  return tex;
}

function getUvScale(imgWidth: number, imgHeight: number, canvasWidth: number, canvasHeight: number): [number, number] {
  if (imgWidth <= 0 || imgHeight <= 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return [1, 1];
  }
  const imgRatio = imgWidth / imgHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  if (canvasRatio > imgRatio) {
    return [1, imgRatio / canvasRatio];
  } else {
    return [canvasRatio / imgRatio, 1];
  }
}

// ============================================================================
// PIXEL MATRIX BACKGROUND COMPONENT
// ============================================================================

export function PixelMatrixBackground({
  frontImagePath = DEFAULT_PIXEL_ASSETS.front,
  backImagePath = DEFAULT_PIXEL_ASSETS.back,
  scrollMode = "cycle",
  className = "",
}: PixelMatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imagesReady, setImagesReady] = useState(false);

  // HTML5 Image references
  const frontImgRef = useRef<HTMLImageElement | null>(null);
  const backImgRef = useRef<HTMLImageElement | null>(null);

  // Scroll tracking (inertial damped scrub)
  const targetScrollYRef = useRef<number>(0);
  const currentScrollYRef = useRef<number>(0);

  // Preload Images
  useEffect(() => {
    let active = true;
    const front = new Image();
    const back = new Image();
    front.crossOrigin = "anonymous";
    back.crossOrigin = "anonymous";
    let loaded = 0;

    const onImageLoaded = () => {
      loaded++;
      if (loaded === 2 && active) {
        frontImgRef.current = front;
        backImgRef.current = back;
        setImagesReady(true);
      }
    };

    front.onload = onImageLoaded;
    front.onerror = onImageLoaded;
    back.onload = onImageLoaded;
    back.onerror = onImageLoaded;

    front.src = frontImagePath;
    back.src = backImagePath;

    if (front.complete) onImageLoaded();
    if (back.complete) onImageLoaded();

    return () => {
      active = false;
    };
  }, [frontImagePath, backImagePath]);

  // Hook into Lenis / Scroll
  const handleScroll = useCallback((scroll: number) => {
    targetScrollYRef.current = Math.max(0, scroll);
  }, []);

  useLenis(
    useCallback(
      (lenis: Lenis) => {
        handleScroll(lenis.scroll);
      },
      [handleScroll]
    )
  );

  useEffect(() => {
    const handleNative = () => {
      handleScroll(window.scrollY);
    };
    handleNative();
    window.addEventListener("scroll", handleNative, { passive: true });
    return () => window.removeEventListener("scroll", handleNative);
  }, [handleScroll]);

  // WebGL Shader Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
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
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    // Uniform and Attribute Locations
    const aPos = gl.getAttribLocation(program, "a_position");
    const uRes = gl.getUniformLocation(program, "uResolution");
    const uPlateReveal = gl.getUniformLocation(program, "uPlateReveal");
    const uNoiseProgress = gl.getUniformLocation(program, "uNoiseProgress");
    const uNoisePlateReveal = gl.getUniformLocation(program, "uNoisePlateReveal");
    const uExitShrink = gl.getUniformLocation(program, "uExitShrink");
    const uTexFront = gl.getUniformLocation(program, "uTextureFront");
    const uTexBack = gl.getUniformLocation(program, "uTextureBack");
    const uUvScale = gl.getUniformLocation(program, "uUvScale");
    const uHasTextures = gl.getUniformLocation(program, "uHasTextures");

    // Full-screen Quad Buffer
    const quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    let frontTex: WebGLTexture | null = null;
    let backTex: WebGLTexture | null = null;

    let width = 0;
    let height = 0;
    let animId: number;

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

    // Main 120 FPS WebGL Render Loop
    const render = () => {
      handleResize();
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Lazy Texture Binding
      if (!frontTex && frontImgRef.current && frontImgRef.current.complete && frontImgRef.current.naturalWidth > 0) {
        frontTex = createTexture(gl, frontImgRef.current);
      }
      if (!backTex && backImgRef.current && backImgRef.current.complete && backImgRef.current.naturalWidth > 0) {
        backTex = createTexture(gl, backImgRef.current);
      }

      // Smooth damped inertial scrub (0.28s lag curve matching to-portfolio.com)
      const targetScroll = targetScrollYRef.current;
      currentScrollYRef.current += (targetScroll - currentScrollYRef.current) * 0.12;
      const scrollY = currentScrollYRef.current;

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uRes, canvas.width, canvas.height);

      // Compute Timeline and GSAP Power4.out Easing
      let plateReveal = 1.0;
      let noiseProgress = 0.0;
      let noisePlateReveal = 0.06;
      let exitShrink = 0.0;

      if (scrollMode === "cycle") {
        const cycleLength = Math.max(900, height * 1.6);
        const rawCycle = scrollY / cycleLength;
        const cycleIndex = Math.floor(rawCycle);
        const cycleFraction = rawCycle - cycleIndex;

        // Dwell and active wipe phases
        let rawT = 0;
        if (cycleFraction < 0.20) {
          rawT = 0;
        } else if (cycleFraction > 0.80) {
          rawT = 1;
        } else {
          rawT = (cycleFraction - 0.20) / 0.60;
        }

        // GSAP Power4.out curve: 1 - (1 - t)^5
        const easedT = 1.0 - Math.pow(1.0 - rawT, 5);
        const isEvenCycle = cycleIndex % 2 === 0;

        if (isEvenCycle) {
          plateReveal = 1.0 - easedT;
          noiseProgress = easedT;
          noisePlateReveal = 0.06 + 0.94 * (1.0 - easedT);
          exitShrink = easedT;
        } else {
          plateReveal = easedT;
          noiseProgress = 1.0 - easedT;
          noisePlateReveal = 0.06 + 0.94 * easedT;
          exitShrink = 1.0 - easedT;
        }
      } else if (scrollMode === "hero-dsa") {
        const threshold = Math.max(1, height * 1.2);
        const rawT = Math.max(0, Math.min(1, scrollY / threshold));
        const easedT = 1.0 - Math.pow(1.0 - rawT, 5);

        plateReveal = 1.0 - easedT;
        noiseProgress = easedT;
        noisePlateReveal = 0.06 + 0.94 * (1.0 - easedT);
        exitShrink = easedT;
      } else {
        const maxScroll = Math.max(
          1,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const rawT = Math.max(0, Math.min(1, scrollY / maxScroll));
        const easedT = 1.0 - Math.pow(1.0 - rawT, 4);

        plateReveal = 1.0 - easedT;
        noiseProgress = easedT;
        noisePlateReveal = 0.06 + 0.94 * (1.0 - easedT);
        exitShrink = easedT;
      }

      gl.uniform1f(uPlateReveal, plateReveal);
      gl.uniform1f(uNoiseProgress, noiseProgress);
      gl.uniform1f(uNoisePlateReveal, noisePlateReveal);
      gl.uniform1f(uExitShrink, exitShrink);

      // Bind Textures
      if (frontTex && backTex && frontImgRef.current && backImgRef.current) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, frontTex);
        gl.uniform1i(uTexFront, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, backTex);
        gl.uniform1i(uTexBack, 1);

        const [uvScaleX, uvScaleY] = getUvScale(
          frontImgRef.current.naturalWidth,
          frontImgRef.current.naturalHeight,
          canvas.width,
          canvas.height
        );
        gl.uniform2f(uUvScale, uvScaleX, uvScaleY);
        gl.uniform1i(uHasTextures, 1);
      } else {
        gl.uniform1i(uHasTextures, 0);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (frontTex) gl.deleteTexture(frontTex);
      if (backTex) gl.deleteTexture(backTex);
      gl.deleteBuffer(quadBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [imagesReady, scrollMode]);

  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none select-none overflow-hidden bg-[#0A0807] ${className}`}
      aria-hidden="true"
    >
      {/* 1. Instant SSR Fallback */}
      {!imagesReady && (
        <img
          src={frontImagePath}
          alt=""
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      )}

      {/* 2. REA WebGL GPU Shader Matrix Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full select-none pointer-events-none"
      />

      {/* 3. Readability Flat Tint Overlay (Maintains WCAG AA contrast for text) */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundColor: "rgba(10, 8, 7, var(--bg-dim, 0.22))",
        }}
      />
    </div>
  );
}

export default PixelMatrixBackground;
