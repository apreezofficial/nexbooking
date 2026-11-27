"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { Studio } from "@/lib/dashboard/types";

/** Round studio bubbles with a gold ring, the same language as the landing page's discover bubbles. */
export function StudioBubbles({ items, hrefFor }: { items: Studio[]; hrefFor: (studio: Studio) => string }) {
  return (
    <ul className="d-bubbles" role="list">
      {items.map((studio, index) => (
        <li key={studio.id}>
          <Link href={hrefFor(studio)} className="d-bubble" style={{ "--d": `${index * 70}ms` } as CSSProperties} aria-label={`${studio.name}, ${studio.rating} stars`}>
            <span className="d-bubble-ring">
              <Image src={studio.photo} alt="" fill sizes="96px" />
            </span>
            <span className="d-bubble-name">{studio.name}</span>
            <span className="d-bubble-meta">★ {studio.rating}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
