import type { Metadata } from "next";
import Link from "next/link";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";

export const metadata: Metadata = { title: "Discover | NexBooking", description: "Find local salons, studios, fitness services, clinics, tutors and more." };

const categories = [
  ["Beauty & wellness", "discover-salon.png", "Salons, spas and the people who help you feel like you."],
  ["Creative studios", "discover-studio.png", "Photographers, makers and spaces for your next idea."],
  ["Fitness", "discover-fitness.png", "Classes and personal training that fit your schedule."],
  ["Learning", "discover-tutor.png", "Find a tutor and make time for a new skill."],
  ["Photography", "discover-photography.png", "Meet photographers and explore their work."],
  ["Events & spaces", "discover-events.png", "Find the people and places for your next gathering."],
];

export default function DiscoverPage() {
  return <RouteShell current="Discover">
    <RouteHero eyebrow="A WORLD OF GOOD BUSINESSES" title="Find your next favourite." description="A fresh cut, a bright idea or a moment for you. Meet local businesses and explore their work before you book." image="discover-landscape.png" cta="Find a service"/>
    <section className="route-content"><div className="route-section-heading"><p className="eyebrow">EXPLORE YOUR NEIGHBOURHOOD</p><h2 className="section-title">A good match is closer than you think.</h2><p className="section-sub">Browse the kinds of places and people you can discover on NexBooking.</p></div>
      <div className="route-category-grid">{categories.map(([name, image, text]) => <Link className="route-category-card" href="/booking" key={name}><SiteArt file={image} className="route-category-image" alt=""/><div><h3>{name}</h3><p>{text}</p><span>Explore businesses ↗</span></div></Link>)}</div>
    </section>
  </RouteShell>;
}
