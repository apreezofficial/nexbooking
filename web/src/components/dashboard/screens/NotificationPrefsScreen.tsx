"use client";

import { api } from "@/lib/dashboard/api";
import { reminderOptions } from "@/lib/dashboard/data";
import { useSettings } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Card, Chips, Overline, PageHeader, ToggleRow } from "../ui";

const groups = [
  { title: "Push", items: ["Booking updates", "Reminders", "Messages", "Promotions"] },
  { title: "Email", items: ["Receipts and invoices", "Newsletter"] },
  { title: "SMS", items: ["Appointment reminders"] },
];

export default function NotificationPrefsScreen() {
  const settings = useSettings();
  const set = (label: string, value: boolean) => void api.settings.update({ notifications: { ...settings.notifications, [label]: value } });

  return (
    <Page>
      <PageHeader title="Notifications" back="/dashboard/account" />
      {groups.map((group) => (
        <div key={group.title} className="d-stack">
          <Overline>{group.title}</Overline>
          <Card pad={false}>
            {group.items.map((label) => <ToggleRow key={label} label={label} checked={Boolean(settings.notifications[label])} onChange={(value) => set(label, value)} />)}
          </Card>
        </div>
      ))}
      <Overline>Reminder timing</Overline>
      <Chips items={reminderOptions} value={settings.reminderTiming} onChange={(reminderTiming) => void api.settings.update({ reminderTiming })} />
    </Page>
  );
}
