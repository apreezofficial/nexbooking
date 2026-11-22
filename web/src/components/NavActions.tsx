"use client";
import Link from "next/link";
import Icon from "./Icon";
import LanguageToggle from "./LanguageToggle";
import { parseSession, useSessionRaw } from "@/lib/session";

export default function NavActions() {
  const session = parseSession(useSessionRaw());
  return (
    <div className="nav-actions">
      <LanguageToggle />
      {session ? (
        <Link className="btn btn-dark nav-dashboard" href="/dashboard"><Icon name="grid" />Dashboard</Link>
      ) : (
        <>
          <Link className="btn btn-ghost" href="/signup">Sign up</Link>
          <Link className="btn btn-dark" href="/login">Login</Link>
        </>
      )}
    </div>
  );
}
