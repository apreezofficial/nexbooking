"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

/** A horizontal, snap-scrolling track with arrow buttons, like the landing page's business carousel. */
export default function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const sync = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  };

  const step = (direction: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.min(el.clientWidth * 0.8, 340), behavior: "smooth" });
  };

  return (
    <div className="d-carousel">
      <div className="d-carousel-track" ref={track} onScroll={sync} role="region" aria-label={label} tabIndex={0}>
        {children}
      </div>
      <div className="d-carousel-controls">
        <button type="button" aria-label="Previous" onClick={() => step(-1)} disabled={edge.start}><ChevronLeft size={18} strokeWidth={2} aria-hidden="true" /></button>
        <button type="button" aria-label="Next" onClick={() => step(1)} disabled={edge.end}><ChevronRight size={18} strokeWidth={2} aria-hidden="true" /></button>
      </div>
    </div>
  );
}
