"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { inboxThreads, studioById } from "@/lib/dashboard/data";
import { useNotifications, useThreads } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { BusinessLogo, Field, Segmented, Title } from "../ui";

export default function InboxScreen() {
  const threads = useThreads();
  const alerts = useNotifications();
  const [view, setView] = useState("Messages");
  const [query, setQuery] = useState("");
  const list = inboxThreads.filter((thread) => thread.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Page>
      <Title>Inbox</Title>
      <Segmented items={["Messages", "Alerts"]} value={view} onChange={setView} />
      {view === "Messages" ? (
        <>
          <Field leading={Search} placeholder="Search messages" value={query} onChange={(event) => setQuery(event.target.value)} />
          {list.length === 0 ? <p className="d-muted">No conversations match “{query}”.</p> : null}
          {list.map((thread) => {
            const last = threads[thread.id]?.at(-1)?.text ?? "";
            const studio = studioById(thread.id);
            return (
              <Link key={thread.id} href={`/dashboard/inbox/${thread.id}`} className="d-box d-thread">
                <span className="d-media">
                  <BusinessLogo monogram={studio.id === thread.id ? studio.monogram : "GS"} name={thread.name} size={44} />
                  <span><b>{thread.name}</b><small>{last}</small></span>
                </span>
              </Link>
            );
          })}
        </>
      ) : (
        alerts.map((alert) => (
          <Link key={alert.id} href="/dashboard/notifications" className="d-box" onClick={() => void api.notifications.markRead(alert.id)}>
            <b>{alert.title}{alert.read ? null : <i className="d-unread" aria-label="Unread" />}</b>
            <small>{alert.detail}</small>
          </Link>
        ))
      )}
    </Page>
  );
}
