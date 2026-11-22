"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import SiteArt from "@/components/SiteArt";
import Icon from "@/components/Icon";
import type { servicePreviews } from "@/lib/services";
import { addBooking, clearDraft, parseDraft, parseSession, saveDraft, useDraftRaw, useSessionRaw, type Draft, type Session } from "@/lib/session";

type ServiceItem = (typeof servicePreviews)[number];
type Provider = { id: string; name: string; business: string; category: string; image: string; avatar: string; bio: string };
type Props = { service: ServiceItem; provider: Provider; price: number };
type Step = "customize" | "checkout" | "confirmed";
type Method = "card" | "transfer" | "in_person";

const naira = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
const todaySnapshot = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const noopSubscribe = () => () => {};

function dayStatus(day: number, dateKey: string) {
  const dow = new Date(`${dateKey}T12:00:00`).getDay();
  if (dow === 0) return "closed" as const;
  if (day % 7 === 3 || day === 14 || day === 21) return "booked" as const;
  if (day % 5 === 2) return "filling" as const;
  return "open" as const;
}
const SLOTS = [
  { time: "09:00 AM", status: "booked" }, { time: "10:30 AM", status: "open" }, { time: "12:00 PM", status: "break" },
  { time: "02:00 PM", status: "open" }, { time: "03:30 PM", status: "booked" }, { time: "05:00 PM", status: "open" },
] as const;
const METHODS: { id: Method; icon: string; title: string; note: string }[] = [
  { id: "card", icon: "card", title: "Debit or credit card", note: "Confirmed instantly" },
  { id: "transfer", icon: "bank", title: "Bank transfer", note: "Reference sent after booking" },
  { id: "in_person", icon: "pin", title: "Pay at the appointment", note: "Pay the vendor directly" },
];

export default function SinglePageBooking(props: Props) {
  const today = useSyncExternalStore(noopSubscribe, todaySnapshot, () => "");
  const sessionRaw = useSessionRaw();
  const draftRaw = useDraftRaw();
  if (!today || sessionRaw === null || draftRaw === null) return <div className="booking-skeleton"><div className="shimmer sk-bar" /><div className="sk-grid"><div className="shimmer sk-main" /><div className="shimmer sk-side" /></div></div>;
  const draft = parseDraft(draftRaw);
  return <BookingFlow {...props} today={today} session={parseSession(sessionRaw)} draft={draft && draft.serviceId === props.service.id ? draft : null} />;
}

