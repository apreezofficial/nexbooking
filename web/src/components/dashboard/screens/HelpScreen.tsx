"use client";

import { CalendarDays, CircleHelp, CreditCard, MessageCircle, Search, UserRound } from "lucide-react";
import { useState } from "react";
import { faqs, helpTopics } from "@/lib/dashboard/data";
import { Page } from "../DashboardShell";
import { Button, Field, PageHeader } from "../ui";

const icons = { calendar: CalendarDays, card: CreditCard, chat: MessageCircle, user: UserRound } as const;

export default function HelpScreen() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(faqs[0].q);
  const lowered = query.trim().toLowerCase();
  const shown = faqs.filter((item) => {
    if (!lowered) return true;
    if (lowered === "bookings") return /book|reschedul/i.test(item.q);
    if (lowered === "payments & refunds") return /refund|pay/i.test(item.q);
    if (lowered === "consultations") return /video|consult/i.test(item.q);
    if (lowered === "account") return /voice|account/i.test(item.q);
    return item.q.toLowerCase().includes(lowered) || item.a.toLowerCase().includes(lowered);
  });

  return (
    <Page>
      <PageHeader title="Help & support" back="/dashboard/account" />
      <Field leading={Search} placeholder="Search help articles" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="d-topics">
        {helpTopics.map((topic) => {
          const Icon = icons[topic.icon as keyof typeof icons] ?? CircleHelp;
          return (
            <button key={topic.label} type="button" className="d-box" onClick={() => setQuery(topic.label)}>
              <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <small>{topic.label}</small>
            </button>
          );
        })}
      </div>
      <h2 className="d-h3">Popular questions</h2>
      {shown.length === 0 ? <p className="d-muted">No articles match “{query}”. Try the chat below.</p> : null}
      {shown.map((item) => (
        <button key={item.q} type="button" className="d-box" aria-expanded={open === item.q} onClick={() => setOpen(open === item.q ? "" : item.q)}>
          <b className="d-h3">{item.q}</b>
          {open === item.q ? <small>{item.a}</small> : null}
        </button>
      ))}
      <Button size="large" block icon={MessageCircle} href="/dashboard/inbox/support">Chat with support</Button>
    </Page>
  );
}
