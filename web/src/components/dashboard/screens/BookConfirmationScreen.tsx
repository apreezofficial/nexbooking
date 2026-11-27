"use client";

import Image from "next/image";
import { use } from "react";
import { Check, Download, Receipt as ReceiptIcon } from "lucide-react";
import { useBookings } from "@/lib/dashboard/hooks";
import { studioById } from "@/lib/dashboard/data";
import { formatDay } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, StateView } from "../ui";
import { FileX } from "lucide-react";

export default function BookConfirmationScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const booking = useBookings().find((item) => item.code === code);

  if (!booking) {
    return <Page><StateView icon={FileX} title="We couldn’t find that booking" body="Your other bookings are in Schedule." primary={{ label: "Go to schedule", href: "/dashboard/schedule" }} /></Page>;
  }

  const studio = studioById(booking.studioId ?? "glow-studio");
  return (
    <Page>
      <section className="d-confirm">
        <span className="d-confirm-ring"><span><Check size={34} strokeWidth={2.6} aria-hidden="true" /></span></span>
        <h1>You’re booked in</h1>
        <p className="d-muted">Demo booking confirmed. No real payment was taken.</p>
      </section>

      <article className="d-ticket is-compact" aria-label={`Booking ${booking.code}`}>
        <header className="d-ticket-hero">
          <Image src={studio.photo} alt="" fill sizes="520px" />
          <div><b>{booking.provider}</b><small>{booking.title}</small></div>
        </header>
        <span className="d-ticket-tear" aria-hidden="true" />
        <dl className="d-ticket-body">
          <div className="d-ticket-row"><dt>When</dt><dd>{formatDay(booking.date, { weekday: "short", day: "numeric", month: "short" })} · {booking.time}</dd></div>
          <div className="d-ticket-row"><dt>With</dt><dd>{booking.staff ?? "Any available"}</dd></div>
          <div className="d-ticket-row"><dt>Paid</dt><dd>{booking.total}</dd></div>
          <div className="d-ticket-row"><dt>Code</dt><dd className="d-code">{booking.code}</dd></div>
        </dl>
      </article>

      <Button size="large" block href={`/dashboard/bookings/${booking.code}`}>View booking</Button>
      {booking.receiptRef ? <Button variant="outline" block icon={ReceiptIcon} href={`/dashboard/account/invoices/${booking.receiptRef}`}>View receipt</Button> : null}
      <Button variant="text" block icon={Download} href="/dashboard">Back to home</Button>
    </Page>
  );
}
