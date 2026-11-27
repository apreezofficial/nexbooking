"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarX, Check, Info } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { useBookings, useRun } from "@/lib/dashboard/hooks";
import { formatDay, useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Banner, Button, Card, PageHeader, StateView, TextArea } from "../ui";

const SLOTS = [
  { time: "09:00 AM", status: "booked" }, { time: "10:30 AM", status: "open" }, { time: "12:00 PM", status: "break" },
  { time: "02:00 PM", status: "open" }, { time: "03:30 PM", status: "booked" }, { time: "05:00 PM", status: "open" },
] as const;

function dayStatus(day: number, dateKey: string) {
  if (new Date(`${dateKey}T12:00:00`).getDay() === 0) return "closed" as const;
  if (day % 7 === 3 || day === 14 || day === 21) return "booked" as const;
  if (day % 5 === 2) return "filling" as const;
  return "open" as const;
}

/**
 * Change the time of a booking. Within the grace window (24 hours or more before) the change is
 * confirmed at once; closer than that it goes to the studio for approval.
 */
export default function RescheduleScreen({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const today = useToday();
  const booking = useBookings().find((item) => item.code === code);
  const { run, busy } = useRun();
  const [monthOffset, setMonthOffset] = useState(0);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  if (!booking) {
    return (
      <Page>
        <PageHeader title="Reschedule" back="/dashboard/schedule" />
        <StateView icon={CalendarX} title="We couldn’t find that booking" body="Your other bookings are in Schedule." primary={{ label: "Go to schedule", href: "/dashboard/schedule" }} />
      </Page>
    );
  }

  const base = today ? new Date(`${today}T12:00:00`) : new Date();
  const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const monthName = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const key = (day: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const hoursAway = today ? (new Date(`${booking.date}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 36e5 : 48;
  const instant = hoursAway >= 24;

  const submit = async () => {
    const result = await run(
      api.bookings.reschedule(booking.code, date, time, reason),
      (outcome) => (outcome.instant
        ? `Your booking has been moved to ${formatDay(date, { weekday: "short", day: "numeric", month: "short" })} at ${time}.`
        : `Reschedule request sent to ${booking.provider}. They’ll confirm whether it works.`),
    );
    if (result) router.push(`/dashboard/bookings/${booking.code}`);
  };

  return (
    <Page>
      <PageHeader title="Reschedule" back={`/dashboard/bookings/${booking.code}`} />
      <Card tone="tint">
        <b className="d-h3">{booking.title}</b>
        <p className="d-muted">{booking.provider} · now {formatDay(booking.date, { weekday: "short", day: "numeric", month: "short" })} at {booking.time}</p>
      </Card>

      <div className={`d-notice ${instant ? "is-ok" : "is-warn"}`}>
        {instant ? <Check size={20} aria-hidden="true" /> : <Info size={20} aria-hidden="true" />}
        <p><b>Grace period:</b> {instant ? "This booking is at least 24 hours away, so a new time is confirmed straight away." : `This booking is under 24 hours away. Your request goes to ${booking.provider}, who decides based on preparation.`}</p>
      </div>

      <div className="d-calendar">
        <div className="d-between">
          <b>{monthName}</b>
          <div className="d-inline">
            <Button variant="outline" size="small" disabled={monthOffset === 0} onClick={() => setMonthOffset((value) => value - 1)} aria-label="Previous month">‹</Button>
            <Button variant="outline" size="small" onClick={() => setMonthOffset((value) => value + 1)} aria-label="Next month">›</Button>
          </div>
        </div>
        <div className="d-cal-week">{["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="d-cal-grid">
          {Array.from({ length: month.getDay() }).map((_, index) => <span key={`e${index}`} />)}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayKey = key(index + 1);
            const past = Boolean(today && dayKey <= today);
            const status = dayStatus(index + 1, dayKey);
            const off = past || status === "closed" || status === "booked";
            return (
              <button key={dayKey} type="button" disabled={off} aria-pressed={date === dayKey}
                aria-label={`${index + 1} ${monthName}, ${past ? "past date" : status === "closed" ? "closed" : status === "booked" ? "fully booked" : status === "filling" ? "nearly full" : "available"}`}
                className={`d-cal-day${date === dayKey ? " is-selected" : ""}${status === "filling" && !past ? " is-filling" : ""}`}
                onClick={() => { setDate(dayKey); setTime(""); }}>
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <h2 className="d-h3">Choose new time {!date ? <small className="d-muted">(pick a date first)</small> : null}</h2>
      <div className="d-slots">
        {SLOTS.map((slot) => (
          <button key={slot.time} type="button" disabled={!date || slot.status !== "open"} aria-pressed={time === slot.time} className={`d-slot${time === slot.time ? " is-selected" : ""}`} onClick={() => setTime(slot.time)}>
            <b>{slot.time}</b>
            <small>{slot.status === "open" ? "Available" : slot.status === "booked" ? "Booked" : "Break"}</small>
          </button>
        ))}
      </div>

      {date && time ? <Banner /> : null}
      <TextArea label="Reason for change (optional)" placeholder="Let the studio know why you need to move it" value={reason} onChange={(event) => setReason(event.target.value)} rows={2} />
      <Button size="large" block disabled={!date || !time} loading={busy} onClick={submit}>{instant ? "Confirm new time" : "Send request"}</Button>
    </Page>
  );
}
