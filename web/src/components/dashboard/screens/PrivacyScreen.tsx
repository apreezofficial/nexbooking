"use client";

import { useState } from "react";
import { Download, Fingerprint, LockKeyhole, Shield, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { useRun, useSettings } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import SideDrawer, { SideDrawerTrigger } from "../SideDrawer";
import { Button, Card, ConfirmDialog, ListItem, PageHeader } from "../ui";

const panels = {
  password: { title: "Change password", icon: LockKeyhole, detail: "Preview the password change form" },
  twoFactor: { title: "Two-factor authentication", icon: ShieldCheck, detail: "Preview setup" },
  biometric: { title: "Biometric login", icon: Fingerprint, detail: "Preview device login" },
  sessions: { title: "Active sessions", icon: Shield, detail: "This browser" },
  export: { title: "Download my data", icon: Download, detail: "Export your dashboard data" },
} as const;

type Panel = keyof typeof panels;

export default function PrivacyScreen() {
  const settings = useSettings();
  const { run, busy } = useRun();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletePreview, setDeletePreview] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  function row(key: Panel) {
    const { title, icon: Icon, detail } = panels[key];
    const enabled = (key === "twoFactor" || key === "biometric") && settings[key];
    return <SideDrawer open={panel === key} onOpenChange={open => {
      setPasswordMessage("");
      setPanel(open ? key : null);
    }} title={title} trigger={<SideDrawerTrigger className="d-list-item d-privacy-trigger">
      <Icon size={20} aria-hidden="true" /><span><strong>{title}</strong><small>{enabled ? "Enabled in preview" : detail}</small></span><span aria-hidden="true">›</span>
    </SideDrawerTrigger>}>
      {panel === key && (
        <div className="d-stack">
          {key === "password" && <>
            <p className="d-muted">Use sample values to try the form. Password changes require a connected account.</p>
            <form className="d-stack provider-modal-form" autoComplete="off" onSubmit={event => {
              event.preventDefault();
              const fields = new FormData(event.currentTarget);
              if (fields.get("next") !== fields.get("confirm")) {
                setPasswordMessage("The new passwords must match.");
                return;
              }
              event.currentTarget.reset();
              setPasswordMessage("The form passed validation. Your account password is unchanged.");
            }}>
              <label>Sample current password<input type="password" name="current" required /></label>
              <label>Sample new password<input type="password" name="next" minLength={8} required /></label>
              <label>Confirm sample password<input type="password" name="confirm" minLength={8} required /></label>
              <Button type="submit">Preview password change</Button>
              <p role="status" className="d-muted">{passwordMessage}</p>
            </form>
          </>}
          {(key === "twoFactor" || key === "biometric") && <>
            <p className="d-muted">{key === "twoFactor" ? "Two-factor authentication uses a second check when you sign in." : "Biometric login uses a passkey stored on a supported device."} This setting is a preview saved in this browser.</p>
            <Button onClick={async () => {
              await api.settings.update({ [key]: !settings[key] });
            }}>{settings[key] ? "Disable preview" : "Enable preview"}</Button>
          </>}
          {key === "sessions" && <>
            <Card className="d-media"><Shield size={20} aria-hidden="true" /><div><b>This browser</b><small>Current demo session</small></div></Card>
            <p className="d-muted">Other devices will appear here when account sessions are connected.</p>
          </>}
          {key === "export" && <>
            <p className="d-muted">Download a JSON copy of your demo profile, settings, bookings and notes from this browser.</p>
            <Button icon={Download} loading={busy} onClick={() => void run(api.settings.exportData(), "Your demo data export is ready.")}>Download JSON</Button>
          </>}
        </div>
      )}
    </SideDrawer>;
  }

  return (
    <Page>
      <PageHeader title="Privacy & security" back="/dashboard/account" />
      <Card pad={false}>{row("password")}{row("twoFactor")}{row("biometric")}</Card>
      <Card pad={false}>{row("sessions")}{row("export")}</Card>
      <Card pad={false}>
        <ListItem icon={Trash2} label="Delete account" detail="Review what would be removed" onClick={() => { setDeletePreview(false); setDeleting(true); }} destructive />
        {deletePreview && <p role="status" className="d-privacy-status d-muted">Deletion preview complete. Your account and data are still available.</p>}
      </Card>
      <ConfirmDialog open={deleting} icon={Trash2} tone="error" title="Delete account?"
        body="Deleting a connected account would remove access to its profile and bookings. This demo only previews that confirmation."
        cancel="Keep account" confirm="Preview deletion" onCancel={() => setDeleting(false)}
        onConfirm={() => { setDeleting(false); setDeletePreview(true); }} />
    </Page>
  );
}
