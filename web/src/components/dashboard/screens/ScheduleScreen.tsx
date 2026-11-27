"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/dashboard/api";
import { formatDay, addDays } from "@/lib/dashboard/store";
import { studioById } from "@/lib/dashboard/data";
import { useBookings, useNotes } from "@/lib/dashboard/hooks";
import { useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Button, Chips, Segmented, Skeleton, StateView, Title, Toggle } from "../ui";

const weekday = (iso: string) => formatDay(iso, { weekday: "short" });

export default function ScheduleScreen() {
  const today = useToday();
  const bookings = useBookings();
  const notes = useNotes();
  const [view, setView] = useState("Bookings");
  const [when, setWhen] = useState("Upcoming");
  const [day, setDay] = useState("");

  const days = useMemo(() => (today ? Array.from({ length: 10 }, (_, i) => addDays(today, i)) : []), [today]);
  const bookedDays = new Set(bookings.filter((item) => item.status !== "Cancelled").map((item) => item.date));

  const shown = bookings
    .filter((item) => {
      if (when === "Cancelled") return item.status === "Cancelled";
      if (item.status === "Cancelled") return false;
      if (day && item.date !== day) return false;
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
          <div className="d-daystrip" role="list" aria-label="Next ten days">
            <button type="button" role="listitem" className={`d-dayitem${day === "" ? " is-active" : ""}`} onClick={() => setDay("")}>
              <small>All</small><b>{shown.length}</b>
            </button>
            {days.map((iso) => (
              <button key={iso} type="button" role="listitem" className={`d-dayitem${day === iso ? " is-active" : ""}`} onClick={() => setDay(day === iso ? "" : iso)} aria-current={day === iso ? "date" : undefined}>
                <small>{weekday(iso)}</small>
                <b>{new Date(`${iso}T12:00:00`).getDate()}</b>
                {bookedDays.has(iso) ? <i className="d-dot-on" aria-label="Has a booking" /> : null}
              </button>
            ))}
          </div>

          <Chips items={["Upcoming", "Past", "Cancelled"]} value={when} onChange={setWhen} />

          {!today ? <Skeleton height={140} /> : null}
          {today && shown.length === 0 ? (
            <StateView icon={CalendarDays} title={when === "Upcoming" ? "Nothing booked yet" : `No ${when.toLowerCase()} bookings`} body="When you book a studio it lands here, on the right day." primary={{ label: "Explore studios", href: "/dashboard/explore" }} />
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
