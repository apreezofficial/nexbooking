"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteArt from "./SiteArt";

type Item = { slug: string; image: string; label: string };

const N = 5; // 5x5 particle grid per circle

// Pure integer math deterministic pseudo-random so SSR and client outputs match exactly
const pseudoRand = (seed: number) => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};

function Circle({ item, index, broken, hidden }: { item: Item; index: number; broken: boolean; hidden?: boolean }) {
  return (
    <Link
      href={`/services/${item.slug}`}
      className={`story-pill ${broken ? "is-breaking" : ""}`}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
    >
      <span className="story-art" aria-hidden="true">
        {/* Solid base photo at rest without seams */}
        <span className="story-base-photo">
          <SiteArt file={item.image} priority={true} />
        </span>

        {/* Circular particle scatter on hover / break */}
        <span className="story-tiles">
          {Array.from({ length: N * N }).map((_, t) => {
            const col = t % N;
            const row = Math.floor(t / N);
            const seed = (index + 1) * 31 + (t + 1) * 17;
            const angle = pseudoRand(seed) * Math.PI * 2;
            const dist = 35 + pseudoRand(seed + 101) * 45;
            return (
              <i
                key={t}
                style={{
                  backgroundImage: `url(/assets/${item.image})`,
                  backgroundPosition: `${(col / (N - 1)) * 100}% ${(row / (N - 1)) * 100}%`,
                  "--dx": `${Math.round(Math.cos(angle) * dist)}px`,
                  "--dy": `${Math.round(Math.sin(angle) * dist - 8)}px`,
                  "--r": `${Math.round((pseudoRand(seed + 202) - 0.5) * 220)}deg`,
                  "--d": `${Math.floor(pseudoRand(seed + 303) * 180)}ms`,
                } as React.CSSProperties}
              />
            );
          })}
        </span>
      </span>
      <span className="story-label">{item.label}</span>
    </Link>
  );
}

export default function StoryMarquee({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(-1);

  // Every few seconds one circle disintegrates into round particles and re-forms
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = setInterval(() => {
      setActive(i % items.length);
      i += 4; // jump across the strip
      setTimeout(() => setActive(-1), 1500);
    }, 3200);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div className="story-marquee" aria-label={label}>
      <div className="story-track">
        {items.map((item, i) => (
          <Circle key={item.slug} item={item} index={i} broken={active === i} />
        ))}
        {items.map((item, i) => (
          <Circle key={`${item.slug}-copy`} item={item} index={i} broken={active === i} hidden />
        ))}
      </div>
    </div>
  );
}
