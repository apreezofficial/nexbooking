import type { Metadata } from "next";
import BookingSearch from "@/components/BookingSearch";
import RouteShell from "@/components/RouteShell";
import SiteArt from "@/components/SiteArt";

export const metadata: Metadata = { title: "Booking | NexBooking", description: "Search services, consultations, appointments, events, classes and spaces." };

export default function BookingPage() {
  return <RouteShell current="Booking">
    <section className="hero route-booking-hero">
      <SiteArt file="hero-scene.png" className="hero-scene" alt=""/>
      <div className="hero-sky" aria-hidden="true"/>
      <div className="hero-copy"><p className="eyebrow">A GOOD PLAN STARTS HERE</p><h1 className="hero-title">Find a service.<br/>Make it yours.</h1><p className="hero-sub">Search local businesses and find a time that works for you.</p></div>
      <BookingSearch/>
    </section>
    <section className="route-content"><div className="route-section-heading"><p className="eyebrow">FROM SEARCH TO CONFIRMATION</p><h2 className="section-title">Booking, made easy to follow.</h2><p className="section-sub">Explore a business, choose a service and keep the details together from start to finish.</p></div>
      <div className="route-steps"><article><span>01</span><h3>Explore the work</h3><p>See business profiles, services and portfolios before choosing.</p></article><article><span>02</span><h3>Choose a time</h3><p>Pick a service and appointment time that works for your day.</p></article><article><span>03</span><h3>Keep it together</h3><p>Review booking details, payment information and receipts in one place.</p></article></div>
    </section>
  </RouteShell>;
}
