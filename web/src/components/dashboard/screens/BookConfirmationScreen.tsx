"use client";

import { use } from "react";
import { Check } from "lucide-react";
import { useBookings } from "@/lib/dashboard/hooks";
import { formatDay } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, Card, Row } from "../ui";

export default function BookConfirmationScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const booking = useBookings().find((item) => item.code === code);

  if (!booking) {
    return (
      <Page>
        <h1 className="d-h2">We couldn’t find that booking</h1>
        <Button href="/dashboard/schedule">Go to schedule</Button>
      </Page>
    );
  }

  return (
    <Page>
      <div className="d-success">
        <span><Check size={34} strokeWidth={2.6} aria-hidden="true" /></span>
        <h1>Booking confirmed</h1>
        <p className="d-muted">Your demo booking is confirmed. No real payment was taken.</p>
      </div>
      <Card>
        <Row label="Studio" value={booking.provider} />
        <Row label="Service" value={booking.title} />
        <Row label="When" value={`${formatDay(booking.date, { weekday: "short", day: "numeric", month: "short" })} · ${booking.time}`} />
        <Row label="Paid with" value={booking.paidWith ?? "—"} />
        <Row label="Total paid" value={booking.total} strong />
      </Card>
      <Button size="large" block href={`/dashboard/bookings/${booking.code}`}>View booking</Button>
      {booking.receiptRef ? <Button variant="outline" block href={`/dashboard/account/invoices/${booking.receiptRef}`}>View receipt</Button> : null}
      <Button variant="text" block href="/dashboard">Back to home</Button>
    </Page>
  );
}
