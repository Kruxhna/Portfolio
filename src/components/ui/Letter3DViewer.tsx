"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface Letter3DViewerProps {
  accentColor?: string;
}

// Frame-rate-independent exponential damp
function damp(current: number, target: number, speed: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-speed * dt));
}

export function Letter3DViewer({ accentColor = "#AD6A4C" }: Letter3DViewerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading]   = useState(true);
  const [loadError, setLoadError]   = useState(false);

  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);

  // Update accent color on prop change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(accentColor);
      materialRef.current.needsUpdate = true;
    }
  }, [accentColor]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 1. Scene ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    const W = canvas.clientWidth  || 480;
    const H = canvas.clientHeight || 560;

    // ── 2. Camera ────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 2.8);

    // ── 3. Renderer — DPR capped at 2 ────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    canvas.appendChild(renderer.domElement);

    // ── 4. Lighting & Environment Setup ──────────────────────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    // Ambient: Rodeo Dust (#DEC1B4) at 0.7 intensity
    const ambientLight = new THREE.AmbientLight(0xDEC1B4, 0.7);
    scene.add(ambientLight);

    // Key Directional Light (top-left [4, 6, 5]): Warm cream (#FFF5EB) at 2.0 intensity
    const keyLight = new THREE.DirectionalLight(0xFFF5EB, 2.0);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    // Rim/Fill Directional Light (bottom-left [-4, -3, 2]): Deep Terracotta (#AD6A4C) at 0.8 intensity
    const rimLight = new THREE.DirectionalLight(0xAD6A4C, 0.8);
    rimLight.position.set(-4, -3, 2);
    scene.add(rimLight);

    // ── 5. Tactile Warm Bronze / Ceramic Material ────────────────────────────
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.22,
      metalness: 0.15,
      clearcoat: 0.4,
      clearcoatRoughness: 0.18,
      transmission: 0,
      transparent: false,
      opacity: 1.0,
    });
    materialRef.current = mat;

    // ── 6. Model ──────────────────────────────────────────────────────────────
    let model: THREE.Group | null = null;
    const initialRot = { x: 0, y: 0.28, z: 0 };

    const loader = new GLTFLoader();
    loader.load(
      "/k.glb",
      (gltf) => {
        const root = gltf.scene;
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) {
              mesh.geometry.deleteAttribute("normal");
              mesh.geometry.computeVertexNormals();
            }
            mesh.material = mat;
          }
        });

        // Center & scale so model occupies ~60-65% of viewport height
        const box    = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const halfH  = Math.tan(THREE.MathUtils.degToRad(42 / 2)) * 2.8;
        const targetFit = halfH * 2 * 0.78;
        const scale = targetFit / (maxDim || 1);

        root.position.sub(center);
        root.scale.setScalar(scale);
        root.rotation.set(initialRot.x, initialRot.y, initialRot.z);

        scene.add(root);
        model = root;
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error("Error loading /k.glb:", err);
        setLoadError(true);
        setIsLoading(false);
      }
    );

    // ── 7. Interaction state ──────────────────────────────────────────────────
    // All values here are "targets" or "current animated values"
    const rot = { x: initialRot.x, y: initialRot.y }; // current animated rotation
    const rotTarget = { x: initialRot.x, y: initialRot.y }; // target from cursor/drag
    const vel = { x: 0, y: 0 }; // angular velocity from drag inertia

    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let lastDragX = 0, lastDragY = 0;
    let isSpinning = false;            // click spin impulse active
    let spinProgress = 0;              // 0→1 over ~1.1s

    // cursor follow target (when not dragging)
    const cursorTarget = { x: 0, y: 0 };

    // ── 8. Pointer events ─────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const margin = 80;
      const isOver =
        e.clientX >= rect.left - margin && e.clientX <= rect.right  + margin &&
        e.clientY >= rect.top  - margin && e.clientY <= rect.bottom + margin;

      if (isOver && !isDragging) {
        const localX = (e.clientX - rect.left) / rect.width;
        const localY = (e.clientY - rect.top)  / rect.height;
        const nx = localX * 2 - 1;
        const ny = -(localY * 2 - 1);
        cursorTarget.x = Math.max(-0.25, Math.min(0.25, ny * 0.25)); // rotation.x
        cursorTarget.y = Math.max(-0.25, Math.min(0.25, nx * 0.25)); // rotation.y
      } else if (!isDragging) {
        cursorTarget.x = 0;
        cursorTarget.y = 0;
      }

      // Drag tracking
      if (isDragging) {
        const dx = e.clientX - lastDragX;
        const dy = e.clientY - lastDragY;
        vel.y = dx * 0.004;
        vel.x = dy * 0.004;
        rotTarget.y += dx * 0.004;
        rotTarget.x = Math.max(-0.5, Math.min(0.5, rotTarget.x + dy * 0.004));
        lastDragX = e.clientX;
        lastDragY = e.clientY;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      dragStartX = lastDragX = e.clientX;
      dragStartY = lastDragY = e.clientY;
      vel.x = 0;
      vel.y = 0;
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      isDragging = false;

      // Check if it was a click (minimal drag distance)
      const dx = Math.abs(e.clientX - dragStartX);
      const dy = Math.abs(e.clientY - dragStartY);
      if (dx < 6 && dy < 6 && !isSpinning) {
        // Click impulse: one smooth full turn on Y
        isSpinning = true;
        spinProgress = 0;
        vel.x = 0;
        vel.y = 0;
      }
      // else inertia continues via vel decay in RAF loop
    };

    const onMouseLeave = () => {
      cursorTarget.x = 0;
      cursorTarget.y = 0;
    };

    // Touch support for drag
    let lastTouchX = 0, lastTouchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      isDragging = true;
      dragStartX = lastTouchX = t.clientX;
      dragStartY = lastTouchY = t.clientY;
      vel.x = 0; vel.y = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const t = e.touches[0];
      const dx = t.clientX - lastTouchX;
      const dy = t.clientY - lastTouchY;
      vel.y = dx * 0.004;
      vel.x = dy * 0.004;
      rotTarget.y += dx * 0.004;
      rotTarget.x = Math.max(-0.5, Math.min(0.5, rotTarget.x + dy * 0.004));
      lastTouchX = t.clientX;
      lastTouchY = t.clientY;
    };
    const onTouchEnd = () => { isDragging = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseleave", onMouseLeave);

    // ── 9. IntersectionObserver: pause rendering offscreen ────────────────────
    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.01 }
    );
    io.observe(wrapper);

    // ── 10. RAF loop ─────────────────────────────────────────────────────────
    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (document.hidden || !isVisible) {
        clock.getDelta(); // consume delta to avoid dt spike on resume
        return;
      }

      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const t  = clock.elapsedTime;

      if (model && !prefersReducedMotion) {
        // ── Idle float ────────────────────────────────────────────────────
        // Two independent sines so it never looks looped
        const floatY    = Math.sin(t * (Math.PI * 2 / 7))   * 0.038;
        const driftRotY = Math.sin(t * (Math.PI * 2 / 11.3)) * 0.022;

        if (!isDragging) {
          if (isSpinning) {
            // Click spin impulse: ease-out cubic over ~1.1s
            spinProgress = Math.min(1, spinProgress + dt / 1.1);
            const eased = 1 - Math.pow(1 - spinProgress, 3);
            rotTarget.y = initialRot.y + eased * Math.PI * 2;
            if (spinProgress >= 1) {
              isSpinning = false;
              spinProgress = 0;
              rotTarget.y = initialRot.y;
            }
          } else {
            // Inertia decay after drag release
            vel.x *= Math.exp(-3 * dt);
            vel.y *= Math.exp(-3 * dt);
            rotTarget.x += vel.x;
            rotTarget.y += vel.y;

            // Spring back toward neutral over ~1.2s when velocity is tiny
            const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
            if (speed < 0.001) {
              rotTarget.x = damp(rotTarget.x, initialRot.x + cursorTarget.x, 2, dt);
              rotTarget.y = damp(rotTarget.y, initialRot.y + cursorTarget.y + driftRotY, 2, dt);
            }
          }
        }

        // Smooth current rotation toward target (speed 5)
        rot.x = damp(rot.x, rotTarget.x, 5, dt);
        rot.y = damp(rot.y, rotTarget.y, 5, dt);

        model.rotation.x = rot.x;
        model.rotation.y = rot.y;
        model.position.y = floatY;

      } else if (model) {
        // reduced motion: hold neutral
        model.rotation.set(initialRot.x, initialRot.y, initialRot.z);
        model.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── 11. Resize observer ───────────────────────────────────────────────────
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nW, height: nH } = entry.contentRect;
        if (nW > 0 && nH > 0) {
          camera.aspect = nW / nH;
          camera.updateProjectionMatrix();
          renderer.setSize(nW, nH);
        }
      }
    });
    ro.observe(canvas);

    // ── 12. Cleanup ───────────────────────────────────────────────────────────
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseleave", onMouseLeave);
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(rafId);
      renderer.dispose();
      pmremGenerator.dispose();
      roomEnv.dispose();
      if (canvas.contains(renderer.domElement)) canvas.removeChild(renderer.domElement);
      scene.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-cursor="drag"
      className="relative w-full select-none"
      style={{
        height: "clamp(280px, 58vh, 620px)",
        overflow: "visible",
      }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 font-mono text-[11px] text-[rgba(222,193,180,0.55)]">
          <div
            className="h-6 w-6 rounded-full border-2 border-[rgba(206,164,145,0.18)] animate-spin"
            style={{ borderTopColor: "#AD6A4C" }}
          />
          <span>Loading…</span>
        </div>
      )}

      {/* Error fallback */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 font-mono text-[11px] text-[#AD6A4C]">
          Unable to display 3D model
        </div>
      )}


      {/* Three.js canvas mount */}
      <div
        ref={canvasRef}
        className="w-full h-full outline-none"
        style={{ overflow: "visible" }}
      />
    </div>
  );
}
