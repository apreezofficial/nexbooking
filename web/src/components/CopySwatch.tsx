"use client";

import { useCopy } from "@/components/CopyButton";

/** A colour chip that copies its hex code when clicked. */
export default function CopySwatch({ name, hex, role }: { name: string; hex: string; role: string }) {
  const { state, copy } = useCopy();
  return (
    <button type="button" className="swatch" onClick={() => copy(hex)} aria-label={`Copy ${name}, ${hex}`}>
      <span className="swatch-chip" style={{ background: hex }}>
        <span className="swatch-state" aria-live="polite">
          {state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy"}
        </span>
      </span>
      <span className="swatch-body">
        <strong>{name}</strong>
        <code>{hex}</code>
        <small>{role}</small>
      </span>
    </button>
  );
}
