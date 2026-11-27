"use client";

import { use } from "react";
import { CalendarX } from "lucide-react";
import { useBookings } from "@/lib/dashboard/hooks";
import { formatDay } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Banner, Button, Card, PageHeader, Row, StateView } from "../ui";

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

  const cancelled = booking.status === "Cancelled";
  const pending = booking.status === "Pending";
  const label = cancelled ? "Cancelled" : booking.rescheduleStatus === "pending_vendor" ? "Reschedule pending" : pending ? "Pending approval" : "Confirmed";
  const consultation = /consult/i.test(booking.title);

  return (
    <Page>
      <PageHeader title="Booking detail" back="/dashboard/schedule" />
      <Badge label={label} status={cancelled ? "Cancelled" : pending || booking.rescheduleStatus === "pending_vendor" ? "Pending" : "Confirmed"} />
      {!cancelled && pending ? <Banner /> : null}
      {booking.rescheduleStatus === "pending_vendor" ? (
        <Card tone="tint"><p className="d-muted">You asked to move this to {formatDay(booking.rescheduleRequestedDate ?? "", { weekday: "short", day: "numeric", month: "short" })} at {booking.rescheduleRequestedTime}. {booking.provider} will confirm shortly.</p></Card>
      ) : null}
      <Card>
        <Row label="Service" value={booking.title} />
        <Row label="Studio" value={booking.provider} />
        <Row label="Staff" value={booking.staff ?? "Any"} />
        <Row label="Date" value={formatDay(booking.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} />
        <Row label="Time" value={booking.time} />
        <Row label="Type" value={booking.venue ?? "In person"} />
        <Row label="Total" value={booking.total} />
        {cancelled ? <Row label="Refund" value={booking.refund || "Reviewed by the studio"} /> : null}
      </Card>

      {!cancelled ? (
        <>
          <div className="d-grid-2">
            <Button variant="outline" href={`/dashboard/bookings/${booking.code}/reschedule`}>Reschedule</Button>
            <Button variant="outline" href={`/dashboard/bookings/${booking.code}/cancel`}>Cancel booking</Button>
          </div>
          {consultation ? <Button size="large" block href={`/dashboard/consultation/${booking.code}`}>Join consultation</Button> : null}
          <Button block href={`/dashboard/inbox/${booking.studioId ?? "glow-studio"}`}>Message studio</Button>
        </>
      ) : (
        <Button block href="/dashboard/explore">Book again</Button>
      )}
      <Button variant="text" block href={`/dashboard/bookings/${booking.code}/review`}>Submit review</Button>
    </Page>
  );
}
