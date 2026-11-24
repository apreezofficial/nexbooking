"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type EffectName = "dither" | "halftone" | "stipple" | "ascii";

const EFFECT_INDEX: Record<EffectName, number> = {
  dither: 0,
  halftone: 1,
  stipple: 2,
  ascii: 3,
};

const EFFECT_NAMES = Object.keys(EFFECT_INDEX) as EffectName[];
const ASCII_RAMP = " .:-=+*#%@";
const INK_HEX = "#3c3c3a";
const PAPER_HEX = "#fcfcf9";
const EYE_IMAGE_SRC = "/assets/404-spiral-eye.jpg";

interface RegionShard {
  id?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  effect?: EffectName;
  until?: number;
  retireAt?: number | null;
  appearAt?: number | null;
}

interface HalftoneParams {
  stepSize: number;
  angle: number;
  minSize: number;
  maxSize: number;
  cornerRadius: number;
  noise: number;
  threshold: number;
  gamma: number;
  blackPoint: number;
  whitePoint: number;
  grain: number;
  blur: number;
  benday: boolean;
}

const DEFAULT_HALFTONE_PARAMS: HalftoneParams = {
  stepSize: 6,
  angle: 0,
  minSize: 0,
  maxSize: 1.1,
  cornerRadius: 1,
  noise: 0,
  threshold: 1,
  gamma: 1,
  blackPoint: 0.02,
  whitePoint: 0.95,
  grain: 0,
  blur: 1,
  benday: false,
};

const DRIFT_SPECS = [
  { dx: 7, dy: -11, dur: 11 },
  { dx: -9, dy: 8, dur: 14 },
  { dx: 6, dy: 10, dur: 9 },
] as const;

function hexToRgbVec(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function createAutoLevels(w = 32, h = 24) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let black = 0.02;
  let white = 0.95;

  return {
    get black() {
      return black;
    },
    get white() {
      return white;
    },
    measure(source: CanvasImageSource) {
      if (!ctx) return;
      ctx.drawImage(source, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      let minL = 1;
      let maxL = 0;
      for (let i = 0; i < data.length; i += 4) {
        const l = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        if (l < minL) minL = l;
        if (l > maxL) maxL = l;
      }
      if (maxL - minL < 0.15) {
        const mid = (minL + maxL) / 2;
        minL = mid - 0.075;
        maxL = mid + 0.075;
      }
      black += (minL - black) * 0.15;
      white += (maxL - white) * 0.15;
    },
  };
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }
  gl.deleteShader(shader);
  return null;
}

const VERTEX_SHADER = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID & 1) * 4 - 1), float((gl_VertexID >> 1) * 4 - 1));
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const HALFTONE_FRAG_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uTexSize;
uniform float uCell;
uniform float uAngle;
uniform float uMinSize;
uniform float uMaxSize;
uniform float uCorner;
uniform float uNoise;
uniform float uThreshold;
uniform float uGamma;
uniform float uBlack;
uniform float uWhite;
uniform float uGrain;
uniform float uBlur;
uniform float uBenday;
uniform float uFlipX;
uniform vec3 uInk;
uniform vec3 uPaper;

in vec2 vUv;
out vec4 outColor;

