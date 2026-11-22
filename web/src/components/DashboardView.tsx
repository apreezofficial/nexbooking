"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import Icon from "./Icon";
import {
  parseBookings,
  parseDraft,
  parseSession,
  signOut,
  updateBooking,
  useBookingsRaw,
  useDraftRaw,
  useSessionRaw,
  type BookingItem,
} from "@/lib/session";

const noopSubscribe = () => () => {};
function todaySnapshot() {
  return typeof window === "undefined" ? "" : new Date().toISOString().slice(0, 10);
}

function dayStatus(day: number, dateKey: string) {
  const dow = new Date(`${dateKey}T12:00:00`).getDay();
  if (dow === 0) return "closed" as const;
  if (day % 7 === 3 || day === 14 || day === 21) return "booked" as const;
  if (day % 5 === 2) return "filling" as const;
  return "open" as const;
}

const SLOTS = [
  { time: "09:00 AM", status: "booked" },
  { time: "10:30 AM", status: "open" },
  { time: "12:00 PM", status: "break" },
  { time: "02:00 PM", status: "open" },
  { time: "03:30 PM", status: "booked" },
  { time: "05:00 PM", status: "open" },
] as const;

export default function DashboardView() {
  const today = useSyncExternalStore(noopSubscribe, todaySnapshot, () => "");
  const sessionRaw = useSessionRaw();
  const session = parseSession(sessionRaw);
  const draft = parseDraft(useDraftRaw());
  const bookings = parseBookings(useBookingsRaw());

  // Reschedule modal state
  const [activeBooking, setActiveBooking] = useState<BookingItem | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  const base = today ? new Date(`${today}T12:00:00`) : new Date(2026, 10, 21);
  const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const key = (d: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  if (sessionRaw === null) return <section className="dash-wrap"><div className="dash-skeleton shimmer" /></section>;
  if (!session) return (
    <section className="dash-wrap">
      <div className="dash-card dash-empty">
        <Icon name="lock" />
        <h1>Log in to see your dashboard</h1>
        <p>Your bookings and saved details appear here once you are logged in.</p>
        <Link href="/login?next=/dashboard" className="btn btn-gradient">Log in</Link>
      </div>
    </section>
  );

  // Check if booking is within grace window (e.g. at least 24 hours in the future)
  function canRescheduleInstantly(bookingDate: string) {
    if (!bookingDate) return false;
    const now = new Date();
    const scheduled = new Date(`${bookingDate}T12:00:00`);
    const diffHours = (scheduled.getTime() - now.getTime()) / (1000 * 60 * 60);
    // Instant reschedule if > 24 hours away
    return diffHours >= 24;
  }

  function handleRescheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeBooking || !newDate || !newTime) return;

    const isWithinGraceTime = canRescheduleInstantly(activeBooking.date);

    if (isWithinGraceTime) {
      // Automatic confirmation within grace time
      updateBooking(activeBooking.code, {
        date: newDate,
        time: newTime,
        rescheduleStatus: "approved",
      });
      setSentNotice(`Your booking has been rescheduled to ${newDate} at ${newTime} (Within grace time).`);
    } else {
      // Requires vendor approval if past grace time or materials may have been prepared
      updateBooking(activeBooking.code, {
        rescheduleStatus: "pending_vendor",
        rescheduleRequestedDate: newDate,
        rescheduleRequestedTime: newTime,
      });
      setSentNotice(
        `Reschedule request sent to ${activeBooking.provider}. Because this is outside the standard grace window, the vendor will review whether materials have been prepared and decide to approve.`
      );
    }

    setActiveBooking(null);
    setNewDate("");
    setNewTime("");
    setRescheduleReason("");
  }

  return (
    <section className="dash-wrap">
      <header className="dash-head">
        <div>
          <p className="eyebrow">YOUR DASHBOARD</p>
          <h1>Hi, {session.name}</h1>
          <p className="dash-sub">{session.email}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={signOut}>
          <Icon name="logout" />Log out
        </button>
      </header>

      {sentNotice && (
        <div className="dash-alert-notice" role="status">
          <Icon name="check" />
          <span>{sentNotice}</span>
          <button type="button" onClick={() => setSentNotice(null)}>×</button>
        </div>
      )}

      {draft && (
        <div className="dash-card dash-draft">
          <Icon name="save" />
          <div>
            <strong>Unfinished booking saved</strong>
            <p>
              {draft.date || "No date yet"}
              {draft.time ? ` at ${draft.time}` : ""} · {draft.guests} {draft.guests === 1 ? "person" : "people"}
            </p>
          </div>
          <Link href={`/book/${draft.serviceId}`} className="btn btn-gradient">
            Continue<Icon name="arrow" />
          </Link>
        </div>
      )}

      <h2 className="dash-h2">Your bookings</h2>
      {bookings.length === 0 ? (
        <div className="dash-card dash-empty">
          <Icon name="calendar" />
          <p>No bookings yet.</p>
          <Link href="/services" className="btn btn-gradient">Explore services</Link>
        </div>
      ) : (
        <div className="dash-list">
          {bookings.map(b => {
            const hasPendingRequest = b.rescheduleStatus === "pending_vendor";
            const isApproved = b.rescheduleStatus === "approved";

            return (
              <article className="dash-card dash-booking" key={b.code}>
                <div className="dash-booking-info">
                  <strong>{b.title}</strong>
                  <p>{b.provider}</p>
                  {hasPendingRequest && (
                    <span className="reschedule-pending-pill">
                      <Icon name="timer" /> Reschedule pending vendor review ({b.rescheduleRequestedDate} at {b.rescheduleRequestedTime})
                    </span>
                  )}
                  {isApproved && (
                    <span className="reschedule-approved-pill">
                      <Icon name="check" /> Reschedule confirmed
                    </span>
                  )}
                </div>

                <div className="dash-booking-meta">
                  <span className="dash-chip"><Icon name="calendar" />{b.date} · {b.time}</span>
                  <span className="dash-chip"><Icon name="users" />{b.guests}</span>
                  <span className="dash-code">{b.code}</span>
                </div>

                <div className="dash-booking-actions">
                  <button
                    type="button"
                    className="btn btn-ghost reschedule-btn"
                    onClick={() => {
                      setActiveBooking(b);
                      setMonthOffset(0);
                      setNewDate("");
                      setNewTime("");
                      setRescheduleReason("");
                    }}
                  >
                    <Icon name="calendar" /> Reschedule
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal / Bottom Sheet with Calendar */}
      {activeBooking && (
        <div
          className="dash-modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setActiveBooking(null);
          }}
        >
          <div className="dash-modal-sheet" role="dialog" aria-labelledby="reschedule-modal-title">
            <header className="dash-modal-header">
              <div>
                <p className="eyebrow">RESCHEDULE BOOKING</p>
                <h3 id="reschedule-modal-title">{activeBooking.title}</h3>
                <small>With {activeBooking.provider}</small>
              </div>
              <button
                type="button"
                className="dash-modal-close"
                onClick={() => setActiveBooking(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </header>

            <form onSubmit={handleRescheduleSubmit} className="reschedule-form">
              <div className={`reschedule-notice-box ${canRescheduleInstantly(activeBooking.date) ? "notice-grace-ok" : "notice-grace-warn"}`}>
                <Icon name={canRescheduleInstantly(activeBooking.date) ? "check" : "info"} />
                <p>
                  <strong>Grace period policy:</strong>{" "}
                  {canRescheduleInstantly(activeBooking.date)
                    ? `Your current booking (${activeBooking.date}) is at least 24 hours in the future. You can pick a new date and time with instant confirmation.`
                    : `Your current booking (${activeBooking.date}) is under 24 hours away. A reschedule request will be sent to ${activeBooking.provider} who will decide based on supplies and prep.`}
                </p>
              </div>

              <div className="availability-legend-bar" aria-label="Legend">
                <span className="legend-item"><i className="legend-dot dot-booked" />Booked</span>
                <span className="legend-item"><i className="legend-dot dot-closed" />Closed</span>
                <span className="legend-item"><i className="legend-dot dot-filling" />Nearly full</span>
              </div>

              <div className="calendar-card">
                <div className="calendar-month-header">
                  <strong>{monthName}</strong>
                  <div className="calendar-nav-buttons">
                    <button type="button" disabled={monthOffset === 0} onClick={() => setMonthOffset(m => m - 1)} aria-label="Previous month">
                      <Icon name="back" />
                    </button>
                    <button type="button" onClick={() => setMonthOffset(m => m + 1)} aria-label="Next month">
                      <Icon name="arrow" />
                    </button>
                  </div>
                </div>
                <div className="calendar-weekday-row">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}
                </div>
                <div className="calendar-days-grid">
                  {Array.from({ length: month.getDay() }).map((_, i) => <span key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const k = key(i + 1);
                    const past = Boolean(today && k < today);
                    const st = dayStatus(i + 1, k);
                    const off = past || st === "closed" || st === "booked";
                    const label = past ? "Past date" : st === "closed" ? "Vendor closed" : st === "booked" ? "Fully booked" : st === "filling" ? "Nearly full" : "Available";
                    return (
                      <button
                        key={k}
                        type="button"
                        disabled={off}
                        title={`${i + 1} ${monthName}: ${label}`}
                        aria-label={`${i + 1} ${monthName}, ${label}`}
                        aria-pressed={newDate === k}
                        className={`day-btn ${newDate === k ? "selected" : ""} ${past ? "day-past" : ""} ${!past ? `day-${st}` : ""}`}
                        onClick={() => { setNewDate(k); setNewTime(""); }}
                      >
                        <span className="day-number">{i + 1}</span>
                        {!past && st !== "open" && <i className={`day-indicator ind-${st}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-field" style={{ marginTop: 12 }}>
                <label className="section-label" style={{ display: "block", marginBottom: 6 }}>
                  Choose New Time {!newDate && <em>(select a date above first)</em>}
                </label>
                <div className={`slots-grid ${!newDate ? "is-locked" : ""}`}>
                  {SLOTS.map(s => {
                    const disabled = !newDate || s.status !== "open";
                    const isSelected = newTime === s.time;
                    return (
                      <button
                        key={s.time}
                        type="button"
                        disabled={disabled}
                        className={`time-slot-btn slot-${s.status} ${isSelected ? "selected" : ""}`}
                        onClick={() => setNewTime(s.time)}
                      >
                        <span className="slot-time-text">{s.time}</span>
                        <span className="slot-badge">{s.status === "open" ? "Available" : s.status === "booked" ? "Booked" : "Break"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {newDate && newTime && (
                <div className="reschedule-selected-pill">
                  <Icon name="calendar" />
                  <span>New appointment: <strong>{newDate}</strong> at <strong>{newTime}</strong></span>
                </div>
              )}

              <div className="form-field" style={{ marginTop: 10 }}>
                <label htmlFor="resched-reason">Reason for change (optional)</label>
                <textarea
                  id="resched-reason"
                  rows={2}
                  placeholder="Let the vendor know why you need to shift the time..."
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                />
              </div>

              <div className="dash-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setActiveBooking(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={!newDate || !newTime} className="btn btn-gradient">
                  {canRescheduleInstantly(activeBooking.date) ? "Confirm Reschedule (Instant)" : "Submit Reschedule Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

