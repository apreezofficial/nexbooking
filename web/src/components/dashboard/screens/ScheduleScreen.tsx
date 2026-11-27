"use client";

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { useBookings, useNotes } from "@/lib/dashboard/hooks";
import { useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Badge, Button, Chips, Segmented, StateView, Title, Toggle } from "../ui";

const monthOf = (iso: string) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : "");
const dayOf = (iso: string) => (iso ? String(new Date(`${iso}T12:00:00`).getDate()) : "");

export default function ScheduleScreen() {
  const today = useToday();
  const bookings = useBookings();
  const notes = useNotes();
  const [view, setView] = useState("Bookings");
  const [when, setWhen] = useState("Upcoming");

  const shown = bookings.filter((item) => {
    if (when === "Cancelled") return item.status === "Cancelled";
    if (item.status === "Cancelled") return false;
    return when === "Past" ? Boolean(today) && item.date < today : !today || item.date >= today;
  }).sort((a, b) => (when === "Past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  return (
    <Page wide>
      <Title>Schedule</Title>
      <Segmented items={["Bookings", "Notes"]} value={view} onChange={setView} />

      {view === "Bookings" ? (
        <>
          <Chips items={["Upcoming", "Past", "Cancelled"]} value={when} onChange={setWhen} />
          {shown.length === 0 ? (
            <StateView icon={CalendarDays} title={when === "Upcoming" ? "No upcoming bookings" : `No ${when.toLowerCase()} bookings`} body="When you book a studio it appears here." primary={{ label: "Explore studios", href: "/dashboard/explore" }} />
          ) : (
            <div className="d-bookinglist">
              {shown.map((item) => (
                <Link key={item.code} href={`/dashboard/bookings/${item.code}`} className="d-booking">
                  <span className="d-datetile"><small>{monthOf(item.date)}</small><b>{dayOf(item.date)}</b></span>
                  <span className="d-booking-text">
                    <b>{item.title}</b>
                    <small>{item.provider} · {item.time}</small>
                    <Badge status={item.status === "Cancelled" ? "Cancelled" : item.rescheduleStatus === "pending_vendor" ? "Rescheduled" : item.status ?? "Confirmed"} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Button icon={Plus} href="/dashboard/notes/new">New note</Button>
          {notes.length === 0 ? (
            <StateView icon={Plus} title="No tasks yet" body="Add a task, or tap the microphone and say it. We’ll write it down." primary={{ label: "Add a task", href: "/dashboard/notes/new" }} />
          ) : (
            <div className="d-stack">
              {notes.map((note) => (
                <div key={note.id} className="d-box d-note">
                  <div className="d-between">
                    <div>
                      <b className={note.done ? "is-done" : undefined}>{note.task}</b>
                      <small>{note.date} · {note.time}{note.repeat !== "Never" ? ` · ${note.repeat}` : ""}</small>
                    </div>
                    <Toggle checked={note.done} onChange={() => void api.notes.toggle(note.id)} label={`Mark ${note.task} done`} />
                  </div>
                  {note.details ? <small>{note.details}</small> : null}
                  <Button variant="text" size="small" onClick={() => void api.notes.remove(note.id)}>Delete</Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Page>
  );
}
