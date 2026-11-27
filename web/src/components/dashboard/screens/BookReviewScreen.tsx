"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, type Quote } from "@/lib/dashboard/api";
import { naira, studioById } from "@/lib/dashboard/data";
import { useFlow, useReceipts, useRun } from "@/lib/dashboard/hooks";
import { formatDay } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, Card, Field, Overline, PageHeader, Row, Steps } from "../ui";

export default function BookReviewScreen() {
  const router = useRouter();
  const flow = useFlow();
  const receipts = useReceipts();
  const { run, busy } = useRun();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [promo, setPromo] = useState(flow.value.promo);
  const studio = studioById(flow.value.studioId);
  const { studioId, serviceId, promo: appliedPromo, date, time } = flow.value;

  // Price the booking from the server's quote, not from local arithmetic.
  useEffect(() => {
    let cancelled = false;
    api.booking.quote(studioId, serviceId, appliedPromo).then((next) => { if (!cancelled) setQuote(next); }).catch(() => { if (!cancelled) setQuote(null); });
    return () => { cancelled = true; };
  }, [studioId, serviceId, appliedPromo]);

  if (!date) {
    return (
      <Page>
        <PageHeader title="Review & confirm" back="/dashboard/book/date" />
        <Card tone="tint"><p className="d-muted">Choose a date and time first.</p></Card>
        <Button href="/dashboard/book/date">Choose a time</Button>
      </Page>
    );
  }

  const reference = `PF-2026-${String(418 + receipts.length + 1).padStart(4, "0")}`;

  return (
    <Page>
      <PageHeader title="Review & confirm" back="/dashboard/book/date" />
      <Steps n={3} label="Review" />
      <Card className="d-stack">
        <Overline>Proforma invoice · {reference}</Overline>
        <h2 className="d-h3">{studio.name}</h2>
        <div>
          <Row label="Service" value={quote?.service.name ?? "…"} />
          <Row label="Staff" value={flow.value.staff} />
          <Row label="Date" value={formatDay(date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })} />
          <Row label="Time" value={time} />
          <Row label="Venue" value="In person" />
          {quote?.promoApplied ? <Row label="Promo" value={`−${naira(quote.discount)}`} /> : null}
          <Row label="Subtotal" value={quote ? naira(quote.subtotal) : "…"} />
          <Row label="VAT (7.5%)" value={quote ? naira(quote.vat) : "…"} />
          <Row label="Total" value={quote ? naira(quote.total) : "…"} strong />
        </div>
      </Card>
      <Card><p className="d-muted">Free cancellation up to 24 hours before. Reschedule once at no cost.</p></Card>
      <div className="d-promo">
        <Field label="Promo code" placeholder="Add promo code" value={promo} onChange={(event) => setPromo(event.target.value)} />
        <Button variant="outline" loading={busy} onClick={async () => {
          const applied = await run(api.booking.quote(studioId, serviceId, promo), (next) => (next.promoApplied ? "Promo code applied." : "No promo code added."));
          if (applied) flow.set({ ...flow.value, promo });
        }}>Apply</Button>
      </div>
      <Button size="large" block onClick={() => router.push("/dashboard/book/payment")}>Proceed to payment</Button>
    </Page>
  );
}
