"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

function useEscape(onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);
}

export function ProviderInquiry({ providerName }: { providerName: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  useEscape(() => setOpen(false), open);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return <>
    <button type="button" className="btn btn-gradient" onClick={() => { setOpen(true); setSent(false); }}>Ask about this provider</button>
    {open && <div className="provider-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="provider-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
        <button type="button" className="provider-modal-close" aria-label="Close inquiry" onClick={() => setOpen(false)}>×</button>
        {!sent ? <>
          <p className="eyebrow">START A CONVERSATION</p>
          <h2 id="inquiry-title">Ask {providerName}</h2>
          <p className="provider-modal-note">This demo form shows the inquiry flow. Messages aren’t delivered until provider messaging is connected.</p>
          <form className="provider-modal-form" onSubmit={submit}>
            <label>Your name<input name="name" autoComplete="name" required placeholder="Your name" /></label>
            <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
            <label>Your message<textarea name="message" required rows={4} placeholder={`What would you like to ask ${providerName}?`} /></label>
            <button className="btn btn-gradient" type="submit">Preview inquiry</button>
          </form>
        </> : <div className="provider-action-success">
          <span aria-hidden="true">✓</span><h2 id="inquiry-title">Inquiry preview ready</h2>
          <p>Your message hasn’t been sent. Provider messaging will be available when the platform is connected.</p>
          <button className="btn btn-gradient" type="button" onClick={() => setOpen(false)}>Done</button>
        </div>}
      </section>
    </div>}
  </>;
}

export function ProviderBookingAction({ providerName, serviceTitle, price }: { providerName: string; serviceTitle: string; price: number }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "payment" | "processing" | "success">("details");
  const [minimumDate, setMinimumDate] = useState("");
  const [month, setMonth] = useState(0);
  const [chosenDate, setChosenDate] = useState("");
  const [chosenTime, setChosenTime] = useState("");
  const [people, setPeople] = useState("1");
  const [method, setMethod] = useState("Card");
  const [booking, setBooking] = useState({ date: "", time: "", people: "1", method: "Card (demo)" });
  useEscape(() => setOpen(false), open);
  const total = price * Number(step === "details" ? people : booking.people);
  const formattedTotal = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(total);

  function continueToPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBooking({
      date: String(data.get("date")),
      time: String(data.get("time")),
      people: String(data.get("people")),
      method: String(data.get("method")),
    });
    setStep("payment");
  }

  function simulatePayment() {
    setStep("processing");
    window.setTimeout(() => setStep("success"), 900);
  }

  function openBooking() {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    setMinimumDate(today.toISOString().slice(0, 10));
    setMonth(0); setChosenDate(""); setChosenTime(""); setPeople("1"); setMethod("Card");
    setOpen(true);
    setStep("details");
  }

  function close() {
    setOpen(false);
    setStep("details");
  }

  const base = minimumDate ? new Date(`${minimumDate}T12:00:00`) : new Date(2026, 0, 1);
  const displayed = new Date(base.getFullYear(), base.getMonth() + month, 1);
  const days = new Date(displayed.getFullYear(), displayed.getMonth() + 1, 0).getDate();
  const blanks = displayed.getDay();
  const dateKey = (day: number) => `${displayed.getFullYear()}-${String(displayed.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return <>
    <button type="button" className="btn btn-gradient" onClick={openBooking}>Plan an appointment</button>
    {open && <div className="provider-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="provider-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" aria-busy={step === "processing"}>
        <button type="button" className="provider-modal-close" aria-label="Close booking" onClick={close}>×</button>
        {step === "details" && <>
          <p className="eyebrow">BOOK WITH {providerName.toUpperCase()} · STEP 1 OF 2</p>
          <h2 id="booking-title">Choose your appointment</h2>
          <p className="provider-modal-note">{serviceTitle} · Demo price {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price)} per person</p>
          <form className="provider-modal-form" onSubmit={continueToPayment}>
            <div className="appointment-calendar"><div className="calendar-heading"><strong>{displayed.toLocaleDateString("en", { month: "long", year: "numeric" })}</strong><div><button type="button" disabled={month === 0} onClick={() => setMonth(month - 1)} aria-label="Previous month">‹</button><button type="button" onClick={() => setMonth(month + 1)} aria-label="Next month">›</button></div></div><div className="calendar-grid">{["S","M","T","W","T","F","S"].map((day, i) => <small key={i}>{day}</small>)}{Array.from({length: blanks}, (_, i) => <span key={`blank-${i}`}/>)}{Array.from({length: days}, (_, i) => { const date = dateKey(i + 1); return <button key={date} type="button" disabled={date < minimumDate} aria-pressed={chosenDate === date} onClick={() => setChosenDate(date)}>{i + 1}</button>; })}</div><input type="hidden" name="date" value={chosenDate}/></div>
            <fieldset className="appointment-times"><legend>Choose a time</legend><div>{["9:00 AM", "10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM"].map(time => <button type="button" key={time} aria-pressed={chosenTime === time} onClick={() => setChosenTime(time)}>{time}</button>)}</div><input type="hidden" name="time" value={chosenTime}/></fieldset>
            <label>People<select name="people" value={people} onChange={event => setPeople(event.target.value)}><option value="1">1 person</option><option value="2">2 people</option><option value="3">3 people</option><option value="4">4 people</option></select></label>
            <fieldset className="payment-methods"><legend>Choose how to pay</legend>{[{name:"Card", icon:"▤", description:"Visa, Mastercard and other cards"},{name:"Bank transfer", icon:"⇄", description:"Pay from your bank"},{name:"Pay in person", icon:"◷", description:"Pay at your appointment"}].map(option => <label key={option.name} className={method === option.name ? "payment-option selected" : "payment-option"}><input type="radio" name="method" value={option.name} checked={method === option.name} onChange={() => setMethod(option.name)}/><span className="payment-option-icon" aria-hidden="true">{option.icon}</span><span><strong>{option.name}</strong><small>{option.description}</small></span><span className="payment-option-check" aria-hidden="true">{method === option.name ? "✓" : ""}</span></label>)}</fieldset>
            <p className="provider-demo-payment">Demo checkout · no real charge or card details collected.</p>
            <button className="btn btn-gradient" type="submit" disabled={!chosenDate || !chosenTime}>Continue · {formattedTotal}</button>
          </form>
        </>}
        {step === "payment" && <div className="provider-payment-review">
          <p className="eyebrow">REVIEW YOUR BOOKING · STEP 2 OF 2</p>
          <h2 id="booking-title">Ready to confirm?</h2>
          <dl><div><dt>Service</dt><dd>{serviceTitle}</dd></div><div><dt>Provider</dt><dd>{providerName}</dd></div><div><dt>Date &amp; time</dt><dd>{booking.date} · {booking.time}</dd></div><div><dt>People</dt><dd>{booking.people}</dd></div><div><dt>Payment</dt><dd>{booking.method}</dd></div><div className="provider-total"><dt>Total</dt><dd>{formattedTotal}</dd></div></dl>
          <div className="payment-preview"><strong>{booking.method === "Card" ? "Card payment" : booking.method === "Bank transfer" ? "Bank transfer" : "Pay at your appointment"}</strong><p>{booking.method === "Card" ? "A secure card form will appear here when payments are connected. Please don’t enter card details in this preview." : booking.method === "Bank transfer" ? "Transfer instructions will appear here when payments are connected." : "You’ll pay the provider in person when real bookings are available."}</p><span>Demo checkout · no payment or booking will be made</span></div>
          <button className="btn btn-gradient" type="button" onClick={simulatePayment}>{booking.method === "Pay in person" ? "Preview booking" : `Simulate ${booking.method.toLowerCase()} payment · ${formattedTotal}`}</button>
          <button className="provider-back-button" type="button" onClick={() => setStep("details")}>Back to appointment details</button>
        </div>}
        {step === "processing" && <div className="provider-action-success" role="status"><span className="provider-spinner"/><h2 id="booking-title">Preparing your preview</h2><p>Just a moment…</p></div>}
        {step === "success" && <div className="provider-action-success" role="status"><span aria-hidden="true">✓</span><h2 id="booking-title">Booking preview ready</h2><p>Your {serviceTitle.toLowerCase()} preview is set for {booking.date} at {booking.time}. No payment was charged and the provider hasn’t been notified.</p><button className="btn btn-gradient" type="button" onClick={close}>Done</button></div>}
      </section>
    </div>}
  </>;
}
