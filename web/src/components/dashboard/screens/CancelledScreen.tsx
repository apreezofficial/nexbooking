"use client";

import { use } from "react";
import { Check } from "lucide-react";
import { useBookings } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Button, Card } from "../ui";

export default function CancelledScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const booking = useBookings().find((item) => item.code === code);
  const steps = booking?.refund
    ? ["Booking cancelled", "Refund initiated", "Back in your account · 3–5 business days"]
    : ["Booking cancelled", `${booking?.provider ?? "The studio"} will confirm any refund`];

  return (
    <Page>
      <div className="d-success">
        <span><Check size={34} strokeWidth={2.6} aria-hidden="true" /></span>
        <h1>Booking cancelled</h1>
        <p className="d-muted">{booking?.refund ? `Your refund of ${booking.refund} is on its way.` : "We’ve let the studio know."}</p>
      </div>
      <Card className="d-stack">
        {steps.map((step) => <b key={step} className="d-h3"><Check size={16} strokeWidth={3} aria-hidden="true" /> {step}</b>)}
      </Card>
      <Button size="large" block href="/dashboard/explore">Book again</Button>
      <Button variant="outline" block href="/dashboard/schedule">Back to schedule</Button>
    </Page>
  );
}
