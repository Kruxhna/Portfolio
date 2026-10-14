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

    // Track reduced motion dynamically (both media query and .reduced-motion class from HUD toggle)
    let isReducedMotion = false;
    const checkReducedMotion = () => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      isReducedMotion =
        mq.matches || document.documentElement.classList.contains("reduced-motion");
    };
    checkReducedMotion();

    const motionObserver = new MutationObserver(checkReducedMotion);
    motionObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionMq.addEventListener("change", checkReducedMotion);

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

    // ── 7. Global Pointer Tracking & Smooth Rotation Damping (STEP 4) ────────
    // Current animated rotations
    const rot = { x: initialRot.x, y: initialRot.y };
    // Target rotations derived from global window pointer
    let targetRotX = initialRot.x;
    let targetRotY = initialRot.y;

    const onPointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;

      // Normalized viewport coordinates [-1, 1]
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      // Smooth tilt target: clamped to prevent extreme rotation angles
      targetRotX = THREE.MathUtils.clamp(-ny * 0.22, -0.25, 0.25);
      targetRotY = initialRot.y + THREE.MathUtils.clamp(nx * 0.35, -0.4, 0.4);
    };

    const onPointerLeave = () => {
      // Smoothly return to resting pose without snapping
      targetRotX = initialRot.x;
      targetRotY = initialRot.y;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    // ── 8. IntersectionObserver: pause rendering offscreen ────────────────────
    let isVisible = true;
    const io = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.01 }
    );
    io.observe(wrapper);

    // ── 9. RAF loop ─────────────────────────────────────────────────────────
    let rafId: number;
    let lastTime = performance.now();
    let elapsedTime = 0;

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);

      if (document.hidden || !isVisible) {
        lastTime = now;
        return;
      }

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      elapsedTime += dt;
      const t = elapsedTime;

      if (model && !isReducedMotion) {
        // Idle gentle breathing float & drift
        const floatY    = Math.sin(t * (Math.PI * 2 / 7))   * 0.038;
        const driftRotY = Math.sin(t * (Math.PI * 2 / 11.3)) * 0.022;

        // Smooth exponential damping toward targets (speed 6)
        rot.x = damp(rot.x, targetRotX, 6, dt);
        rot.y = damp(rot.y, targetRotY, 6, dt);

        model.rotation.x = rot.x;
        model.rotation.y = rot.y + driftRotY;
        model.position.y = floatY;
      } else if (model) {
        // Reduced motion: hold neutral resting pose cleanly
        rot.x = initialRot.x;
        rot.y = initialRot.y;
        targetRotX = initialRot.x;
        targetRotY = initialRot.y;
        model.rotation.set(initialRot.x, initialRot.y, initialRot.z);
        model.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate(performance.now());

    // ── 10. Resize observer ───────────────────────────────────────────────────
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

    // ── 11. Cleanup ───────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      motionObserver.disconnect();
      motionMq.removeEventListener("change", checkReducedMotion);
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
      className="relative w-full select-none pointer-events-none"
      style={{
        height: "clamp(280px, 58vh, 620px)",
        overflow: "visible",
      }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 font-mono text-[11px] text-[rgba(222,193,180,0.55)] pointer-events-none">
          <div
            className="h-6 w-6 rounded-full border-2 border-[rgba(206,164,145,0.18)] animate-spin"
            style={{ borderTopColor: "#AD6A4C" }}
          />
          <span>Loading…</span>
        </div>
      )}

      {/* Error fallback */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 font-mono text-[11px] text-[#AD6A4C] pointer-events-none">
          Unable to display 3D model
        </div>
      )}

      {/* Three.js canvas mount */}
      <div
        ref={canvasRef}
        className="w-full h-full outline-none pointer-events-none"
        style={{ overflow: "visible" }}
      />
    </div>
  );
}
