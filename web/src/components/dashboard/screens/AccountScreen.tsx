"use client";

import { Bell, CircleHelp, CreditCard, FileText, Globe, Heart, LogOut, Shield, Star } from "lucide-react";
import Link from "next/link";
import { useBookings, useProfile, useReceipts, useSaved, useSettings } from "@/lib/dashboard/hooks";
import { Page, useShell } from "../DashboardShell";
import { Overline, Title } from "../ui";

const initials = (name: string) => (name || "Ada Okafor").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

function Stat({ value, label, href }: { value: number; label: string; href: string }) {
  return <Link href={href} className="d-stat"><b>{value}</b><small>{label}</small></Link>;
}

function Row({ icon: Icon, label, detail, href, onClick, tone = "gold", destructive }: { icon: typeof Heart; label: string; detail?: string; href?: string; onClick?: () => void; tone?: "gold" | "blue" | "green" | "rose" | "violet"; destructive?: boolean }) {
  const inner = (
    <>
      <span className={`d-row-icon is-${tone}`}><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
      <span className="d-row-label">{label}</span>
      {detail ? <small>{detail}</small> : null}
      <span className="d-row-chev" aria-hidden="true">›</span>
    </>
  );
  const className = `d-row${destructive ? " is-destructive" : ""}`;
  return href ? <Link href={href} className={className}>{inner}</Link> : <button type="button" className={className} onClick={onClick}>{inner}</button>;
}

export default function AccountScreen() {
  const profile = useProfile();
  const settings = useSettings();
  const receipts = useReceipts();
  const bookings = useBookings().filter((item) => item.status !== "Cancelled").length;
  const savedCount = Object.values(useSaved()).filter(Boolean).length;
  const { askLogout } = useShell();

  return (
    <Page wide>
      <Title>Account</Title>

      <section className="d-profile">
        <span className="d-profile-avatar">{initials(profile.name)}</span>
        <div className="d-profile-text">
          <b>{profile.name || "Ada Okafor"}</b>
          <small>{profile.email || "ada@example.com"}</small>
          <span className="d-profile-loc">{profile.location || "Lekki, Lagos"}</span>
        </div>
        <Link href="/dashboard/account/profile" className="d-profile-edit">Edit</Link>
      </section>

      <div className="d-stats">
        <Stat value={bookings} label="Bookings" href="/dashboard/schedule" />
        <Stat value={savedCount} label="Saved" href="/dashboard/explore" />
        <Stat value={receipts.length} label="Receipts" href="/dashboard/account/invoices" />
      </div>

      <div className="d-account-cols">
        <div className="d-account-col">
          <Overline>Activity</Overline>
          <div className="d-group">
            <Row icon={CreditCard} tone="gold" label="Payment methods" href="/dashboard/account/payment-methods" />
            <Row icon={FileText} tone="blue" label="Invoices & receipts" detail={String(receipts.length)} href="/dashboard/account/invoices" />
            <Row icon={Star} tone="violet" label="My reviews" href="/dashboard/account/reviews" />
            <Row icon={Heart} tone="rose" label="Saved & favourites" detail={String(savedCount)} href="/dashboard/explore" />
          </div>
        </div>
        <div className="d-account-col">
          <Overline>Preferences</Overline>
          <div className="d-group">
            <Row icon={Bell} tone="gold" label="Notifications" href="/dashboard/account/notifications" />
            <Row icon={Globe} tone="green" label="Language" detail={settings.language} href="/dashboard/account/language" />
            <Row icon={Shield} tone="blue" label="Privacy & security" href="/dashboard/account/privacy" />
          </div>
          <Overline>Support</Overline>
          <div className="d-group">
            <Row icon={CircleHelp} tone="violet" label="Help & support" href="/dashboard/account/help" />
            <Row icon={LogOut} tone="rose" label="Log out" onClick={askLogout} destructive />
          </div>
        </div>
      </div>
    </Page>
  );
}
