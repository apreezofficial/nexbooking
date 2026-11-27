"use client";

import Link from "next/link";
import { BellOff } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { useNotifications } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Chips, PageHeader, StateView } from "../ui";

export default function NotificationsScreen() {
  const items = useNotifications();
  const [filter, setFilter] = useState("All");
  const shown = items.filter((item) => filter === "All" || item.kind === filter);

  return (
    <Page>
      <PageHeader title="Notifications" back="/dashboard" />
      <Chips items={["All", "Bookings", "Payments", "Offers"]} value={filter} onChange={setFilter} />
      {shown.length === 0 ? (
        <StateView icon={BellOff} title="Nothing here yet" body="Booking updates, receipts and offers show up here." />
      ) : (
        shown.map((item) => (
          <Link key={item.id} href="/dashboard/schedule" className="d-box" onClick={() => void api.notifications.markRead(item.id)}>
            <b>{item.title}{item.read ? null : <i className="d-unread" aria-label="Unread" />}</b>
            <small>{item.detail}</small>
          </Link>
        ))
      )}
    </Page>
  );
}
