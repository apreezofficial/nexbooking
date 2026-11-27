"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarX } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { cancelReasons } from "@/lib/dashboard/data";
import { useBookings, useRun } from "@/lib/dashboard/hooks";
import { useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, Card, Chips, Field, PageHeader, StateView } from "../ui";

export default function CancelScreen({ params }: { params: Promise<{ code: string }> }) {
  return <CancelForm code={use(params).code} />;
}

export function CancelForm({ code, onDone }: { code: string; onDone?: () => void }) {
  const router = useRouter();
  const booking = useBookings().find((item) => item.code === code);
  const today = useToday();
  const { run, busy } = useRun();
  const [reason, setReason] = useState(cancelReasons[0]);
  const [note, setNote] = useState("");

  if (!booking) {
    return (
      <Page>
        <PageHeader title="Cancel booking" back="/dashboard/schedule" />
        <StateView icon={CalendarX} title="We couldn’t find that booking" body="Your other bookings are in Schedule." primary={{ label: "Go to schedule", href: "/dashboard/schedule" }} />
      </Page>
    );
  }

  const hours = today ? (new Date(`${booking.date}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 36e5 : 48;
  const full = hours >= 24;

  return (
    <Page>
      {!onDone && <PageHeader title="Cancel booking" back={`/dashboard/bookings/${booking.code}`} />}
      <Card>
        <b className="d-h3">{booking.title}</b>
        <p className="d-muted">{booking.provider} · {booking.time}</p>
      </Card>
      {full ? (
        <Card tone="success" className="d-refund">
          <b>You’ll get a full refund</b>
          <span>{booking.total}</span>
          <p>To {booking.paidWith ?? "your original payment method"} · 3–5 business days</p>
        </Card>
      ) : (
        <Card tone="tint"><b>This booking is within 24 hours</b><p className="d-muted">Refunds for late cancellations are decided by {booking.provider}. We’ll tell you what they decide.</p></Card>
      )}
      <h2 className="d-h2">Why are you cancelling?</h2>
      <Chips items={cancelReasons} value={reason} onChange={setReason} />
      <Field placeholder="Add a note (optional)" value={note} onChange={(event) => setNote(event.target.value)} />
      {onDone ? <Button variant="outline" block onClick={onDone}>Keep booking</Button> : <Button variant="outline" block href={`/dashboard/bookings/${booking.code}`}>Keep booking</Button>}
      <Button variant="dark" block loading={busy} onClick={async () => {
        const result = await run(api.bookings.cancel(booking.code, reason, note));
        if (result && onDone) onDone();
        else if (result) router.push(`/dashboard/bookings/${booking.code}/cancelled`);
      }}>Cancel booking</Button>
    </Page>
  );
}
