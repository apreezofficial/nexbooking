"use client";

import { Download, LockKeyhole, Shield, Trash2 } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { useRun, useSettings } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Card, ListItem, PageHeader, ToggleRow } from "../ui";

export default function PrivacyScreen() {
  const settings = useSettings();
  const { run, notify } = useRun();

  return (
    <Page>
      <PageHeader title="Privacy & security" back="/dashboard/account" />
      <Card pad={false}>
        <ListItem icon={LockKeyhole} label="Change password" detail="Last changed 3 months ago" onClick={() => void run(api.settings.changePassword())} />
        <ToggleRow label="Two-factor authentication" detail="Add an extra layer of security" checked={settings.twoFactor} onChange={(checked) => void api.settings.update({ twoFactor: checked })} />
        <ToggleRow label="Biometric login" detail="Use your fingerprint or face to log in" checked={settings.biometric} onChange={(checked) => void api.settings.update({ biometric: checked })} />
      </Card>
      <Card pad={false}>
        <ListItem icon={Shield} label="Active sessions" detail="This browser" onClick={() => notify("This browser is currently active.")} />
        <ListItem icon={Download} label="Download my data" onClick={() => void run(api.settings.exportData(), "Your data export is being prepared.")} />
        <ListItem icon={Trash2} label="Delete account" onClick={() => void run(api.settings.deleteAccount())} destructive />
      </Card>
      <Card tone="tint" className="d-media">
        <Shield size={20} strokeWidth={1.8} aria-hidden="true" />
        <div><b>Your data is encrypted and handled</b><small>under GDPR and CCPA.</small></div>
      </Card>
    </Page>
  );
}
