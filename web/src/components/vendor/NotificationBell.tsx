"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CalendarCheck, CircleDollarSign, Star } from "lucide-react";

const items = [
  { icon: CalendarCheck, title: "New booking request", body: "Sade Bello asked for Deep tissue massage tomorrow at 2:00 PM.", time: "5 min ago", unread: true },
  { icon: CircleDollarSign, title: "Payment received", body: "₦28,000 from Sade Bello for Deep tissue massage.", time: "1 hour ago", unread: true },
  { icon: Star, title: "New review", body: "Ada O. left you 5 stars.", time: "Yesterday", unread: false },
];

/** Notification bell for the vendor nav. Items are sample activity until the notifications API is connected. */
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(items.filter(item => item.unread).length);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return <div className="vd-bell-wrap" ref={root}>
    <button type="button" className="vd-bell" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} aria-expanded={open} onClick={() => { setOpen(value => !value); }}>
      <Bell size={18} aria-hidden="true" />
      {unread > 0 && <i aria-hidden="true">{unread}</i>}
    </button>
    {open && <div className="vd-bell-panel" role="dialog" aria-label="Notifications">
      <header><b>Notifications</b><button type="button" className="vd-text-link" onClick={() => setUnread(0)}>Mark all read</button></header>
      {items.map(item => { const Icon = item.icon; return <article key={item.title} className={item.unread ? "is-unread" : ""}>
        <span className="vd-bell-icon"><Icon size={16} aria-hidden="true" /></span>
        <div><strong>{item.title}</strong><p>{item.body}</p><small>{item.time}</small></div>
      </article>; })}
    </div>}
  </div>;
}
