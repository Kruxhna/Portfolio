"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface Letter3DViewerProps {
  accentColor?: string;
}

export function Letter3DViewer({ accentColor = "#3ecf8e" }: Letter3DViewerProps) {
  // The outer wrapper div — used for pill position tracking & layout
  const wrapperRef = useRef<HTMLDivElement>(null);
  // The canvas mount target
  const canvasRef = useRef<HTMLDivElement>(null);
  // Badge element
  const pillRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const modelRef = useRef<THREE.Group | null>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const pillPosRef = useRef({ x: 0.5, y: 0.5 }); // normalised 0-1 within wrapper
  const pillTargetRef = useRef({ x: 0.5, y: 0.5 });
  const initialRotation = useRef({ x: 0, y: 0.28, z: 0 });
  const isInteractingRef = useRef(false);

  // Update material color when prop changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(accentColor);
      materialRef.current.needsUpdate = true;
    }
  }, [accentColor]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── 1. Scene ────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    let W = canvas.clientWidth || 480;
    let H = canvas.clientHeight || 560;

    // ── 2. Camera — wide-ish FOV so K fills the frame with ~8% padding ─────
    //    FOV 42° + camera at Z=2.8 gives the right framing for a unit-sized model
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 2.8);

    // ── 3. Renderer ─────────────────────────────────────────────────────────
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

    // ── 4. Lighting & Environment ────────────────────────────────────────────
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // Soft key light from top-left (main highlight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(-3, 4, 3);
    scene.add(keyLight);

    // Soft fill from bottom-right
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(3, -1, 2);
    scene.add(fillLight);

    // ── 5. OrbitControls ─────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.minPolarAngle = Math.PI / 3;
    controlsRef.current = controls;
    controls.addEventListener("start", () => { isInteractingRef.current = true; });
    controls.addEventListener("end", () => { isInteractingRef.current = false; });

    // ── 6. Material: matte-satin, no clearcoat, no noisy normals ─────────────
    const matteKMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentColor),
      roughness: 0.38,
      metalness: 0,
      transmission: 0,
      transparent: false,
      opacity: 1.0,
      clearcoat: 0,
    });
    materialRef.current = matteKMaterial;

    // ── 7. Load Model ────────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      "/k.glb",
      (gltf) => {
        const root = gltf.scene;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.geometry) {
              // Smooth normals
              mesh.geometry.deleteAttribute("normal");
              mesh.geometry.computeVertexNormals();
            }
            mesh.material = matteKMaterial;
          }
        });

        // Center & scale to fill 84% of the frustum at camera Z
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        // Compute the frustum half-height at z=0 and scale so model = 84% of it
        const halfH = Math.tan(THREE.MathUtils.degToRad(42 / 2)) * 2.8;
        const targetFit = halfH * 2 * 0.84; // 84% → ~8% padding each side
        const scaleFactor = targetFit / (maxDim || 1);

        root.position.sub(center);
        root.scale.setScalar(scaleFactor);
        root.rotation.set(0, 0.28, 0);
        initialRotation.current = { x: 0, y: 0.28, z: 0 };

        scene.add(root);
        modelRef.current = root;
        setIsLoading(false);

        // Initialise pill to wrapper centre
        pillPosRef.current = { x: 0.5, y: 0.5 };
        pillTargetRef.current = { x: 0.5, y: 0.5 };
        applyPillTransform();
      },
      undefined,
      (err) => {
        console.error("Error loading /k.glb:", err);
        setLoadError(true);
        setIsLoading(false);
      }
    );

    // ── 8. Badge helper ───────────────────────────────────────────────────────
    function applyPillTransform() {
      const pill = pillRef.current;
      const w = wrapperRef.current;
      if (!pill || !w) return;
      const wW = w.clientWidth;
      const wH = w.clientHeight;
      const px = pillPosRef.current.x * wW;
      const py = pillPosRef.current.y * wH;
      pill.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
    }

    // ── 9. Pointer tracking ──────────────────────────────────────────────────
    // Badge follows cursor within 80px proximity around the WRAPPER
    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const margin = 80;
      const isClose =
        e.clientX >= rect.left - margin &&
        e.clientX <= rect.right + margin &&
        e.clientY >= rect.top - margin &&
        e.clientY <= rect.bottom + margin;

      if (isClose) {
        // Badge target: cursor position relative to wrapper, normalised
        const localX = (e.clientX - rect.left) / rect.width;
        const localY = (e.clientY - rect.top) / rect.height;
        pillTargetRef.current = {
          x: Math.max(0.05, Math.min(0.95, localX)),
          y: Math.max(0.05, Math.min(0.95, localY + 0.04)),
        };

        // 3D rotation target: normalised [-1,1]
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        mouseRef.current.targetX = Math.max(-0.25, Math.min(0.25, nx * 0.25));
        mouseRef.current.targetY = Math.max(-0.25, Math.min(0.25, ny * 0.25));
      } else {
        // Reset pill to wrapper centre
        pillTargetRef.current = { x: 0.5, y: 0.5 };
        mouseRef.current.targetX = 0;
        mouseRef.current.targetY = 0;
      }
    };

    const handleMouseLeave = () => {
      pillTargetRef.current = { x: 0.5, y: 0.5 };
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // ── 10. Render loop ──────────────────────────────────────────────────────
    let rafId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Lerp mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      // Lerp badge (normalised, lag factor 0.12)
      pillPosRef.current.x += (pillTargetRef.current.x - pillPosRef.current.x) * 0.12;
      pillPosRef.current.y += (pillTargetRef.current.y - pillPosRef.current.y) * 0.12;
      applyPillTransform();

      // Animate model
      if (modelRef.current && !isInteractingRef.current) {
        if (!prefersReducedMotion) {
          const floatY = Math.sin(t * ((Math.PI * 2) / 7)) * 0.038;
          const driftY = Math.sin(t * ((Math.PI * 2) / 8.5)) * 0.022;
          modelRef.current.rotation.y = initialRotation.current.y + mouseRef.current.x + driftY;
          modelRef.current.rotation.x = initialRotation.current.x - mouseRef.current.y;
          modelRef.current.position.y = floatY;
        } else {
          modelRef.current.rotation.set(0, 0.28, 0);
          modelRef.current.position.set(0, 0, 0);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── 11. Resize observer ──────────────────────────────────────────────────
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: nW, height: nH } = entry.contentRect;
        if (nW > 0 && nH > 0) {
          W = nW; H = nH;
          camera.aspect = nW / nH;
          camera.updateProjectionMatrix();
          renderer.setSize(nW, nH);
        }
      }
    });
    ro.observe(canvas);

    // ── 12. Cleanup ──────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      ro.disconnect();
      cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      pmremGenerator.dispose();
      roomEnv.dispose();
      if (canvas.contains(renderer.domElement)) canvas.removeChild(renderer.domElement);
      scene.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    /*
      Outer wrapper: full width of the right zone column, tall enough
      to show the K without clipping. overflow: visible so the model
      can bleed past the canvas edges naturally.
    */
    <div
      ref={wrapperRef}
      className="relative w-full select-none"
      style={{
        height: "clamp(280px, 58vh, 620px)",
        overflow: "visible",
      }}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 font-mono text-[11px] text-[#6b7280]">
          <div
            className="h-6 w-6 rounded-full border-2 border-[#27272a] animate-spin"
            style={{ borderTopColor: accentColor }}
          />
          <span>Loading…</span>
        </div>
      )}

      {/* Error fallback */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 font-mono text-[11px] text-rose-400">
          Unable to display 3D model
        </div>
      )}

      {/* Three.js canvas mount — fills the wrapper */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        style={{ overflow: "visible" }}
      />

      {/*
        Pill badge — sits at absolute top:0 left:0, then translated by
        the JS lerp to follow the cursor.  -translate-x/y-1/2 centres it
        on the hot-point via CSS transform (applied in applyPillTransform).
      */}
      <div
        ref={pillRef}
        className="absolute top-0 left-0 pointer-events-none z-20 select-none will-change-transform"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: "opacity 0.3s",
          // Initial centred placement until JS takes over
          transform: "translate3d(50%, 50%, 0) translate(-50%, -50%)",
        }}
      >
        <div
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-mono font-semibold text-[#0f1115] shadow-lg"
          style={{ backgroundColor: accentColor }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0f1115]" />
          <span>drag · click</span>
        </div>
      </div>
    </div>
  );
}