vec2 coverUv(vec2 uv) {
  if (uFlipX > 0.5) uv.x = 1.0 - uv.x;
  float ca = uRes.x / uRes.y;
  float ia = uTexSize.x / uTexSize.y;
  vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float sourceLuma(vec2 uv) {
  vec2 r = uBlur / uTexSize;
  float l = luma(texture(uTex, uv).rgb) * 0.44;
  l += luma(texture(uTex, uv + vec2(r.x, 0.0)).rgb) * 0.14;
  l += luma(texture(uTex, uv - vec2(r.x, 0.0)).rgb) * 0.14;
  l += luma(texture(uTex, uv + vec2(0.0, r.y)).rgb) * 0.14;
  l += luma(texture(uTex, uv - vec2(0.0, r.y)).rgb) * 0.14;
  return l;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float sdRoundBox(vec2 p, float b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float a = radians(uAngle);
  mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
  mat2 inv = mat2(cos(a), sin(a), -sin(a), cos(a));

  vec2 centred = vUv * uRes - uRes * 0.5;
  vec2 cell = (rot * centred) / uCell;

  float shift = uBenday > 0.5 ? mod(floor(cell.y), 2.0) * 0.5 : 0.0;
  cell.x += shift;

  vec2 idx = floor(cell);
  vec2 f = fract(cell) - 0.5;

  vec2 centreRot = (idx + 0.5 - vec2(shift, 0.0)) * uCell;
  vec2 src = coverUv((inv * centreRot + uRes * 0.5) / uRes);

  float l = sourceLuma(clamp(src, 0.0, 1.0));
  l = clamp((l - uBlack) / max(uWhite - uBlack, 1e-4), 0.0, 1.0);
  l = pow(l, max(uGamma, 1e-4));
  l += (hash(idx) - 0.5) * uGrain;

  float k = clamp(1.0 - l / max(uThreshold, 1e-4), 0.0, 1.0);
  float halfSize = mix(uMinSize, uMaxSize, k) * 0.5;

  vec2 jitter = uNoise * vec2(hash(idx + 3.7) - 0.5, hash(idx + 8.1) - 0.5);
  float sd = sdRoundBox(f - jitter, halfSize, uCorner * halfSize);

  float aa = 0.7071 / uCell;
  float ink = clamp(0.5 - sd / (2.0 * aa), 0.0, 1.0);
  ink *= smoothstep(0.0, aa, halfSize);

  outColor = vec4(mix(uPaper, uInk, ink), 1.0);
}`;

const HALFTONE_UNIFORMS = [
  "uTex",
  "uRes",
  "uTexSize",
  "uCell",
  "uAngle",
  "uMinSize",
  "uMaxSize",
  "uCorner",
  "uNoise",
  "uThreshold",
  "uGamma",
  "uBlack",
  "uWhite",
  "uGrain",
  "uBlur",
  "uBenday",
  "uFlipX",
  "uInk",
  "uPaper",
] as const;

const GLITCH_FRAG_SHADER = `#version 300 es
precision highp float;

uniform sampler2D uTex;
uniform sampler2D uAtlas;
uniform vec2 uRes;
uniform vec2 uTexSize;
uniform float uDpr;
uniform float uEffect;
uniform float uFlipX;
uniform float uCount;
uniform float uAlpha;
uniform float uGlyphAspect;
uniform float uBlack;
uniform float uWhite;
uniform vec4 uPitch;
uniform vec3 uInk;
uniform vec3 uPaper;

in vec2 vUv;
out vec4 outColor;

const float BAYER4[16] = float[16](
  0.0, 8.0, 2.0, 10.0,
  12.0, 4.0, 14.0, 6.0,
  3.0, 11.0, 1.0, 9.0,
  15.0, 7.0, 13.0, 5.0
);

vec2 coverUv(vec2 uv) {
  if (uFlipX > 0.5) uv.x = 1.0 - uv.x;
  float ca = uRes.x / uRes.y;
  float ia = uTexSize.x / uTexSize.y;
  vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float levels(float x) {
  return clamp((x - uBlack) / max(uWhite - uBlack, 1e-3), 0.0, 1.0);
}

vec3 levels3(vec3 c) {
  return clamp((c - uBlack) / max(uWhite - uBlack, 1e-3), 0.0, 1.0);
}

vec3 source(vec2 uv) {
  vec2 r = 1.2 / uTexSize;
  vec3 c = texture(uTex, uv).rgb * 0.44;
  c += texture(uTex, uv + vec2(r.x, 0.0)).rgb * 0.14;
  c += texture(uTex, uv - vec2(r.x, 0.0)).rgb * 0.14;
  c += texture(uTex, uv + vec2(0.0, r.y)).rgb * 0.14;
  c += texture(uTex, uv - vec2(0.0, r.y)).rgb * 0.14;
  return c;
}

float sdRoundBox(vec2 p, float b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  if (uEffect < 0.5) {
    float cell = uPitch.x * uDpr;
    vec2 block = floor(vUv * uRes / cell);
    vec3 c = levels3(source(clamp(coverUv((block + 0.5) * cell / uRes), 0.0, 1.0)));
    int idx = int(mod(block.y, 4.0)) * 4 + int(mod(block.x, 4.0));
    float t = (BAYER4[idx] + 0.5) / 16.0;
    outColor = vec4(step(vec3(t), c), uAlpha);
    return;
  }

  if (uEffect < 1.5) {
    float cellPx = uPitch.y * uDpr;
    float a = radians(45.0);
    mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
    mat2 inv = mat2(cos(a), sin(a), -sin(a), cos(a));

    vec2 centred = vUv * uRes - uRes * 0.5;
    vec2 cell = (rot * centred) / cellPx;
    vec2 idx = floor(cell);
    vec2 f = fract(cell) - 0.5;

    vec2 src = coverUv((inv * ((idx + 0.5) * cellPx) + uRes * 0.5) / uRes);
    float l = levels(luma(source(clamp(src, 0.0, 1.0))));

    float halfSize = mix(0.0, 1.3, 1.0 - l) * 0.5;
    float aa = 0.7071 / cellPx;
    float ink = clamp(0.5 - sdRoundBox(f, halfSize, halfSize) / (2.0 * aa), 0.0, 1.0);
    ink *= smoothstep(0.0, aa, halfSize);
    outColor = vec4(mix(uPaper, uInk, ink), uAlpha);
    return;
  }

  if (uEffect < 2.5) {
    float colPx = uPitch.z * uDpr;
    vec2 cell = vUv * uRes / colPx;
    vec2 idx = floor(cell);
    float f = fract(cell.x) - 0.5;

    vec2 src = coverUv(((idx + 0.5) * colPx) / uRes);
    float l = levels(luma(source(clamp(src, 0.0, 1.0))));

    float w = mix(0.13, 0.95, 1.0 - l);
    float px = max(0.5 / colPx, 1e-6);
    float hw = w * 0.5;
    float ink = clamp((min(f + px, hw) - max(f - px, -hw)) / (2.0 * px), 0.0, 1.0);
    outColor = vec4(mix(uPaper, uInk, ink), uAlpha);
    return;
  }

  float cw = uPitch.w * uDpr;
  vec2 cellSize = vec2(cw, cw / uGlyphAspect);
  vec2 cellPos = vUv * uRes / cellSize;
  vec2 idx = floor(cellPos);
  vec2 f = fract(cellPos);

  vec2 src = coverUv(((idx + 0.5) * cellSize) / uRes);
  float l = levels(luma(source(clamp(src, 0.0, 1.0))));
  float rampIdx = floor(min(1.0 - l, 0.9999) * uCount);

  float glyph = texture(uAtlas, vec2((rampIdx + f.x) / uCount, 1.0 - f.y)).r;
  glyph = smoothstep(0.22, 0.8, glyph);
  outColor = vec4(mix(uPaper, uInk, glyph), uAlpha);
}`;

const GLITCH_UNIFORMS = [
  "uTex",
  "uAtlas",
  "uRes",
  "uTexSize",
  "uDpr",
  "uEffect",
  "uFlipX",
  "uCount",
  "uAlpha",
  "uGlyphAspect",
  "uBlack",
  "uWhite",
  "uPitch",
  "uInk",
  "uPaper",
] as const;

function buildAsciiAtlas(fontFamily: string, fontSizePx: number) {
  const chars = [...ASCII_RAMP];
  const font = `${fontSizePx}px ${fontFamily}`;
  const measureCtx = document.createElement("canvas").getContext("2d");
  let advance = 0.6 * fontSizePx;
  let maxAscent = 0.72 * fontSizePx;
  let maxDescent = 0;
  let maxHalfWidth = advance / 2;

  if (measureCtx) {
    measureCtx.font = font;
    measureCtx.textAlign = "center";
    advance = measureCtx.measureText("M").width || advance;
    maxHalfWidth = advance / 2;
    let found = false;
    for (const ch of chars) {
      const m = measureCtx.measureText(ch);
      const asc = m.actualBoundingBoxAscent ?? 0;
      const desc = m.actualBoundingBoxDescent ?? 0;
      if (asc + desc > 0) {
        maxAscent = found ? Math.max(maxAscent, asc) : asc;
        maxDescent = found ? Math.max(maxDescent, desc) : desc;
        found = true;
        maxHalfWidth = Math.max(
          maxHalfWidth,
          m.actualBoundingBoxLeft ?? 0,
          m.actualBoundingBoxRight ?? 0
        );
      }
    }
  }

  const cellW = Math.max(1, Math.ceil(Math.max(advance, 2 * maxHalfWidth)) + 2);
  const glyphH = Math.max(1, maxAscent + maxDescent);
  const cellH = Math.max(1, Math.ceil(glyphH) + 2);
  const baselineY = 1 + (cellH - 2 - glyphH) / 2 + maxAscent;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, chars.length * cellW);
  canvas.height = cellH;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = font;
    chars.forEach((ch, idx) => {
      ctx.fillText(ch, (idx + 0.5) * cellW, baselineY);
    });
  }

  return {
    canvas,
    aspect: cellW / cellH,
    count: chars.length,
  };
}

function HalftoneCanvas({
  src,
  video,
  maxDpr = 1,
  mirror = false,
  params = DEFAULT_HALFTONE_PARAMS,
  ink = INK_HEX,
  paper = PAPER_HEX,
  onReady,
  onUnavailable,
  className,
  style,
  alt = "",
}: {
  src: string;
  video?: HTMLVideoElement | null;
  maxDpr?: number;
  mirror?: boolean;
  params?: HalftoneParams;
  ink?: string;
  paper?: string;
  onReady?: () => void;
  onUnavailable?: () => void;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  const onUnavailableRef = useRef(onUnavailable);
  const mirrorRef = useRef(mirror);
  const paramsRef = useRef(params);
  const inkRef = useRef(ink);
  const paperRef = useRef(paper);

  useEffect(() => {
    onReadyRef.current = onReady;
    onUnavailableRef.current = onUnavailable;
    mirrorRef.current = mirror;
    paramsRef.current = params;
    inkRef.current = ink;
    paperRef.current = paper;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true });
    if (!gl) {
      onUnavailableRef.current?.();
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, HALFTONE_FRAG_SHADER);
    if (!vs || !fs) {
      onUnavailableRef.current?.();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      onUnavailableRef.current?.();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onUnavailableRef.current?.();
      return;
    }
    gl.useProgram(program);

    const locs = Object.fromEntries(
      HALFTONE_UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])
    ) as Record<(typeof HALFTONE_UNIFORMS)[number], WebGLUniformLocation | null>;

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const autoLevels = video ? createAutoLevels() : null;
    let texW = 1;
    let texH = 1;
    let hasTexture = false;
    let notifiedReady = false;

    const draw = () => {
      if (!hasTexture) return;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);

      const p = paramsRef.current;
      gl.uniform2f(locs.uRes, w, h);
      gl.uniform2f(locs.uTexSize, texW, texH);
      gl.uniform1f(locs.uCell, Math.max(2, p.stepSize) * dpr);
      gl.uniform1f(locs.uAngle, p.angle);
      gl.uniform1f(locs.uMinSize, p.minSize);
      gl.uniform1f(locs.uMaxSize, p.maxSize);
      gl.uniform1f(locs.uCorner, p.cornerRadius);
      gl.uniform1f(locs.uNoise, p.noise);
      gl.uniform1f(locs.uThreshold, p.threshold);
      gl.uniform1f(locs.uGamma, p.gamma);
      gl.uniform1f(locs.uBlack, autoLevels ? autoLevels.black : p.blackPoint);
      gl.uniform1f(locs.uWhite, autoLevels ? autoLevels.white : p.whitePoint);
      gl.uniform1f(locs.uGrain, p.grain);
      gl.uniform1f(locs.uBlur, p.blur);
      gl.uniform1f(locs.uBenday, p.benday ? 1 : 0);
      gl.uniform1f(locs.uFlipX, mirrorRef.current ? 1 : 0);
      gl.uniform3fv(locs.uInk, hexToRgbVec(inkRef.current));
      gl.uniform3fv(locs.uPaper, hexToRgbVec(paperRef.current));
      gl.uniform1i(locs.uTex, 0);

      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!notifiedReady) {
        notifiedReady = true;
        requestAnimationFrame(() => onReadyRef.current?.());
      }
    };

    const uploadTexture = (source: TexImageSource, w: number, h: number) => {
      texW = w;
      texH = h;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      hasTexture = true;
    };

    let rafId = 0;
    if (video) {
      const frameInterval = 1000 / 30;
      let lastTime = 0;
      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        if (now - lastTime < frameInterval) return;
        if (video.readyState >= 2 && video.videoWidth > 0) {
          lastTime = now;
          autoLevels?.measure(video);
          uploadTexture(video, video.videoWidth, video.videoHeight);
          draw();
        }
      };
      rafId = requestAnimationFrame(tick);
    } else {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        uploadTexture(img, img.naturalWidth, img.naturalHeight);
        draw();
      };
      img.src = src;
    }

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      gl.deleteTexture(tex);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src, video, maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={!alt || undefined}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}

function GlitchOverlayCanvas({
  src,
  video,
  regions,
  maxDpr = 1,
  mirror = false,
  ink = INK_HEX,
  paper = PAPER_HEX,
  onUnavailable,
}: {
  src: string;
  video?: HTMLVideoElement | null;
  regions: RegionShard[];
  maxDpr?: number;
  mirror?: boolean;
  ink?: string;
  paper?: string;
  onUnavailable?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const regionsRef = useRef(regions);
  const mirrorRef = useRef(mirror);
  const inkRef = useRef(ink);
  const paperRef = useRef(paper);
  const onUnavailableRef = useRef(onUnavailable);
  const drawRef = useRef<(() => void) | null>(null);
  const kickAnimRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    regionsRef.current = regions;
    mirrorRef.current = mirror;
    inkRef.current = ink;
    paperRef.current = paper;
    onUnavailableRef.current = onUnavailable;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true });
    if (!gl) {
      onUnavailableRef.current?.();
      return;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, GLITCH_FRAG_SHADER);
    if (!vs || !fs) {
      onUnavailableRef.current?.();
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      onUnavailableRef.current?.();
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      onUnavailableRef.current?.();
      return;
    }
    gl.useProgram(program);

    const locs = Object.fromEntries(
      GLITCH_UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])
    ) as Record<(typeof GLITCH_UNIFORMS)[number], WebGLUniformLocation | null>;

    const createUnitTex = (unit: number) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return t;
    };

    const sourceTex = createUnitTex(0);
    const atlasTex = createUnitTex(1);
    const autoLevels = createAutoLevels();

    let texW = 1;
    let texH = 1;
    let glyphAspect = 0.6;
    let glyphCount = ASCII_RAMP.length;
    let hasTexture = false;

    const rebuildAtlas = () => {
      const fontFamily = getComputedStyle(canvas).fontFamily || "monospace";
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const atlas = buildAsciiAtlas(fontFamily, Math.max(8, Math.round(9 * dpr * 3)));
      glyphAspect = atlas.aspect;
      glyphCount = atlas.count;
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    };

    rebuildAtlas();
    document.fonts?.ready.then(() => {
      rebuildAtlas();
      drawRef.current?.();
    });

    const draw = () => {
      if (!hasTexture) return;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const ch = canvas.clientHeight;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(ch * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const list = regionsRef.current;
      if (!list.length) return;

      gl.uniform2f(locs.uRes, w, h);
      gl.uniform2f(locs.uTexSize, texW, texH);
      gl.uniform1f(locs.uDpr, dpr);
      gl.uniform1f(locs.uFlipX, mirrorRef.current ? 1 : 0);
      gl.uniform1f(locs.uCount, glyphCount);
      gl.uniform1f(locs.uGlyphAspect, glyphAspect);
      gl.uniform1f(locs.uBlack, autoLevels.black);
      gl.uniform1f(locs.uWhite, autoLevels.white);
      gl.uniform4f(locs.uPitch, 2, 6.5, 5, 9);
      gl.uniform3fv(locs.uInk, hexToRgbVec(inkRef.current));
      gl.uniform3fv(locs.uPaper, hexToRgbVec(paperRef.current));
      gl.uniform1i(locs.uTex, 0);
      gl.uniform1i(locs.uAtlas, 1);

      const now = performance.now();
      gl.enable(gl.SCISSOR_TEST);
      for (const item of list) {
        const retireProgress = item.retireAt ? Math.min(1, (now - item.retireAt) / 340) : 0;
        if (retireProgress >= 1) continue;
        let scale = 1 - (1 - 0.7) * retireProgress;
        if (item.appearAt != null) {
          const t = Math.min(1, (now - item.appearAt) / 220);
          scale *= 0.6 + 0.4 * (1 - (1 - t) * (1 - t));
        }
        const rw = item.w * scale;
        const rh = item.h * scale;
        const rx = item.x + (item.w - rw) / 2;
        const ry = item.y + (item.h - rh) / 2;
        gl.scissor(
          Math.round(rx * dpr),
          Math.round((ch - (ry + rh)) * dpr),
          Math.round(rw * dpr),
          Math.round(rh * dpr)
        );
        gl.uniform1f(locs.uEffect, EFFECT_INDEX[item.effect ?? "dither"]);
        gl.uniform1f(locs.uAlpha, 1 - retireProgress);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      gl.disable(gl.SCISSOR_TEST);
    };

    drawRef.current = draw;

    const uploadSource = (source: TexImageSource, w: number, h: number) => {
      texW = w;
      texH = h;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, sourceTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      hasTexture = true;
    };

    let rafId = 0;
    const hasAnimatingRegions = () => {
      const now = performance.now();
      return regionsRef.current.some(
        (r) => r.retireAt != null || (r.appearAt != null && now - r.appearAt < 220)
      );
    };

    if (video) {
      let lastTime = 0;
      const tick = (now: number) => {
        rafId = requestAnimationFrame(tick);
        const minDelta = hasAnimatingRegions() ? 0 : 1000 / 30;
        if (now - lastTime < minDelta) return;
        if (regionsRef.current.length && video.readyState >= 2 && video.videoWidth > 0) {
          lastTime = now;
          autoLevels.measure(video);
          uploadSource(video, video.videoWidth, video.videoHeight);
          draw();
        }
      };
      rafId = requestAnimationFrame(tick);
    } else {
      const loop = () => {
        draw();
        rafId = hasAnimatingRegions() ? requestAnimationFrame(loop) : 0;
      };
      kickAnimRef.current = () => {
        if (!rafId) rafId = requestAnimationFrame(loop);
      };

      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        for (let i = 0; i < 12; i++) autoLevels.measure(img);
        uploadSource(img, img.naturalWidth, img.naturalHeight);
        draw();
      };
      img.src = src;
    }

    const observer = new ResizeObserver(() => draw());
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      drawRef.current = null;
      kickAnimRef.current = null;
      gl.deleteTexture(sourceTex);
      gl.deleteTexture(atlasTex);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [src, video, maxDpr]);

  const regionsKey = regions
    .map(
      (r) =>
        `${r.effect}:${r.x},${r.y},${r.w},${r.h},${r.retireAt ?? 0},${r.appearAt ?? 0}`
    )
    .join(";");

  useEffect(() => {
    if (!video) {
      drawRef.current?.();
      kickAnimRef.current?.();
    }
  }, [regionsKey, video, mirror, ink, paper]);

  return (
    <canvas
      ref={canvasRef}
      className="nf-glitch-canvas"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function snap10(v: number) {
  return 10 * Math.round(v / 10);
}

function pickNextEffect(exclude?: EffectName): EffectName {
  const pool = exclude ? EFFECT_NAMES.filter((e) => e !== exclude) : EFFECT_NAMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function Halftone404({
  imageSrc = EYE_IMAGE_SRC,
  message = "No branch or commit has this page.",
  homeHref = "/",
  homeLabel = "Go home",
}: {
  imageSrc?: string;
  message?: string;
  homeHref?: string;
  homeLabel?: string;
} = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [activeCursorEffect, setActiveCursorEffect] = useState<{
    effect: EffectName;
    appearAt: number;
  } | null>(null);
  const [shards, setShards] = useState<RegionShard[]>([]);

  // Camera state
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [cameraFailed, setCameraFailed] = useState(false);
  const [baseReady, setBaseReady] = useState(false);
  const [readyVideo, setReadyVideo] = useState<HTMLVideoElement | null>(null);
  const [settledVideo, setSettledVideo] = useState<HTMLVideoElement | null>(null);

  const sessionRef = useRef<{
    cancelled: boolean;
    stream: MediaStream | null;
    player: HTMLVideoElement | null;
    release: () => void;
  } | null>(null);

  const lastSpawnPointRef = useRef<{ x: number; y: number } | null>(null);
  const shardIdRef = useRef(0);
  const pointerRafRef = useRef(0);
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null);

  const stopCamera = useCallback(() => {
    sessionRef.current?.release();
    sessionRef.current = null;
    setVideoEl(null);
  }, []);

  const startCamera = useCallback(() => {
    sessionRef.current?.release();
    setVideoEl(null);
    setCameraFailed(false);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraFailed(true);
      return;
    }

    const handleEnded = () => {
      if (sessionRef.current === session) {
        stopCamera();
        setCameraFailed(true);
      }
    };

    const session = {
      cancelled: false,
      stream: null as MediaStream | null,
      player: null as HTMLVideoElement | null,
      release: () => {
        session.cancelled = true;
        for (const track of session.stream?.getTracks() ?? []) {
          track.removeEventListener("ended", handleEnded);
          track.stop();
        }
        if (session.player) {
          session.player.pause();
          session.player.srcObject = null;
        }
      },
    };

    sessionRef.current = session;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (session.cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        session.stream = stream;
        for (const t of stream.getTracks()) {
          t.addEventListener("ended", handleEnded);
        }
        const vid = document.createElement("video");
        session.player = vid;
        vid.srcObject = stream;
        vid.muted = true;
        vid.playsInline = true;
        return vid.play().then(() => {
          if (!session.cancelled) {
            setVideoEl(vid);
          }
        });
      })
      .catch(handleEnded);
  }, [stopCamera]);

  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) stopCamera();
    };
    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("pagehide", stopCamera);
    return () => {
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("pagehide", stopCamera);
      sessionRef.current?.release();
      sessionRef.current = null;
    };
  }, [stopCamera]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasShards = shards.length > 0;
  useEffect(() => {
    if (!hasShards) return;
    const interval = setInterval(() => {
      const now = performance.now();
      setShards((prev) => {
        const updated = prev.map((item) =>
          item.retireAt == null && item.until != null && now > item.until
            ? { ...item, retireAt: now }
            : item
        );
        const filtered = updated.filter(
          (item) =>
            !(item.retireAt != null
              ? now > item.retireAt + 340
              : item.until != null && now > item.until)
        );
        return filtered.length === prev.length &&
          updated.every((v, idx) => v === prev[idx])
          ? prev
          : filtered;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [hasShards]);

  const isVideoReady = !!videoEl && readyVideo === videoEl;
  const isVideoSettled = !!videoEl && settledVideo === videoEl;

  useEffect(() => {
    if (!isVideoReady) return;
    const t = setTimeout(() => setSettledVideo(videoEl), 700);
    return () => clearTimeout(t);
  }, [isVideoReady, videoEl]);

  useEffect(() => {
    return () => cancelAnimationFrame(pointerRafRef.current);
  }, []);

  const retireCursor = useCallback(() => {
    cancelAnimationFrame(pointerRafRef.current);
    pointerRafRef.current = 0;
    latestPointerRef.current = null;
    setPointer(null);
    setActiveCursorEffect(null);
    const now = performance.now();
    setShards((prev) =>
      prev.map((item) => (item.retireAt ? item : { ...item, retireAt: now }))
    );
  }, []);

  const scale = size.w / 1440;
  const ty = (size.h - 840 * scale) / 2 - 180 * scale;
  const clipTransform = `translate(${-29 * scale} ${ty}) scale(${scale})`;

  const activeRegions: RegionShard[] =
    pointer && activeCursorEffect
      ? [
          ...shards,
          {
            x: pointer.x - 190,
            y: pointer.y - 145,
            w: 380,
            h: 290,
            effect: activeCursorEffect.effect,
            appearAt: activeCursorEffect.appearAt,
          },
        ]
      : shards;

  const isLive = !!videoEl;

  return (
    <div
      ref={containerRef}
      data-not-found=""
      className="nf-stage"
      onPointerMove={(e) => {
        const el = containerRef.current;
        if (!el) return;
        const target = e.target as HTMLElement | null;
        if (target?.closest("[data-camera]") || target?.closest(".nf-pill")) {
          if (pointer || pointerRafRef.current) retireCursor();
          return;
        }
        const rect = el.getBoundingClientRect();
        latestPointerRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        if (!pointerRafRef.current) {
          pointerRafRef.current = requestAnimationFrame(() => {
            pointerRafRef.current = 0;
            const pt = latestPointerRef.current;
            if (!pt) return;
            setPointer(pt);
            setActiveCursorEffect((prev) =>
              prev ?? { effect: pickNextEffect(), appearAt: performance.now() }
            );
            const last = lastSpawnPointRef.current;
            if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 90) {
              lastSpawnPointRef.current = pt;
              const w = snap10(randRange(150, 400));
              const h = snap10(Math.min(400, Math.max(150, w * randRange(0.62, 1.6))));
              const now = performance.now();
              const nextShard: RegionShard = {
                id: shardIdRef.current++,
                effect: pickNextEffect(),
                until: now + randRange(900, 1600),
                retireAt: null,
                appearAt: now,
                x: snap10(pt.x - w / 2 + randRange(-w / 3, w / 3)),
                y: snap10(pt.y - h / 2 + randRange(-h / 3, h / 3)),
                w,
                h,
              };
              setShards((prev) =>
                [
                  ...prev.map((item) =>
                    item.retireAt ? item : { ...item, retireAt: now }
                  ),
                  nextShard,
                ].slice(-8)
              );
              setActiveCursorEffect((prev) => ({
                effect: pickNextEffect(prev?.effect),
                appearAt: now,
              }));
            }
          });
        }
      }}
      onPointerLeave={retireCursor}
    >
      <svg width="0" height="0" role="presentation" className="nf-clip-svg">
        <defs>
          <clipPath id="sc-404-clip" clipPathUnits="userSpaceOnUse">
            <path
              d="M552.541 797.997V883.167H456.724V1039.67H360.908V883.167H0V805.45L338.551 294.43H456.724V797.997H552.541ZM105.398 797.997H360.908V411.538L105.398 797.997Z"
              transform={clipTransform}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                additive="sum"
                values={`0 0; ${DRIFT_SPECS[0].dx} ${DRIFT_SPECS[0].dy}; ${-(0.6 * DRIFT_SPECS[0].dx)} ${-(0.6 * DRIFT_SPECS[0].dy)}; 0 0`}
                keyTimes="0;0.33;0.66;1"
                calcMode="spline"
                keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                dur={`${DRIFT_SPECS[0].dur}s`}
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M740.502 775.047C556.322 775.047 453.053 635.581 453.053 387.524C453.053 139.466 556.322 0 740.502 0C924.682 0 1027.95 139.466 1027.95 387.524C1027.95 635.581 924.682 775.047 740.502 775.047Z M619.5 387.5a121 232 0 1 0 242 0a121 232 0 1 0 -242 0Z"
              clipRule="evenodd"
              transform={clipTransform}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                additive="sum"
                values={`0 0; ${DRIFT_SPECS[1].dx} ${DRIFT_SPECS[1].dy}; ${-(0.6 * DRIFT_SPECS[1].dx)} ${-(0.6 * DRIFT_SPECS[1].dy)}; 0 0`}
                keyTimes="0;0.33;0.66;1"
                calcMode="spline"
                keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                dur={`${DRIFT_SPECS[1].dur}s`}
                repeatCount="indefinite"
              />
            </path>
            <path
              d="M1499 667.804V752.974H1403.18V909.474H1307.37V752.974H946.459V675.256L1285.01 164.236H1403.18V667.804H1499ZM1051.86 667.804H1307.37V281.345L1051.86 667.804Z"
              transform={clipTransform}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                additive="sum"
                values={`0 0; ${DRIFT_SPECS[2].dx} ${DRIFT_SPECS[2].dy}; ${-(0.6 * DRIFT_SPECS[2].dx)} ${-(0.6 * DRIFT_SPECS[2].dy)}; 0 0`}
                keyTimes="0;0.33;0.66;1"
                calcMode="spline"
                keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"
                dur={`${DRIFT_SPECS[2].dur}s`}
                repeatCount="indefinite"
              />
            </path>
          </clipPath>
        </defs>
      </svg>

      {size.w > 0 && (
        <>
          <div className="nf-clipped-layer" style={{ clipPath: "url(#sc-404-clip)" }}>
            <HalftoneCanvas
              src={imageSrc}
              maxDpr={1}
              params={DEFAULT_HALFTONE_PARAMS}
              ink={INK_HEX}
              paper={PAPER_HEX}
              alt="404"
              onReady={() => setBaseReady(true)}
              className="nf-fade-canvas"
              style={{
                opacity: baseReady ? 1 : 0,
                visibility: isVideoSettled ? "hidden" : undefined,
              }}
            />
            {videoEl && (
              <HalftoneCanvas
                src={imageSrc}
                video={videoEl}
                maxDpr={1}
                params={DEFAULT_HALFTONE_PARAMS}
                ink={INK_HEX}
                paper={PAPER_HEX}
                alt="404"
                mirror
                onReady={() => setReadyVideo(videoEl)}
                className="nf-fade-canvas nf-live-canvas"
                style={{
                  opacity: isVideoReady ? 1 : 0,
                }}
              />
            )}
          </div>

          <div className="nf-glitch-layer">
            <GlitchOverlayCanvas
              src={imageSrc}
              video={videoEl}
              regions={activeRegions}
              mirror={isLive}
              ink={INK_HEX}
              paper={PAPER_HEX}
            />
          </div>
        </>
      )}

      <button
        type="button"
        onClick={(e) => {
          const el = containerRef.current;
          if (!el) return;
          cancelAnimationFrame(pointerRafRef.current);
          pointerRafRef.current = 0;
          const rect = el.getBoundingClientRect();
          setPointer(
            e.detail
              ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
              : { x: rect.width / 2, y: rect.height / 2 }
          );
          setActiveCursorEffect((prev) => ({
            effect: prev
              ? EFFECT_NAMES[(EFFECT_NAMES.indexOf(prev.effect) + 1) % EFFECT_NAMES.length]
              : EFFECT_NAMES[0],
            appearAt: prev?.appearAt ?? performance.now(),
          }));
        }}
        aria-label={`Change 404 panel effect; current: ${activeCursorEffect?.effect ?? "none"}`}
        className="nf-backdrop-trigger"
      />

      <div className="nf-overlay">
        <h1 className="nf-sr-only">Page not found</h1>
        <p className="nf-message">{message}</p>
        <div className="nf-actions">
          <Link href={homeHref} className="nf-pill spiral-ring">
            <span>{homeLabel}</span>
            <span aria-hidden="true" className="nf-arrow-flip">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="presentation" aria-hidden="true" className="nf-icon-sm">
                <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
              </svg>
            </span>
          </Link>

          <button
            type="button"
            data-camera={isLive ? "on" : "off"}
            aria-label={isLive ? "Get lost: turn the camera off" : "Find yourself: turn the camera on"}
            aria-describedby="sc-404-camera-note"
            onClick={isLive ? stopCamera : startCamera}
            className="nf-pill spiral-ring"
          >
            <span className="nf-label-stack">
              <span className={isLive ? "nf-label-hidden" : ""}>Find yourself</span>
              <span className={!isLive ? "nf-label-hidden" : ""}>Get lost</span>
            </span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="presentation" aria-hidden="true" className="nf-icon-cam">
              <path
                d={
                  isLive
                    ? "M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"
                    : "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                }
              />
            </svg>
          </button>
        </div>
        <p id="sc-404-camera-note" role="status" className="nf-caption">
          {cameraFailed
            ? "The camera is not available. Check this site's camera permission."
            : "The video stays in your browser."}
        </p>
      </div>
    </div>
  );
}
