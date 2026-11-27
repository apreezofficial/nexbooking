"use client";

import { useState, type FormEvent } from "react";
import { NotebookPen, Plus } from "lucide-react";
import SideDrawer from "@/components/dashboard/SideDrawer";

type Note = { id: string; title: string; body: string; assignee: string; due: string; done: boolean; bookingId: string };
type Props = { owner: string; staff: {id: string; name: string}[]; bookings: {id: string; client: string; service: string}[]; bookingId?: string };

export default function VendorNotes({owner, staff, bookings, bookingId = ""}: Props) {
  const key = "edebooking-vendor-notes:" + owner.toLowerCase();
  const read = (): Note[] => JSON.parse(localStorage.getItem(key) ?? "[]");
  const [notes, setNotes] = useState<Note[]>(() => { try { return read(); } catch { return []; } });
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Note | null>(null);
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
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    if (!value("title")) { setError("Enter a title for this note."); return; }
    const note = { ...editing, id: editing.id || crypto.randomUUID(), title: value("title"), body: value("body"), due: value("due"), assignee: value("assignee"), bookingId: value("booking") };
    if (change(list => editing.id ? list.map(n => n.id === note.id ? note : n) : [note, ...list])) setEditing(null);
  }
  return <section className="vd-card vendor-notes">
    <div className="vd-section-head"><div><h2>{currentBooking ? currentBooking.client + " · Session notes" : "Workspace notes"}</h2><p>{visible.filter(n => n.done).length} of {visible.length} complete</p></div>
      <button className="vd-primary" onClick={() => { setError(""); setEditing({ id: "", title: "", body: "", due: "", assignee: "owner", bookingId: currentBooking?.id ?? "", done: false }); }}><Plus size={17}/> Add note</button>
    </div>
    <div className="vendor-segments" aria-label="Filter notes">{["All", "Mine", "Team"].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
    {!visible.length && <div className="vendor-empty"><NotebookPen size={32}/><h3>A little space to get organised</h3><p>Add a task, a reminder or a note for your next appointment.</p></div>}
    {visible.map(n => <article key={n.id} className="vendor-studio-row">
      <label><input type="checkbox" checked={n.done} onChange={() => change(list => list.map(item => item.id === n.id ? { ...item, done: !item.done } : item))}/> {n.title}</label>
      <p>{n.assignee === "owner" ? "Me" : staff.find(s => s.id === n.assignee)?.name ?? "Team"}{n.due && " · " + new Date(n.due).toLocaleString()}{n.bookingId && " · " + n.bookingId}</p>
      {n.body && <p style={{whiteSpace:"pre-wrap"}}>{n.body}</p>}
      <button className="vd-outline" onClick={() => { setError(""); setEditing(n); }}>Edit</button>
      <button className="vd-text-link" onClick={() => { if (window.confirm("Delete this note?")) change(list => list.filter(item => item.id !== n.id)); }}>Delete</button>
    </article>)}
    {!editing && error && <p role="alert">{error}</p>}
    <SideDrawer open={Boolean(editing)} onOpenChange={open => { if (!open) setEditing(null); }} trigger={null} title={editing?.id ? "Edit note" : "Add note"}>
      {editing && <form key={editing.id} className="vd-drawer-form" onSubmit={save}>
        <label>Title<input required name="title" defaultValue={editing.title}/></label>
        <label>Details<textarea name="body" defaultValue={editing.body}/></label>
        <label>Assigned to<select name="assignee" defaultValue={editing.assignee}><option value="owner">Me</option><option value="team">Everyone</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label>Due date and time<input type="datetime-local" name="due" defaultValue={editing.due}/></label>
        <label>Appointment<select name="booking" defaultValue={editing.bookingId}><option value="">General workspace note</option>{bookings.map(b => <option key={b.id} value={b.id}>{b.client} · {b.service} · {b.id}</option>)}</select></label>
        {error && <p role="alert">{error}</p>}<button className="vd-primary">Save note</button>
      </form>}
    </SideDrawer>
  </section>;
}
