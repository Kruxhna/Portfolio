/**
 * WebGL2 Navier-Stokes 2D Eulerian Fluid Simulation & Image Mask Reveal Engine
 *
 * Precision fixes applied:
 * 1. Global pointer tracking with re-entry protection and MAX_DELTA clamping (no giant wedges/jumps).
 * 2. Clean mask compositing with getCoverUV and tight smoothstep(0.18, 0.35, mask) directly mixing
 *    FRONT.png and BACK.png (no muddy black/grey halo).
 * 3. Frame-rate independent exponential decay + linear floor subtraction (no pooling or stagnant stains).
 * 4. Respects reduced motion toggle.
 */

export interface FluidRevealOptions {
  frontImagePath?: string;
  backImagePath?: string;
  simResolution?: number;       // default: 128 (on short viewport side)
  dyeResolution?: number;       // default: 512 (on short viewport side)
  densityDissipation?: number;  // default: 0.92 (decay base)
  velocityDissipation?: number; // default: 0.3
  pressure?: number;            // default: 0.8
  pressureIterations?: number;  // default: 20
  curl?: number;                // default: 25.0
  splatRadius?: number;         // default: 0.0035
  splatForce?: number;          // default: 4500.0
  onFirstFrameReady?: () => void;
}

export interface FluidRevealController {
  destroy: () => void;
}

