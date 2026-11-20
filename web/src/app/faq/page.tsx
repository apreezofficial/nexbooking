import type { Metadata } from "next";
import LandingControls from "@/components/LandingControls";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";

export const metadata: Metadata = { title: "FAQ | NexBooking", description: "Answers to common questions about discovering businesses, bookings, payments and business tools." };

const questions = [
  ["What can I do with NexBooking?", "Discover businesses, book services, arrange consultations and manage payments. Business owners can also organise notes, daily tasks, invoices and their portfolio."],
  ["Does every business get its own space?", "Yes. Each business has its own profile, team, services, bookings and records on the shared NexBooking platform."],
  ["Can I create invoices and receipts?", "The accounts module is designed for proforma invoices, payment records and receipts, keeping your business paperwork together."],
  ["How will voice notes work?", "Voice notes and audio translation are planned to help turn spoken tasks into written lists. Availability will be shared when these features launch."],
  ["Can I showcase my work?", "Yes. Your profile brings your work and services together in a familiar visual feed, so customers can explore before booking."],
];

export default function FaqPage() {
  return <RouteShell current="FAQ">
    <RouteHero eyebrow="HERE TO HELP" title="Questions? We’ve got you." description="A few answers to help you get to know NexBooking and what you can do here." image="discover-landscape.png" cta="Explore the features" href="/features"/>
    <section className="route-content route-faq"><div className="route-section-heading"><p className="eyebrow">A FEW THINGS YOU MIGHT ASK</p><h2 className="section-title">How can we help?</h2><p className="section-sub">Choose a topic or browse the most common questions.</p></div><LandingControls mode="faq" questions={questions}/></section>
  </RouteShell>;
}
