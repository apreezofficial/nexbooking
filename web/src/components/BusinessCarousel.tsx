"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import Icon from "./Icon";

export interface BusinessCardItem {
  name: string;
  file: string;
  tag: string;
  text: string;
  href: string;
  cta: string;
}

export const businessCardsData: BusinessCardItem[] = [
  {
    name: "Beauty, on your schedule",
    file: "discover-salon.png",
    tag: "BEAUTY & WELLNESS",
    text: "Your work gets noticed. Your next client gets booked.",
    href: "/services/beauty",
    cta: "Explore beauty services",
  },
  {
    name: "Make room for your craft",
    file: "discover-studio.png",
    tag: "CREATIVES & PROFESSIONALS",
    text: "Show your portfolio and turn interest into a conversation.",
    href: "/services/photography",
    cta: "Explore creative & photo",
  },
  {
    name: "A better way to connect",
    file: "discover-clinic.png",
    tag: "CONSULTATIONS & SERVICES",
    text: "A welcoming space for appointments and ongoing care.",
    href: "/services/consultations",
    cta: "Book a consultation",
  },
  {
    name: "Train on your terms",
    file: "discover-fitness.png",
    tag: "FITNESS",
    text: "Find a class or make time for a personal training session.",
    href: "/services/fitness",
    cta: "Find fitness sessions",
  },
  {
    name: "Plan your next event",
    file: "discover-events.png",
    tag: "EVENTS",
    text: "Discover spaces and services for your next gathering.",
    href: "/services/events",
    cta: "Discover event spaces",
  },
];

export default function BusinessCarousel({ items = businessCardsData }: { items?: BusinessCardItem[] }) {
  const [isPaused, setIsPaused] = useState(false);
  const [nudgeOffset, setNudgeOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Allow manual nudge via arrow buttons
  function nudge(direction: -1 | 1) {
    const cardWidth = 320 + 24; // card width + gap
    setNudgeOffset(prev => prev + direction * cardWidth);
  }

  // Double items for seamless infinite marquee loop
  const loopItems = [...items, ...items];

  return (
    <div className="business-carousel-wrapper">
      <div
        className={`infinite-business-carousel ${isPaused ? "is-paused" : ""}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={trackRef}
          className="business-marquee-track"
          style={{
            transform: nudgeOffset !== 0 ? `translateX(${nudgeOffset}px)` : undefined,
          }}
        >
          {loopItems.map((c, i) => {
            const isClone = i >= items.length;
            return (
              <article
                className="business-card modern-business-card"
                key={`${c.name}-${i}`}
                aria-hidden={isClone ? "true" : undefined}
              >
                <Link href={c.href} className="business-cover-link" tabIndex={isClone ? -1 : 0}>
                  <div className="art business-cover">
                    <Image
                      src={`/assets/${c.file}`}
                      alt={c.name}
                      fill
                      sizes="(max-width: 600px) 280px, 340px"
                    />
                  </div>
                </Link>
                <span className="card-category">{c.tag}</span>
                <h3>
                  <Link href={c.href} tabIndex={isClone ? -1 : 0}>
                    {c.name}
                  </Link>
                </h3>
                <p>{c.text}</p>
                <Link
                  href={c.href}
                  className="btn btn-gradient business-card-btn"
                  tabIndex={isClone ? -1 : 0}
                >
                  {c.cta}
                  <Icon name="arrow" />
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      <div className="carousel-controls modern-carousel-controls">
        <button
          type="button"
          aria-label="Previous card"
          className="carousel-nav-btn"
          onClick={() => nudge(1)}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label={isPaused ? "Play carousel auto-scroll" : "Pause carousel auto-scroll"}
          className="carousel-nav-btn carousel-play-btn"
          onClick={() => setIsPaused(p => !p)}
        >
          {isPaused ? "▶" : "⏸"}
        </button>
        <button
          type="button"
          aria-label="Next card"
          className="carousel-nav-btn"
          onClick={() => nudge(-1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
