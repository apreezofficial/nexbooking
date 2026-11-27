"use client";

import Link from "next/link";
import type { Studio } from "@/lib/dashboard/types";
import { DashArt } from "./Media";

/** The /services story row: round photo bubbles with a gold ring and a label. Uses the site's own classes. */
export function StudioBubbles({ items, hrefFor }: { items: Studio[]; hrefFor: (studio: Studio) => string }) {
  return (
    <div className="service-stories" aria-label="Studios">
      {items.map((studio) => (
        <Link key={studio.id} href={hrefFor(studio)} aria-label={`${studio.name}, ${studio.rating} stars`}>
          <DashArt src={studio.photo} />
          <span>{studio.name}</span>
        </Link>
      ))}
    </div>
  );
}

/** Category row (All, Hair, Nails…) that filters a screen. Selected state is the site's `aria-pressed` ring. */
export function CategoryStories({ items, value, onChange }: { items: { label: string; image: string }[]; value: string; onChange: (label: string) => void }) {
  return (
    <div className="service-stories" role="group" aria-label="Categories">
      {items.map((item) => (
        <button key={item.label} type="button" aria-pressed={value === item.label} onClick={() => onChange(item.label)}>
          <DashArt src={item.image} />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
