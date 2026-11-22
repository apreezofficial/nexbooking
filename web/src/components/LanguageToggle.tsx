"use client";
import { useEffect, useId, useRef, useState } from "react";
import Icon from "./Icon";

const languages = [
  ["en", "English", "EN"], ["fr", "Français", "FR"], ["es", "Español", "ES"], ["pt", "Português", "PT"],
  ["de", "Deutsch", "DE"], ["ar", "العربية", "AR"], ["yo", "Yorùbá", "YO"], ["ig", "Igbo", "IG"],
  ["ha", "Hausa", "HA"], ["sw", "Kiswahili", "SW"], ["hi", "हिन्दी", "HI"], ["zh-CN", "中文", "ZH"],
] as const;

function currentCode(): string {
  const m = document.cookie.match(/(?:^|; )googtrans=\/[^/]+\/([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "en";
}

function setLanguage(code: string) {
  const host = window.location.hostname;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  if (code === "en") {
    document.cookie = `googtrans=; ${expire}; path=/`;
    document.cookie = `googtrans=; ${expire}; path=/; domain=${host}`;
  } else {
    document.cookie = `googtrans=/en/${code}; path=/`;
    document.cookie = `googtrans=/en/${code}; path=/; domain=${host}`;
  }
  window.location.reload();
}

declare global {
  interface Window { googleTranslateElementInit?: () => void; google?: { translate: { TranslateElement: new (o: object, id: string) => unknown } } }
}

export default function LanguageToggle() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("en");
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    const saved = currentCode();
    const t = setTimeout(() => setCode(saved), 0);
    if (saved !== "en" && !document.getElementById("google-translate-script")) {
      window.googleTranslateElementInit = () => {
        new window.google!.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, "google_translate_element");
      };
      const s = document.createElement("script");
      s.id = "google-translate-script";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  const current = languages.find(l => l[0] === code) ?? languages[0];

  return (
    <div className="currency-wrap lang-wrap" ref={root} translate="no">
      <div id="google_translate_element" className="gt-host" />
      <button type="button" className="currency-btn lang-btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} onClick={() => setOpen(o => !o)}>
        <Icon name="globe" />{current[2]}<Icon name="chevron" className={`caret ${open ? "caret-up" : ""}`} />
      </button>
      {open && (
        <ul id={listId} role="listbox" className="currency-menu lang-menu" aria-label="Choose language">
          {languages.map(([c, name, short]) => (
            <li key={c} role="option" aria-selected={c === code} className={`currency-option ${c === code ? "is-selected" : ""}`} onClick={() => c === code ? setOpen(false) : setLanguage(c)}>
              <span className="lang-short">{short}</span>
              <span className="currency-text"><strong>{name}</strong></span>
              {c === code && <Icon name="check" className="currency-check" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
