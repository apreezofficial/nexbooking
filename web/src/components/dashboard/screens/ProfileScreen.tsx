"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/dashboard/api";
import { useProfile, useRun } from "@/lib/dashboard/hooks";
import { Button, Field } from "../ui";

const initials = (name: string) => (name || "Ada Okafor").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const splitName = (name: string) => {
  const [first = "", ...rest] = name.trim().split(/\s+/);
  return { first, last: rest.join(" ") };
};

/**
 * The profile settings page: "My Profile" summary, then "Personal Information" with an Edit toggle,
 * matching the settings layout (sub-nav on the left, cards on the right).
 */
export default function ProfileScreen() {
  const profile = useProfile();
  const { run, busy } = useRun();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ first: "", last: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Read-only values come straight from the stored profile; the draft only exists while editing.
  const stored = { ...splitName(profile.name), email: profile.email, phone: profile.phone };
  const view = editing ? draft : stored;
  const setField = (key: keyof typeof draft) => (event: React.ChangeEvent<HTMLInputElement>) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  const startEdit = () => {
    setDraft(stored);
    setErrors({});
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setErrors({});
  };

  const save = async () => {
    const next: Record<string, string> = {};
    if (!draft.first.trim()) next.first = "Enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const saved = await run(api.profile.update({ name: `${draft.first} ${draft.last}`.trim(), email: draft.email, phone: draft.phone }), "Profile changes saved.");
    if (saved) setEditing(false);
  };

  return (
    <div className="s-stack">
      <section className="s-card">
        <header className="s-card-head"><h2>My Profile</h2></header>
        <div className="s-person">
          <span className="s-avatar" aria-hidden="true">{initials(profile.name)}</span>
          <div className="s-person-text">
            <b>{profile.name || "Ada Okafor"}</b>
            <small>{profile.email || "ada@example.com"}</small>
            <small>{profile.location || "Lekki, Lagos"}</small>
          </div>
          <Button variant="outline" size="small" icon={Pencil} onClick={startEdit} disabled={editing}>Edit</Button>
        </div>
      </section>

      <section className="s-card">
        <header className="s-card-head">
          <h2>Personal Information</h2>
          {editing ? (
            <div className="s-actions">
              <Button variant="outline" size="small" onClick={cancel}>Cancel</Button>
              <Button size="small" loading={busy} onClick={save}>Save changes</Button>
            </div>
          ) : (
            <Button variant="outline" size="small" icon={Pencil} onClick={startEdit}>Edit</Button>
          )}
        </header>
        <div className="s-fields">
          <Field label="First name" value={view.first} onChange={setField("first")} readOnly={!editing} error={errors.first} autoComplete="given-name" />
          <Field label="Last name" value={view.last} onChange={setField("last")} readOnly={!editing} autoComplete="family-name" />
          <Field label="Email address" type="email" value={view.email} onChange={setField("email")} readOnly={!editing} error={errors.email} autoComplete="email" />
          <Field label="Phone number" type="tel" value={view.phone} onChange={setField("phone")} readOnly={!editing} placeholder="+234 801 234 5678" autoComplete="tel" />
        </div>
      </section>
    </div>
  );
}
