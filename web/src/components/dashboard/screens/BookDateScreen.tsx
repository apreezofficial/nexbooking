"use client";

import { useRouter } from "next/navigation";
import { dayParts, naira, servicesByStudio, studioById } from "@/lib/dashboard/data";
import { useFlow } from "@/lib/dashboard/hooks";
import { addDays, formatDay, useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Banner, Button, Card, Chip, PageHeader, Steps } from "../ui";

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
  const month = selectedDay ? formatDay(selectedDay, { month: "long", year: "numeric" }) : today ? formatDay(today, { month: "long", year: "numeric" }) : "";
  const ready = Boolean(selectedDay && flow.value.time);

  return (
    <Page>
      <PageHeader title="Date & time" back="/dashboard/book/service" />
      <Steps n={2} label="Date & time" />
      <div className="d-card d-card-tint">
        <b className="d-h3">{service?.name}</b>
        <p className="d-muted">{flow.value.staff} · {service?.minutes} min · {service ? naira(service.price) : ""}</p>
      </div>

      <h2 className="d-h2">{month}</h2>
      <div className="d-days" role="group" aria-label="Choose a date">
        {days.map((date) => (
          <button key={date} type="button" disabled={closed(date)} aria-pressed={date === selectedDay} className={`d-day${date === selectedDay ? " is-selected" : ""}`} onClick={() => flow.set({ ...flow.value, date })}>
            <small>{formatDay(date, { weekday: "short" })}</small>
            <b>{new Date(`${date}T12:00:00`).getDate()}</b>
            {closed(date) ? <i>Closed</i> : null}
          </button>
        ))}
      </div>

      {selectedDay ? (
        dayParts.map((group) => (
          <div key={group.part} className="d-stack">
            <h3 className="d-h3 d-muted">{group.part}</h3>
            <div className="d-chips">
              {group.times.map((time, index) => (
                <Chip key={time} label={time} selected={flow.value.time === time} disabled={slotTaken(selectedDay, dayParts.indexOf(group) * 3 + index)} onClick={() => flow.set({ ...flow.value, time })} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card tone="tint"><p className="d-muted">Choose a date to see the times that are free.</p></Card>
      )}

      {ready ? <Banner /> : null}
      <Button size="large" block disabled={!ready} onClick={() => router.push("/dashboard/book/review")}>Continue</Button>
    </Page>
  );
}
