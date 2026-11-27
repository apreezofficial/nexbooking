"use client";

import { Mic, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/dashboard/api";
import { useRun } from "@/lib/dashboard/hooks";
import { useToday } from "@/lib/dashboard/store";
import { Page } from "../DashboardShell";
import { Button, Card, PageHeader } from "../ui";

type Phase = "idle" | "listening" | "thinking" | "done";
const captions: Record<Phase, string> = { idle: "Tap to speak", listening: "Listening…", thinking: "One moment", done: "" };

/**
 * Say your tasks and they are written down. Recording and transcription go through api.notes.fromVoice;
 * until a speech service is connected it returns sample tasks so the whole flow can be tried.
 */
export default function VoiceNoteScreen() {
  const router = useRouter();
  const today = useToday();
  const { run, busy } = useRun();
  const [phase, setPhase] = useState<Phase>("idle");
  const [tasks, setTasks] = useState<string[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const start = () => {
    if (phase === "listening") {
      setPhase("thinking");
      void api.notes.fromVoice().then((found) => { setTasks(found); setPhase("done"); });
      return;
    }
    setPhase("listening");
    timer.current = window.setTimeout(() => {
      setPhase("thinking");
      void api.notes.fromVoice().then((found) => { setTasks(found); setPhase("done"); });
    }, 3200);
  };

  const saveAll = async () => {
    const created = await run(
      Promise.all(tasks.map((task) => api.notes.create({ task, details: "", date: today, time: "16:30", repeat: "Never", remind: "30 minutes before" }))),
      `Saved ${tasks.length} ${tasks.length === 1 ? "note" : "notes"}.`,
    );
    if (created) router.push("/dashboard/schedule");
  };

  return (
    <Page>
      <PageHeader title={phase === "done" ? "Review notes" : "Voice note"} back="/dashboard/notes/new" />
      {phase !== "done" ? (
        <div className="d-voice">
          <button type="button" className={`d-mic${phase === "listening" ? " is-live" : ""}`} onClick={start} disabled={phase === "thinking"} aria-label={phase === "listening" ? "Stop listening" : "Start speaking"}>
            <Mic size={36} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <div className="d-wave" aria-hidden="true">{Array.from({ length: 9 }, (_, index) => <i key={index} style={{ animationDelay: `${index * 90}ms` }} />)}</div>
          <p aria-live="polite"><b>{captions[phase]}</b></p>
          <small className="d-muted">Say what’s on your mind. We’ll turn it into tasks you can review.</small>
        </div>
      ) : (
        <>
          <h2 className="d-h2">We found {tasks.length} {tasks.length === 1 ? "task" : "tasks"} in your voice note</h2>
          {tasks.map((task) => (
            <Card key={task} className="d-between">
              <b className="d-h3">{task}</b>
              <button type="button" className="d-x" aria-label={`Remove ${task}`} onClick={() => setTasks((current) => current.filter((item) => item !== task))}><X size={18} aria-hidden="true" /></button>
            </Card>
          ))}
          <Button size="large" block disabled={tasks.length === 0} loading={busy} onClick={saveAll}>Save {tasks.length} {tasks.length === 1 ? "note" : "notes"}</Button>
          <Button variant="text" block onClick={() => { setPhase("idle"); setTasks([]); }}>Record again</Button>
        </>
      )}
    </Page>
  );
}
