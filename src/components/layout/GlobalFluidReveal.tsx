"use client";

import React, { useRef, useEffect } from "react";

interface GlobalFluidRevealProps {
  className?: string;
}

export function GlobalFluidReveal({ className = "" }: GlobalFluidRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Offscreen buffer canvases for masking & compositing
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");

    const revealCanvas = document.createElement("canvas");
    const revealCtx = revealCanvas.getContext("2d");

    if (!maskCtx || !revealCtx) return;

    // Load Image 1 (Front/Resting) and Image 2 (Back/Reveal)
    const frontImg = new Image();
    frontImg.crossOrigin = "anonymous";
    frontImg.src = "/images/FRONT.png";

    const backImg = new Image();
    backImg.crossOrigin = "anonymous";
    backImg.src = "/images/BACK.png";

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Motion & Theme states
    let isReducedMotion = false;
    let isLightTheme = false;

    // Cursor tracking with lerp & velocity interpolation
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let prevX = -1000;
    let prevY = -1000;
    let hasMoved = false;
    let angle = 0;

    // Handle high-DPI sizing
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      const pixelWidth = Math.floor(width * dpr);
      const pixelHeight = Math.floor(height * dpr);

      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      maskCanvas.width = pixelWidth;
      maskCanvas.height = pixelHeight;

      revealCanvas.width = pixelWidth;
      revealCanvas.height = pixelHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Track Theme toggles
    const checkThemeAndMotion = () => {
      isLightTheme =
        document.documentElement.classList.contains("theme-light") ||
        document.documentElement.getAttribute("data-theme") === "light";
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      isReducedMotion =
        mediaQuery.matches ||
        document.documentElement.classList.contains("reduced-motion");
    };

    checkThemeAndMotion();
    const observer = new MutationObserver(checkThemeAndMotion);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Pointer event listeners
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ("touches" in e) {
        if (e.touches.length === 0) return;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      targetX = clientX * dpr;
      targetY = clientY * dpr;

      if (!hasMoved) {
        currentX = targetX;
        currentY = targetY;
        prevX = targetX;
        prevY = targetY;
        hasMoved = true;
      }
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    // Draw image with object-fit: cover math
    const drawCoverImage = (
      targetContext: CanvasRenderingContext2D,
      img: HTMLImageElement,
      cw: number,
      ch: number,
      alpha = 1.0
    ) => {
      if (!img.complete || img.naturalWidth === 0) return;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let renderW: number;
      let renderH: number;
      let offsetX: number;
      let offsetY: number;

      if (canvasRatio > imgRatio) {
        renderW = cw;
        renderH = cw / imgRatio;
        offsetX = 0;
        offsetY = (ch - renderH) / 2;
      } else {
        renderH = ch;
        renderW = ch * imgRatio;
        offsetX = (cw - renderW) / 2;
        offsetY = 0;
      }

      targetContext.save();
      targetContext.globalAlpha = alpha;
      targetContext.drawImage(img, offsetX, offsetY, renderW, renderH);
      targetContext.restore();
    };

    // Stamp organic billowy smoke puff
    const stampPuff = (
      mCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      speed: number,
      currAngle: number
    ) => {
      // Dynamic radius expanding with velocity between 140px and 240px
      const baseRadius = Math.min(
        260 * dpr,
        Math.max(140 * dpr, (140 + speed * 2.8) * dpr)
      );

      mCtx.save();
      mCtx.globalCompositeOperation = "source-over";

      // Center primary plume
      const centerGrad = mCtx.createRadialGradient(x, y, 0, x, y, baseRadius);
      centerGrad.addColorStop(0, "rgba(255, 255, 255, 0.96)");
      centerGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.72)");
      centerGrad.addColorStop(0.72, "rgba(255, 255, 255, 0.28)");
      centerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

      mCtx.fillStyle = centerGrad;
      mCtx.beginPath();
      mCtx.arc(x, y, baseRadius, 0, Math.PI * 2);
      mCtx.fill();

      // 2–3 rotating offset satellite puffs (smoke turbulence)
      if (!isReducedMotion) {
        const numPuffs = 3;
        const offsetDist = baseRadius * 0.44;

        for (let s = 0; s < numPuffs; s++) {
          const theta = currAngle + (s * Math.PI * 2) / numPuffs;
          const puffRadius =
            baseRadius * (0.45 + 0.16 * Math.sin(currAngle * 1.5 + s));
          const sx = x + Math.cos(theta) * (offsetDist + speed * 0.8);
          const sy = y + Math.sin(theta) * (offsetDist + speed * 0.8);

          const satGrad = mCtx.createRadialGradient(
            sx,
            sy,
            0,
            sx,
            sy,
            puffRadius
          );
          satGrad.addColorStop(0, "rgba(255, 255, 255, 0.58)");
          satGrad.addColorStop(0.52, "rgba(255, 255, 255, 0.22)");
          satGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

          mCtx.fillStyle = satGrad;
          mCtx.beginPath();
          mCtx.arc(sx, sy, puffRadius, 0, Math.PI * 2);
          mCtx.fill();
        }
      }

      mCtx.restore();
    };

    // Animation Loop
    let animationFrameId: number;

    const render = () => {
      const cw = canvas.width;
      const ch = canvas.height;

      // 1. Decay the mask canvas smoothly (destination-out with 0.032 opacity)
      // Dissolves the portal back into the resting background over ~1.5 seconds
      maskCtx.save();
      maskCtx.globalCompositeOperation = "destination-out";
      maskCtx.fillStyle = "rgba(0, 0, 0, 0.032)";
      maskCtx.fillRect(0, 0, cw, ch);
      maskCtx.restore();

      // 2. Interpolate pointer physics
      if (hasMoved) {
        const lerpFactor = 0.16;
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;

        const vx = currentX - prevX;
        const vy = currentY - prevY;
        const dist = Math.sqrt(vx * vx + vy * vy);

        // Subdivide fast jumps so fast sweeps produce an unbroken liquid ribbon
        const stepSize = Math.max(14 * dpr, 10);
        const steps = Math.max(1, Math.ceil(dist / stepSize));

        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const ix = prevX + (currentX - prevX) * t;
          const iy = prevY + (currentY - prevY) * t;
          stampPuff(maskCtx, ix, iy, dist / steps, angle);
        }

        prevX = currentX;
        prevY = currentY;
        angle += 0.035;
      }

      // 3. Clear Screen Canvas
      ctx.clearRect(0, 0, cw, ch);

      // 4. Render Resting Base Layer
      // Pure Black canvas base
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, cw, ch);

      if (isLightTheme) {
        // Light Theme: FRONT.png in full radiance
        drawCoverImage(ctx, frontImg, cw, ch, 1.0);
      } else {
        // Dark Theme: Subtle ambient presence of FRONT.png's flowing organic curves
        drawCoverImage(ctx, frontImg, cw, ch, 0.22);
        // Contrast veil keeping text 100% legible
        const veil = ctx.createLinearGradient(0, 0, 0, ch);
        veil.addColorStop(0, "rgba(0, 0, 0, 0.72)");
        veil.addColorStop(0.5, "rgba(10, 8, 7, 0.62)");
        veil.addColorStop(1, "rgba(0, 0, 0, 0.82)");
        ctx.fillStyle = veil;
        ctx.fillRect(0, 0, cw, ch);
      }

      // 5. Render Cursor-Revealed Layer (BACK.png Topographic Artwork)
      revealCtx.clearRect(0, 0, cw, ch);
      drawCoverImage(revealCtx, backImg, cw, ch, 1.0);

      // Apply offscreen smoke mask to reveal buffer
      revealCtx.save();
      revealCtx.globalCompositeOperation = "destination-in";
      revealCtx.drawImage(maskCanvas, 0, 0);
      revealCtx.restore();

      // 6. Composite the masked reveal over the resting base layer
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(revealCanvas, 0, 0);
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
