"use client";

import Image from "next/image";
import { use } from "react";
import { CalendarX, Check, Clock, MessageSquare, Star, Video } from "lucide-react";
import { studioById } from "@/lib/dashboard/data";
import { useBookings } from "@/lib/dashboard/hooks";
import { formatDay } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Button, PageHeader, StateView } from "../ui";

export default function BookingDetailScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const booking = useBookings().find((item) => item.code === code);

  if (!booking) {
    return (
      <Page>
        <PageHeader title="Booking detail" back="/dashboard/schedule" />
        <StateView icon={CalendarX} title="We couldn’t find that booking" body="It may have been removed. Your other bookings are in Schedule." primary={{ label: "Go to schedule", href: "/dashboard/schedule" }} />
      </Page>
    );
  }

  const studio = studioById(booking.studioId ?? "glow-studio");
  const cancelled = booking.status === "Cancelled";
  const rescheduling = booking.rescheduleStatus === "pending_vendor";
  const confirmed = !cancelled && booking.status !== "Pending";
  const consultation = /consult/i.test(booking.title);
  const when = formatDay(booking.date, { weekday: "long", day: "numeric", month: "long" });
  const steps = [
    { label: "Booked", done: true },
    { label: "Confirmed", done: confirmed },
    { label: "Appointment", done: confirmed && !cancelled },
  ];

  return (
    <Page wide>
      <PageHeader title="Booking" back="/dashboard/schedule" />

      <section className="d-bhero">
        <Image src={studio.photo} alt="" fill priority sizes="(max-width: 1100px) 100vw, 900px" />
        <div className="d-bhero-copy">
          <Badge status={cancelled ? "Cancelled" : rescheduling ? "Rescheduled" : booking.status === "Pending" ? "Pending" : "Confirmed"} label={cancelled ? "Cancelled" : rescheduling ? "Reschedule pending" : booking.status === "Pending" ? "Pending approval" : "Confirmed"} />
          <h1>{booking.title}</h1>
          <p>{booking.provider}{booking.staff ? ` · with ${booking.staff}` : ""}</p>
        </div>
      </section>

      <div className="d-bgrid">
        <div className="d-stack">
          <ol className="d-steps-track" aria-label="Booking progress">
            {steps.map((step) => (
              <li key={step.label} className={step.done ? "is-done" : ""}>
                <span>{step.done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : null}</span>
                <small>{step.label}</small>
              </li>
            ))}
          </ol>

          <section className="d-fact-grid">
            <div className="d-fact"><Clock size={18} strokeWidth={1.8} aria-hidden="true" /><small>When</small><b>{when}</b><span>{booking.time}</span></div>
            <div className="d-fact"><Star size={18} strokeWidth={1.8} aria-hidden="true" /><small>Venue</small><b>{booking.venue ?? "In person"}</b><span>{studio.area}</span></div>
            <div className="d-fact"><Check size={18} strokeWidth={1.8} aria-hidden="true" /><small>Total</small><b>{booking.total}</b><span>{booking.paidWith ?? "Pay at the studio"}</span></div>
          </section>

          {rescheduling ? (
            <div className="d-notice is-warn"><p>You asked to move this to {formatDay(booking.rescheduleRequestedDate ?? "", { weekday: "short", day: "numeric", month: "short" })} at {booking.rescheduleRequestedTime}. {booking.provider} will confirm shortly.</p></div>
          ) : null}
          {cancelled ? <div className="d-notice is-warn"><p>Cancelled. Refund: {booking.refund || "reviewed by the studio"}.</p></div> : null}
        </div>

        <aside className="d-stack">
          {!cancelled ? (
            <>
              <Button size="large" block variant="dark" href={`/dashboard/bookings/${booking.code}/reschedule`}>Reschedule</Button>
              {consultation ? <Button size="large" block icon={Video} href={`/dashboard/consultation/${booking.code}`}>Join consultation</Button> : null}
              <Button block variant="outline" icon={MessageSquare} href={`/dashboard/inbox/${booking.studioId ?? "glow-studio"}`}>Message studio</Button>
              <Button block variant="text" href={`/dashboard/bookings/${booking.code}/cancel`}>Cancel booking</Button>
            </>
          ) : (
            <Button block href="/dashboard/explore">Book again</Button>
          )}
          <Button block variant="text" href={`/dashboard/bookings/${booking.code}/review`}>Write a review</Button>
        </aside>
      </div>
    </Page>
  );
}
