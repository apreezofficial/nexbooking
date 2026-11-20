"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

export const currencies = [
  { code: "NGN", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
];

const STORAGE_KEY = "nexbooking-currency";
const DEFAULT_CODE = "NGN";

// The viewer's saved choice lives in localStorage. Storage can be blocked, so every access is guarded.
function readSaved(): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && currencies.some((c) => c.code === saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  return DEFAULT_CODE;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function CurrencySelect() {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const saved = useSyncExternalStore(subscribe, readSaved, () => DEFAULT_CODE);
  const selected = chosen ?? saved;
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = currencies.find((c) => c.code === selected) ?? currencies[0];

  const choose = (code: string) => {
    setChosen(code);
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <div className="currency-wrap" ref={rootRef}>
      <button
        type="button"
        className="currency-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{current.code}</span>
        <span className={`caret ${open ? "caret-up" : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <ul id={listId} role="listbox" className="currency-menu" aria-label="Currency">
          {currencies.map((c, i) => (
            <li
              key={c.code}
              role="option"
              aria-selected={c.code === selected}
              tabIndex={0}
              className={`currency-option ${c.code === selected ? "is-selected" : ""}`}
              style={{ animationDelay: `${i * 40}ms` }}
              onClick={() => choose(c.code)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  choose(c.code);
                }
              }}
            >
              <span className="currency-flag" aria-hidden="true">
                {c.flag}
              </span>
              <span className="currency-text">
                <strong>{c.code}</strong>
                <small>{c.name}</small>
              </span>
              {c.code === selected && <span className="currency-check">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
