import Link from "next/link";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Business profiles and booking tools",
  description: "Give your business its own EdeBooking space: a profile and portfolio, appointment bookings, notes and tasks, invoices and receipts in one flow.",
  path: "/business",
});

const tools = [
  ["A profile that feels like you", "Bring your services, team and portfolio into one welcoming business space.", "business-studio.png"],
  ["Appointments with less admin", "Keep customer bookings organised and make it easier for people to find a time.", "business-salon.png"],
  ["Your work in good company", "Help new customers understand what you do through photos, services and clear details.", "business-photography.png"],
];

export default function BusinessPage() {
  return <RouteShell current="For business">
    <RouteHero eyebrow="YOUR BUSINESS, YOUR SPACE" title="Make room for the work you love." description="Showcase your craft, connect with customers and keep the everyday details of your business together." image="business-studio.png" cta="Register your business" href="/business/signup"/>
    <section className="route-content"><div className="route-section-heading"><p className="eyebrow">MADE FOR YOUR BUSINESS</p><h2 className="section-title">A welcoming space to grow from.</h2><p className="section-sub">EdeBooking gives customers a clear way to discover what you do and gives you one place to manage the details.</p></div>
      <div className="route-feature-grid">{tools.map(([title, text, image]) => <article className="route-feature-card" key={title}><SiteArt file={image} className="route-feature-image" alt=""/><div><small>YOUR NEXBOOKING SPACE</small><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      <div className="route-callout"><div><p className="eyebrow">KEEP THE DETAILS CLOSE</p><h2>Appointments, notes and records in one flow.</h2></div><Link className="btn btn-gradient" href="/business/signup">Register your business</Link></div>
    </section>
  </RouteShell>;
}
