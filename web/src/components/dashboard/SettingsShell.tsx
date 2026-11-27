"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, CircleHelp, CreditCard, FileText, Globe, LogOut, Shield, Star, UserRound, type LucideIcon } from "lucide-react";
import { useShell } from "./DashboardShell";

type Section = { href: string; label: string; subtitle: string; icon: LucideIcon };

export const accountSections: Section[] = [
  { href: "/dashboard/account", label: "Profile", subtitle: "Manage your account information and preferences", icon: UserRound },
  { href: "/dashboard/account/payment-methods", label: "Payment methods", subtitle: "Cards and payment options you use to book", icon: CreditCard },
  { href: "/dashboard/account/invoices", label: "Invoices & receipts", subtitle: "Every receipt and proforma invoice in one place", icon: FileText },
  { href: "/dashboard/account/reviews", label: "My reviews", subtitle: "The reviews you’ve written for studios", icon: Star },
  { href: "/dashboard/account/notifications", label: "Notifications", subtitle: "Choose what we tell you, and how", icon: Bell },
  { href: "/dashboard/account/language", label: "Language", subtitle: "The language used across EdeBooking", icon: Globe },
  { href: "/dashboard/account/privacy", label: "Privacy & security", subtitle: "Protect your account and control your data", icon: Shield },
  { href: "/dashboard/account/help", label: "Help & support", subtitle: "Answers, and a way to reach our team", icon: CircleHelp },
];

/** Settings frame shared by every account page: a sub-nav on the left, the page on the right. */
export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname() ?? "";
  const { askLogout } = useShell();
  const current = accountSections
    .filter((section) => pathname === section.href || (section.href !== "/dashboard/account" && pathname.startsWith(section.href)))
    .sort((a, b) => b.href.length - a.href.length)[0] ?? accountSections[0];
  const isActive = (section: Section) => section.href === current.href;

  return (
    <div className="s-shell">
      <header className="s-head">
        <p className="s-crumb">Account <span aria-hidden="true">/</span> {current.label}</p>
        <h1>{current.label === "Profile" ? "Profile Settings" : current.label}</h1>
        <p className="s-sub">{current.subtitle}</p>
      </header>

      <div className="s-grid">
        <div className="s-navigation">
          <button type="button" className="s-menu-toggle" aria-expanded={expanded} aria-controls="account-settings-menu" onClick={() => setExpanded(!expanded)}>
            <span>Account menu</span>
            <ChevronDown size={18} aria-hidden="true" />
          </button>
          <nav id="account-settings-menu" className="s-menu" data-expanded={expanded} aria-label="Account settings">
            {accountSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.href} href={section.href} onClick={() => setExpanded(false)} className={isActive(section) ? "is-active" : undefined} aria-current={isActive(section) ? "page" : undefined}>
                  <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  <span>{section.label}</span>
                </Link>
              );
            })}
            <button type="button" className="s-danger" onClick={() => { setExpanded(false); askLogout(); }}>
              <LogOut size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </nav>
        </div>

        <div className="s-main">{children}</div>
      </div>
    </div>
  );
}
