"use client";

import { CreditCard, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { naira, paymentMethodOptions, studioById } from "@/lib/dashboard/data";
import { useFlow, useRun } from "@/lib/dashboard/hooks";
import type { PaymentMethodId } from "@/lib/dashboard/types";
import { formatDay } from "@/lib/dashboard/store";
import { useEffect } from "react";
import type { Quote } from "@/lib/dashboard/api";
import { Page } from "../DashboardShell";
import { Button, Card, Field, PageHeader, RadioRow, Steps } from "../ui";

const groupCard = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

export default function BookPaymentScreen() {
  const router = useRouter();
  const flow = useFlow();
  const { run, busy } = useRun();
  const studio = studioById(flow.value.studioId);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const { studioId, serviceId, promo, date, time, method } = flow.value;

  useEffect(() => {
    let cancelled = false;
    api.booking.quote(studioId, serviceId, promo).then((next) => { if (!cancelled) setQuote(next); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [studioId, serviceId, promo]);

  if (!date) {
    return (
      <Page>
        <PageHeader title="Payment" back="/dashboard/book/date" />
        <Card tone="tint"><p className="d-muted">Choose a date and time first.</p></Card>
        <Button href="/dashboard/book/date">Choose a time</Button>
      </Page>
    );
  }

  const pay = async () => {
    const created = await run(api.booking.create(flow.value, { holder, number, expiry, cvc }), "Demo payment successful. No real money was charged.");
    if (created) router.push(`/dashboard/book/confirmation/${created.booking.code}`);
  };

  return (
    <Page>
      <PageHeader title="Payment" back="/dashboard/book/review" />
      <Steps n={4} label="Pay" />
      <Card tone="dark" className="d-due">
        <p>Amount due · {studio.name}</p>
        <b>{quote ? naira(quote.total) : "…"}</b>
        <small>{quote?.service.name} · {formatDay(date, { weekday: "short", day: "numeric", month: "short" })} · {time}</small>
      </Card>

      <h2 className="d-h2">Pay with</h2>
      {paymentMethodOptions.map((option) => (
        <RadioRow key={option.id} icon={CreditCard} selected={method === option.id} title={option.label} note={option.note} onSelect={() => flow.set({ ...flow.value, method: option.id as PaymentMethodId })} />
      ))}

      {method === "card" ? (
        <div className="d-stack">
          <Field label="Name on card" placeholder="Ada Example" autoComplete="cc-name" value={holder} onChange={(event) => setHolder(event.target.value)} />
          <Field label="Card number" placeholder="4242 4242 4242 4242" inputMode="numeric" autoComplete="cc-number" value={number} onChange={(event) => setNumber(groupCard(event.target.value))} maxLength={19} />
          <div className="d-grid-2">
            <Field label="Expiry" placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" value={expiry} onChange={(event) => setExpiry(formatExpiry(event.target.value))} maxLength={5} />
            <Field label="CVC" placeholder="123" inputMode="numeric" autoComplete="cc-csc" type="password" value={cvc} onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} />
          </div>
        </div>
      ) : (
        <Card tone="tint">
          <b>{method === "transfer" ? "Demo transfer details" : "Demo wallet checkout"}</b>
          <p className="d-muted">{method === "transfer" ? "EdeBooking · 0123456789 · Demo Bank" : "Continue to simulate wallet authorization."}</p>
        </Card>
      )}

      <Card className="d-media"><Lock size={20} strokeWidth={1.8} aria-hidden="true" /><small className="d-muted">Demo checkout only. No real payment will be taken.</small></Card>
      <Button size="large" block loading={busy} onClick={pay}>Pay {quote ? naira(quote.total) : ""}</Button>
    </Page>
  );
}
