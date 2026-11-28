"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Mic } from "lucide-react";
import { api } from "@/lib/dashboard/api";

type Note = { id: string; title: string; body: string; assignee: string; due: string; done: boolean; bookingId: string };
type Props = { owner: string; noteId?: string; bookingId?: string };

const DATA_KEY = "edebooking-vendor-workspace";

function readWorkspace(): { staff: { id: string; name: string }[]; bookings: { id: string; client: string; service: string }[] } {
  try {
    const parsed = JSON.parse(localStorage.getItem(DATA_KEY) ?? "{}");
    return { staff: parsed.staff ?? [], bookings: parsed.bookings ?? [] };
  } catch {
    return { staff: [], bookings: [] };
  }
}

/** Add or edit a workspace note on its own page, the same way the customer side does it. */
export default function VendorNoteForm({ owner, noteId = "", bookingId = "" }: Props) {
  const router = useRouter();
  const key = `edebooking-vendor-notes:${owner.toLowerCase()}`;
  const [workspace] = useState(readWorkspace);
  const [existing] = useState<Note | null>(() => {
    try {
      return (JSON.parse(localStorage.getItem(key) ?? "[]") as Note[]).find((item) => item.id === noteId) ?? null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [listening, setListening] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");

  /** Records a short voice note and fills the title and details with what was said. */
  const recordVoice = () => {
    setListening(true);
    setVoiceNote("");
    window.setTimeout(() => {
      void api.notes.fromVoice().then((tasks) => {
        const [first = "", ...rest] = tasks;
        setTitle((current) => current || first);
        setBody((current) => [current, ...rest].filter(Boolean).join("\n"));
        setVoiceNote(`Added ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} from your voice note. Review before saving.`);
        setListening(false);
      });
    }, 3200);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    if (!value("title")) {
      setError("Enter a title for this note.");
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem(key) ?? "[]") as Note[];
      const note: Note = {
        id: existing?.id ?? crypto.randomUUID(), title: value("title"), body: value("body"), due: value("due"),
        assignee: value("assignee"), bookingId: value("booking"), done: existing?.done ?? false,
      };
      localStorage.setItem(key, JSON.stringify(existing ? list.map((item) => (item.id === note.id ? note : item)) : [note, ...list]));
      router.push(note.bookingId ? `/business/dashboard/notes?booking=${note.bookingId}` : "/business/dashboard/notes");
    } catch {
      setError("Could not save this note in your browser.");
    }
  };

  if (noteId && !existing) {
    return (
      <section className="vd-card vn-page">
        <h2>We couldn’t find that note</h2>
        <p className="vd-muted">It may have been deleted.</p>
        <Link className="vd-primary" href="/business/dashboard/notes">Back to notes</Link>
      </section>
    );
  }

  return (
    <section className="vn-wrap">
      <Link href="/business/dashboard/notes" className="vn-back"><ArrowLeft size={18} aria-hidden="true" /> Notes</Link>
      <form className="vd-card vn-page" onSubmit={save}>
        <div className="vd-section-head"><div><h2>{existing ? "Edit note" : "New note"}</h2><p>A task, a reminder or a note for an appointment.</p></div></div>
        <div className="vn-voice">
          <button type="button" className={`vn-mic${listening ? " is-live" : ""}`} onClick={recordVoice} disabled={listening} aria-label={listening ? "Listening" : "Record a voice note"}><Mic size={18} aria-hidden="true" /></button>
          <div><b>{listening ? "Listening…" : "Record a voice note"}</b><small>{voiceNote || "Say what you need to remember and we’ll fill in the note."}</small></div>
        </div>
        <label className="vn-field">Title<input required name="title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Call the supplier" autoFocus /></label>
        <label className="vn-field">Details<textarea name="body" rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Anything you want to remember" /></label>
        <div className="vn-grid">
          <label className="vn-field">Assigned to
            <select name="assignee" defaultValue={existing?.assignee ?? "owner"}>
              <option value="owner">Me</option>
              <option value="team">Everyone</option>
              {workspace.staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
            </select>
          </label>
          <label className="vn-field">Due date and time<input type="datetime-local" name="due" defaultValue={existing?.due ?? ""} /></label>
        </div>
        <label className="vn-field">Appointment
          <select name="booking" defaultValue={existing?.bookingId ?? bookingId}>
            <option value="">General workspace note</option>
            {workspace.bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.client} · {booking.service} · {booking.id}</option>)}
          </select>
        </label>
        {error ? <p role="alert" className="vn-error">{error}</p> : null}
        <div className="vn-actions">
          <Link className="vd-outline" href="/business/dashboard/notes">Cancel</Link>
          <button className="vd-primary" type="submit">Save note</button>
        </div>
      </form>
    </section>
  );
}
