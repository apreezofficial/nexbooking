"use client";

import { useEffect, useRef, useState } from "react";

/** Copies text, falling back to a hidden textarea where the Clipboard API is blocked. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(field);
      return ok;
    } catch {
      return false;
    }
  }
}

export type CopyState = "idle" | "copied" | "failed";

/** Copy handler plus a short-lived "copied" state for button feedback. */
export function useCopy() {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy(text: string) {
    const ok = await copyToClipboard(text);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  }

  return { state, copy };
}

export default function CopyButton({ text, label = "Copy", className = "btn btn-soft" }: { text: string; label?: string; className?: string }) {
  const { state, copy } = useCopy();
  return (
    <button type="button" className={className} onClick={() => copy(text)}>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label}</span>
    </button>
  );
}
