"use client";

import AssistantAvatar, { assistantName, assistantStatus, type AssistantState } from "@/components/assistant/AssistantAvatar";
import "./assistant.css";

export type AssistantMessage = { id: string; role: "assistant" | "user"; text: string };

const welcome: AssistantMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I’m your EdeBooking assistant. Soon I’ll help you find a service, check a booking and keep your tasks in order.",
  },
];

const defaultSuggestions = ["Find a salon near me", "Book a consultation", "Add a task to my day"];

/**
 * The chat window, as a shell. It renders messages and suggestions it is given and has
 * no behaviour of its own yet: the input and suggestions are switched off until chat
 * is connected (wire `onSend` and `onSuggestion`, then drop `disabled`).
 */
export default function AssistantPanel({
  state = "idle",
  messages = welcome,
  suggestions = defaultSuggestions,
  disabled = true,
  onClose,
  onSend,
  onSuggestion,
  id,
}: {
  state?: AssistantState;
  messages?: AssistantMessage[];
  suggestions?: string[];
  disabled?: boolean;
  onClose?: () => void;
  onSend?: (text: string) => void;
  onSuggestion?: (text: string) => void;
  id?: string;
}) {
  return (
    <section className="assistant-panel" id={id} aria-label={assistantName}>
      <header className="assistant-head">
        <AssistantAvatar state={state} size={44} />
        <div>
          <h2>{assistantName}</h2>
          <p role="status">{assistantStatus[state]}</p>
        </div>
        {onClose ? (
          <button type="button" className="assistant-close" onClick={onClose} aria-label="Close assistant">
            ×
          </button>
        ) : null}
      </header>

      <div className="assistant-thread" aria-live="polite">
        {messages.map((message) => (
          <p key={message.id} className={`assistant-bubble assistant-bubble-${message.role}`}>
            {message.text}
          </p>
        ))}
        {disabled ? <p className="assistant-soon">Chat is coming soon</p> : null}
      </div>

      <div className="assistant-suggestions">
        {suggestions.map((text) => (
          <button key={text} type="button" disabled={disabled} onClick={() => onSuggestion?.(text)}>
            {text}
          </button>
        ))}
      </div>

      <form
        className="assistant-compose"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const text = String(data.get("message") ?? "").trim();
          if (text && !disabled) {
            onSend?.(text);
            event.currentTarget.reset();
          }
        }}
      >
        <label className="sr-only" htmlFor={`${id ?? "assistant"}-message`}>
          Message the assistant
        </label>
        <input id={`${id ?? "assistant"}-message`} name="message" placeholder="Ask anything…" disabled={disabled} autoComplete="off" />
        <button type="submit" disabled={disabled}>
          Send
        </button>
      </form>
    </section>
  );
}
