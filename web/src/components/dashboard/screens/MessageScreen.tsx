"use client";

import { use, useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Send } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { studioById, threadName } from "@/lib/dashboard/data";
import { useRun, useThreads } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Banner, BusinessLogo, IconButton, PageHeader } from "../ui";

export default function MessageScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const thread = useThreads()[id] ?? [];
  const { run } = useRun();
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const name = threadName(id);
  const studio = studioById(id);

  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [thread.length]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    const sent = text;
    setText("");
    await api.messages.send(id, sent);
  };

  return (
    <Page>
      <PageHeader title={name} back="/dashboard/inbox" action={id !== "support" ? <BusinessLogo monogram={studio.monogram} name={name} size={40} /> : undefined} />
      {id !== "support" ? <Banner /> : null}
      <div className="d-chat" aria-live="polite">
        <small className="d-chat-day">Today</small>
        {thread.map((message) => (
          <p key={message.id} className={`d-bubble ${message.from === "me" ? "is-me" : ""}`}>{message.text}</p>
        ))}
        <div ref={end} />
      </div>
      <form className="d-compose" onSubmit={send}>
        <IconButton icon={Plus} label="Add attachment" onClick={() => void run(api.messages.attach())} />
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Message…" aria-label="Message" autoComplete="off" />
        <IconButton icon={Send} label="Send message" type="submit" />
      </form>
    </Page>
  );
}
