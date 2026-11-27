"use client";

import { useRouter } from "next/navigation";
import { reminderOptions, repeatOptions } from "@/lib/dashboard/data";
import { useStored } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, Chips, PageHeader } from "../ui";
import { emptyDraft, type NoteDraft } from "./NewNoteScreen";

export default function NoteSettingsScreen() {
  const router = useRouter();
  const { value: draft, set } = useStored<NoteDraft>("note-draft", emptyDraft);

  return (
    <Page>
      <PageHeader title="Remind me" back="/dashboard/notes/new" />
      <Chips items={reminderOptions} value={draft.remind} onChange={(remind) => set({ ...draft, remind })} />
      <h2 className="d-h3">Repeat</h2>
      <Chips items={repeatOptions} value={draft.repeat} onChange={(repeat) => set({ ...draft, repeat: repeat as NoteDraft["repeat"] })} />
      <Button size="large" block onClick={() => router.push("/dashboard/notes/new")}>Done</Button>
    </Page>
  );
}