function BookingFlow({ service, provider, price, today, session, draft }: Props & { today: string; session: Session | null; draft: Draft | null }) {
  const [step, setStep] = useState<Step>(draft && draft.date && draft.time && session ? "checkout" : "customize");
  const [monthOffset, setMonthOffset] = useState(0);
  const [date, setDate] = useState(draft?.date ?? "");
  const [time, setTime] = useState(draft?.time ?? "");
  const [guests, setGuests] = useState(draft?.guests ?? 1);
  const [notes, setNotes] = useState(draft?.notes ?? "");
  const [method, setMethod] = useState<Method>((draft?.method as Method) ?? "card");
  const [tried, setTried] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [code, setCode] = useState("");

  const base = new Date(`${today}T12:00:00`);
  const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const key = (d: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const total = naira(price * guests);
  const nextPath = `/book/${service.id}`;
  const methodList = METHODS;

  const missing = [
    !date && { icon: "calendar", title: "Pick a date", why: "The vendor needs to know which day works for you. Dates with a dot are booked, closed or nearly full." },
    !time && { icon: "clock", title: "Pick a time", why: date ? "Choose one of the open times for that day." : "Time slots depend on the day, so choose a date first." },
  ].filter(Boolean) as { icon: string; title: string; why: string }[];

  const currentDraft = (): Draft => ({ serviceId: service.id, date, time, guests, notes, method });

  function goCheckout() {
    setTried(true);
    if (missing.length) return;
    saveDraft(currentDraft());
    setStep("checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const phone = String(f.get("phone") || "").trim();
    const next: Record<string, string> = {};
    if (name.length < 1) next.name = "Enter your full name so the vendor knows who to expect.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address. Your confirmation is sent there.";
    if (phone.replace(/\D/g, "").length < 7) next.phone = "Add a phone number the vendor can reach if plans change.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setPending(true);
    setTimeout(() => {
      const c = `NB-${service.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      addBooking({ code: c, title: service.title, provider: provider.business, date, time, guests: String(guests), total });
      clearDraft();
      setCode(c);
      setPending(false);
      setStep("confirmed");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  }

  const steps: [Step, string][] = [["customize", "Date & time"], ["checkout", "Details & pay"], ["confirmed", "Confirmed"]];
  const stepIndex = steps.findIndex(s => s[0] === step);

  return (
    <div className="single-booking-container">
      <div className="booking-top-bar">
        <Link href={`/services/${service.category}`} className="booking-back-link"><Icon name="back" />Back to {service.categoryName}</Link>
        <div className="booking-provider-pill"><SiteArt file={provider.avatar} className="provider-pill-avatar" /><span>{provider.business}</span></div>
      </div>

      <div className="single-booking-grid">
        <div className="booking-interactive-card">
          <ol className="bk-steps" aria-label="Booking progress">
            {steps.map(([id, label], i) => (
              <li key={id} className={`bk-step ${i === stepIndex ? "is-active" : ""} ${i < stepIndex ? "is-done" : ""}`}>
                <span className="bk-step-dot">{i < stepIndex ? <Icon name="check" /> : i + 1}</span>{label}
              </li>
            ))}
          </ol>

          {step === "customize" && (
            <div className="booking-step-pane">
              <div className="pane-header"><h2>Choose your date and time</h2><p>Dots show what is not available.</p></div>

              <div className="availability-legend-bar" aria-label="Legend">
                <span className="legend-item"><i className="legend-dot dot-booked" />Booked</span>
                <span className="legend-item"><i className="legend-dot dot-closed" />Vendor closed</span>
                <span className="legend-item"><i className="legend-dot dot-filling" />Nearly full</span>
              </div>

              <div className={`calendar-card ${tried && !date ? "has-error" : ""}`}>
                <div className="calendar-month-header">
                  <strong>{monthName}</strong>
                  <div className="calendar-nav-buttons">
                    <button type="button" disabled={monthOffset === 0} onClick={() => setMonthOffset(m => m - 1)} aria-label="Previous month"><Icon name="back" /></button>
                    <button type="button" onClick={() => setMonthOffset(m => m + 1)} aria-label="Next month"><Icon name="arrow" /></button>
                  </div>
                </div>
                <div className="calendar-weekday-row">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}</div>
                <div className="calendar-days-grid">
                  {Array.from({ length: month.getDay() }).map((_, i) => <span key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const k = key(i + 1);
                    const past = k < today;
                    const st = dayStatus(i + 1, k);
                    const off = past || st === "closed" || st === "booked";
                    const label = past ? "Past date" : st === "closed" ? "Vendor closed" : st === "booked" ? "Fully booked" : st === "filling" ? "Nearly full" : "Available";
                    return (
                      <button key={k} type="button" disabled={off} title={`${i + 1} ${monthName}: ${label}`} aria-label={`${i + 1} ${monthName}, ${label}`} aria-pressed={date === k}
                        className={`day-btn ${date === k ? "selected" : ""} ${past ? "day-past" : ""} ${!past ? `day-${st}` : ""}`}
                        onClick={() => { setDate(k); setTime(""); }}>
                        <span className="day-number">{i + 1}</span>
                        {!past && st !== "open" && <i className={`day-indicator ind-${st}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="time-slots-section">
                <div className="section-header-flex"><span className="section-label">Time</span>{date && <span className="date-context-tag">{new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}</span>}</div>
                <div className={`slots-grid ${!date ? "is-locked" : ""} ${tried && date && !time ? "has-error" : ""}`}>
                  {SLOTS.map(s => (
                    <button key={s.time} type="button" disabled={!date || s.status !== "open"} aria-pressed={time === s.time}
                      className={`time-slot-btn ${time === s.time ? "selected" : ""} slot-${s.status}`} onClick={() => setTime(s.time)}>
                      <strong className="slot-time-text">{s.time}</strong>
                      <span className="slot-badge">{s.status === "booked" ? "Booked" : s.status === "break" ? "Vendor break" : "Open"}</span>
                    </button>
                  ))}
                </div>
                {!date && <p className="field-hint"><Icon name="info" />Choose a date to unlock times.</p>}
              </div>

              <div className="party-size-section">
                <span className="section-label">People</span>
                <div className="guest-selector">{[1, 2, 3, 4].map(n => <button key={n} type="button" className={`guest-btn ${guests === n ? "selected" : ""}`} aria-pressed={guests === n} onClick={() => setGuests(n)}>{n}</button>)}</div>
              </div>

              <div className="notes-section">
                <label className="section-label" htmlFor="bk-notes">Notes for the vendor <em>(optional)</em></label>
                <textarea id="bk-notes" className="booking-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Allergies, preferences, anything useful…" />
              </div>

              {tried && missing.length > 0 && (
                <div className="bk-alert" role="alert"><Icon name="alert" />
                  <div><strong>Almost there, we still need:</strong>
                    <ul>{missing.map(m => <li key={m.title}><Icon name={m.icon} /><span><b>{m.title}.</b> {m.why}</span></li>)}</ul></div>
                </div>
              )}

              <button type="button" className="btn btn-gradient continue-booking-btn" onClick={goCheckout}>Continue · {total}<Icon name="arrow" /></button>
              <p className="field-hint center"><Icon name="lock" />You will need to be logged in to confirm. We save your choices so you can pick up where you left off.</p>
            </div>
          )}

          {step === "checkout" && (
            <div className="booking-step-pane">
              <div className="pane-header"><h2>Your details</h2><p>{date} at {time} · {guests} {guests === 1 ? "person" : "people"}</p></div>

              {!session ? (
                <div className="bk-gate">
                  <span className="bk-gate-icon"><Icon name="lock" /></span>
                  <h3>Log in to finish booking</h3>
                  <p>Bookings are tied to your account so you can manage, reschedule and receive receipts. Your date, time and notes are saved, so you will come straight back here after logging in.</p>
                  <div className="bk-gate-actions">
                    <Link className="btn btn-gradient" href={`/login?next=${encodeURIComponent(nextPath)}`} onClick={() => saveDraft(currentDraft())}><Icon name="save" />Save &amp; log in</Link>
                    <Link className="btn btn-ghost" href={`/signup?next=${encodeURIComponent(nextPath)}`} onClick={() => saveDraft(currentDraft())}>Create account</Link>
                  </div>
                  <button type="button" className="provider-back-button" onClick={() => setStep("customize")}>Change date or time</button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate className="checkout-contact-form">
                  <div className="form-row">
                    <Field id="bk-name" label="Full name" icon="user" error={errors.name}><input id="bk-name" name="name" autoComplete="name" defaultValue={session.name} aria-invalid={!!errors.name} placeholder="Your full name" /></Field>
                    <Field id="bk-email" label="Email" icon="chat" error={errors.email}><input id="bk-email" name="email" type="email" autoComplete="email" defaultValue={session.email} aria-invalid={!!errors.email} placeholder="you@example.com" /></Field>
                  </div>
                  <Field id="bk-phone" label="Phone number" icon="phone" error={errors.phone} hint="Only shared with this vendor."><input id="bk-phone" name="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} placeholder="+234 801 234 5678" /></Field>

                  <fieldset className="payment-cards-grid"><legend className="section-label">How would you like to pay?</legend>
                    {methodList.map(m => (
                      <button key={m.id} type="button" aria-pressed={method === m.id} className={`payment-method-card ${method === m.id ? "selected" : ""}`} onClick={() => setMethod(m.id)}>
                        <span className="method-icon"><Icon name={m.icon} /></span>
                        <span className="method-info"><strong>{m.title}</strong><small>{m.note}</small></span>
                        <span className="method-radio">{method === m.id && <Icon name="check" />}</span>
                      </button>
                    ))}
                  </fieldset>

                  <p className="demo-notice-banner"><Icon name="info" /><span><strong>Demo checkout.</strong> Nothing is charged.</span></p>
                  <div className="pane-footer-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setStep("customize")}><Icon name="back" />Back</button>
                    <button type="submit" className="btn btn-gradient finish-booking-btn" disabled={pending}>{pending ? <><span className="auth-spinner" />Booking…</> : <>Confirm booking · {total}</>}</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {step === "confirmed" && (
            <div className="booking-step-pane confirmation-pane">
              <div className="confirmation-badge"><Icon name="check" /></div>
              <h2>You are booked</h2>
              <p className="confirmation-sub">{provider.business} will see your request.</p>
              <div className="booking-summary-ticket">
                <div className="ticket-header"><span>Booking code</span><strong>{code}</strong></div>
                <div className="ticket-body">
                  <div className="ticket-row"><span>Service</span><strong>{service.title}</strong></div>
                  <div className="ticket-row"><span>When</span><strong>{date} · {time}</strong></div>
                  <div className="ticket-row"><span>People</span><strong>{guests}</strong></div>
                  <div className="ticket-row"><span>Total</span><strong>{total}</strong></div>
                </div>
              </div>
              <div className="confirmed-actions">
                <Link href="/dashboard" className="btn btn-gradient"><Icon name="grid" />Go to dashboard</Link>
                <Link href="/services" className="btn btn-ghost">Explore more</Link>
              </div>
            </div>
          )}
        </div>

        <aside className="booking-sidebar">
          <div className="service-showcase-card">
            <div className="service-image-header"><SiteArt file={service.image} className="showcase-art" /><span className="showcase-category-tag">{service.categoryName}</span></div>
            <div className="showcase-details">
              <h3>{service.title}</h3>
              <p className="showcase-provider-name">{provider.business}</p>
              <p className="showcase-bio">{provider.bio}</p>
              <div className="price-highlight-row">
                <div><span className="price-label">Per person</span><div className="price-value">{naira(price)}</div></div>
                <span className="duration-pill"><Icon name="timer" />60 min</span>
              </div>
              <ul className="showcase-perks">
                <li><Icon name="check" />Instant confirmation</li>
                <li><Icon name="shield" />Secure, account-based booking</li>
                <li><Icon name="calendar" />Reschedule from your dashboard</li>
              </ul>
              {date && time && (
                <div className="selected-time-summary"><Icon name="calendar" /><div><strong>{date}</strong><small>{time} · {guests} {guests === 1 ? "person" : "people"} · {total}</small></div></div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ id, label, icon, error, hint, children }: { id: string; label: string; icon: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={`form-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap"><Icon name={icon} />{children}</div>
      {error ? <p className="field-error" role="alert"><Icon name="alert" />{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}
