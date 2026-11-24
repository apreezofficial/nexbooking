"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const TAU = Math.PI * 2;

export default function ServicesHalftone404({
  message = "No service or booking lives here.",
  ctaHref = "/services",
  ctaLabel = "Explore services",
}: {
  message?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraActiveRef = useRef(false);
  const pointerRef = useRef({ x: 0.5, y: 0.45, active: false });

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    cameraActiveRef.current = false;
    setCameraActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraBusy) return;

    if (cameraActiveRef.current) {
      stopCamera();
      setCameraError(null);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access isn’t available in this browser.");
      return;
    }

    setCameraBusy(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      cameraActiveRef.current = true;
      setCameraActive(true);
    } catch {
      stopCamera();
      setCameraError("Camera permission blocked — showing studio halftone.");
    } finally {
      setCameraBusy(false);
    }
  }, [cameraBusy, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
    const sampleCanvas = document.createElement("canvas");
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

    if (!maskCtx || !sampleCtx) return;

    let width = 0;
    let height = 0;
    let step = 8;
    let cols = 0;
    let rows = 0;
    let maskAlpha = new Float32Array(0);
    let animId = 0;

    const buildMask = () => {
      const rect = stage.getBoundingClientRect();
      width = Math.max(320, Math.floor(rect.width));
      height = Math.max(360, Math.floor(rect.height));

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      step = width < 640 ? 6 : width < 1024 ? 7 : 8;
      cols = Math.ceil(width / step) + 1;
      rows = Math.ceil(height / step) + 1;

      maskCanvas.width = cols;
      maskCanvas.height = rows;
      sampleCanvas.width = cols;
      sampleCanvas.height = rows;

      maskCtx.clearRect(0, 0, cols, rows);
      maskCtx.fillStyle = "#000000";
      if ("filter" in maskCtx) {
        maskCtx.filter = "blur(0.65px)";
      }

      const targetFontPx =
        width < 640
          ? Math.min(height * 0.56, width * 0.55)
          : Math.min(height * 0.88, width * 0.52);
      const gridFont = targetFontPx / step;

      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.font = `900 ${gridFont}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif`;
      maskCtx.fillText("4", cols * 0.215, rows * 0.62);
      maskCtx.fillText("4", cols * 0.785, rows * 0.45);

      maskCtx.font = `900 ${gridFont * 1.08}px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif`;
      maskCtx.fillText("0", cols * 0.495, rows * 0.34);

      if ("filter" in maskCtx) {
        maskCtx.filter = "none";
      }

      const raw = maskCtx.getImageData(0, 0, cols, rows).data;
      maskAlpha = new Float32Array(cols * rows);
      for (let i = 0; i < cols * rows; i++) {
        maskAlpha[i] = raw[i * 4 + 3] / 255;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerRef.current = {
        x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
        y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
        active: true,
      };
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    const renderFrame = (timeMs: number) => {
      animId = window.requestAnimationFrame(renderFrame);
      if (!cols || !rows) return;

      ctx.fillStyle = "#fbfcf8";
      ctx.fillRect(0, 0, width, height);

      const video = videoRef.current;
      const hasLiveVideo =
        cameraActiveRef.current &&
        video !== null &&
        video.readyState >= 2 &&
        video.videoWidth > 0 &&
        video.videoHeight > 0;

      let frameData: Uint8ClampedArray | null = null;
      if (hasLiveVideo && video) {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const scale = Math.max(cols / vw, rows / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (cols - dw) / 2;
        const dy = (rows - dh) / 2;

        sampleCtx.save();
        sampleCtx.translate(cols, 0);
        sampleCtx.scale(-1, 1);
        sampleCtx.drawImage(video, dx, dy, dw, dh);
        sampleCtx.restore();

        frameData = sampleCtx.getImageData(0, 0, cols, rows).data;
      }

      const t = timeMs * 0.0011;
      const ptr = pointerRef.current;
      const focusX = ptr.active ? ptr.x : 0.5 + Math.sin(t * 0.55) * 0.12;
      const focusY = ptr.active ? ptr.y : 0.42 + Math.cos(t * 0.42) * 0.08;
      const maxRadius = step * 0.48;
      const halfStep = step * 0.5;

      ctx.fillStyle = "#1c1a14";
      ctx.beginPath();

      for (let r = 0; r < rows; r++) {
        const cy = r * step + halfStep;
        const ny = r / rows;
        const rowOffset = r * cols;

        for (let c = 0; c < cols; c++) {
          const idx = rowOffset + c;
          const alpha = maskAlpha[idx];
          if (alpha < 0.04) continue;

          let darkness: number;
          if (frameData) {
            const p = idx * 4;
            const luma =
              (0.299 * frameData[p] + 0.587 * frameData[p + 1] + 0.114 * frameData[p + 2]) / 255;
            const contrasted = Math.max(0.06, Math.min(0.96, (luma - 0.5) * 1.4 + 0.48));
            darkness = 1 - contrasted;
          } else {
            const nx = c / cols;
            const dx = nx - focusX;
            const dy = (ny - focusY) * 0.72;
            const dist = Math.hypot(dx, dy);
            const ripple =
              Math.sin(nx * 5.2 - t * 1.2 + Math.cos(ny * 4.4 + t * 0.8)) * 0.22 +
              Math.cos((nx - ny) * 6.5 + t * 0.7) * 0.14;
            const studioGlow = Math.exp(-dist * dist * 8.5) * 0.42;
            darkness = Math.max(0.18, Math.min(0.92, 0.68 + ripple - studioGlow));
          }

          const radius = maxRadius * darkness * alpha;
          if (radius < 0.35) continue;

          const cx = c * step + halfStep;
          ctx.moveTo(cx + radius, cy);
          ctx.arc(cx, cy, radius, 0, TAU);
        }
      }

      ctx.fill();
    };

    buildMask();
    const observer = new ResizeObserver(buildMask);
    observer.observe(stage);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerleave", handlePointerLeave);
    animId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.cancelAnimationFrame(animId);
      observer.disconnect();
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <main className="nf-stage" ref={stageRef}>
      <canvas className="nf-clipped-layer" ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} aria-label="404 services halftone canvas" />
      <video ref={videoRef} playsInline muted style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }} aria-hidden="true" />

      <div className="nf-overlay">
        <h1 className="nf-sr-only">Service not found</h1>
        <p className="nf-message">{message}</p>
        <div className="nf-actions">
          <Link href={ctaHref} className="nf-pill spiral-ring">
            <span>{ctaLabel}</span>
            <span aria-hidden="true" className="nf-arrow-flip">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="presentation" aria-hidden="true" className="nf-icon-sm">
                <path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z" />
              </svg>
            </span>
          </Link>

          <button
            type="button"
            className="nf-pill spiral-ring"
            onClick={toggleCamera}
            disabled={cameraBusy}
          >
            <span>{cameraActive ? "Get lost" : "Find yourself"}</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" role="presentation" aria-hidden="true" className="nf-icon-cam">
              <path
                d={
                  cameraActive
                    ? "M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"
                    : "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"
                }
              />
            </svg>
          </button>
        </div>
        <p className="nf-caption" role="status">
          {cameraError ?? "The video stays in your browser."}
        </p>
      </div>
    </main>
  );
}
