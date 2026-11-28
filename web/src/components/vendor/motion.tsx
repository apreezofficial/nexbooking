"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** True once the element has scrolled into view. Charts use it to start their animation when you can see them. */
export function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setSeen(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, seen];
}

/** A number that counts up from zero when it comes into view. Honors reduced motion. */
export function CountUp({ value, format = (n: number) => n.toLocaleString("en-NG"), duration = 1000 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const [ref, seen] = useInView<HTMLSpanElement>();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = reduce ? 1 : Math.min(1, (now - start) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, value, duration]);
  return <span ref={ref}>{format(seen ? shown : 0)}</span>;
}

/** Wrapper that adds `is-live` when in view, so CSS transitions inside it can run. */
export function Live({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return <div ref={ref} className={`vi-live ${seen ? "is-live" : ""} ${className}`.trim()}>{children}</div>;
}
