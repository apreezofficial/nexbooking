"use client";

import Link from "next/link";
import { useState } from "react";
import { NotebookPen, Plus } from "lucide-react";

type Note = { id: string; title: string; body: string; assignee: string; due: string; done: boolean; bookingId: string };
type Props = { owner: string; staff: {id: string; name: string}[]; bookings: {id: string; client: string; service: string}[]; bookingId?: string };

export default function VendorNotes({owner, staff, bookings, bookingId = ""}: Props) {
  const key = "edebooking-vendor-notes:" + owner.toLowerCase();
  const read = (): Note[] => JSON.parse(localStorage.getItem(key) ?? "[]");
  const [notes, setNotes] = useState<Note[]>(() => { try { return read(); } catch { return []; } });
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const currentBooking = bookings.find(b => b.id === bookingId);
  const visible = notes.filter(n => (!currentBooking || n.bookingId === currentBooking.id) && (filter === "All" || (filter === "Mine" ? n.assignee === "owner" : n.assignee !== "owner")));
  function change(update: (existing: Note[]) => Note[]) {
    try {
      const next = update(read());
      localStorage.setItem(key, JSON.stringify(next));
      setNotes(next);
      setError("");
      return true;
    } catch { setError("Could not save this note in your browser."); return false; }
  }
  return <section className="vd-card vendor-notes">
    <div className="vd-section-head"><div><h2>{currentBooking ? currentBooking.client + " · Session notes" : "Workspace notes"}</h2><p>{visible.filter(n => n.done).length} of {visible.length} complete</p></div>
      <Link className="vd-primary" href={`/business/dashboard/notes/new${currentBooking ? `?booking=${currentBooking.id}` : ""}`}><Plus size={17}/> Add note</Link>
    </div>
    <div className="vendor-segments" aria-label="Filter notes">{["All", "Mine", "Team"].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
    {!visible.length && <div className="vendor-empty"><NotebookPen size={32}/><h3>A little space to get organised</h3><p>Add a task, a reminder or a note for your next appointment.</p></div>}
    {visible.map(n => <article key={n.id} className="vendor-studio-row">
      <label><input type="checkbox" checked={n.done} onChange={() => change(list => list.map(item => item.id === n.id ? { ...item, done: !item.done } : item))}/> {n.title}</label>
      <p>{n.assignee === "owner" ? "Me" : staff.find(s => s.id === n.assignee)?.name ?? "Team"}{n.due && " · " + new Date(n.due).toLocaleString()}{n.bookingId && " · " + n.bookingId}</p>
      {n.body && <p style={{whiteSpace:"pre-wrap"}}>{n.body}</p>}
      <Link className="vd-outline" href={`/business/dashboard/notes/${n.id}`}>Edit</Link>
      <button className="vd-text-link" onClick={() => { if (window.confirm("Delete this note?")) change(list => list.filter(item => item.id !== n.id)); }}>Delete</button>
    </article>)}
    {error && <p role="alert">{error}</p>}
  </section>;
}
