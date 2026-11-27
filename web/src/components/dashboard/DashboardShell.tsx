"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, LogOut, Plus } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { api } from "@/lib/dashboard/api";
import { useStored } from "@/lib/dashboard/store";
import type { Profile } from "@/lib/dashboard/types";
import { parseSession, useSessionRaw } from "@/lib/session";
import { NoticeProvider } from "./Notice";
import { Button, ConfirmDialog, StateView, tabs, useActiveTab } from "./ui";

const ShellContext = createContext<{ askLogout: () => void }>({ askLogout: () => {} });
export const useShell = () => useContext(ShellContext);

const initials = (name: string) => (name || "?").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

/**
 * The frame around every dashboard screen: a sidebar on desktop, the app's floating tab bar on phones,
 * the login check, and the log out confirmation.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sessionRaw = useSessionRaw();
  const session = parseSession(sessionRaw);
  const active = useActiveTab();
  const { value: profile } = useStored<Profile | null>("profile", null);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  // First open: fill the dashboard with the sample content the app shows.
  useEffect(() => {
    if (session) void api.bootstrap();
  }, [session]);

  if (sessionRaw === null) return <div className="d-app"><div className="d-boot" aria-busy="true"><span className="d-spinner is-large" /></div></div>;

  if (!session) {
    return (
      <div className="d-app">
        <main className="d-main">
          <div className="d-page">
            <StateView
              icon={LockKeyhole}
              title="Log in to see your dashboard"
              body="Your bookings, receipts and messages appear here once you are logged in."
              primary={{ label: "Log in", href: "/login?next=/dashboard" }}
              secondary={{ label: "Back to the website", href: "/" }}
            />
          </div>
        </main>
      </div>
    );
  }

  const name = profile?.name || session.name;
  const logout = async () => {
    setConfirmingLogout(false);
    await api.auth.logout();
    router.replace("/login");
  };

  return (
    <ShellContext.Provider value={{ askLogout: () => setConfirmingLogout(true) }}>
      <NoticeProvider>
        <div className="d-app">
          <aside className="d-side" aria-label="Dashboard">
            <BrandLogo />
            <nav aria-label="Main">
              {tabs.map(({ label, href, icon: Icon }) => (
                <Link key={label} href={href} className={label === active ? "is-active" : undefined} aria-current={label === active ? "page" : undefined}>
                  <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                  {label}
                </Link>
              ))}
              <Link href="/dashboard/notes/new" className="d-side-add"><Plus size={20} strokeWidth={1.8} aria-hidden="true" />New note</Link>
            </nav>
            <div className="d-side-user">
              <Link href="/dashboard/account/profile" aria-label="Edit profile"><span>{initials(name)}</span></Link>
              <div>
                <b>{name}</b>
                <small>{session.email}</small>
              </div>
              <button type="button" aria-label="Log out" onClick={() => setConfirmingLogout(true)}><LogOut size={18} strokeWidth={1.8} aria-hidden="true" /></button>
            </div>
          </aside>

          <main className="d-main" id="d-main">{children}</main>

          <nav className="d-tabbar" role="tablist" aria-label="Dashboard">
            {tabs.map(({ label, href, icon: Icon }) => {
              const on = label === active;
              return (
                <Link key={label} href={href} role="tab" aria-selected={on} aria-label={label} className={on ? "is-active" : undefined}>
                  <Icon size={22} strokeWidth={1.8} fill={on && label === "Home" ? "currentColor" : "none"} aria-hidden="true" />
                  {on && <span>{label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <ConfirmDialog
          open={confirmingLogout}
          icon={LogOut}
          tone="error"
          title="Log out?"
          body="You’ll need to log in again to manage your bookings and tasks."
          cancel="Stay logged in"
          confirm="Log out"
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={logout}
        />
      </NoticeProvider>
    </ShellContext.Provider>
  );
}

/** Wrapper for a screen's content: sets the width and the page rhythm. */
export function Page({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return <div className={wide ? "d-page is-wide" : "d-page"}>{children}</div>;
}

export { Button };
