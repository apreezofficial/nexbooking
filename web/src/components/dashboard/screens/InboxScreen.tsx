"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, MessageCircle, Search } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { inboxThreads, studioById } from "@/lib/dashboard/data";
import { useNotifications, useThreads } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import ChatPane from "../ChatPane";
import { BusinessLogo, Chips, Field, Skeleton, Title } from "../ui";

/** Messages on the left, the open conversation on the right on desktop. Alerts are a second list. */
export default function InboxScreen() {
  const threads = useThreads();
  const alerts = useNotifications();
  const [view, setView] = useState("Messages");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState("glow-studio");
  const list = inboxThreads.filter((thread) => thread.name.toLowerCase().includes(query.trim().toLowerCase()));
  const unreadAlerts = alerts.filter((item) => !item.read).length;

  return (
    <Page wide>
      <Title sub="Messages with the studios you’ve booked, and alerts about your bookings.">Inbox</Title>
      <div className="d-inbox-head">
        <Chips items={["Messages", "Alerts"]} value={view} onChange={setView} />
        {view === "Alerts" && unreadAlerts > 0 ? <span className="d-count"><Bell size={14} strokeWidth={2} aria-hidden="true" /> {unreadAlerts} new</span> : null}
      </div>

      {view === "Messages" ? (
        <div className="d-split">
          <aside className="d-threads" aria-label="Conversations">
            <Field leading={Search} placeholder="Search messages" value={query} onChange={(event) => setQuery(event.target.value)} />
            {list.length === 0 ? <p className="d-muted">No conversations match “{query}”.</p> : null}
            {list.map((thread) => {
              const messages = threads[thread.id] ?? [];
              const last = messages.at(-1);
              const studio = studioById(thread.id);
              const active = open === thread.id;
              return (
                <div key={thread.id} className="d-thread-row">
                  <button type="button" className={`d-thread${active ? " is-active" : ""}`} onClick={() => setOpen(thread.id)} aria-current={active ? "true" : undefined}>
                    <BusinessLogo monogram={studio.monogram} name={thread.name} size={46} />
                    <span className="d-thread-text">
                      <b>{thread.name}</b>
                      <small>{last?.text ?? "No messages yet"}</small>
                    </span>
                    <span className="d-thread-time">{last?.at ?? ""}</span>
                  </button>
                  <Link href={`/dashboard/inbox/${thread.id}`} className="d-thread-open" aria-label={`Open ${thread.name}`} />
                </div>
              );
            })}
          </aside>
          <div className="d-split-pane">
            {open ? <ChatPane id={open} /> : <div className="d-empty"><MessageCircle size={28} strokeWidth={1.8} aria-hidden="true" /><p>Pick a conversation to read it here.</p></div>}
          </div>
        </div>
      ) : (
        <div className="d-stack">
          {alerts.length === 0 ? <Skeleton height={120} /> : null}
          {alerts.map((alert) => (
            <Link key={alert.id} href="/dashboard/notifications" className={`d-alert${alert.read ? "" : " is-new"}`} onClick={() => void api.notifications.markRead(alert.id)}>
              <span className="d-alert-dot" aria-hidden="true" />
              <span className="d-alert-text"><b>{alert.title}</b><small>{alert.detail}</small></span>
              <span className="d-kind">{alert.kind}</span>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}