export function createFluidReveal(
  canvas: HTMLCanvasElement,
  options: FluidRevealOptions = {}
): FluidRevealController | null {
  const glCtx = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });

  if (!glCtx) {
    console.warn("WebGL2 not supported on this browser.");
    return null;
  }

  const gl: WebGL2RenderingContext = glCtx;

  // Check required extensions
  const extColorBufferFloat = gl.getExtension("EXT_color_buffer_float");
  const extLinear = gl.getExtension("OES_texture_float_linear");

  if (!extColorBufferFloat) {
    console.warn("EXT_color_buffer_float not supported.");
  }

  const hasLinear = !!extLinear;

  const config = {
    frontImagePath: options.frontImagePath || "/Images/FRONT.png",
    backImagePath: options.backImagePath || "/Images/BACK.png",
    simResolution: options.simResolution ?? 128,
    dyeResolution: options.dyeResolution ?? 512,
    densityDissipation: options.densityDissipation ?? 0.92,
    velocityDissipation: options.velocityDissipation ?? 0.3,
    pressure: options.pressure ?? 0.8,
    pressureIterations: options.pressureIterations ?? 20,
    curl: options.curl ?? 25.0,
    splatRadius: options.splatRadius ?? 0.0035,
    splatForce: options.splatForce ?? 4500.0,
    onFirstFrameReady: options.onFirstFrameReady,
  };

  // ─── SHADER SOURCES ────────────────────────────────────────────────────────
  const baseVertexShader = `#version 300 es
    precision highp float;
    in vec2 aPosition;
    out vec2 vUv;
    out vec2 vL;
    out vec2 vR;
    out vec2 vT;
    out vec2 vB;
    uniform vec2 uTexelSize;

    void main() {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(uTexelSize.x, 0.0);
      vR = vUv + vec2(uTexelSize.x, 0.0);
      vT = vUv + vec2(0.0, uTexelSize.y);
      vB = vUv - vec2(0.0, uTexelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const splatFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTarget;
    uniform float uAspectRatio;
    uniform vec2 uPoint;
    uniform vec3 uColor;
    uniform float uRadius;

    void main() {
      vec2 p = vUv - uPoint;
      p.x *= uAspectRatio;
      float distSq = dot(p, p);
      vec3 base = texture(uTarget, vUv).xyz;
      vec3 splat = exp(-distSq / max(uRadius, 0.000001)) * uColor;
      vec3 result = base + splat;
      // Cap density to 1.2 so ink never pools into unbounded dark stains
      if (uColor.y == 0.0 && uColor.z == 0.0) {
        result.x = min(result.x, 1.2);
      }
      fragColor = vec4(result, 1.0);
    }
  `;

  const curlFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;

    void main() {
      float L = texture(uVelocity, vL).y;
      float R = texture(uVelocity, vR).y;
      float T = texture(uVelocity, vT).x;
      float B = texture(uVelocity, vB).x;
      float vorticity = 0.5 * (R - L - (T - B));
      fragColor = vec4(vorticity, 0.0, 0.0, 1.0);
    }
  `;

  const vorticityFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float uCurlStrength;
    uniform float uDt;

    void main() {
      float L = abs(texture(uCurl, vL).x);
      float R = abs(texture(uCurl, vR).x);
      float T = abs(texture(uCurl, vT).x);
      float B = abs(texture(uCurl, vB).x);
      float C = texture(uCurl, vUv).x;

      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force *= vec2(1.0, -1.0);
      float len = length(force);
      if (len > 0.0001) {
        force /= len;
      }
      force *= uCurlStrength * C;

      vec2 vel = texture(uVelocity, vUv).xy;
      fragColor = vec4(vel + force * uDt, 0.0, 1.0);
    }
  `;

  const divergenceFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;

    void main() {
      float L = texture(uVelocity, vL).x;
      float R = texture(uVelocity, vR).x;
      float T = texture(uVelocity, vT).y;
      float B = texture(uVelocity, vB).y;

      vec2 C = texture(uVelocity, vUv).xy;
      if (vL.x < 0.0) L = -C.x;
      if (vR.x > 1.0) R = -C.x;
      if (vB.y < 0.0) B = -C.y;
      if (vT.y > 1.0) T = -C.y;

      float div = 0.5 * (R - L + T - B);
      fragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const pressureScaleFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform float uScale;

    void main() {
      fragColor = vec4(texture(uPressure, vUv).x * uScale, 0.0, 0.0, 1.0);
    }
  `;

  const jacobiFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main() {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      float div = texture(uDivergence, vUv).x;

      float p = (L + R + T + B - div) * 0.25;
      fragColor = vec4(p, 0.0, 0.0, 1.0);
    }
  `;

  const gradientSubtractFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uPressure;

    void main() {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;

      vec2 vel = texture(uVelocity, vUv).xy;
      vel -= 0.5 * vec2(R - L, T - B);
      fragColor = vec4(vel, 0.0, 1.0);
    }
  `;

  const advectionFragmentShader = `#version 300 es
    ${hasLinear ? "#define HAS_LINEAR_FILTERING 1" : ""}
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;
    uniform float uDecayBase;
    uniform float uLinearSub;
    uniform int uIsDensity;

    #ifndef HAS_LINEAR_FILTERING
    vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
      vec2 st = uv / tsize - 0.5;
      vec2 iuv = floor(st);
      vec2 f = fract(st);
      vec4 a = texture(sam, (iuv + vec2(0.5, 0.5)) * tsize);
      vec4 b = texture(sam, (iuv + vec2(1.5, 0.5)) * tsize);
      vec4 c = texture(sam, (iuv + vec2(0.5, 1.5)) * tsize);
      vec4 d = texture(sam, (iuv + vec2(1.5, 1.5)) * tsize);
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    #endif

    void main() {
      vec2 vel = texture(uVelocity, vUv).xy;
      vec2 coord = vUv - uDt * vel * uTexelSize;
      #ifdef HAS_LINEAR_FILTERING
      vec4 result = texture(uSource, coord);
      #else
      vec4 result = bilerp(uSource, coord, uTexelSize);
      #endif

      if (uIsDensity == 1) {
        // Frame-rate independent exponential decay + linear floor subtraction
        // Prevents stagnant blobs and guarantees full clearance to zero
        float decay = pow(uDecayBase, uDt * 60.0);
        result.r = max(0.0, result.r * decay - uLinearSub * (uDt * 60.0));
        if (result.r < 0.002) {
          result.r = 0.0;
        }
      } else {
        float decay = 1.0 / (1.0 + uDissipation * uDt);
        result.xy *= decay;
      }

      fragColor = result;
    }
  `;

  const compositeFragmentShader = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;

    uniform sampler2D uFrontTex;
    uniform sampler2D uBackTex;
    uniform sampler2D uDensity;

    uniform vec2 uViewport;
    uniform vec2 uImageResolution;

    vec2 getCoverUV(vec2 uv, vec2 planeRes, vec2 texRes) {
      float planeAspect = planeRes.x / planeRes.y;
      float texAspect = texRes.x / texRes.y;
      vec2 scale = vec2(1.0);
      if (planeAspect > texAspect) {
        scale.y = texAspect / planeAspect;
      } else {
        scale.x = planeAspect / texAspect;
      }
      return (uv - 0.5) * scale + 0.5;
    }

    void main() {
      vec2 coverUv = getCoverUV(vUv, uViewport, uImageResolution);

      float rawMask = texture(uDensity, vUv).r;
      // Tight organic edge with no muddy wide grey ramp, no black halo
      float reveal = smoothstep(0.18, 0.35, rawMask);

      vec4 frontCol = texture(uFrontTex, coverUv);
      vec4 backCol  = texture(uBackTex, coverUv);

      // Directly mix the two textures at full opacity (no dirty alpha / black border bleed)
      fragColor = vec4(mix(frontCol.rgb, backCol.rgb, reveal), 1.0);
    }
  `;

  // ─── SHADER COMPILATION UTILS ──────────────────────────────────────────────
  function compileShader(type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source.trim());
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const err = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${err}`);
    }
    return shader;
  }

  function createProgram(vsSource: string, fsSource: string): WebGLProgram {
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const err = gl.getProgramInfoLog(prog);
      gl.deleteProgram(prog);
      throw new Error(`Program link error: ${err}`);
    }
    return prog;
  }

  // Compile programs
  const splatProgram = createProgram(baseVertexShader, splatFragmentShader);
  const curlProgram = createProgram(baseVertexShader, curlFragmentShader);
  const vorticityProgram = createProgram(baseVertexShader, vorticityFragmentShader);
  const divergenceProgram = createProgram(baseVertexShader, divergenceFragmentShader);
  const pressureScaleProgram = createProgram(baseVertexShader, pressureScaleFragmentShader);
  const jacobiProgram = createProgram(baseVertexShader, jacobiFragmentShader);
  const gradientSubtractProgram = createProgram(baseVertexShader, gradientSubtractFragmentShader);
  const advectionProgram = createProgram(baseVertexShader, advectionFragmentShader);
  const compositeProgram = createProgram(baseVertexShader, compositeFragmentShader);

  // Full-screen quad geometry
  const quadVAO = gl.createVertexArray()!;
  gl.bindVertexArray(quadVAO);
  const quadVBO = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  // ─── FRAMEBUFFER & TEXTURE CREATION ────────────────────────────────────────
  interface FBO {
    fbo: WebGLFramebuffer;
    texture: WebGLTexture;
    width: number;
    height: number;
    texelSize: [number, number];
  }

  interface DoubleFBO {
    read: FBO;
    write: FBO;
    swap: () => void;
  }

  function createFBO(
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    type: number,
    filter: number
  ): FBO {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      width,
      height,
      0,
      format,
      type,
      null
    );

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
      fbo,
      texture,
      width,
      height,
      texelSize: [1.0 / width, 1.0 / height],
    };
  }

  function createDoubleFBO(
    width: number,
    height: number,
    internalFormat: number,
    format: number,
    type: number,
    filter: number
  ): DoubleFBO {
    let fbo1 = createFBO(width, height, internalFormat, format, type, filter);
    let fbo2 = createFBO(width, height, internalFormat, format, type, filter);

    return {
      get read() {
        return fbo1;
      },
      get write() {
        return fbo2;
      },
      swap() {
        const tmp = fbo1;
        fbo1 = fbo2;
        fbo2 = tmp;
      },
    };
  }

  let simW = 128;
  let simH = 128;
  let dyeW = 512;
  let dyeH = 512;

  function computeResolutions(w: number, h: number) {
    const aspect = w / h;
    if (aspect >= 1.0) {
      simH = config.simResolution;
      simW = Math.max(1, Math.round(config.simResolution * aspect));
      dyeH = config.dyeResolution;
      dyeW = Math.max(1, Math.round(config.dyeResolution * aspect));
    } else {
      simW = config.simResolution;
      simH = Math.max(1, Math.round(config.simResolution / aspect));
      dyeW = config.dyeResolution;
      dyeH = Math.max(1, Math.round(config.dyeResolution / aspect));
    }
  }

  computeResolutions(window.innerWidth, window.innerHeight);

  const filtering = hasLinear ? gl.LINEAR : gl.NEAREST;

  let velocity = createDoubleFBO(simW, simH, gl.RG16F, gl.RG, gl.HALF_FLOAT, filtering);
  let density = createDoubleFBO(dyeW, dyeH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
  let pressure = createDoubleFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
  let divergence = createFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
  let curl = createFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);

  function destroyFBO(fbo: FBO) {
    gl.deleteFramebuffer(fbo.fbo);
    gl.deleteTexture(fbo.texture);
  }

  function destroyDoubleFBO(dfbo: DoubleFBO) {
    destroyFBO(dfbo.read);
    destroyFBO(dfbo.write);
  }

  function resizeFBOs() {
    computeResolutions(canvas.width, canvas.height);

    destroyDoubleFBO(velocity);
    destroyDoubleFBO(density);
    destroyDoubleFBO(pressure);
    destroyFBO(divergence);
    destroyFBO(curl);

    velocity = createDoubleFBO(simW, simH, gl.RG16F, gl.RG, gl.HALF_FLOAT, filtering);
    density = createDoubleFBO(dyeW, dyeH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
    pressure = createDoubleFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
    divergence = createFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
    curl = createFBO(simW, simH, gl.R16F, gl.RED, gl.HALF_FLOAT, filtering);
  }

  // ─── IMAGE TEXTURES ────────────────────────────────────────────────────────
  let frontTexture: WebGLTexture | null = null;
  let backTexture: WebGLTexture | null = null;
  let imageResolution = [1672, 941];
  let frontLoaded = false;
  let backLoaded = false;
  let firstFrameRendered = false;

  function loadTexture(url: string, onLoad: (tex: WebGLTexture, img: HTMLImageElement) => void) {
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([10, 8, 7, 255])
    );

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      onLoad(tex, img);
    };
    return tex;
  }

  frontTexture = loadTexture(config.frontImagePath, (tex, img) => {
    frontLoaded = true;
    imageResolution = [img.naturalWidth || 1672, img.naturalHeight || 941];
  });

  backTexture = loadTexture(config.backImagePath, () => {
    backLoaded = true;
  });

  // ─── CLAMPED POINTER TRACKING (STEP 1) ─────────────────────────────────────
  const lastMouse = { x: -1, y: -1 };
  const currentMouse = { x: -1, y: -1 };
  let hasFirstMove = false;
  let isPointerInside = false;
  let reentered = false;

  // Track prefers-reduced-motion / .reduced-motion
  let isReducedMotion = false;
  function checkReducedMotion() {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion =
      mq.matches || document.documentElement.classList.contains("reduced-motion");
  }
  checkReducedMotion();
  const motionObserver = new MutationObserver(checkReducedMotion);
  motionObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  function updatePointer(clientX: number, clientY: number) {
    if (isReducedMotion) return;

    // Viewport-normalized coordinates [0, 1] (WebGL UV space)
    const x = clientX / window.innerWidth;
    const y = 1.0 - clientY / window.innerHeight;

    if (!hasFirstMove || !isPointerInside || reentered) {
      lastMouse.x = x;
      lastMouse.y = y;
      currentMouse.x = x;
      currentMouse.y = y;
      hasFirstMove = true;
      isPointerInside = true;
      reentered = false;
      return;
    }

    currentMouse.x = x;
    currentMouse.y = y;
    isPointerInside = true;
  }

  const onPointerMove = (e: PointerEvent) => {
    updatePointer(e.clientX, e.clientY);
  };

  const onPointerDown = (e: PointerEvent) => {
    updatePointer(e.clientX, e.clientY);
  };

  const onPointerLeave = () => {
    isPointerInside = false;
    reentered = true;
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      isPointerInside = false;
      reentered = true;
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave, { passive: true });
  document.documentElement.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget) onPointerLeave();
  }, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Resize handler
  let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
  const onResize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.floor(window.innerWidth * dpr);
    const displayHeight = Math.floor(window.innerHeight * dpr);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeFBOs();
    }, 120);
  };

  onResize();
  window.addEventListener("resize", onResize, { passive: true });

  // ─── SIMULATION PIPELINE EXECUTION ─────────────────────────────────────────
  function blit(fbo: FBO | null) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo ? fbo.fbo : null);
    gl.viewport(0, 0, fbo ? fbo.width : canvas.width, fbo ? fbo.height : canvas.height);
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function splat(
    target: DoubleFBO,
    pointX: number,
    pointY: number,
    dx: number,
    dy: number,
    dz: number,
    radius: number
  ) {
    gl.useProgram(splatProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, target.read.texture);
    gl.uniform1i(gl.getUniformLocation(splatProgram, "uTarget"), 0);
    gl.uniform1f(
      gl.getUniformLocation(splatProgram, "uAspectRatio"),
      canvas.width / canvas.height
    );
    gl.uniform2f(gl.getUniformLocation(splatProgram, "uPoint"), pointX, pointY);
    gl.uniform3f(gl.getUniformLocation(splatProgram, "uColor"), dx, dy, dz);
    gl.uniform1f(gl.getUniformLocation(splatProgram, "uRadius"), radius);

    blit(target.write);
    target.swap();
  }

  let animationFrameId: number;
  let lastTime = performance.now();

  function step(now: number) {
    animationFrameId = requestAnimationFrame(step);

    let dt = (now - lastTime) / 1000;
    lastTime = now;
    dt = Math.min(dt, 0.033);

    // If reduced motion is active, clear and skip fluid advection
    if (isReducedMotion) {
      if (frontTexture && backTexture) {
        gl.useProgram(compositeProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, frontTexture);
        gl.uniform1i(gl.getUniformLocation(compositeProgram, "uFrontTex"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, backTexture);
        gl.uniform1i(gl.getUniformLocation(compositeProgram, "uBackTex"), 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
        gl.uniform1i(gl.getUniformLocation(compositeProgram, "uDensity"), 2);

        gl.uniform2f(gl.getUniformLocation(compositeProgram, "uViewport"), canvas.width, canvas.height);
        gl.uniform2f(gl.getUniformLocation(compositeProgram, "uImageResolution"), imageResolution[0], imageResolution[1]);

        blit(null);
      }
      return;
    }

    // ── 1. CLAMPED SPLAT INJECTION (STEP 1) ───────────────────────────────────
    if (hasFirstMove && isPointerInside) {
      const rawDx = currentMouse.x - lastMouse.x;
      const rawDy = currentMouse.y - lastMouse.y;
      const dist = Math.hypot(rawDx, rawDy);

      // Threshold to ignore sub-pixel jitter
      if (dist > 0.0004) {
        // Clamp maximum delta per frame to 0.08 in UV space to eliminate giant wedges
        const MAX_DELTA = 0.08;
        const clampedDist = Math.min(dist, MAX_DELTA);
        const scale = clampedDist / dist;
        const dx = rawDx * scale;
        const dy = rawDy * scale;

        // Sub-step stroke interpolation: deposit splats evenly along segment
        const stepSize = 0.008;
        const steps = Math.min(16, Math.max(1, Math.ceil(clampedDist / stepSize)));
        const radius = config.splatRadius;

        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const px = lastMouse.x + dx * t;
          const py = lastMouse.y + dy * t;

          const forceX = (dx / steps) * config.splatForce;
          const forceY = (dy / steps) * config.splatForce;

          splat(velocity, px, py, forceX, forceY, 0.0, radius);
          splat(density, px, py, 1.0, 0.0, 0.0, radius);
        }

        lastMouse.x = currentMouse.x;
        lastMouse.y = currentMouse.y;
      }
    }

    // ── 2. Curl & Vorticity Confinement ──────────────────────────────────────
    gl.useProgram(curlProgram);
    gl.uniform2f(
      gl.getUniformLocation(curlProgram, "uTexelSize"),
      velocity.read.texelSize[0],
      velocity.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(curlProgram, "uVelocity"), 0);
    blit(curl);

    gl.useProgram(vorticityProgram);
    gl.uniform2f(
      gl.getUniformLocation(vorticityProgram, "uTexelSize"),
      velocity.read.texelSize[0],
      velocity.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(vorticityProgram, "uVelocity"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, curl.texture);
    gl.uniform1i(gl.getUniformLocation(vorticityProgram, "uCurl"), 1);
    gl.uniform1f(gl.getUniformLocation(vorticityProgram, "uCurlStrength"), config.curl);
    gl.uniform1f(gl.getUniformLocation(vorticityProgram, "uDt"), dt);
    blit(velocity.write);
    velocity.swap();

    // ── 3. Divergence & Pressure Projection (Jacobi) ─────────────────────────
    gl.useProgram(divergenceProgram);
    gl.uniform2f(
      gl.getUniformLocation(divergenceProgram, "uTexelSize"),
      velocity.read.texelSize[0],
      velocity.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(divergenceProgram, "uVelocity"), 0);
    blit(divergence);

    // Scale pressure by 0.8
    gl.useProgram(pressureScaleProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
    gl.uniform1i(gl.getUniformLocation(pressureScaleProgram, "uPressure"), 0);
    gl.uniform1f(gl.getUniformLocation(pressureScaleProgram, "uScale"), config.pressure);
    blit(pressure.write);
    pressure.swap();

    // 20 Jacobi Iterations
    gl.useProgram(jacobiProgram);
    gl.uniform2f(
      gl.getUniformLocation(jacobiProgram, "uTexelSize"),
      velocity.read.texelSize[0],
      velocity.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, divergence.texture);
    gl.uniform1i(gl.getUniformLocation(jacobiProgram, "uDivergence"), 1);

    for (let i = 0; i < config.pressureIterations; i++) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
      gl.uniform1i(gl.getUniformLocation(jacobiProgram, "uPressure"), 0);
      blit(pressure.write);
      pressure.swap();
    }

    // Subtract pressure gradient
    gl.useProgram(gradientSubtractProgram);
    gl.uniform2f(
      gl.getUniformLocation(gradientSubtractProgram, "uTexelSize"),
      velocity.read.texelSize[0],
      velocity.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(gradientSubtractProgram, "uVelocity"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
    gl.uniform1i(gl.getUniformLocation(gradientSubtractProgram, "uPressure"), 1);
    blit(velocity.write);
    velocity.swap();

    // ── 4. Velocity Advection ────────────────────────────────────────────────
    gl.useProgram(advectionProgram);
    gl.uniform2f(
      gl.getUniformLocation(advectionProgram, "uTexelSize"),
      velocity.read.texelSize[0],
      velocity.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, "uVelocity"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, "uSource"), 1);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uDt"), dt);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uDissipation"), config.velocityDissipation);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uDecayBase"), 0.92);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uLinearSub"), 0.0);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, "uIsDensity"), 0);
    blit(velocity.write);
    velocity.swap();

    // ── 5. Density Advection with Frame-Rate Independent Decay (STEP 3) ─────
    const decayBase = isPointerInside ? 0.92 : 0.82;
    const linearSub = isPointerInside ? 0.004 : 0.008;

    gl.useProgram(advectionProgram);
    gl.uniform2f(
      gl.getUniformLocation(advectionProgram, "uTexelSize"),
      density.read.texelSize[0],
      density.read.texelSize[1]
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, "uVelocity"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, "uSource"), 1);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uDt"), dt);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uDissipation"), 0.0);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uDecayBase"), decayBase);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, "uLinearSub"), linearSub);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, "uIsDensity"), 1);
    blit(density.write);
    density.swap();

    // ── 6. Composite Shader Pass (STEP 2) ────────────────────────────────────
    if (frontTexture && backTexture) {
      gl.useProgram(compositeProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, frontTexture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, "uFrontTex"), 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, backTexture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, "uBackTex"), 1);

      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
      gl.uniform1i(gl.getUniformLocation(compositeProgram, "uDensity"), 2);

      gl.uniform2f(gl.getUniformLocation(compositeProgram, "uViewport"), canvas.width, canvas.height);
      gl.uniform2f(gl.getUniformLocation(compositeProgram, "uImageResolution"), imageResolution[0], imageResolution[1]);

      blit(null); // Render to canvas screen

      if (!firstFrameRendered && frontLoaded && backLoaded) {
        firstFrameRendered = true;
        config.onFirstFrameReady?.();
      }
    }
  }

  animationFrameId = requestAnimationFrame(step);

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      motionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("resize", onResize);

      if (resizeTimeout) clearTimeout(resizeTimeout);

      destroyDoubleFBO(velocity);
      destroyDoubleFBO(density);
      destroyDoubleFBO(pressure);
      destroyFBO(divergence);
      destroyFBO(curl);

      if (frontTexture) gl.deleteTexture(frontTexture);
      if (backTexture) gl.deleteTexture(backTexture);

      gl.deleteBuffer(quadVBO);
      gl.deleteVertexArray(quadVAO);

      gl.deleteProgram(splatProgram);
      gl.deleteProgram(curlProgram);
      gl.deleteProgram(vorticityProgram);
      gl.deleteProgram(divergenceProgram);
      gl.deleteProgram(pressureScaleProgram);
      gl.deleteProgram(jacobiProgram);
      gl.deleteProgram(gradientSubtractProgram);
      gl.deleteProgram(advectionProgram);
      gl.deleteProgram(compositeProgram);
    },
  };
}
