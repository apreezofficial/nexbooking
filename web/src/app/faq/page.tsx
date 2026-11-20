import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LandingControls from "@/components/LandingControls";
import RouteHero from "@/components/RouteHero";
import RouteShell from "@/components/RouteShell";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "FAQ and help",
  description: "Answers to common questions about discovering businesses, booking services, payments, invoices, notes and your own business space.",
  path: "/faq",
});

const questions = [
  ["What can I do with EdeBooking?", "Discover businesses, book services, arrange consultations and manage payments. Business owners can also organise notes, daily tasks, invoices and their portfolio."],
  ["Does every business get its own space?", "Yes. Each business has its own profile, team, services, bookings and records on the shared EdeBooking platform."],
  ["Can I create invoices and receipts?", "The accounts module is designed for proforma invoices, payment records and receipts, keeping your business paperwork together."],
  ["How will voice notes work?", "Voice notes and audio translation are planned to help turn spoken tasks into written lists. Availability will be shared when these features launch."],
  ["Can I showcase my work?", "Yes. Your profile brings your work and services together in a familiar visual feed, so customers can explore before booking."],
];

export default function FaqPage() {
  return <RouteShell current="FAQ">
    <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) }} />
    <RouteHero eyebrow="HERE TO HELP" title="Questions? We’ve got you." description="A few answers to help you get to know EdeBooking and what you can do here." image="discover-landscape.png" cta="Explore the features" href="/features"/>
    <section className="route-content route-faq"><div className="route-section-heading"><p className="eyebrow">A FEW THINGS YOU MIGHT ASK</p><h2 className="section-title">How can we help?</h2><p className="section-sub">Choose a topic or browse the most common questions.</p></div><LandingControls mode="faq" questions={questions}/>
      <div className="route-callout"><div><p className="eyebrow">STILL WONDERING?</p><h2>Can’t find what you’re looking for?</h2></div><Link className="btn btn-gradient" href="/contact">Contact us</Link></div>
    </section>
  </RouteShell>;
}
