"use client";

import { Mic } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { useRun, useSettings } from "@/lib/dashboard/hooks";
import { addDays, useStored, useToday } from "@/lib/dashboard/store";
import type { Note } from "@/lib/dashboard/types";
import { Page } from "../DashboardShell";
import { Button, Card, Field, IconButton, PageHeader, TextArea } from "../ui";

export type NoteDraft = Pick<Note, "task" | "details" | "date" | "time" | "repeat" | "remind">;
export const emptyDraft: NoteDraft = { task: "", details: "", date: "", time: "16:30", repeat: "Never", remind: "30 minutes before" };

export default function NewNoteScreen() {
  const router = useRouter();
  const today = useToday();
  const settings = useSettings();
  const { value: stored, set } = useStored<NoteDraft>("note-draft", emptyDraft);
  const { run, busy } = useRun();
  const [task, setTask] = useState(stored.task);
  const [details, setDetails] = useState(stored.details);
  const draft: NoteDraft = { ...stored, task, details, date: stored.date || today || addDays(new Date().toISOString().slice(0, 10), 0), remind: stored.remind || settings.reminderTiming };

  const save = async () => {
    const created = await run(api.notes.create(draft).then(() => true), "Task saved.");
    if (created) {
      set(emptyDraft);
      router.push("/dashboard/schedule");
    }
  };

  return (
    <Page>
      <PageHeader title="New note" back="/dashboard/schedule" />
      <Field label="Task" value={task} onChange={(event) => setTask(event.target.value)} placeholder="Call the supplier" trailing={<IconButton icon={Mic} label="Voice note" href="/dashboard/notes/voice" />} />
      <TextArea label="Notes (optional)" value={details} onChange={(event) => setDetails(event.target.value)} />
      <Card className="d-grid-2 d-when">
        <Field label="Date" type="date" value={draft.date} min={today} onChange={(event) => set({ ...draft, date: event.target.value })} />
        <Field label="Time" type="time" value={draft.time} onChange={(event) => set({ ...draft, time: event.target.value })} />
      </Card>
      <Card className="d-stack">
        <div className="d-between"><span className="d-muted">Repeat</span><b>{draft.repeat === "Never" ? "Does not repeat" : draft.repeat}</b></div>
      </Card>
      <Button variant="outline" block onClick={() => { set(draft); router.push("/dashboard/notes/settings"); }}>Reminder · {draft.remind}</Button>
      <Button size="large" block loading={busy} onClick={save}>Save task</Button>
    </Page>
  );
}
