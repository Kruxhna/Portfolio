"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
} from "react";

// ============================================================================
// INTERACTIVE TUNABLE CONFIG (CAESAR THEME: BLACK / CRIMSON / BLUSH / ALABASTER)
// ============================================================================

export const SAND_TEXT_CONFIG = {
  text: "KRUXHNA",
  backgroundColor: "#000000",
  glyphColor: "#F5EEF0",
  particleColors: ["#FFFFFF", "#E899AC", "#C93B5B", "#6D001A"],
  turbulenceFreq: 0.009,
  turbulenceAmp: 2.2, // Silky, subtle mirage heat-haze in px
  turbulenceSpeed: 0.012,
  hoverErosionRadius: 85,
  erosionGranularity: 0.65,
  particleCountMax: 6000,
  particleSizeRange: [1.0, 2.6] as [number, number],
  scatterVelocityBoost: 0.45,
  curlNoiseStrength: 1.3,
  returnToOrigin: true,
};

// ============================================================================
// MATHEMATICAL NOISE & CURL HELPERS
// ============================================================================

function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

// 2D Curl-Noise velocity field for smooth swirling desert dust
function curlNoise2D(x: number, y: number, time: number): [number, number] {
  const eps = 1.0;
  const scale = 0.006;
  const t = time * 0.7;

  const phi = (px: number, py: number) => {
    return (
      Math.sin(px * scale + t) * Math.cos(py * scale * 1.1) +
      Math.sin((px + py) * scale * 1.3 - t * 0.4) * 0.5
    );
  };

  const dFdy = (phi(x, y + eps) - phi(x, y - eps)) / (2 * eps);
  const dFdx = (phi(x + eps, y) - phi(x - eps, y)) / (2 * eps);

  return [dFdy * 13.0, -dFdx * 13.0];
}

// ============================================================================
// COMPONENT: SandTextMonument
// ============================================================================

interface SandTextMonumentProps {
  text?: string;
  className?: string;
}

