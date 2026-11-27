"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { formatDay, addDays } from "@/lib/dashboard/store";
import { studioById } from "@/lib/dashboard/data";
import { useBookings, useNotes } from "@/lib/dashboard/hooks";
import { useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Button, Chips, Segmented, Skeleton, StateView, Title, Toggle } from "../ui";

export default function ScheduleScreen() {
  const today = useToday();
  const bookings = useBookings();
  const notes = useNotes();
  const [view, setView] = useState("Bookings");
  const [when, setWhen] = useState("Upcoming");
  const [day, setDay] = useState("");

  const [monthOffset, setMonthOffset] = useState(0);
  const base = today ? new Date(`${today}T12:00:00`) : new Date(2000, 0, 1);
  const month = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const first = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
  const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const bookedDays = new Set(bookings.filter(item => when === "Cancelled" ? item.status === "Cancelled" : item.status !== "Cancelled").map(item => item.date));

  const shown = bookings
    .filter((item) => {
      if (day && item.date !== day) return false;
      if (when === "Cancelled") return item.status === "Cancelled";
      if (item.status === "Cancelled") return false;
      return when === "Past" ? Boolean(today) && item.date < today : !today || item.date >= today;
    })
    .sort((a, b) => (when === "Past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  const grouped = shown.reduce<Record<string, typeof shown>>((acc, item) => {
    (acc[item.date] ??= []).push(item);
    return acc;
  }, {});

  return (
    <Page wide>
      <Title sub="Your bookings and tasks, day by day.">Schedule</Title>
      <Segmented items={["Bookings", "Notes"]} value={view} onChange={setView} />

      {view === "Bookings" ? (
        <>
          <Chips items={["Upcoming", "Past", "Cancelled"]} value={when} onChange={value => { setWhen(value); setDay(""); setMonthOffset(0); }} />
          {today && <section className="appointment-calendar d-schedule-calendar" aria-label="Booking calendar">
            <div className="calendar-heading">
              <strong aria-live="polite">{formatDay(first, { month: "long", year: "numeric" })}</strong>
              <div>
                <button type="button" aria-label="Previous month" onClick={() => setMonthOffset(value => value - 1)}>‹</button>
                <button type="button" aria-label="Next month" onClick={() => setMonthOffset(value => value + 1)}>›</button>
              </div>
            </div>
            <div className="calendar-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(name => <small key={name}>{name}</small>)}
              {Array.from({ length: month.getDay() }, (_, i) => <span key={i} />)}
              {Array.from({ length: dayCount }, (_, i) => {
                const iso = addDays(first, i);
                const hasBooking = bookedDays.has(iso);
                return <button key={iso} type="button" aria-current={iso === today ? "date" : undefined}
                  aria-label={`${formatDay(iso, { dateStyle: "full" })}${hasBooking ? ", has bookings" : ""}`}
                  disabled={when === "Upcoming" ? iso < today : when === "Past" && iso >= today}
                  aria-pressed={iso === day} onClick={() => setDay(iso === day ? "" : iso)}>
                  {i + 1}{hasBooking && <span className="d-calendar-dot" aria-hidden="true" />}
                </button>;
              })}
            </div>
            {day && <Button variant="text" onClick={() => setDay("")}>Show all dates</Button>}
          </section>}

          {!today ? <Skeleton height={140} /> : null}
          {today && shown.length === 0 ? (
            <StateView icon={CalendarDays} title={day ? "No bookings on this date" : when === "Upcoming" ? "Nothing booked yet" : `No ${when.toLowerCase()} bookings`} body="When you book a studio it lands here, on the right day." primary={{ label: "Explore studios", href: "/dashboard/explore" }} />
          ) : null}

          {Object.entries(grouped).map(([iso, items]) => (
            <section key={iso} className="d-day-group">
              <header className="d-day-head"><b>{formatDay(iso, { weekday: "long", day: "numeric", month: "long" })}</b><span>{items.length} {items.length === 1 ? "booking" : "bookings"}</span></header>
              <ol className="d-timeline">
                {items.map((item) => {
                  const studio = studioById(item.studioId ?? "glow-studio");
                  const status = item.rescheduleStatus === "pending_vendor" ? "Rescheduled" : item.status ?? "Confirmed";
                  return (
                    <li key={item.code}>
                      <Link href={`/dashboard/bookings/${item.code}`} className="d-tcard">
                        <span className="d-tcard-time">{item.time}</span>
                        <span className="d-tcard-photo"><Image src={studio.photo} alt="" fill sizes="72px" /></span>
                        <span className="d-tcard-text">
                          <b>{item.title}</b>
                          <small>{item.provider}{item.staff ? ` · with ${item.staff}` : ""}</small>
                        </span>
                        <Badge status={status} small />
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </>
      ) : (
        <>
          <Button icon={Plus} href="/dashboard/notes/new">New note</Button>
          {notes.length === 0 ? (
            <StateView icon={Plus} title="No tasks yet" body="Add a task, or tap the microphone and say it. We’ll write it down." primary={{ label: "Add a task", href: "/dashboard/notes/new" }} />
          ) : (
            <ul className="d-notes" role="list">
              {notes.map((note) => (
                <li key={note.id} className={`d-note${note.done ? " is-done" : ""}`}>
                  <div className="d-note-main">
                    <b>{note.task}</b>
                    <small>{note.date} · {note.time}{note.repeat !== "Never" ? ` · ${note.repeat}` : ""}</small>
                    {note.details ? <p>{note.details}</p> : null}
                  </div>
                  <Toggle checked={note.done} onChange={() => void api.notes.toggle(note.id)} label={`Mark ${note.task} done`} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Page>
  );
}
