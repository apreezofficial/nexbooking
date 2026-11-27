"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { CalendarClock } from "lucide-react";
import { dayParts, naira, servicesByStudio, studioById } from "@/lib/dashboard/data";
import { useFlow } from "@/lib/dashboard/hooks";
import { addDays, formatDay, useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Banner, Button, PageHeader, Steps } from "../ui";

/** Sundays are closed, and a few slots are already taken, so the picker shows real availability states. */
const slotTaken = (date: string, index: number) => (new Date(`${date}T12:00:00`).getDate() + index) % 7 === 3;

export default function BookDateScreen() {
  const router = useRouter();
  const today = useToday();
  const flow = useFlow();
  const studio = studioById(flow.value.studioId);
  const service = (servicesByStudio[studio.id] ?? []).find((item) => item.id === flow.value.serviceId) ?? servicesByStudio[studio.id]?.[0];
  const days = today ? Array.from({ length: 14 }, (_, index) => addDays(today, index + 1)) : [];
  const selectedDay = flow.value.date;
  const closed = (date: string) => new Date(`${date}T12:00:00`).getDay() === 0;
  const ready = Boolean(selectedDay && flow.value.time);
  let slotIndex = 0;

  return (
    <Page wide>
      <PageHeader title="Date & time" back="/dashboard/book/service" />
      <Steps n={2} label="Date & time" />

      <div className="d-bookhead">
        <span className="d-bookhead-photo"><Image src={studio.photo} alt="" fill sizes="64px" /></span>
        <div>
          <b>{service?.name}</b>
          <small>{studio.name} · with {flow.value.staff} · {service?.minutes} min</small>
        </div>
        <b className="d-bookhead-price">{service ? naira(service.price) : ""}</b>
      </div>

      <section className="d-section">
        <h2 className="d-h2">Pick a day</h2>
        <div className="d-daystrip" role="group" aria-label="Choose a date">
          {days.map((date) => (
            <button key={date} type="button" disabled={closed(date)} aria-pressed={date === selectedDay} className={`d-dayitem${date === selectedDay ? " is-active" : ""}`} onClick={() => flow.set({ ...flow.value, date })}>
              <small>{formatDay(date, { weekday: "short" })}</small>
              <b>{new Date(`${date}T12:00:00`).getDate()}</b>
              {closed(date) ? <i className="d-closed">Closed</i> : null}
            </button>
          ))}
        </div>
      </section>

      {selectedDay ? (
        <section className="d-section">
          <h2 className="d-h2">Choose a time</h2>
          {dayParts.map((group) => (
            <div key={group.part} className="d-timegroup">
              <h3 className="d-overline">{group.part}</h3>
              <div className="d-slots">
                {group.times.map((time) => {
                  const taken = slotTaken(selectedDay, slotIndex++);
                  return (
                    <button key={time} type="button" disabled={taken} aria-pressed={flow.value.time === time} className={`d-slot${flow.value.time === time ? " is-selected" : ""}`} onClick={() => flow.set({ ...flow.value, time })}>
                      <b>{time}</b>
                      <small>{taken ? "Taken" : "Free"}</small>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <div className="d-hint"><CalendarClock size={22} strokeWidth={1.8} aria-hidden="true" /><p>Choose a day to see the times that are free.</p></div>
      )}

      {ready ? <Banner /> : null}
      <Button size="large" block disabled={!ready} onClick={() => router.push("/dashboard/book/review")}>Continue</Button>
    </Page>
  );
}