export function SandTextMonument({
  text = SAND_TEXT_CONFIG.text,
  className = "",
}: SandTextMonumentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Smoothed mouse & velocity state
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    vx: 0,
    vy: 0,
    active: false,
  });

  // Erosion bite marks with exponential organic decay
  const bitesRef = useRef<
    Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
    }>
  >([]);

  // Performance tracking refs (avoid idle RAF and 24,000 loop passes)
  const isVisibleRef = useRef(false);
  const activeCountRef = useRef(0);

  // Preallocated particle pools (Float32Array for zero garbage collection)
  const poolRef = useRef<{
    pX: Float32Array;
    pY: Float32Array;
    pVx: Float32Array;
    pVy: Float32Array;
    pOrigX: Float32Array;
    pOrigY: Float32Array;
    pSize: Float32Array;
    pAlpha: Float32Array;
    pLife: Float32Array;
    pDecay: Float32Array;
    pColor: Uint8Array;
    pActive: Uint8Array;
    head: number;
  }>({
    pX: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pY: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pVx: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pVy: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pOrigX: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pOrigY: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pSize: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pAlpha: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pLife: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pDecay: new Float32Array(SAND_TEXT_CONFIG.particleCountMax),
    pColor: new Uint8Array(SAND_TEXT_CONFIG.particleCountMax),
    pActive: new Uint8Array(SAND_TEXT_CONFIG.particleCountMax),
    head: 0,
  });

  const glyphDataRef = useRef<{
    alpha: Uint8Array;
    width: number;
    height: number;
  } | null>(null);

  // Rasterize offscreen glyph with mathematical optical centering and monumental scale
  const rasterizeOffscreenGlyph = useCallback(
    (w: number, h: number) => {
      if (w <= 0 || h <= 0) return;

      let offscreen = offscreenCanvasRef.current;
      if (!offscreen) {
        offscreen = document.createElement("canvas");
        offscreenCanvasRef.current = offscreen;
      }
      offscreen.width = w;
      offscreen.height = h;

      const oCtx = offscreen.getContext("2d", { willReadFrequently: true });
      if (!oCtx) return;

      oCtx.clearRect(0, 0, w, h);

      // Monumental scale: target spanning ~96% of container width
      const targetWidth = w * 0.96;
      const testSize = 120;

      // Detect computed body font to match Geist Sans exactly, with Devanagari fallbacks
      let fontFamily = '"Geist Sans", "Noto Sans Devanagari", "Mangal", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif';
      if (typeof window !== "undefined") {
        const computed = getComputedStyle(document.body).fontFamily;
        if (computed) {
          fontFamily = `${computed}, "Noto Sans Devanagari", "Mangal", "Segoe UI", sans-serif`;
        }
      }

      oCtx.font = `900 ${testSize}px ${fontFamily}`;
      const testMetrics = oCtx.measureText(text);

      let fontSize = testSize;
      if (testMetrics.width > 0) {
        const widthScale = targetWidth / testMetrics.width;
        const testVisualH =
          (testMetrics.actualBoundingBoxAscent || testSize * 0.72) +
          (testMetrics.actualBoundingBoxDescent || testSize * 0.05);
        const heightScale = (h * 0.90) / Math.max(testVisualH, 1);
        const finalScale = Math.min(widthScale, heightScale);
        fontSize = Math.floor(testSize * finalScale);
      }

      // Configure final monumental font
      oCtx.font = `900 ${fontSize}px ${fontFamily}`;
      oCtx.fillStyle = SAND_TEXT_CONFIG.glyphColor;
      oCtx.textAlign = "center";
      oCtx.textBaseline = "alphabetic";

      // Perfect optical vertical centering using actual glyph font metrics
      const finalMetrics = oCtx.measureText(text);
      const ascent = finalMetrics.actualBoundingBoxAscent || fontSize * 0.72;
      const descent = finalMetrics.actualBoundingBoxDescent || 0;
      const opticalCenterY = Math.round((h - (ascent + descent)) / 2 + ascent);

      oCtx.fillText(text, Math.round(w / 2), opticalCenterY);

      // Cache alpha channel for O(1) hit testing
      const imgData = oCtx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const alphaBuffer = new Uint8Array(w * h);

      for (let i = 0; i < w * h; i++) {
        alphaBuffer[i] = data[i * 4 + 3];
      }

      glyphDataRef.current = {
        alpha: alphaBuffer,
        width: w,
        height: h,
      };
    },
    [text]
  );

  // Responsive resize handler & font-load listener
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      if (w === 0 || h === 0) return;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      rasterizeOffscreenGlyph(w, h);
    };

    handleResize();

    const raf = requestAnimationFrame(handleResize);
    const timeout = setTimeout(handleResize, 150);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        handleResize();
      });
    }

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [rasterizeOffscreenGlyph]);

  // Pointer event listeners with smoothed velocity
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    const mouse = mouseRef.current;
    if (!mouse.active) {
      mouse.prevX = curX;
      mouse.prevY = curY;
      mouse.vx = 0;
      mouse.vy = 0;
      mouse.active = true;
    }

    const rawVx = curX - mouse.prevX;
    const rawVy = curY - mouse.prevY;

    // Exponential velocity smoothing (avoids jerky impulses)
    mouse.vx += (rawVx - mouse.vx) * 0.4;
    mouse.vy += (rawVy - mouse.vy) * 0.4;
    mouse.prevX = curX;
    mouse.prevY = curY;
    mouse.x = curX;
    mouse.y = curY;
  };

  const handlePointerLeave = () => {
    mouseRef.current.active = false;
  };

  // Main 120fps Animation Loop (with offscreen IntersectionObserver gating)
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const loop = (now: number) => {
      if (!isVisibleRef.current) {
        rafId = 0;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;
      elapsed += dt;

      const canvas = canvasRef.current;
      const offscreen = offscreenCanvasRef.current;
      const glyphCache = glyphDataRef.current;

      if (!canvas || !offscreen || !glyphCache) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      const w = glyphCache.width;
      const h = glyphCache.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const mouse = mouseRef.current;
      const pool = poolRef.current;

      // ----------------------------------------------------------------------
      // 1. UPDATE EROSION & SPAWN PARTICLES
      // ----------------------------------------------------------------------
      if (mouse.active) {
        const mx = mouse.x;
        const my = mouse.y;
        const radius = SAND_TEXT_CONFIG.hoverErosionRadius;

        bitesRef.current.push({
          x: mx,
          y: my,
          radius: radius,
          alpha: 1.0,
        });

        if (bitesRef.current.length > 25) {
          bitesRef.current.shift();
        }

        const step = 4;
        const maxSpawnPerFrame = 45;
        let spawnedThisFrame = 0;

        for (let dy = -radius; dy <= radius; dy += step) {
          if (spawnedThisFrame >= maxSpawnPerFrame) break;

          for (let dx = -radius; dx <= radius; dx += step) {
            const dist = Math.hypot(dx, dy);
            if (dist > radius) continue;

            const px = Math.floor(mx + dx);
            const py = Math.floor(my + dy);

            if (px < 0 || px >= w || py < 0 || py >= h) continue;

            const alphaVal = glyphCache.alpha[py * w + px];
            if (alphaVal > 50) {
              const noiseVal = hash2D(px, py);
              if (noiseVal < SAND_TEXT_CONFIG.erosionGranularity) {
                const idx = pool.head;
                pool.head = (pool.head + 1) % SAND_TEXT_CONFIG.particleCountMax;

                pool.pX[idx] = px + (Math.random() - 0.5) * 3;
                pool.pY[idx] = py + (Math.random() - 0.5) * 3;
                pool.pOrigX[idx] = px;
                pool.pOrigY[idx] = py;

                const angle =
                  Math.atan2(py - my, px - mx) + (Math.random() - 0.5) * 0.6;
                const radialSpeed = 1.4 + Math.random() * 2.8;

                pool.pVx[idx] =
                  Math.cos(angle) * radialSpeed +
                  mouse.vx * SAND_TEXT_CONFIG.scatterVelocityBoost;
                pool.pVy[idx] =
                  Math.sin(angle) * radialSpeed +
                  mouse.vy * SAND_TEXT_CONFIG.scatterVelocityBoost -
                  0.3;

                pool.pSize[idx] =
                  SAND_TEXT_CONFIG.particleSizeRange[0] +
                  Math.random() *
                    (SAND_TEXT_CONFIG.particleSizeRange[1] -
                      SAND_TEXT_CONFIG.particleSizeRange[0]);

                pool.pAlpha[idx] = 0.5 + Math.random() * 0.5;
                pool.pLife[idx] = 1.0;
                pool.pDecay[idx] = 0.012 + Math.random() * 0.015;

                const randColor = Math.random();
                pool.pColor[idx] =
                  randColor < 0.35 ? 0 : randColor < 0.65 ? 1 : randColor < 0.85 ? 2 : 3;

                pool.pActive[idx] = 1;
                spawnedThisFrame++;
                if (spawnedThisFrame >= maxSpawnPerFrame) break;
              }
            }
          }
        }
      }

      // Smooth exponential bite healing
      for (let i = bitesRef.current.length - 1; i >= 0; i--) {
        bitesRef.current[i].alpha *= 0.93;
        if (bitesRef.current[i].alpha < 0.015) {
          bitesRef.current.splice(i, 1);
        }
      }

      // ----------------------------------------------------------------------
      // 2. PASS 1: RENDER TURBULENT GLYPH WITH CONTINUOUS HEAT-HAZE MIRAGE
      // ----------------------------------------------------------------------
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Optimized 4px sub-bands: cuts drawImage calls in half while preserving silky mirage
      const sliceH = 4;
      const numSlices = Math.ceil(h / sliceH);

      for (let i = 0; i < numSlices; i++) {
        const sy = i * sliceH;

        const wave1 =
          Math.sin(
            sy * SAND_TEXT_CONFIG.turbulenceFreq + elapsed * 1.2
          ) * SAND_TEXT_CONFIG.turbulenceAmp;
        const wave2 =
          Math.sin(
            sy * (SAND_TEXT_CONFIG.turbulenceFreq * 2.8) - elapsed * 1.8
          ) *
          (SAND_TEXT_CONFIG.turbulenceAmp * 0.28);

        let dx = wave1 + wave2;

        if (mouse.active) {
          const distY = Math.abs(sy - mouse.y);
          if (distY < 140) {
            // Smooth cosine proximity falloff
            const prox = Math.cos((distY / 140) * (Math.PI * 0.5));
            dx += Math.sin(sy * 0.12 + elapsed * 7) * (prox * prox * 2.8);
          }
        }

        ctx.drawImage(offscreen, 0, sy, w, sliceH, dx, sy, w, sliceH);
      }

      // Apply granular erosion bite marks (destination-out)
      if (bitesRef.current.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";

        for (let b = 0; b < bitesRef.current.length; b++) {
          const bite = bitesRef.current[b];
          const grad = ctx.createRadialGradient(
            bite.x,
            bite.y,
            bite.radius * 0.3,
            bite.x,
            bite.y,
            bite.radius
          );
          grad.addColorStop(0, `rgba(0, 0, 0, ${bite.alpha * 0.95})`);
          grad.addColorStop(0.7, `rgba(0, 0, 0, ${bite.alpha * 0.55})`);
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(bite.x, bite.y, bite.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // CAESAR Crimson & Rose edge rim glow along eroded bites
        ctx.save();
        ctx.globalCompositeOperation = "source-atop";
        for (let b = 0; b < bitesRef.current.length; b++) {
          const bite = bitesRef.current[b];
          const rimGrad = ctx.createRadialGradient(
            bite.x,
            bite.y,
            bite.radius * 0.5,
            bite.x,
            bite.y,
            bite.radius + 14
          );
          rimGrad.addColorStop(0, "rgba(109, 0, 26, 0)");
          rimGrad.addColorStop(
            0.8,
            `rgba(158, 11, 46, ${bite.alpha * 0.45})`
          );
          rimGrad.addColorStop(1, "rgba(201, 59, 91, 0)");

          ctx.fillStyle = rimGrad;
          ctx.beginPath();
          ctx.arc(bite.x, bite.y, bite.radius + 14, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // ----------------------------------------------------------------------
      // 3. PASS 2: BATCHED SAND-PARTICLE SCATTER PHYSICS & DRAW (SKIPPED WHEN IDLE)
      // ----------------------------------------------------------------------
      // If mouse is active, we know particles were spawned or might be active
      if (mouse.active) {
        activeCountRef.current = 1;
      }

      if (activeCountRef.current > 0 || bitesRef.current.length > 0) {
        const colors = SAND_TEXT_CONFIG.particleColors;
        let currentActive = 0;

        // Physics integration pass
        for (let i = 0; i < SAND_TEXT_CONFIG.particleCountMax; i++) {
          if (!pool.pActive[i]) continue;
          currentActive++;

          const [curlX, curlY] = curlNoise2D(pool.pX[i], pool.pY[i], elapsed);
          pool.pVx[i] += curlX * SAND_TEXT_CONFIG.curlNoiseStrength * dt;
          pool.pVy[i] += curlY * SAND_TEXT_CONFIG.curlNoiseStrength * dt;

          pool.pVx[i] *= 0.93;
          pool.pVy[i] *= 0.93;

          if (SAND_TEXT_CONFIG.returnToOrigin) {
            const distToCursor = Math.hypot(
              pool.pX[i] - mouse.x,
              pool.pY[i] - mouse.y
            );
            if (!mouse.active || distToCursor > SAND_TEXT_CONFIG.hoverErosionRadius * 1.2) {
              const dx = pool.pOrigX[i] - pool.pX[i];
              const dy = pool.pOrigY[i] - pool.pY[i];
              const spring = 0.045;

              pool.pVx[i] += dx * spring;
              pool.pVy[i] += dy * spring;

              if (Math.hypot(dx, dy) < 2.0 && Math.hypot(pool.pVx[i], pool.pVy[i]) < 0.5) {
                pool.pActive[i] = 0;
                continue;
              }
            }
          }

          pool.pX[i] += pool.pVx[i];
          pool.pY[i] += pool.pVy[i];

          pool.pLife[i] -= pool.pDecay[i];
          if (pool.pLife[i] <= 0 && !SAND_TEXT_CONFIG.returnToOrigin) {
            pool.pActive[i] = 0;
            continue;
          }
        }

        activeCountRef.current = currentActive;

        // Batched rendering pass: only draw if active particles exist
        if (currentActive > 0) {
          for (let c = 0; c < colors.length; c++) {
            ctx.fillStyle = colors[c];
            ctx.beginPath();
            for (let i = 0; i < SAND_TEXT_CONFIG.particleCountMax; i++) {
              if (pool.pActive[i] && pool.pColor[i] === c) {
                const size = pool.pSize[i] * Math.max(0.4, pool.pLife[i]);
                ctx.rect(pool.pX[i], pool.pY[i], size, size);
              }
            }
            ctx.fill();
          }
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    // IntersectionObserver to only animate when monument is in viewport
    const containerEl = containerRef.current;
    let observer: IntersectionObserver | null = null;
    if (containerEl) {
      observer = new IntersectionObserver(
        ([entry]) => {
          const wasVisible = isVisibleRef.current;
          isVisibleRef.current = entry.isIntersecting;
          if (!wasVisible && isVisibleRef.current) {
            lastTime = performance.now();
            if (!rafId) {
              rafId = requestAnimationFrame(loop);
            }
          }
        },
        { threshold: 0.01, rootMargin: "150px 0px 150px 0px" }
      );
      observer.observe(containerEl);
    }

    return () => {
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[clamp(240px,24vw,460px)] select-none overflow-hidden flex items-center justify-center ${className}`}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="block w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
}

export default SandTextMonument;
