"use client";

import { Bell, CircleHelp, CreditCard, FileText, Globe, Heart, LogOut, Shield, Star } from "lucide-react";
import { useProfile, useReceipts, useSaved, useSettings } from "@/lib/dashboard/hooks";
import { Page, useShell } from "../DashboardShell";
import { Button, Card, ListItem, Overline, Title } from "../ui";

const initials = (name: string) => (name || "Ada Okafor").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function AccountScreen() {
  const profile = useProfile();
  const settings = useSettings();
  const receipts = useReceipts();
  const savedCount = Object.values(useSaved()).filter(Boolean).length;
  const { askLogout } = useShell();

  return (
    <Page>
      <Title>Account</Title>
      <Card className="d-profilecard">
        <span className="d-avatar">{initials(profile.name)}</span>
        <div>
          <b>{profile.name || "Ada Okafor"}</b>
          <small>{profile.email || "ada@example.com"}</small>
        </div>
        <Button size="small" href="/dashboard/account/profile">Edit</Button>
      </Card>

      <Overline>Activity</Overline>
      <Card pad={false}>
        <ListItem icon={Heart} label="Saved & favourites" detail={String(savedCount)} href="/dashboard/explore" />
        <ListItem icon={CreditCard} label="Payment methods" href="/dashboard/account/payment-methods" />
        <ListItem icon={FileText} label="Invoices & receipts" detail={String(receipts.length)} href="/dashboard/account/invoices" />
        <ListItem icon={Star} label="My reviews" href="/dashboard/account/reviews" />
      </Card>

      <Overline>Preferences</Overline>
      <Card pad={false}>
        <ListItem icon={Bell} label="Notifications" href="/dashboard/account/notifications" />
        <ListItem icon={Globe} label="Language" detail={settings.language} href="/dashboard/account/language" />
        <ListItem icon={Shield} label="Privacy & security" href="/dashboard/account/privacy" />
      </Card>

      <Overline>Support</Overline>
      <Card pad={false}>
        <ListItem icon={CircleHelp} label="Help & support" href="/dashboard/account/help" />
        <ListItem icon={LogOut} label="Log out" onClick={askLogout} destructive />
      </Card>
    </Page>
  );
}
