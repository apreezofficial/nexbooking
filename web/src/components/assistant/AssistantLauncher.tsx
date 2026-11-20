"use client";

import { useEffect, useId, useRef, useState } from "react";
import AssistantAvatar from "@/components/assistant/AssistantAvatar";
import AssistantPanel from "@/components/assistant/AssistantPanel";
import "./assistant.css";

/**
 * A floating button that opens the assistant panel. Mount it once, in the root layout,
 * to put the assistant on every page. It only opens and closes the panel for now.
 */
export default function AssistantLauncher() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="assistant-launcher">
      {open ? <AssistantPanel id={panelId} onClose={() => { setOpen(false); buttonRef.current?.focus(); }} /> : null}
      <button
        ref={buttonRef}
        type="button"
        className="assistant-fab"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen((value) => !value)}
      >
        <AssistantAvatar size={52} state={open ? "working" : "idle"} interactive={false} />
      </button>
    </div>
  );
}
