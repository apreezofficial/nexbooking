import type { Metadata } from "next";
import AssistantAvatar, { type AssistantState } from "@/components/assistant/AssistantAvatar";
import AssistantLauncher from "@/components/assistant/AssistantLauncher";
import AssistantPanel from "@/components/assistant/AssistantPanel";
import RouteShell from "@/components/RouteShell";

// A working preview of the assistant components. Not linked, not in the sitemap, and kept out of search.
export const metadata: Metadata = {
  title: "Assistant preview",
  robots: { index: false, follow: false },
};

const states: { state: AssistantState; note: string }[] = [
  { state: "idle", note: "Looks around, blinks, hops now and then." },
  { state: "working", note: "Hops with a smile while it handles a request." },
  { state: "sleeping", note: "Head down, resting between tasks." },
];

export default function AssistantPreviewPage() {
  return (
    <RouteShell>
      <section className="route-content assistant-preview">
        <div className="route-section-heading">
          <p className="eyebrow">COMPONENT PREVIEW</p>
          <h1 className="section-title">The assistant, before it can talk.</h1>
          <p className="section-sub">Three states, the chat window shell and the floating launcher in the corner. Chat is not connected yet.</p>
        </div>

        <div className="assistant-states">
          {states.map(({ state, note }) => (
            <article key={state}>
              <AssistantAvatar state={state} size={96} />
              <h2>{state[0].toUpperCase() + state.slice(1)}</h2>
              <p>{note}</p>
            </article>
          ))}
        </div>

        <div className="assistant-inline">
          <AssistantPanel id="assistant-preview-panel" />
        </div>
      </section>
      <AssistantLauncher />
    </RouteShell>
  );
}
