"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Paperclip, Send } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { studioById, threadName } from "@/lib/dashboard/data";
import { useThreads } from "@/lib/dashboard/hooks";
import { BusinessLogo, Button } from "./ui";

/** A conversation: the message bubbles and a composer. Used full-page on phones and beside the list on desktop. */
export default function ChatPane({ id, compact = false }: { id: string; compact?: boolean }) {
  const thread = useThreads()[id] ?? [];
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const name = threadName(id);
  const studio = studioById(id);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [thread.length, id]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    const sent = text;
    setText("");
    await api.messages.send(id, sent);
  };

  return (
    <section className={`d-convo${compact ? " is-compact" : ""}`} aria-label={`Conversation with ${name}`}>
      <header className="d-convo-head">
        <BusinessLogo monogram={studio.monogram} name={name} size={44} />
        <div>
          <b>{name}</b>
          <small><span className="d-online" aria-hidden="true" /> Usually replies within the hour</small>
        </div>
      </header>
      <div className="d-convo-body" aria-live="polite">
        <span className="d-day-pill">Today</span>
        {thread.map((message) => (
          <div key={message.id} className={`d-msg ${message.from === "me" ? "is-me" : ""}`}>
            <p>{message.text}</p>
            <small>{message.at}</small>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form className="d-composer" onSubmit={send}>
        <button type="button" className="d-composer-icon" aria-label="Attach a file" onClick={() => void api.messages.attach().catch(() => undefined)}>
          <Paperclip size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message…" aria-label="Message" autoComplete="off" />
        <Button type="submit" size="small" disabled={!text.trim()} icon={Send} className="d-composer-send" aria-label="Send">Send</Button>
      </form>
    </section>
  );
}
