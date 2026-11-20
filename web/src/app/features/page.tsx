import Link from "next/link";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Features for bookings, payments and notes",
  description: "Explore the tools that keep work moving: appointments, payments, daily notes and tasks, proforma invoices, receipts and business portfolios.",
  path: "/features",
});

const features = [
  { title: "Stay on top of your day", text: "Capture notes, plan tasks and keep the next thing you need to do close at hand.", image: "feature-notes-scene.png", label: "NOTES & TASKS" },
  { title: "Find a service with confidence", text: "Explore real portfolios, compare services and meet a business before you book.", image: "discover-salon.png", label: "DISCOVERY" },
  { title: "Keep every booking together", text: "Appointments, consultations, payment records and receipts stay connected.", image: "feature-booking-scene.png", label: "BOOKING & PAYMENTS" },
];

export default function FeaturesPage() {
  return <RouteShell current="Features">
    <RouteHero eyebrow="A LITTLE MORE ROOM IN YOUR DAY" title="The everyday tools that keep things moving." description="Discover, book and manage the details of work and life in one thoughtful place." image="feature-notes-scene.png" cta="See how booking works"/>
    <section className="route-content"><div className="route-section-heading"><p className="eyebrow">MADE TO WORK TOGETHER</p><h2 className="section-title">One place for the details.</h2><p className="section-sub">From the first search to the last receipt, the pieces stay connected.</p></div>
      <div className="route-feature-grid">{features.map((feature) => <article className="route-feature-card" key={feature.title}><SiteArt file={feature.image} className="route-feature-image" alt=""/><div><small>{feature.label}</small><h3>{feature.title}</h3><p>{feature.text}</p></div></article>)}</div>
      <div className="route-callout"><div><p className="eyebrow">BUILT AROUND YOUR ROUTINE</p><h2>Less switching.<br/>More getting on with it.</h2></div><Link className="btn btn-gradient" href="/discover">Explore NexBooking</Link></div>
    </section>
  </RouteShell>;
}
